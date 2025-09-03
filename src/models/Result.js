// src/models/Result.js
const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  description: { type: String, required: true },
  s3Key: { type: String, required: true },
  weight:      { type: Number, required: true, min: 0 },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
}, {
  timestamps: true,
  collection: 'results',
});

ResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Result', ResultSchema);
