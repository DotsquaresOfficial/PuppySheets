const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
    withdraw_request_id: { 
        type: String,
        required: true,
        unique: true
    },
    company_id: {
        type: String,
        required: true
    },
    account_id: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    }
    ,
    type: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Withdraw', withdrawSchema);