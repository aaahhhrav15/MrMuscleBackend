// src/models/Result.js
const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  description: { type: String, required: true },
  imageBase64: { type: String, required: true }, // e.g. data URL
  weight:      { type: Number, required: true, min: 0 }, // int or float
  gymId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', index: true, required: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
}, {
  timestamps: true,
  collection: 'results', // name the collection as you prefer
});

ResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Result', ResultSchema);
