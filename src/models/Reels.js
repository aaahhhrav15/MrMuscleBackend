const mongoose = require('mongoose');

const reelsSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  s3Key: {
    type: String,
    required: true, 
  },
}, { timestamps: true });

module.exports = mongoose.model('Reels', reelsSchema);
