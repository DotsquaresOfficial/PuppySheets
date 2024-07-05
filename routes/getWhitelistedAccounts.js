const router = require("express").Router();
const getWhitelistedAccounts=require('../controller/getWhitelistedAccountsController');

router.get("/get_whitelisted_accounts", getWhitelistedAccounts.get_whitelisted_accounts);


module.exports = router;