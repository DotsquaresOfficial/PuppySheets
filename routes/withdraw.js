const  withdraw  = require("../controller/withdrawController");

const router = require("express").Router();


router.post("/withdrawal", withdraw.withdraw);
router.get("/withdrawal/:withdrawal_id", withdraw.get_a_withdraw);
router.delete("/withdrawal/:withdrawal_id", withdraw.delete_a_withdraw);
router.get("/withdrawal", withdraw.get_all_withdraw);



module.exports = router;