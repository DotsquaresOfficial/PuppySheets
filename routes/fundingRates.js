const  fundingRates  = require("../controller/fundingRatesController");

const router = require("express").Router();


router.get("/funding_rates", fundingRates.funding_rates);




module.exports = router;