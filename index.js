const express = require('express');
const dotEnv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const expressValidator = require('express-validator');
const sanitize = require('mongo-sanitize');
const { check, validationResult } = require('express-validator');

// Load environment variables
dotEnv.config();

// Validate environment variables
const requiredEnvVars = ['PORT', 'API_BASE_URL', 'AUTHORIZATION'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable ${envVar}`);
    process.exit(1);
  }
});

// Initialize Express app
const app = express();

// Database connection
const connectDB = require('./mongoose');
connectDB();

// Middleware
app.use(helmet()); // Security headers
// app.use(cors({
//   origin: 'https://your-allowed-origin.com', // Replace with your allowed origin
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   preflightContinue: false,
//   optionsSuccessStatus: 204
// }));
app.use(bodyParser.json({ limit: '10mb' })); // Parse JSON requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined')); // Logging requests
app.use(compression()); // Enable compression

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});
app.use(limiter);

// Middleware to sanitize user input
app.use((req, res, next) => {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
});

// Middleware to handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON:', err.message);
    return res.status(400).json({
      success: false,
      message: "The operation was unsuccessful.",
      error: {
        reason: "Invalid JSON format.",
        suggestion: "Please ensure the JSON payload is correctly formatted."
      }
    });
  }
  next();
});

// Import routes
const balanceRoute = require("./routes/balance");
const getTradingPairsRoute = require("./routes/getTradingPairs");
const requestForQuoteRoute = require("./routes/requestForQuote");
const getWhitelistedAccountsRoute = require("./routes/getWhitelistedAccounts");
const orderRoute = require("./routes/order");
const withdrawalStatusRoute = require("./routes/withdrawalStatus");
const generateAuthTokenRoute = require("./routes/generateAuthToken");

// Validation middleware
const validateRequest = (schema) => {
  return [
    ...schema,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "The operation was unsuccessful.",
          error: {
            reason: "Validation failed.",
            details: errors.array()
          }
        });
      }
      next();
    }
  ];
};

// Example validation schema
const companyIdValidation = [
  check('company_id').isNumeric().withMessage('company_id must be a number')
];

// API routes
app.use("/api/v1", generateAuthTokenRoute);
app.use("/api/v1", getTradingPairsRoute);
app.use("/api/v1", balanceRoute);
app.use("/api/v1", validateRequest(companyIdValidation), requestForQuoteRoute);
app.use("/api/v1", getWhitelistedAccountsRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", withdrawalStatusRoute);

// Catch-all route handler for undefined routes (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "The operation was unsuccessful.",
    error: {
      reason: "Route not found.",
      suggestion: "Please check the URL and try again."
    }
  });
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.message); // Log the error message for debugging

  // Handle known HTTP errors
  let status = err.status || 500;
  let errorMessage = {
    reason: err.message || 'An error occurred',
    suggestion: "Please try again later."
  };

  // Handle network-related errors
  if (err.request) {
    status = 500;
    errorMessage.reason = 'Network error occurred';
    errorMessage.suggestion = "Please check your network connection and try again.";
  }

  // Send the error response
  res.status(status).json({
    success: false,
    message: "The operation was unsuccessful.",
    error: errorMessage
  });
});

// Start the server
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`LP API listening on port ${PORT}`);
});
