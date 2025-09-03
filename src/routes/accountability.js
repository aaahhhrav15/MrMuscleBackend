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
    const { description, key } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'S3 key is required' });
    }

    const newPost = new Accountability({
      userId: req.userId,
      description,
      s3Key: key,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (e) {
    console.error('[ACCOUNTABILITY POST]', e);
    res.status(500).json({ error: 'Server error' });
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
