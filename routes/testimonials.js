const router = require("express").Router();
const testimonials=require('../controller/testimonialsController');

router.get("/testimonials", testimonials.getTestimonials);
router.post("/testimonial", testimonials.postTestimonials);

module.exports = router;