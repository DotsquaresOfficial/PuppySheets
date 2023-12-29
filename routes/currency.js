const  currency  = require("../controller/currencyController");

const router = require("express").Router();


router.get("/currency", currency.currency);




module.exports = router;