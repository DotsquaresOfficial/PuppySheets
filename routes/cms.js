const router = require("express").Router();
const cms=require('../controller/cmsController');

router.get("/cms", cms.getCms);
router.post("/cms", cms.postCms);

module.exports = router;