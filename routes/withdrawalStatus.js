const  withdrawalStatus  = require("../controller/withdrawalStatusController");

const router = require("express").Router();


router.get("/withdrawal_status", withdrawalStatus.withdrawal_status);


module.exports = router;