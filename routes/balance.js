const router = require("express").Router();
const balance=require('../controller/balanceController');

router.get("/balance", balance.getBalance);

module.exports = router;