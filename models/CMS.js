const mongoose = require('mongoose');

const CmsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['privacy_policy', 'terms_and_conditions','about_us'], 
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false, // Disables the __v field
    _id: false // Disables the automatic _id field
});


module.exports = mongoose.model('CMS', CmsSchema);
