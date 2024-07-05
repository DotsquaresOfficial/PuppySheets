const router = require("express").Router();
const getTradingPairs=require('../controller/getTradingPairsController');

router.get("/get_trading_pairs", getTradingPairs.get_trading_pairs);


module.exports = router;