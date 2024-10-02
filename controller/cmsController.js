const axios = require("axios"); // Import the axios library for making HTTP requests.
const FormData = require("form-data"); // Import the FormData library to create multipart/form-data payloads.
const { v4: uuidv4 } = require("uuid");
const CMS = require("../models/CMS");

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
    return response.status(status).json({
      success: false,
      message: "The operation was unsuccessful.",
      details: { reason: data.error || reason, suggestion },
    }); // Send a JSON response with the error details.
  } else if (request) {
    // Check if the error has a request object, indicating a network error.
    return response.status(500).json({
      success: false,
      message: "The operation was unsuccessful.",
      details: {
        reason: "Network error occurred.",
        suggestion: "Please check your network connection and try again.",
      },
    }); // Send a JSON response with a network error message.
  } else {
    // If the error is not related to axios response or request.
    return response.status(500).json({
      success: false,
      message: "The operation was unsuccessful.",
      details: { reason: message, suggestion: "Please try again later." },
    }); // Send a JSON response with a generic error message.
  }
};

const getCms = async (req, res) => {
  // Async function to get testimonials.
  try {

    const {type} = req.body;

     // Validate required parameters
     if (!type) {
        return res.status(400).json({
          success: false,
          message: "The operation was unsuccessful.",
          details: {
            reason: "type is required.",
            suggestion: "Please add a type.",
          },
        });
      }else if(typeof(type) !== typeof("String")){
        return res.status(400).json({
          success: false,
          message: "The operation was unsuccessful.",
          details: {
            reason: "type is invalid.",
            suggestion: "Please add a valid type.",
          },
        });
      }else if(!(['privacy_policy', 'terms_and_conditions','about_us'].includes(type))){
        return res.status(400).json({
            success: false,
            message: "The operation was unsuccessful.",
            details: {
              reason: "type is invalid.",
              suggestion: "Please add a valid type from ['privacy_policy', 'terms_and_conditions','about_us'].",
            },
          });
      }

    const cms= await CMS.find({type}).select('type title body');

    return res.status(200).json({
      success: true,
      message: "CMS fetched successfully.",
      data: cms.map((e)=>{
        return {
            type: e.type,
            title: e.title,
            body: e.body,
        };
      })[0],
    }); // Send a JSON response with the balance data.
  } catch (error) {
    // Catch any errors that occur during the try block.
    console.error("Error occurred:", error); // Log the error to the console.
    return generateErrorResponse(error, res); // Generate and send an error response based on the error type.
  }
};

const postCms = async (req, res) => {
  // Async function to post testimonials.
  try {
    // Destructure required properties from the request body
    const {type, title, body } = req.body;

   // Validate required parameters
   if (!type) {
    return res.status(400).json({
      success: false,
      message: "The operation was unsuccessful.",
      details: {
        reason: "type is required.",
        suggestion: "Please add a type.",
      },
    });
  }else if(typeof(type) !== typeof("String")){
    return res.status(400).json({
      success: false,
      message: "The operation was unsuccessful.",
      details: {
        reason: "type is invalid.",
        suggestion: "Please add a valid type.",
      },
    });
  }else if(!(['privacy_policy', 'terms_and_conditions','about_us'].includes(type))){
    return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "type is invalid.",
          suggestion: "Please add a valid type from ['privacy_policy', 'terms_and_conditions','about_us'].",
        },
      });
  }

    // Validate required parameters
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "title is required.",
          suggestion: "Please add a title.",
        },
      });
    }else if(typeof(title) !== typeof("String")){
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "title is invalid.",
          suggestion: "Please add a valid title.",
        },
      });
    }

    // Validate required parameters
    if (!body) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "body is required.",
          suggestion: "Please add an body.",
        },
      });
    }else if(typeof(body)!==typeof("String")){
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "body is invalid.",
          suggestion: "Please add a valid body.",
        },
      });
    }


    // Update The CMS
    await CMS.findOneAndUpdate(
      { type },
      {
        type, title, body
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: `CMS updated successfully.`,
      data:{
        type, title, body
      }
    }); // Send a JSON response with the balance data.
  } catch (error) {
    // Catch any errors that occur during the try block.
    console.error("Error occurred:", error); // Log the error to the console.
    return generateErrorResponse(error, res); // Generate and send an error response based on the error type.
  }
};

module.exports = { getCms, postCms }; // Export the getBalance function for use in other modules.
