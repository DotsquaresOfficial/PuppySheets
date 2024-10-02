const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    testimonial_id: {
        type: String,
        required: true,
        unique: true
    },
    active: {
        type: Boolean,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    testimonial: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    avatar: {
        type: String,
        required: true
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false, // Disables the __v field
    _id: false // Disables the automatic _id field
});


module.exports = mongoose.model('Testimonial', TestimonialSchema);
