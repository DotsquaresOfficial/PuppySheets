const axios = require('axios');
const RFQ = require('../models/RFQ');
const { v4: uuidv4 } = require('uuid');

const post_request_for_quote = async (req, res) => {
  try {

    // Destructure required properties from the request body
    const { body } = req;

    // Generate uuid 
    const uuid=uuidv4();

    if(body.instrument!=='USTEUR.SPOT'){
      return res.status(400).json({
        "success": false,
        "message": "The operation was unsuccessful.",
        "details": {
            "reason": "Instrument not permitted.",
            "suggestion": "Please utilize the USTEUR.SPOT instrument exclusively at this time."
        }
    });
    }

    // Send the request for quote to the API
    const response = await axios.post(`${process.env.API_BASE_URL}request_for_quote/`, {...body,client_rfq_id:`${uuid}`}, {
      headers: {    'Authorization': `Token ${process.env.AUTHORIZATION}`, 'Content-Type': 'application/json' }
    });

    const apiUrl = `https://portal.bcxpro.io/api/check-balance`;
    const feeResponse = await axios.get(apiUrl);

    const feePercentage=feeResponse.data.client_fee;

    // Extract relevant data from the response
    const { data } = response;
    let { created, rfq_id, client_rfq_id, quantity, side, instrument, price } = data;
    console.log(price,"Before");
    if(side==='sell'){
      price=(Number(price)-Number((Number(price)*Number(feePercentage))/100)).toString();
    }else{
      price=(Number(price)+Number((Number(price)*Number(feePercentage))/100)).toString();
    }

    console.log(price,"After Fee Before Fixed");
    price=Number(price).toFixed(5).toString()
    console.log(price,"After Fixed");
    // Calculate the valid_until timestamp (100 seconds after the creation time)
    const valid_until = new Date((new Date(created)).getTime() + 100 * 1000);

    

    // Update or insert the RFQ data into the database
    await RFQ.findOneAndUpdate({ client_rfq_id }, { created, valid_until, rfq_id, client_rfq_id, quantity, side, instrument, price }, { upsert: true });

    // Respond with the modified response data
    res.json({ ...data,quantity:quantity.slice(0, (quantity.toString().indexOf('.') + 3)), valid_until:valid_until,price:price,rfq_id:undefined});
  } catch (error) {
      // Log the error for debugging purposes
      console.error('Error occurred:', error.message);

      // Handle known HTTP errors
      if (error.response) {
        const { status, data } = error.response;
        return res.status(status).json({ error: data.error || 'An error occurred' });
      }

      // Handle network-related errors
      if (error.request) {
        return res.status(500).json({ error: 'Network error occurred' });
      }

      // Handle other types of errors
      res.status(500).json({ error: 'An error occurred' });
  }
};

module.exports = { post_request_for_quote };
