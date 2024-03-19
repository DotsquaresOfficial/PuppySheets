const  withdraw  = require("../controller/withdrawController");

const router = require("express").Router();


router.get("/withdrawal", withdraw.get_a_withdraw);


module.exports = router;