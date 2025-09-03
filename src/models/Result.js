// src/models/Result.js
const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  description: { type: String, required: true },
  imageUrl: { type: String, required: true }, // AWS S3 URL for results posts
  weight:      { type: Number, required: true, min: 0 }, // int or float
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
}, {
  timestamps: true,
  collection: 'results',
});

ResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Result', ResultSchema);
