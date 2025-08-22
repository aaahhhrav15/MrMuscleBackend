// src/models/Accountability.js
const mongoose = require('mongoose');

const AccountabilitySchema = new mongoose.Schema({
  description: { type: String, required: true },
  imageBase64: { type: String, required: true }, // e.g., "data:image/jpeg;base64,/9j/4AAQ..."
  gymId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', index: true, required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
}, {
  timestamps: true,
  collection: 'accountability'
});

// helpful index for user timeline
AccountabilitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Accountability', AccountabilitySchema);
