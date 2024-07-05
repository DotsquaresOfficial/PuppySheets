const express = require('express')
const app = express();
const dotEnv=require('dotenv');
const cors = require("cors");
dotEnv.config();


// Import routes
const balanceRoute = require("./routes/balance");
const getTradingPairsRoute=require("./routes/getTradingPairs");
const requestForQuoteRoute=require("./routes/requestForQuote");
const getWhitelistedAccountsRoute=require("./routes/getWhitelistedAccounts");
const orderRoute=require("./routes/order");
const withdrawalStatusRoute=require("./routes/withdrawalStatus");
const genrateAuthTokenRoute=require("./routes/generateAuthToken");

// Connecting with database
const connectDB = require('./mongoose');

// Middlewares
app.use(express.json());
app.use(cors());

connectDB();


app.use("/api/v1",genrateAuthTokenRoute);
app.use("/api/v1",getTradingPairsRoute);
app.use("/api/v1", balanceRoute);
app.use("/api/v1",requestForQuoteRoute);
app.use("/api/v1",getWhitelistedAccountsRoute);
app.use("/api/v1",orderRoute);
app.use("/api/v1",withdrawalStatusRoute);


app.listen(process.env.PORT||8001, () => {
  console.log(`LP API listening on port ${8001}`)
});