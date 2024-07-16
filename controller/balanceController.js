const axios = require("axios"); // Import the axios library for making HTTP requests.
const FormData = require("form-data"); // Import the FormData library to create multipart/form-data payloads.
const AccessKey = require("../models/AccessKey"); // Import the AccessKey model from the models directory.

const errorMessages = {
  // Define a mapping of HTTP status codes to error messages and suggestions.
  400: [
    "Bad request. Please check the provided data.",
    "Ensure all required fields are correctly filled.",
  ],
  401: [
    "Unauthorized. Invalid credentials.",
    "Please provide valid credentials.",
  ],
  403: [
    "Forbidden. You do not have permission to access this resource.",
    "Ensure you have the necessary permissions.",
  ],
  404: [
    "Not found. The requested resource could not be found.",
    "Check the URL and try again.",
  ],
  500: [
    "Internal server error. Something went wrong on our end.",
    "Please try again later.",
  ],
  502: [
    "Bad gateway. Invalid response from the upstream server.",
    "Please try again later.",
  ],
  503: [
    "Service unavailable. The server is temporarily unavailable.",
    "Please try again later.",
  ],
  504: [
    "Gateway timeout. The server took too long to respond.",
    "Please try again later.",
  ],
  default: ["An unexpected error occurred.", "Please try again later."],
};

const generateErrorResponse = (error, response) => {
  // Function to generate an error response based on the error type.
  const { response: axiosResponse, request, message } = error; // Destructure the error object into its components.
  if (axiosResponse) {
    // Check if the error has an axios response object.
    const { status, data } = axiosResponse; // Destructure the status and data from the axios response object.
    const [reason, suggestion] = errorMessages[status] || errorMessages.default; // Get the reason and suggestion based on the status code.
    return response
      .status(status)
      .json({
        success: false,
        message: "The operation was unsuccessful.",
        details: { reason: data.error || reason, suggestion },
      }); // Send a JSON response with the error details.
  } else if (request) {
    // Check if the error has a request object, indicating a network error.
    return response
      .status(500)
      .json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "Network error occurred.",
          suggestion: "Please check your network connection and try again.",
        },
      }); // Send a JSON response with a network error message.
  } else {
    // If the error is not related to axios response or request.
    return response
      .status(500)
      .json({
        success: false,
        message: "The operation was unsuccessful.",
        details: { reason: message, suggestion: "Please try again later." },
      }); // Send a JSON response with a generic error message.
  }
};

const getBalance = async (request, response) => {
  // Async function to get the balance for a company.
  try {
    const { access_token } = request.body; // Destructure the access_token from the request body.
    if (!access_token) {
      // Check if the access_token is missing.
      return response
        .status(400)
        .json({
          success: false,
          message: "The operation was unsuccessful.",
          details: {
            reason: errorMessages[400][0],
            suggestion: errorMessages[400][1],
          },
        }); // Send a JSON response indicating that the access_token is required.
    }

    const accessTokenData = await AccessKey.findOne({
      access_key: access_token,
    }); // Query the database for the access token.
    if (!accessTokenData) {
      // Check if the access token is not found in the database.
      return response
        .status(400)
        .json({
          success: false,
          message: "The operation was unsuccessful.",
          error: {
            reason: errorMessages[401][0],
            suggestion: errorMessages[401][1],
          },
        }); // Send a JSON response indicating that the access token is invalid.
    }

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
    console.log(axiosResponse); // console log the response.
    const balanceData = axiosResponse.data.getTotCryptoBalance.reduce(
      (accumulator, { currency, crypto_amt }) => {
        // Reduce the getTotCryptoBalance array to a balanceData object.
        accumulator[currency] = `${crypto_amt}`; // Set the currency amount in the balanceData object.
        return accumulator; // Return the accumulator for the next iteration.
      },
      { EUR: axiosResponse.data.eur_balance ,USD: axiosResponse.data.usd_balance,GBP: axiosResponse.data.gbp_balance },
    ); // Initialize the balanceData object with the EUR balance.


    return response
      .status(200)
      .json({
        success: true,
        message: "Balance fetched successfully.",
        data: balanceData,
      }); // Send a JSON response with the balance data.
  } catch (error) {
    // Catch any errors that occur during the try block.
    console.error("Error occurred:", error); // Log the error to the console.
    return generateErrorResponse(error, response); // Generate and send an error response based on the error type.
  }
};

module.exports = { getBalance }; // Export the getBalance function for use in other modules.
