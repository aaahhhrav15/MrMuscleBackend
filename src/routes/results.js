// src/routes/results.js
const express = require('express');
const Result = require('../models/Result');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

/** GET /results?limit=20&skip=0
 *  List the logged-in user's results posts (newest first)
 */
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const match = { userId: req.userId };

    const [items, total] = await Promise.all([
      Result.find(match)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Math.min(Number(limit), 100))
        .lean(),
      Result.countDocuments(match),
    ]);

    res.json({
      total,
      limit: Number(limit),
      skip: Number(skip),
      items,
    });
  } catch (e) {
    console.error('[RESULTS GET]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /results/s3
 * Create a new results post with an S3 URL
 */
router.post('/s3', auth, async (req, res) => {
  try {
    const { weight, description, s3Url } = req.body;

    if (!s3Url) {
      return res.status(400).json({ error: 'S3 URL is required' });
    }

    const newResult = new Result({
      userId: req.userId,
      weight,
      description,
      s3Key: s3Url, // Save the S3 URL in MongoDB
    });

    await newResult.save();
    res.status(201).json(newResult);
  } catch (e) {
    console.error('[RESULTS POST]', e);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * DELETE /results/:id
 * Delete a user's result post by ID (must be owner)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Result.findOne({ _id: id, userId: req.userId });
    if (!post) {
      return res.status(404).json({ error: 'Result not found or not authorized' });
    }
    const s3Key = post.s3Key;
    await Result.deleteOne({ _id: id });
    res.json({ message: 'Result post deleted.', s3Key });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
