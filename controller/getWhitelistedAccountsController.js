const axios = require('axios');
const FormData = require('form-data');
const AccessKey = require('../models/AccessKey');

// Function to get the balance for a company
const get_whitelisted_accounts = async (req, res) => {
  try {

    const {access_token} = req.body;

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

    // Create form data for the request
    let data = JSON.stringify({
        "company_id": company_id
    });

   

    const formData = new FormData(); // Create a new FormData instance.
    formData.append("company_id", accessTokenData.company_id); // Append the company_id to the FormData instance.

    const axiosConfig = {
      // Define the axios configuration object for the HTTP request.
      method: "get", // Set the HTTP method to GET.
      maxBodyLength: Infinity, // Set the maximum body length to Infinity.
      url: `https://portal.bcxpro.io/api/check-balance/${accessTokenData.company_id}`, // Set the URL for the HTTP request.
      headers: formData.getHeaders(), // Set the headers for the HTTP request using the FormData headers.
      data: formData, // Set the data for the HTTP request to the FormData instance.
    };

    const axiosResponse = await axios.request(axiosConfig); // Make the HTTP request using axios and await the response.
    console.log(axiosResponse.data.getTotCryptoBalance.map(e=>e.id.toString()),"Balance Response");

    // Make the API request to get the whitelisted account balance.
     // Configure the request
     let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://portal.bcxpro.io/api/dedicated-wallets`,
      headers: { 
      'Content-Type': 'application/json'
      },
      data: data
    };
    const response = await axios.request(config);
    console.log(response);


    // Process the response data to format the balance information
    const whitelistedWalletAddress = response.data.filter(item=>item.wallet_address).map(item => (
         {
         
          id:item.id,
          currency:axiosResponse.data.getTotCryptoBalance.find((e)=>e.id.toString()===item.crypto_id.toString()).currency_name,
          wallet:item.wallet_address}
    ));

    const whitelistedBankAccounts = response.data.filter(item=>item.bank_acc).map(item => (
     {
      id:item.id,
      currency:item.fiat_id===1?'GBP':item.fiat_id===2?'EUR':item.fiat_id===3?'USD':'Undefined',
      account:item.bank_acc}
 ));


    // Return the response data
    res.status(200).json({
      success: true,
      message: "Accounts fetched successfully.",
      wallets:whitelistedWalletAddress,
      bank_accounts:whitelistedBankAccounts,
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

module.exports = { get_whitelisted_accounts };
