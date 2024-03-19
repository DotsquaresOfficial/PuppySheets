const axios = require('axios');

const get_balance = async (req, res) => {
  try {

    const apiUrl = `https://portal.bcxpro.io/api/check-balance`;
    const response = await axios.get(apiUrl);

    const balanceData = response.data.getTotCryptoBalance.reduce((acc, e) => {
      const currency = e.currency;
      const amount = e.crypto_amt;
      acc[currency] = `${amount}`;
      return acc;
    }, {});

    // Return the response data
    res.json({...balanceData,EUR:response.data.eur_balance});

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
