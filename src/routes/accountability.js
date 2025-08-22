// src/routes/accountability.js
const express = require('express');
const Accountability = require('../models/Accountability');
const auth = require('../middleware/auth');
const User = require('../models/User');   

const router = express.Router();

// OPTIONAL: tune this to your infra limit (Mongo doc max is 16MB)
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * GET /accountability
 * List the logged-in user's accountability posts (newest first)
 * Query: ?limit=20&skip=0
 */
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20, skip = 0 } = req.query;

    const match = { userId: req.userId };
    // tenant fence if your auth middleware exposes gymId
    if (req.userGymId) match.gymId = req.userGymId;

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
 * POST /accountability
 * Create a new accountability post for the logged-in user.
 * Body: { description: string, imageBase64: string }
 */
router.post('/', auth, async (req, res) => {
  try {
    const { description, imageBase64 } = req.body || {};
    if (!description || !imageBase64) {
      return res.status(400).json({ error: 'description and imageBase64 are required' });
    }

    // 1) Get gymId automatically
    let gymId = req.userGymId;
    if (!gymId) {
      const u = await User.findById(req.userId).select('gymId').lean();
      if (!u) return res.status(401).json({ error: 'User not found' });
      gymId = u.gymId;
    }
    if (typeof gymId === 'string' && /^[0-9a-fA-F]{24}$/.test(gymId)) {
      gymId = new mongoose.Types.ObjectId(gymId);
    }

    // 2) Image size guard
    const base64 = imageBase64.includes('base64,') ? imageBase64.split('base64,')[1] : imageBase64;
    const approxBytes = Math.floor((base64.length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'Image too large' });
    }

    // 3) Create accountability doc
    const doc = await Accountability.create({
      description,
      imageBase64,
      userId: req.userId,
      gymId,     // 👈 now always populated
    });

    res.status(201).json(doc);
  } catch (e) {
    console.error('[ACC POST]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /accountability/:id
// Deletes a single accountability post that belongs to the logged-in user.
// Returns 204 on success, 404 if not found/owned by user.
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Basic ObjectId validation without crashing on malformed ids
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(String(id));
    if (!isValidObjectId) {
      return res.status(400).json({ error: 'Invalid post id' });
    }

    const match = { _id: id, userId: req.userId };
    // tenant fence if your middleware exposes gymId
    if (req.userGymId) match.gymId = req.userGymId;

    const result = await Accountability.deleteOne(match);

    if (result.deletedCount === 0) {
      // Either it doesn't exist, or it doesn't belong to this user/tenant
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json({ message: 'Accountability post deleted successfully', postId: id });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
