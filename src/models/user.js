// src/models/User.js
const mongoose = require('mongoose');
const { normalize } = require('../util/phone');

const UserSchema = new mongoose.Schema({
  gymCode: { type: String, required: true },
  gymId: { type: String, required: true },
  joinDate: { type: Date, required: true },
  membershipDuration: { type: Number, required: true },
  membershipEndDate: { type: Date, required: true },
  membershipFees: { type: Number, required: true },
  membershipStartDate: { type: Date, required: true },
  name: { type: String, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },

  // IMPORTANT: some DBs store phone as string, others as number. Mixed covers both.
  phone: { type: mongoose.Schema.Types.Mixed, required: true },
}, {
  timestamps: true,
  collection: 'customers',       // 👈 your collection
});

// If you ever insert/modify, write in canonical E.164
UserSchema.pre('save', function(next) {
  if (typeof this.phone === 'string') this.phone = normalize(this.phone);
  next();
});

module.exports = mongoose.model('User', UserSchema);
