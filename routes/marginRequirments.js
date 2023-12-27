const router = require("express").Router();
const margin_requirements=require('../controller/marginRequirmentsController')

router.get("/margin_requirements", margin_requirements.get_margin_requirments);


module.exports = router;