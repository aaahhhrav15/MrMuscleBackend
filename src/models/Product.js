const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  disclaimer: {
    type: String,
    required: true,
  },
  fastFacts: {
    type: String,
    required: true,
  },
  gymId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gym',
    required: true,
  },
  imageBase64: {
    type: String,
    required: true,
  },
  keyBenefits: {
    type: [String],
    required: true,
  },
  manufacturedBy: {
    type: String,
    required: true,
  },
  marketedBy: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  overview: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  shelfLife: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  storage: {
    type: String,
    required: true,
  },
  usage: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
