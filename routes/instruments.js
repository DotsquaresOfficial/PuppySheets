const router = require("express").Router();
const instruments=require('../controller/instrumentsController');

router.get("/instruments", instruments.get_instruments);


module.exports = router;