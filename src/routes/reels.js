const express = require('express');
const router = express.Router();
const Reels = require('../models/Reels');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Fetch all reels
router.get('/', async (req, res) => {
  try {
    const reels = await Reels.find().populate('customerId', 'name');
    res.status(200).json(reels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reels' });
  }
});

// Post a new reel
router.post('/', auth, async (req, res) => {
  const { caption, url } = req.body;
  const customerId = req.userId; // Extracted from the auth middleware
  try {
    const newReel = new Reels({ caption, customerId, url });
    await newReel.save();
    res.status(201).json(newReel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reel' });
  }
});

// Delete a reel
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Reels.findByIdAndDelete(id);
    res.status(200).json({ message: 'Reel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reel' });
  }
});

module.exports = router;
