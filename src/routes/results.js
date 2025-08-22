// src/routes/results.js
const express = require('express');
const Result = require('../models/Result');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();

// tune if needed
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/** GET /results?limit=20&skip=0
 *  List the logged-in user's results posts (newest first)
 */
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const match = { userId: req.userId };
    if (req.userGymId) match.gymId = req.userGymId;

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

/** POST /results
 *  Body: { description, imageBase64, weight }
 */
router.post('/', auth, async (req, res) => {
  try {
    const { description, imageBase64, weight } = req.body || {};
    if (!description || !imageBase64 || typeof weight !== 'number') {
      return res.status(400).json({ error: 'description, imageBase64, and numeric weight are required' });
    }

    // 1) Determine gymId automatically
    let gymId = req.userGymId;
    if (!gymId) {
      const u = await User.findById(req.userId).select('gymId').lean();
      if (!u) return res.status(401).json({ error: 'User not found' });
      gymId = u.gymId;
    }
    // Cast to ObjectId if it looks like one
    if (typeof gymId === 'string' && /^[0-9a-fA-F]{24}$/.test(gymId)) {
      gymId = new mongoose.Types.ObjectId(gymId);
    }

    // 2) Image size guard
    const base64 = imageBase64.includes('base64,') ? imageBase64.split('base64,')[1] : imageBase64;
    const approxBytes = Math.floor((base64.length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) return res.status(413).json({ error: 'Image too large' });

    // 3) Create post
    const doc = await Result.create({
      description,
      imageBase64,
      weight,
      userId: req.userId,
      gymId,
    });

    res.status(201).json(doc);
  } catch (e) {
    console.error('[RESULTS POST]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

/** DELETE /results/:id
 *  Deletes one of the user's own results posts.
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(String(id));
    if (!isValidObjectId) return res.status(400).json({ error: 'Invalid post id' });

    const match = { _id: id, userId: req.userId };
    if (req.userGymId) match.gymId = req.userGymId;

    const out = await Result.deleteOne(match);
    if (out.deletedCount === 0) return res.status(404).json({ error: 'Post not found' });

    return res.status(200).json({ message: 'Result post deleted successfully', postId: id });
  } catch (e) {
    console.error('[RESULTS DELETE]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
