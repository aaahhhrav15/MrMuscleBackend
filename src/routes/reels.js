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


/**
 * DELETE /reels/:id
 * Delete a user's reel by ID (must be owner)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const reel = await Reels.findOne({ _id: id, customerId: req.userId });
    if (!reel) {
      return res.status(404).json({ error: 'Reel not found or not authorized' });
    }
    const s3Key = reel.s3Key;
    await Reels.deleteOne({ _id: id });
    res.json({ message: 'Reel deleted.', s3Key });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
