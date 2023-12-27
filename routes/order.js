const router = require("express").Router();
const order=require('../controller/orderController');

router.get("/post_order", order.post_an_order);
router.get("/get_an_order", order.get_an_order);
router.get("/get_multiple_order", order.get_multiple_order);

module.exports = router;