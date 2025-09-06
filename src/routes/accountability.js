// src/routes/accountability.js
const express = require('express');
const Accountability = require('../models/Accountability');
const auth = require('../middleware/auth');
const User = require('../models/User');   

const router = express.Router();

/**
 * GET /accountability
 * List the logged-in user's accountability posts (newest first)
 * Query: ?limit=20&skip=0
 */
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const match = { userId: req.userId };

    const [items, total] = await Promise.all([
      Accountability.find(match)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Math.min(Number(limit), 100))
        .lean(),
      Accountability.countDocuments(match)
    ]);

    res.json({
      total,
      limit: Number(limit),
      skip: Number(skip),
      items
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * POST /accountability/s3
 * Create a new accountability post with an S3 Key
 */
router.post('/s3', auth, async (req, res) => {
  try {
    console.log('=== ACCOUNTABILITY POST DEBUG ===');
    console.log('Request body:', req.body);
    console.log('User ID:', req.userId);
    
    const { description, s3Key } = req.body; // Changed from s3key to s3Key

    if (!s3Key) { // Changed from key to s3Key
      console.log('Missing s3Key in request');
      return res.status(400).json({ error: 'S3 key is required' });
    }

    if (!description) {
      console.log('Missing description in request');
      return res.status(400).json({ error: 'Description is required' });
    }

    console.log('Creating new post with:', {
      userId: req.userId,
      description,
      s3Key
    });

    const newPost = new Accountability({
      userId: req.userId,
      description,
      s3Key, // Changed from s3key to s3Key to match schema
    });

    const savedPost = await newPost.save();
    console.log('Successfully saved:', savedPost);
    
    res.status(201).json(savedPost);
  } catch (e) {
    console.error('[ACCOUNTABILITY POST ERROR]', e);
    res.status(500).json({ 
      error: 'Server error', 
      details: e.message // Add details for debugging
    });
  }
});

/**
 * DELETE /accountability/:id
 * Delete a user's accountability post by ID (must be owner)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Accountability.findOne({ _id: id, userId: req.userId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found or not authorized' });
    }
    const s3Key = post.s3Key;
    await Accountability.deleteOne({ _id: id });
    res.json({ message: 'Accountability post deleted.', s3Key });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
