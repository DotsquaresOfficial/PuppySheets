const express = require('express')
const app = express();
const dotEnv=require('dotenv');
const mongoose=require('mongoose');
const cors = require("cors");
dotEnv.config();


// Import routes
const balanceRoute = require("./routes/balance");
const marginRequirmentRoute=require("./routes/marginRequirments");
const openPositionRoute=require("./routes/openPosition");
const instrumentsRoute=require("./routes/instruments");
const requestForQuoteRoute=require("./routes/requestForQuote");
const orderRoute=require("./routes/order");
const tradeRoute=require("./routes/trade");
const cfdContractsRoute=require("./routes/cdfContracts");
const ledgerRoute=require("./routes/ledger");
const withdrawRoute=require("./routes/withdraw");
const currencyRoute=require("./routes/currency");
const fundingRatesRoute=require("./routes/fundingRates");
const accountInfoRoute=require("./routes/accountInfo");

// Connecting with database
const connectDB = require('./mongoose');

// Middlewares
app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/v1", balanceRoute);
app.use("/api/v1",instrumentsRoute);
app.use("/api/v1",requestForQuoteRoute);
app.use("/api/v1",orderRoute);


app.listen(process.env.PORT||8001, () => {
  console.log(`LP API listening on port ${8001}`)
});