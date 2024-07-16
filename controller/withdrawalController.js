const axios = require('axios');
const FormData = require('form-data');
const AccessKey = require('../models/AccessKey');
const Withdraw = require('../models/Withdraw');
const { v4: uuidv4 } = require('uuid');

/**
 * Retrieves the withdrawal status for a given order ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
const withdrawal_status = async (req, res) => {
  try {
    const { access_token, order_id ,withdraw_type} = req.body;

    // Validate access_token presence
    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "access_token is required.",
          suggestion: "Please add an access_token."
        }
      });
    }

    if (!withdraw_type) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "withdraw_type is required.",
          suggestion: "Please add an withdraw_type."
        }
      });
    }
    // Retrieve company_id using access_token
    const accessTokenData = await AccessKey.findOne({ access_key: access_token });

    // Handle invalid or expired access_token
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

    // Validate order_id presence
    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: "Unable to get withdrawal status.",
        error: {
          reason: "order_id is required.",
          suggestion: "Please add an order_id.",
        },
      });
    }

    const { company_id } = accessTokenData;

    // Configure the request to get withdrawal status
    let data = JSON.stringify({
      "company_id": company_id,
      "order_id": order_id,
      "type": withdraw_type
    });
    const config = {
      method: 'get',
      url: 'https://portal.bcxpro.io/api/withdrawal-status-api',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };
    console.log(data);
    // Make the API request to get withdrawal status
    const response = await axios(config);

    console.log(response.data);

    // Extract relevant data from the API response
    const { status, txn_id, date, type, amount, notes, wallet_address_other } = response.data;

    // Send a successful response with the extracted data
    res.json({
      status,
      txn_id,
      date,
      type,
      amount,
      notes,
      order_id,
      wallet_address: wallet_address_other
    });
  } catch (error) {
    console.error('Error occurred:', error.message);

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

/**
 * Retrieves the withdrawal status for a given order ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
const withdrawal_all = async (req, res) => {
  try {
    const { access_token } = req.body;

    // Validate access_token presence
    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "access_token is required.",
          suggestion: "Please add an access_token."
        }
      });
    }

    // Retrieve company_id using access_token
    const accessTokenData = await AccessKey.findOne({ access_key: access_token });

    // Handle invalid or expired access_token
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

    const { company_id } = accessTokenData;

     const withdraws= await Withdraw.find({company_id}).select('withdraw_request_id company_id account_id amount currency createdAt');

     res.json({
      success: true,
      message: withdraws.length > 0 ? "The withdraws were fetched successfully." : "No withdraws found.",
      data: withdraws.map((item)=>{
         return {
          withdraw_request_id:item.withdraw_request_id,
          company_id:item.company_id,
          account_id:item.account_id,
          amount:item.amount,
          currency:item.currency,
          createdAt:item.createdAt
        }
      })
    });

  } catch (error) {
    console.error('Error occurred:', error.message);

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

/**
 * Handles withdrawal requests for transferring funds to a specified account.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>}
 */
const withdrawal_request = async (req, res) => {
  try {
    const { access_token, account_id, amount, currency, type } = req.body;

    // Validate access_token presence
    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "access_token is required.",
          suggestion: "Please add an access_token."
        }
      });
    }

    // Retrieve company_id using access_token
    const accessTokenData = await AccessKey.findOne({ access_key: access_token });

    // Handle invalid or expired access_token
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

    const { company_id } = accessTokenData;

    // Validate account_id presence
    if (!account_id) {
      return res.status(400).json({
        success: false,
        message: 'The operation was unsuccessful.',
        error: {
          reason: "account_id is required.",
          suggestion: "Please add an account_id.",
        },
      });
    }

    // Create JSON data for the request to get whitelisted wallet
    const configWhitelistedWallet = {
      method: 'get',
      url: 'https://portal.bcxpro.io/api/dedicated-wallets',
      params: { company_id },
      headers: { 'Content-Type': 'application/json' }
    };

    // Make the API request to get whitelisted wallet
    const responseWhitelistedWallet = await axios(configWhitelistedWallet);

    // Filter the account information from the response data
    const whitelistedWalletAddress = responseWhitelistedWallet.data.filter(item => item.id === account_id);

    // Validate account_id existence
    if (whitelistedWalletAddress.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The operation was unsuccessful.',
        error: {
          reason: "Invalid account id.",
          suggestion: "Please check account id.",
        },
      });
    }

    // Validate amount presence
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'The operation was unsuccessful.',
        error: {
          reason: "amount is required.",
          suggestion: "Please add an amount.",
        },
      });
    }

    // Validate currency presence
    if (!currency) {
      return res.status(400).json({
        success: false,
        message: 'The operation was unsuccessful.',
        error: {
          reason: "currency is required.",
          suggestion: "Please add a currency.",
        },
      });
    }

      // Type is required
      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'The operation was unsuccessful.',
          error: {
            reason: "type is required.",
            suggestion: "Please add type.",
          },
        });
      }

    // Create form data for the request to get balance
    const formData = new FormData();
    formData.append('company_id', company_id);

    // Configure the request to get balance
    const configBalance = {
      method: 'get',
      url: `https://portal.bcxpro.io/api/check-balance/${company_id}`,
      headers: {
        ...formData.getHeaders()
      },
      data: formData
    };

    // Make the API request to get balance
    const responseBalance = await axios(configBalance);

    // Filter the currency information from the balance response
    const currencyNameList = responseBalance.data.getTotCryptoBalance.filter(item => item.currency_name === currency);

    // Validate currency existence
    if (currencyNameList.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'The operation was unsuccessful.',
        error: {
          reason: "currency not found.",
          suggestion: "Please use a valid currency.",
        },
      });
    }


    const withdrawUUID = uuidv4(); // Generate a unique UUID for the withdrawal request.

    // Create a new Withdraw document
    const withdraw = new Withdraw({
      withdraw_request_id: withdrawUUID,
      company_id,
      account_id,
      amount,
      currency,
      type
    });

    await withdraw.save(); // Save the Withdraw document to the database.

    // Create JSON data for the withdrawal request
    const dataWithdrawRequest = JSON.stringify({
      "currency_id": currencyNameList[0].id,
      "type": type,
      "quantity": amount,
      "destination_id": account_id,
      "company_id": company_id,
      "withdrawal_request_txn_id": withdrawUUID
    });

    console.log(dataWithdrawRequest);
    // Configure the request to initiate withdrawal
    const configWithdrawRequest = {
      method: 'post',
      url: 'https://portal.bcxpro.io/api/withdrawal-request',
      headers: {
        'Content-Type': 'application/json'
      },
      data: dataWithdrawRequest
    };

    // Make the API request to initiate withdrawal
    const responseWithdrawRequest = await axios(configWithdrawRequest);
    console.log(responseWithdrawRequest)

    // Send a successful response with the withdrawal request status
    res.status(200).json({
      success: true,
      message: 'Withdrawal request successful.',
      data: {
        currency_id: currencyNameList[0].id,
        currency_name: currencyNameList[0].currency_name,
        type,
        quantity: amount,
        destination_id: account_id,
        company_id,
        withdrawal_request_txn_id: withdrawUUID
      }
    });
  } catch (error) {
    console.error('Error occurred:', error.message);

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
  withdrawal_request,
  withdrawal_all
};
