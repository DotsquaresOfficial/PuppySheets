const axios = require('axios');
const RFQ = require('../models/RFQ');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
const Trade = require('../models/Trade'); 
const AccessKey = require('../models/AccessKey');

const fixCryptoSuffix=(crypto_symbol)=>{
  if(crypto_symbol==='UST'){
      return 'USDT';
  }else if(crypto_symbol==='USC'){
    return 'USDC';
  }else if(crypto_symbol==='MAT'){
    return 'MATIC';
  }else{
    return crypto_symbol;
  }
}
const order = async (req, res) => {
  try {

 // Destructure required properties from the request body
 const { body } = req;
 const { client_rfq_id, order_type, access_token } = body;

 // Generate UUIDs
 const uuid = uuidv4();
 const withdraw_uuid = uuidv4();

 if (!access_token) {
   return res.status(400).json({
     success: false,
     message: "The operation was unsuccessful.",
     details: {
       reason: "access_token is required.",
       suggestion: "Please add a access_token."
     }
   });
 }

 const accessTokenData = await AccessKey.findOne({access_key:access_token});

 console.log(accessTokenData);

 if (!accessTokenData) {
   return res.status(400).json({
     success: false,
     message: 'The operation was unsuccessful.',
     error: {
       reason: 'access token expired or invalid',
       suggestion: 'Please use a valid access token.'
     }
   });
 }
 const {company_id}=accessTokenData;

 // Validate required fields
 if (!client_rfq_id) {
   return res.status(400).json({
     success: false,
     message: 'The operation was unsuccessful.',
     error: {
       reason: 'client_rfq_id is required.',
       suggestion: 'Please provide client_rfq_id in the request body.'
     }
   });
 }

 if (!access_token) {
   return res.status(400).json({
     success: false,
     message: 'The operation was unsuccessful.',
     error: {
       reason: 'access_token is required.',
       suggestion: 'Please provide access_token in the request body.'
     }
   });
 }

    const dataRFQ = await RFQ.findOne({ client_rfq_id });
    console.log(dataRFQ);
    if(dataRFQ){
      const {instrument,side,quantity,price,valid_until} = dataRFQ;

      // Ensure that the request body contains the client_rfq_id
      if (new Date(valid_until)<new Date()) {
        return res.status(400).json({
          "success": false,
          "message": "Operation unsuccessful.",
          "error": "The validity period for the client RFQ ID has expired."
      });
      }

      let data = new FormData();
      data.append('company_id',company_id);
  
      let configBalance = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://portal.bcxpro.io/api/check-balance/${company_id}`,
        headers: { 
          ...data.getHeaders()
        },
        data : data
      };
  
      const responseBalance = await axios.request(configBalance);
      const balanceData = responseBalance.data.getTotCryptoBalance.reduce((acc, e) => {
        const currency = e.currency;
        const amount = e.crypto_amt;
        acc[currency] = `${amount}`;
        return acc;
      }, {});

      const fullBalance={...balanceData,EUR:responseBalance.data.eur_balance,USD: responseBalance.data.usd_balance,GBP: responseBalance.data.gbp_balance }

      const availableBalance=fullBalance[`${side==='sell'?fixCryptoSuffix(instrument.slice(0,3)):fixCryptoSuffix(instrument.slice(3,6))}`];
      const requiredBalance=side=="sell"?quantity: Number(price.toString().slice(0, (price.toString().indexOf('.') + 6))*quantity);

      // Ensure user have enough balance
      if(availableBalance<requiredBalance){
        return res.status(400).json({
          message: `*Insufficient Balance!`,
          available: `${availableBalance} ${side==='sell'?fixCryptoSuffix(instrument.slice(0,3)):fixCryptoSuffix(instrument.slice(3,6))}`,
          required: `${requiredBalance} ${side==='sell'?fixCryptoSuffix(instrument.slice(0,3)):fixCryptoSuffix(instrument.slice(3,6))}`
          });
      }

      if(!availableBalance){
        return res.status(400).json({
          "success": false,
          "message": "Operation unsuccessful.",
          "error": "Available balance not found."
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
      console.log(JSON.stringify(config),"Config Data");
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
        data.append('company_id', company_id);

        let config_withdraw = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://portal.bcxpro.io/api/trade-samy',
          headers: { 
            ...data.getHeaders()
          },
          data : data
        };
      
      try{
        const response= await axios(config_withdraw);
        console.log(response);
      }catch(ex){
        console.log(ex);
      }

      await RFQ.deleteOne({ client_rfq_id });

        const trade = new Trade({
        message:'*TRADE SUCCESSFUL!',
        created:created,
        trade_type:side,
        instrument : instrument,
        price:`${price}`,
        cost :`${side==='sell'?quantity:Number(price*quantity).toFixed(5)} ${side==='sell'?instrument.slice(0,3):instrument.slice(3,6)}`,
        received :`${side==='sell'?Number(price*quantity).toFixed(5):quantity} ${side==='sell'?instrument.slice(3,6):instrument.slice(0,3)}`,
        company_id:company_id,
        order_id:`${withdraw_uuid}`
        });

      await  trade.save();
      res.json({
        message:'*TRADE SUCCESSFUL!',
        created:created,
        trade_type:side,
        instrument : instrument,
        price:`${price}`,
        cost :`${side==='sell'?quantity:Number(price*quantity).toFixed(5)} ${side==='sell'?instrument.slice(0,3):instrument.slice(3,6)}`,
        received :`${side==='sell'?Number(price*quantity).toFixed(5):quantity} ${side==='sell'?instrument.slice(3,6):instrument.slice(0,3)}`,
        // quoted_price:`${price.toString().slice(0, (price.toString().indexOf('.') + 6))}`,
        // executed_price:`${executed_price.toString().slice(0, (executed_price.toString().indexOf('.') + 6))}`,
        order_id:withdraw_uuid
      });
      }else{
        res.status(400).json({message:'*TRADE UNSUCCESSFUL!'});
      }
    }else{
      return res.status(400).json({
        "success": false,
        "message": "Operation unsuccessful.",
        "error": "The provided client RFQ ID is either invalid or has already been used."
    });
    }
    
  } catch (error) {
    // Log the error for debugging purposes
  console.error('Error occurred:', error.message);

  // Handle known HTTP errors
  if (error.response) {
    // If the error has a response (i.e., HTTP error), extract status and data
    const { status, data } = error.response;
    return res.status(status).json({
      success: false,
      message: 'The operation was unsuccessful.',
      error: {
        reason: data.error || `An error occurred: ${error.message}`,
        suggestion: 'Please check the error details and try again.'
      }
    });
  }

  // Handle network-related errors
  if (error.request) {
    // If there is an issue with the request (e.g., no response received), handle it here
    return res.status(500).json({
      success: false,
      message: 'The operation was unsuccessful.',
      error: {
        reason: 'Network error occurred',
        suggestion: 'Please check your network connection and try again.'
      }
    });
  }

  // Handle other types of errors
  return res.status(500).json({
    success: false,
    message: 'The operation was unsuccessful.',
    error: {
      reason: `An error occurred: ${error.message}`,
      suggestion: 'Please try again later.'
    }
  });
  }
};


// Function to get multiple orders
const orders = async (req, res) => {
  try {
    const { body } = req;
    const { access_token } = body;
    
 if (!access_token) {
  return res.status(400).json({
    success: false,
    message: "The operation was unsuccessful.",
    details: {
      reason: "access_token is required.",
      suggestion: "Please add a access_token."
    }
  });
}

const accessTokenData = await AccessKey.findOne({access_key:access_token});

console.log(accessTokenData);

if (!accessTokenData) {
  return res.status(400).json({
    success: false,
    message: 'The operation was unsuccessful.',
    error: {
      reason: 'access token expired or invalid',
      suggestion: 'Please use a valid access token.'
    }
  });
}
const {company_id}=accessTokenData;

    // Fetch trades by company_id from the database
    const trades = await Trade.find({ company_id }).select('message created trade_type instrument price cost received order_id');

    // Send the appropriate response based on the trades length
    res.json({
      success: true,
      message: trades.length > 0 ? "The trades were fetched successfully." : "No trades found.",
      data: trades
    });

  } catch (error) {
    console.error('Error occurred:', error.message); // Log the error message for debugging

    // Determine the error type and set the response accordingly
    let status = 500;
    let errorMessage = {
      reason: error.message || 'An error occurred',
      suggestion: "Please try again later."
    };

    if (error.response) {
      // Handle known HTTP errors
      status = error.response.status;
      errorMessage.reason = error.response.data.error || 'An error occurred';
    } else if (error.request) {
      // Handle network-related errors
      errorMessage.reason = 'Network error occurred';
      errorMessage.suggestion = "Please check your network connection and try again.";
    }

    // Send the error response
    res.status(status).json({
      success: false,
      message: "The operation was unsuccessful.",
      error: errorMessage
    });
  }
};

module.exports = {
    order,
    orders
  }