const router = require("express").Router();
const ledger=require('../controller/ledgerController');

router.get("/ledger", ledger.get_ledger);


module.exports = router;