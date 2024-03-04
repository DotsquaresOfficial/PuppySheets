const router = require("express").Router();
const users=require('../controller/usersController');

router.get("/registerUser", users.registerUser);
router.get("/loginUser", users.loginUser);
router.get("/loginAdmin", users.loginAdmin);


module.exports = router;