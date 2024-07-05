const axios = require('axios');

// Function to fetch trading pairs
const get_trading_pairs = async (req, res) => {
  try {
    // Validate request body
    const allFlag = req.body.all === true;

    // Prepare request data
    const data = JSON.stringify({ "all": allFlag });

    // Configuration for the GET request to fetch trading pairs
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${process.env.API_BASE_URL}instruments/`,
      headers: { 
        'Authorization': `Token ${process.env.AUTHORIZATION}`,
        'Content-Type': 'application/json',
      },
      data: data
    };

    // Make the GET request
    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));

    // Send a success response with the fetched data
    return res.status(200).json({
      success: true,
      message: "Trading pairs fetched successfully.",
      data: response.data,
    });

  } catch (error) {
    // Enhanced error handling

    // Log the error for debugging
    console.error(error);

    if (error.response) {
      // Server responded with a status code out of the 2xx range
      return res.status(error.response.status).json({
        success: false,
        message: "Failed to fetch trading pairs.",
        error: {
          reason: error.response.data,
          suggestion: "Please check the request and try again.",
        },
      });
    } else if (error.request) {
      // Request was made but no response received
      return res.status(500).json({
        success: false,
        message: "No response received from the server.",
        error: {
          reason: "The server did not respond.",
          suggestion: "Please try again later.",
        },
      });
    } else {
      // Error in setting up the request
      return res.status(500).json({
        success: false,
        message: "Error in setting up the request.",
        error: {
          reason: error.message,
          suggestion: "Please try again later.",
        },
      });
    }
  }
};

// Export the function as a module
module.exports = {
  get_trading_pairs
};
