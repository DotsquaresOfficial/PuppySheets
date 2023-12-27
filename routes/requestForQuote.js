const router = require("express").Router();
const requestForQuote=require('../controller/requestForQuoteController');

router.post("/request_for_quote", requestForQuote.post_request_for_quote);


module.exports = router;