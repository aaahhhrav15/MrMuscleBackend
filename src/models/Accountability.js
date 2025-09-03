const mongoose = require('mongoose');

const AccountabilitySchema = new mongoose.Schema({
  description: { type: String, required: true },
  s3Key: { type: String, required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
}, {
  timestamps: true,
  collection: 'accountabilities'
});

AccountabilitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Accountability', AccountabilitySchema);
