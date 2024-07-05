const axios = require('axios');
const FormData = require('form-data');

// Function to get the withdrawal status
const withdrawal_status = async (req, res) => {
  try {
    // Check if company_id is provided in the request body
    if (!req.body.company_id) {
      return res.status(400).json({
        success: false,
        message: "Unable to get withdrawal status.",
        error: {
          reason: "company_id is required.",
          suggestion: "Please add a company_id.",
        },
      });
    }

    // Check if order_id is provided in the request body
    if (!req.body.order_id) {
      return res.status(400).json({
        success: false,
        message: "Unable to get withdrawal status.",
        error: {
          reason: "order_id is required.",
          suggestion: "Please add an order_id.",
        },
      });
    }

    // Configure the request
    let config = {
      method: 'get', // HTTP method
      maxBodyLength: Infinity, // No limit on body length
      url: 'https://portal.bcxpro.io/api/withdrawal-status-api', // API endpoint
      headers: {
        'Content-Type': 'application/json' // Set content type to JSON
      },
      data: req.body // Request body containing company_id and order_id
    };

    console.log(req.body); // Log the request body for debugging purposes

    // Make the API request
    const response = await axios.request(config);
    console.log(response.data); // Log the response data for debugging purposes

    // Destructure relevant data from the API response
    const { status, txn_id, date, type, amount, notes, order_id, wallet_address_other } = response.data;

    // Send a successful response with the extracted data
    res.json({
      status: status,
      txn_id: txn_id,
      date: date,
      type: type,
      amount: amount,
      notes: notes,
      order_id: order_id,
      wallet_address: wallet_address_other
    });
  } catch (error) {
    console.error('Error occurred:', error.message); // Log the error message for debugging

    // Handle known HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status).json({
        success: false,
        message: "Operation unsuccessful.",
        error: {
          reason: data.error || 'An error occurred',
          suggestion: "Please check the provided data and try again."
        }
      });
    }

    // Handle network-related errors
    if (error.request) {
      return res.status(500).json({
        success: false,
        message: "Operation unsuccessful.",
        error: {
          reason: 'Network error occurred',
          suggestion: "Please check your network connection and try again."
        }
      });
    }

    // Handle other types of errors
    res.status(500).json({
      success: false,
      message: "Operation unsuccessful.",
      error: {
        reason: error.message || 'An error occurred',
        suggestion: "Please try again later."
      }
    });
  }
};

module.exports = {
  withdrawal_status,
};
