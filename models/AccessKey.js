const mongoose = require('mongoose');

const accessKeySchema = new mongoose.Schema({
    company_id: {
        type: String,
        required: true,
        unique: true
    },
    access_key: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AccessKey', accessKeySchema);
