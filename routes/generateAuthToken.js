const router = require("express").Router();
const { generate_auth_token } = require("../controller/generateAuthTokenController");

router.post("/generate_auth_token", generate_auth_token);


module.exports = router;