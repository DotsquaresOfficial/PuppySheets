const router = require("express").Router();
const cfdContracts=require('../controller/cfdContracts');

router.get("/cfd/Contracts", cfdContracts.get_multiple_contract_entries);


module.exports = router;