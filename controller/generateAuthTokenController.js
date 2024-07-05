const axios = require("axios");
const crypto = require("crypto");
const AccessKey = require("./../models/AccessKey");
const sgMail = require("@sendgrid/mail");
const { auth_key_email } = require("../emailTemplates/authKeyTemplate");

// Function to generate a random key of specified length
const generateRandomKey = (length) => {
  // Generate random bytes
  const buffer = crypto.randomBytes(length || 16); // Default length is 16 if not specified
  // Convert the buffer to a hexadecimal string
  return buffer.toString("hex");
};

// Function to generate and send an authentication token
const generate_auth_token = async (req, res) => {
  try {
    // Check if we have a company id
    if (!req.body.company_id) {
      return res.status(400).json({
        success: false,
        message: "Unable to generate auth token.",
        error: {
          reason: "company_id is required.",
          suggestion: "Please add a company_id.",
        },
      });
    }

    // Generate a random key specific to the company id
    const accessKey = generateRandomKey(16);

    // Configuration for the POST request to get email from company id
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://portal.bcxpro.io/api/user-authentication",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        company_id: req.body.company_id,
      }),
    };

    // Make the POST request
    let response;
    try {
      response = await axios.request(config);
    } catch (axiosError) {
      if (axiosError.response) {
        // Request made and server responded
        return res.status(axiosError.response.status).json({
          success: false,
          message: "Failed to authenticate company.",
          error: {
            reason: axiosError.response.data,
            suggestion: "Please check the company_id and try again.",
          },
        });
      } else if (axiosError.request) {
        // The request was made but no response was received
        return res.status(500).json({
          success: false,
          message: "No response received from authentication server.",
          error: {
            reason: "The authentication server did not respond.",
            suggestion: "Please try again later.",
          },
        });
      } else {
        // Something happened in setting up the request
        return res.status(500).json({
          success: false,
          message: "Error setting up the authentication request.",
          error: {
            reason: axiosError.message,
            suggestion: "Please try again later.",
          },
        });
      }
    }

    // Save the key to the database
    try {
      const existingAccessKey = await AccessKey.findOne({
        company_id: req.body.company_id,
      });

      if (existingAccessKey) {
        // Update existing document
        existingAccessKey.access_key = accessKey;
        await existingAccessKey.save();
      } else {
        // Create a new document
        const newAccessKey = new AccessKey({
          company_id: req.body.company_id,
          access_key: accessKey,
        });
        await newAccessKey.save();
      }
    } catch (dbError) {
      return res.status(500).json({
        success: false,
        message: "Database error while saving access key.",
        error: {
          reason: dbError.message,
          suggestion: "Please try again later.",
        },
      });
    }

    // Send email with the generated access key
    try {
      const SEND_GRID_EMAIL_API_KEY = process.env.SEND_GRID_EMAIL_API_KEY;
      sgMail.setApiKey(SEND_GRID_EMAIL_API_KEY);

      // Placeholder for live email retrieval; replace with actual email
      // response.data.data.email ||
      const email =  "rampandey.dotsquares@gmail.com"; // Change this for production use

      await sgMail.send({
        to: [email],
        from: process.env.send_grid_sender_email,
        subject: "Your BCX Pro API Authentication Token",
        html: auth_key_email(accessKey),
      });

      // Send a success response
      res.status(200).json({
        success: true,
        message: `Access Token sent to email: ${response.data.data}`,
      });
    } catch (emailError) {
      return res.status(500).json({
        success: false,
        message: "Failed to send email with access key.",
        error: {
          reason: emailError.message,
          suggestion: "Please verify the email configuration and try again.",
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to generate auth token.",
      error: {
        reason: error.message,
        suggestion: "Please try again later.",
      },
    });
  }
};

// Export the function as a module
module.exports = {
  generate_auth_token,
};
