const router = require("express").Router();
const trade=require('../controller/tradeController');

router.get("/trade/:trade_id", trade.get_a_trade);
router.get("/trade", trade.get_multiple_trade);


module.exports = router;