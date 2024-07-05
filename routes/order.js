const router = require("express").Router();
const order=require('../controller/orderController');

router.post("/order", order.order);
router.get("/orders", order.orders);

module.exports = router;