const axios = require('axios');
const FormData = require('form-data');

// Function to get the balance for a company
const get_balance = async (req, res) => {
  try {
    // Validate the presence of company_id in the request body
    const { company_id } = req.body;
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

    // Create form data for the request
    let data = new FormData();
    data.append('company_id', company_id);

    // Configure the request
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://portal.bcxpro.io/api/check-balance/${company_id}`,
      headers: { 
        ...data.getHeaders()
      },
      data: data
    };

    // Make the API request to get the balance
    const response = await axios.request(config);

    // Process the response data to format the balance information
    const balanceData = response.data.getTotCryptoBalance.reduce((acc, e) => {
      const currency = e.currency;
      const amount = e.crypto_amt;
      acc[currency] = `${amount}`;
      return acc;
    }, {});

    // Include EUR balance in the response
    balanceData.EUR = response.data.eur_balance;

    // Return the response data
    res.status(200).json({
      success: true,
      message: "Balance fetched successfully.",
      data: balanceData
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
    res.status(500).json({
      success: false,
      message: "The operation was unsuccessful.",
      details: {
        reason: error.message,
        suggestion: "Please try again later."
      }
    });
  }
};

module.exports = { get_balance };
