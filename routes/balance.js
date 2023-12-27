const router = require("express").Router();
const balance=require('../controller/balanceController');

router.get("/balance", balance.get_balance);


module.exports = router;