const axios = require('axios'); // Import the axios library for making HTTP requests
const RFQ = require('../models/RFQ'); // Import the RFQ model for database operations
const { v4: uuidv4 } = require('uuid'); // Import the uuid library for generating unique identifiers

// Function to handle the request for quote
const request_for_quote = async (req, res) => {
  try {
    // Destructure required properties from the request body
    const { instrument, side, quantity, company_id } = req.body;

    // Validate required parameters
    if (!instrument) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "instrument is required.",
          suggestion: "Please add an instrument."
        }
      });
    }

    if (!side) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "side is required.",
          suggestion: "Please add a side."
        }
      });
    }

    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "quantity is required.",
          suggestion: "Please add a quantity."
        }
      });
    }

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "company_id is required.",
          suggestion: "Please add a company_id."
        }
      });
    }

    // Generate a unique client RFQ ID
    const client_rfq_id = uuidv4();

    // Send the request for quote to the API
    const response = await axios.post(
      `${process.env.API_BASE_URL}request_for_quote/`, 
      { instrument, side, quantity, client_rfq_id }, 
      { headers: { 'Authorization': `Token ${process.env.AUTHORIZATION}`, 'Content-Type': 'application/json' } }
    );

    // Get Client Fee
    const feeResponse = await axios.get(`https://portal.bcxpro.io/api/check-balance/${company_id}`);
    const feePercentage = feeResponse.data.client_fee;

    // Extract relevant data from the response
    const { created, rfq_id, quantity: respQuantity, price: respPrice } = response.data;
    let price = Number(respPrice); // Convert price to a number for calculations

    // Adjust the price based on the side and feePercentage
    if (side === 'sell') {
      price -= (price * feePercentage) / 100;
    } else {
      price += (price * feePercentage) / 100;
    }

    // Round price to 5 decimal places
    price = price.toFixed(5);

    // Calculate the valid_until timestamp (30 seconds after the creation time)
    const valid_until = new Date(new Date(created).getTime() + 30 * 1000);

    // Update or insert the RFQ data into the database
    await RFQ.findOneAndUpdate(
      { client_rfq_id },
      { created, valid_until, rfq_id, client_rfq_id, quantity: respQuantity, side, instrument, price },
      { upsert: true }
    );

    // Respond with the modified response data
    res.json({ 
      ...response.data, 
      quantity: respQuantity.slice(0, (respQuantity.toString().indexOf('.') + 3)), // Trim quantity to 2 decimal places
      valid_until, 
      price, 
      rfq_id: undefined // Remove rfq_id from the response
    });

  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error occurred:', error);

    // Handle known HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: data.error || 'An error occurred',
          suggestion: "Please check the provided data and try again."
        }
      });
    }

    // Handle network-related errors
    if (error.request) {
      return res.status(500).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "Network error occurred.",
          suggestion: "Please check your network connection and try again."
        }
      });
    }

    // Handle other types of errors
    return res.status(500).json({
      success: false,
      message: "The operation was unsuccessful.",
      details: {
        reason: error.message,
        suggestion: "Please try again later."
      }
    });
  }
};

// Export the function as a module
module.exports = { request_for_quote };
