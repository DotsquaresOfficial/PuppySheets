const  withdrawalStatus  = require("../controller/withdrawalController");

const router = require("express").Router();


router.get("/withdrawal_status", withdrawalStatus.withdrawal_status);
router.get("/withdrawal_request", withdrawalStatus.withdrawal_request);
router.get("/withdrawals", withdrawalStatus.withdrawal_all);
module.exports = router;