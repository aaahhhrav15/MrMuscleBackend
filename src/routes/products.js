const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get products for the logged-in customer
router.get('/', auth, async (req, res) => {
  const customerId = req.userId; // Extracted from the auth middleware
  try {
    const products = await Product.find({ customerId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;
