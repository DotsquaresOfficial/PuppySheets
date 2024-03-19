const axios = require('axios');
const RFQ = require('../models/RFQ');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');

const order = async (req, res) => {
  try {

    // Destructure required properties from the request body
    const { body } = req;

    // Generate uuid 
    const uuid=uuidv4();

    // Generate withdraw uuid 
    const withdraw_uuid=uuidv4();
    
    const { client_rfq_id ,wallet_id,order_type} =body;

    // Ensure that the request body contains the client_rfq_id
    if (!client_rfq_id) {
      return res.status(400).json({ message: 'client_rfq_id is required' });
    }

    // Ensure that the request body contains the client_rfq_id
    if (!wallet_id) {
      return res.status(400).json({ message: 'wallet_id is required' });
    }

    const data = await RFQ.findOne({ client_rfq_id });
    if(data){
      const {instrument,side,quantity,price,valid_until} = data;

      // Ensure that the request body contains the client_rfq_id
      if (new Date(valid_until)<new Date()) {
        return res.status(400).json({ message: 'validity of client_rfq_id is expired.' });
      }
      const apiUrl = `https://portal.bcxpro.io/api/check-balance`;
      const responseBalance = await axios.get(apiUrl);
      const balanceData = responseBalance.data.getTotCryptoBalance.reduce((acc, e) => {
        const currency = e.currency;
        const amount = e.crypto_amt;
        acc[currency] = `${amount}`;
        return acc;
      }, {});
      const fullBalance={...balanceData,EUR:responseBalance.data.eur_balance}

      // Ensure user have enough balance
      if(fullBalance[`${side==='sell'?instrument.slice(0,3):instrument.slice(3,6)}`]<`${Number(price.toString().slice(0, (price.toString().indexOf('.') + 6))*quantity)}`){
        return res.status(400).json({
           message: `*Insufficient Balance!`,
           available: `${fullBalance[`${side==='sell'?instrument.slice(0,3):instrument.slice(3,6)}`]} ${side==='sell'?instrument.slice(0,3):instrument.slice(3,6)} `,
           required: `${Number(price.toString().slice(0, (price.toString().indexOf('.') + 6))*quantity)} ${side==='sell'?instrument.slice(0,3):instrument.slice(3,6)}`
           });
      }
      

      let request_data= {instrument:instrument,side:side,quantity:quantity, valid_until: new Date(Date.now() + 300 * 1000), executing_unit: 'risk-adding-strategy',client_order_id:uuid,order_type:order_type?order_type.toUpperCase():'MKT' }
      if(order_type && order_type.toUpperCase()==='FOK'){
            request_data={
              ...request_data,
              price:price,
            }
      }
      const config = {
        url: `${process.env.API_BASE_URL_V2}order/`,
        headers: {  'Authorization': `Token ${process.env.AUTHORIZATION}`, 'Content-Type': 'application/json' },
        data:  request_data
      };
      console.log(JSON.stringify(config));
      const response = await axios.post(config.url, config.data, { headers: config.headers });
      const {order_id,trades,executed_price,created}=response.data;
      if(response.data.trades.length>0){
        const {order,trade_id,quantity,side}=trades[0];

        const inputDateString = created.toString();

        // Parse the input date string
        const inputDate = new Date(inputDateString);

        // Extract the components of the date and time
        const year = inputDate.getFullYear();
        const month = String(inputDate.getMonth() + 1).padStart(2, '0');
        const day = String(inputDate.getDate()).padStart(2, '0');
        const hours = String(inputDate.getHours()).padStart(2, '0');
        const minutes = String(inputDate.getMinutes()).padStart(2, '0');
        const seconds = String(inputDate.getSeconds()).padStart(2, '0');
        const milliseconds = String(inputDate.getMilliseconds()).padStart(3, '0');

        // Construct the new date string in the desired format
        const newDateString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;

        let data = new FormData();
        data.append("created", newDateString);
        data.append("trade_type", side);
        data.append("instrument", instrument);
        data.append("amount", Number(price*quantity));
        data.append("received",Number(quantity));
        data.append("quoted_rate", price);
        data.append("executed_price", executed_price);
        data.append("order_id", order_id);
        data.append('wallet_address', wallet_id);
        data.append('withdrawal_request_txn_id', `${withdraw_uuid}`);

        let config_withdraw = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://portal.bcxpro.io/api/trade-samy',
          headers: { 
            ...data.getHeaders()
          },
          data : data
        };

  
        // var config_withdraw = {
        //   method: 'post',
        //   url: 'https://portal.bcxpro.io/api/trade-samy',
        //   headers: {
        //     'Authorization': `Token ${process.env.AUTHORIZATION}`,    
        //     'Content-Type': 'multipart/form-data'
        //   },
        //   data : data
        // };        
      try{
       const response= await axios(config_withdraw);
       console.log(response);
      }catch(ex){
        console.log(ex);
      }
      res.json({
        message:'*TRADE SUCCESSFUL!',
        created:created,
        trade_type:side,
        instrument : instrument,
        price:`${price}`,
        cost :`${Number(price*quantity)} ${side==='sell'?instrument.slice(0,3):instrument.slice(3,6)}`,
        received :`${quantity} ${side==='sell'?instrument.slice(3,6):instrument.slice(0,3)}`,
        // quoted_price:`${price.toString().slice(0, (price.toString().indexOf('.') + 6))}`,
        // executed_price:`${executed_price.toString().slice(0, (executed_price.toString().indexOf('.') + 6))}`,
        order_id:withdraw_uuid
      });
      }else{
        res.status(400).json({message:'*TRADE UNSUCCESSFUL!'});
      }
    }else{
      return res.status(404).json({ error: 'client_rfq_id is not valid' });
    }
    
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error occurred:', error.message);

    // Handle known HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status).json({ error: data.error || `An error occurred: ${error}` });
    }

    // Handle network-related errors
    if (error.request) {
      return res.status(500).json({ error: 'Network error occurred' });
    }

    // Handle other types of errors
    res.status(500).json({ error: `An error occurred: ${error}` });
  }
};

// Get an order
const get_an_order = async (req, res) => {
    try {
        // console.log(req);
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${process.env.API_BASE_URL}order/`+req.params.order_id,
            headers: { 
              'Authorization': `Token ${process.env.AUTHORIZATION}`,
            },
          };
          axios.request(config)
          .then((response) => {
            // console.log(JSON.stringify(response.data));
            res.json(response.data);
          })
          .catch((error) => {
            console.log(error);
            res.status(400).json(error);
          });
      } catch (error) {
        console.log(error);
        res.status(400).json(error);
      }
};


// Get an order
const get_multiple_order = async (req, res) => {
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${process.env.API_BASE_URL}order/`,
            headers: { 
              'Authorization': `Token ${process.env.AUTHORIZATION}`,
            },
            data:req.body
          };
          
          axios.request(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
            res.json(response.data);
          })
          .catch((error) => {
            console.log(error);
            res.status(400).json(error);
          });
      } catch (error) {
        console.log(error);
        res.status(400).json(error);
      }
};

module.exports = {
    order,
    get_an_order,
    get_multiple_order
  }