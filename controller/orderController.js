const axios = require('axios');
const RFQ = require('../models/RFQ');
const { v4: uuidv4 } = require('uuid');

const order = async (req, res) => {
  try {

    // Destructure required properties from the request body
    const { authorization } = req.headers;
    const { body } = req;

    // Ensure that the request contains the Authorization header
    if (!authorization) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }
    // Generate uuid 
    const uuid=uuidv4();
    
    const { client_rfq_id ,wallet_id} =body;

    // Ensure that the request body contains the client_rfq_id
    if (!client_rfq_id) {
      return res.status(400).json({ message: 'client_rfq_id not found' });
    }

    // Ensure that the request body contains the client_rfq_id
    if (!wallet_id) {
      return res.status(400).json({ message: 'wallet_id not found' });
    }

    const data = await RFQ.findOne({ client_rfq_id });
    if(data){
      const {instrument,side,quantity,price} = data;
      const config = {
        url: `${process.env.API_BASE_URL_V2}order/`,
        headers: { 'Authorization': req.headers.authorization, 'Content-Type': 'application/json' },
        data:  {instrument:instrument,side:side,quantity:quantity,price:price, valid_until: new Date(Date.now() + 300 * 1000), executing_unit: 'risk-adding-strategy',client_order_id:uuid,order_type:'FOK' }
      };
      // console.log(JSON.stringify(config));
      const response = await axios.post(config.url, config.data, { headers: config.headers });
      const {order_id,trades,executed_price,created}=response.data;
      if(response.data.trades.length>0){
        const {order,trade_id,price,quantity,side}=trades[0];
        const responseWithdraw = await axios.post(`${process.env.API_BASE_URL}withdrawal`, {
          "amount": `${quantity}`,
          "currency": `${instrument.slice(3,6)}`,
          "destination_address": {
          "address_value": `${wallet_id}`,
          "address_suffix": "tag0",
          "address_protocol": "None"
          }
      }, { headers: config.headers });
        res.json({message:'*TRADE SUCCESSFUL!',created:created,trade_type:side, instrument : instrument,amount:`${quantity} ${instrument.slice(0,3)}`,received:`${Number(price*quantity)} ${instrument.slice(3,6)}`,order_id:order_id});
      }else{
        res.json({message:'*TRADE UNSUCCESSFUL!'});
      }
    }else{
      const config = {
        url: `${process.env.API_BASE_URL_V2}order/`,
        headers: { 'Authorization': req.headers.authorization, 'Content-Type': 'application/json' },
        data:  req.body
      };
       // console.log(JSON.stringify(config));
       const response = await axios.post(config.url, config.data, { headers: config.headers });
       const {order_id,trades,executed_price,created}=response.data;
       if(response.data.trades.length>0){
         const {order,trade_id,price,quantity,side}=trades[0];
        
         const responseWithdraw = await axios.post(`${process.env.API_BASE_URL}withdrawal`, {
          "amount": `${quantity}`,
          "currency": `${instrument.slice(3,6)}`,
          "destination_address": {
          "address_value": `${wallet_id}`,
          "address_suffix": "tag0",
          "address_protocol": "None"
          }
      }, { headers: config.headers });
        console.log("withdrawResponse ",responseWithdraw);
         res.json({message:'*TRADE SUCCESSFUL!',created:created,trade_type:side, instrument : instrument,amount:`${quantity} ${instrument.slice(0,3)}`,received:`${Number(price*quantity)} ${instrument.slice(3,6)}`,order_id:order_id});
       }else{
         res.json({message:'*TRADE UNSUCCESSFUL!'});
       }
     
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
            url: 'https://api.uat.b2c2.net/order/'+req.params.order_id,
            headers: { 
              'Authorization': req.headers.authorization
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
            url: 'https://api.uat.b2c2.net/order/',
            headers: { 
              'Authorization': req.headers.authorization
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