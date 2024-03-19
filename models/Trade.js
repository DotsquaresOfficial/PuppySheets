// Import Mongoose
const mongoose = require('mongoose');

// Define the trade schema
const tradeSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        required: true
    },
    trade_type: {
        type: String,
        required: true
    },
    instrument: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    cost: {
        type: String,
        required: true
    },
    received: {
        type: String,
        required: true
    },
    order_id: {
        type: String,
        required: true
    }
},{ versionKey: false });

// Create the Trade model
const Trade = mongoose.model('Trade', tradeSchema);

// Export the Trade model
module.exports = Trade;
