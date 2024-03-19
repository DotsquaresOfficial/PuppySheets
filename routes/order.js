const router = require("express").Router();
const order=require('../controller/orderController');

router.post("/order", order.order);
router.get("/order", order.get_multiple_order);

module.exports = router;