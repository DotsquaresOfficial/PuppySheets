const axios = require('axios');
const RFQ = require('../models/RFQ');
const { v4: uuidv4 } = require('uuid');

const post_request_for_quote = async (req, res) => {
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

    // Send the request for quote to the API
    const response = await axios.post(`${process.env.API_BASE_URL}request_for_quote/`, {...body,client_rfq_id:`${uuid}`}, {
      headers: { 'Authorization': authorization, 'Content-Type': 'application/json' }
    });

    // Extract relevant data from the response
    const { data } = response;
    const { created, rfq_id, client_rfq_id, quantity, side, instrument, price } = data;

    // Calculate the valid_until timestamp (100 seconds after the creation time)
    const valid_until = new Date((new Date(created)).getTime() + 100 * 1000);

    // Update or insert the RFQ data into the database
    await RFQ.findOneAndUpdate({ client_rfq_id }, { created, valid_until, rfq_id, client_rfq_id, quantity, side, instrument, price }, { upsert: true });

    // Respond with the modified response data
    res.json({ ...data,quantity:quantity.slice(0, (quantity.toString().indexOf('.') + 3)), valid_until:valid_until, price:price.slice(0, (price.toString().indexOf('.') + 6))});
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
