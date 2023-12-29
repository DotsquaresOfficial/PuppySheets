const  accountInfo  = require("../controller/accountInfoController");

const router = require("express").Router();


router.get("/account_info", accountInfo.account_info);




module.exports = router;