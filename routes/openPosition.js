const router = require("express").Router();
const open_positions=require('../controller/openPositionsController');

router.get("/cfd/open_positions", open_positions.get_open_positions);


module.exports = router;
