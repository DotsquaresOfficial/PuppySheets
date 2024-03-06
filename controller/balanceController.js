const axios = require('axios');

const get_balance = async (req, res) => {
  try {
    // Ensure that the request contains the Authorization header
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    // Sanitize input to prevent injection attacks
    const apiUrl = `${process.env.API_BASE_URL}balance/`;
    const headers = { 'Authorization': authorizationHeader };

    const response = await axios.get(apiUrl, { headers });

    // Return the response data
    res.json(response.data);

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

module.exports = { get_balance };
