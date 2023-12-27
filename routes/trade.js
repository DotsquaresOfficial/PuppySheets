const router = require("express").Router();
const trade=require('../controller/tradeController');

router.get("/get_a_trade", trade.get_a_trade);
router.get("/get_multiple_trade", trade.get_multiple_trade);


module.exports = router;