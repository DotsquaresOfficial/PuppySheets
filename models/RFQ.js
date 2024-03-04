// models/RFQ.js

const mongoose = require('mongoose');

const RFQSchema = new mongoose.Schema({
  created: {
    type: Date,
    required: true
  },
  valid_until: {
    type: Date,
    required: true
  },
  rfq_id: {
    type: String,
    required: true
  },
  client_rfq_id: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  side: {
    type: String,
    enum: ['buy', 'sell'], // Assuming side can only be 'buy' or 'sell'
    required: true
  },
  instrument: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('RFQ', RFQSchema);
