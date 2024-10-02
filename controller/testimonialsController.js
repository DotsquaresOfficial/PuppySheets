const axios = require("axios"); // Import the axios library for making HTTP requests.
const FormData = require("form-data"); // Import the FormData library to create multipart/form-data payloads.
const Testimonial = require("../models/Testimonial");
const { v4: uuidv4 } = require("uuid");

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

const getTestimonials = async (req, res) => {
  // Async function to get testimonials.
  try {

    const testimonials= await Testimonial.find({active:true}).select('testimonial_id name testimonial rating avatar');

    return res.status(200).json({
      success: true,
      message: "Testimonials fetched successfully.",
      data: testimonials.map((e)=>{
        return {
          testimonial_id: e.testimonial_id,
          name: e.name,
          rating: e.rating,
          testimonial: e.testimonial,
          avatar: e.avatar,
        };
      }),
    }); // Send a JSON response with the balance data.
  } catch (error) {
    // Catch any errors that occur during the try block.
    console.error("Error occurred:", error); // Log the error to the console.
    return generateErrorResponse(error, res); // Generate and send an error response based on the error type.
  }
};

function isUrlValid(str) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  );
  return pattern.test(str);
 }

const postTestimonials = async (req, res) => {
  // Async function to post testimonials.
  try {
    // Destructure required properties from the request body
    const { testimonial_id, active, name, testimonial, rating, avatar } = req.body;

    // If id parameter is given that should exist in database
    if(testimonial_id){
      const testimonialData= await Testimonial.findOne({testimonial_id});
      if(!testimonialData){
        return res.status(400).json({
          success: false,
          message: "The operation was unsuccessful.",
          details: {
            reason: "id is invalid.",
            suggestion: "Please check your id.",
          },
        }); 
      }
    }

    // Check if id Exists or generate a new Id
    const testimonialId = testimonial_id ?? uuidv4();

    // Validate required parameters
    if (active===undefined||active===null) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "active is required.",
          suggestion: "Please add an active.",
        },
      });
    }else if(typeof(active) !== typeof(true)){
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "active is invalid.",
          suggestion: "Please add a valid active.",
        },
      });
    }

    // Validate required parameters
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "name is required.",
          suggestion: "Please add a name.",
        },
      });
    }else if(typeof(name) !== typeof("String")){
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "name is invalid.",
          suggestion: "Please add a valid name.",
        },
      });
    }

    // Validate required parameters
    if (!testimonial) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "testimonial is required.",
          suggestion: "Please add an testimonial.",
        },
      });
    }else if(typeof(testimonial)!==typeof("String")){
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "testimonial is invalid.",
          suggestion: "Please add a valid testimonial.",
        },
      });
    }

    // Validate required parameters
    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "rating is required.",
          suggestion: "Please add an rating.",
        },
      });
    }else if(typeof(rating)!==typeof(0) || rating>5 || rating<0 ){
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "rating is invalid.",
          suggestion: "Please add a valid rating. Rating Ranges from (0 to 5)",
        },
      });
    }

    // Validate required parameters
    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "avatar is required.",
          suggestion: "Please add an avatar.",
        },
      });
    }else if(typeof(avatar)!==typeof("String")){
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "avatar is invalid.",
          suggestion: "Please add a valid avatar.",
        },
      });
    }else if(!isUrlValid(avatar)){
      return res.status(400).json({
        success: false,
        message: "The operation was unsuccessful.",
        details: {
          reason: "avatar is invalid.",
          suggestion: "Please add a valid avatar URL.",
        },
      });
    }


    await Testimonial.findOneAndUpdate(
      { testimonial_id:testimonialId },
      {
        active, name, testimonial, rating, avatar
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: `Testimonials ${testimonial_id?"updated":"added"} successfully.`,
      data:{
        testimonial_id:testimonialId,
        active, name, testimonial, rating, avatar
      }
    }); // Send a JSON response with the balance data.
  } catch (error) {
    // Catch any errors that occur during the try block.
    console.error("Error occurred:", error); // Log the error to the console.
    return generateErrorResponse(error, res); // Generate and send an error response based on the error type.
  }
};

module.exports = { getTestimonials, postTestimonials }; // Export the getBalance function for use in other modules.
