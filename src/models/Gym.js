const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  address: {
    city: String,
    country: String,
    state: String,
    street: String,
    zipCode: String,
  },
  contactInfo: {
    email: String,
    phone: String,
  },
  facilities: [mongoose.Schema.Types.Mixed],
  freeTrialCounter: Number,
  gymCode: { type: String, required: true },
  invoiceCounter: Number,
  logo: { type: String, default: null },
  name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Gym', gymSchema);
