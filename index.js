const express = require('express')
const app = express();
const port = process.env.PORT;
const dotEnv=require('dotenv');
const mongoose=require('mongoose');
const cors = require("cors");
dotEnv.config();

mongoose.connect(process.env.DB_CONNECT);
mongoose.Promise=global.Promise;
let db=mongoose.connection;

db.on('connected',()=>{
    console.log('Connected to db');
});

db.on('error',(error)=>{
   console.error('error',error);
});

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

// Middlewares
app.use(express.json());
app.use(cors());

// route Middlewares
app.use("/api/v1", balanceRoute);
app.use("/api/v1",marginRequirmentRoute);
app.use("/api/v1",openPositionRoute);
app.use("/api/v1",instrumentsRoute);
app.use("/api/v1",requestForQuoteRoute);
app.use("/api/v1",orderRoute);
app.use("/api/v1",tradeRoute);
app.use("/api/v1",cfdContractsRoute);
app.use("/api/v1",ledgerRoute);

app.listen(port, () => {
  console.log(`LP API listening on port ${port}`)
});