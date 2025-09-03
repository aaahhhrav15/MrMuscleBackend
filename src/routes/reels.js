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
router.post('/s3', auth, async (req, res) => {
  const { caption, s3Key } = req.body;
  const customerId = req.userId;
  try {
    const newReel = new Reels({ caption, customerId, s3Key });
    await newReel.save();
    res.status(201).json(newReel);
  } catch (error) {
    res.status(500).json({ "[Reel POST]": error });
    res.status(500).json({ error: 'Failed to create reel' });
  }
});

module.exports = router;
