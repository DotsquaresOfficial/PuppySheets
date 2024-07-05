const router = require("express").Router();
const requestForQuote=require('../controller/requestForQuoteController');

router.post("/request_for_quote", requestForQuote.request_for_quote);

module.exports = router;