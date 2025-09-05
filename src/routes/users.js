
// src/routes/users.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { normalize, tail10 } = require('../util/phone');

const router = express.Router();

/**
 * GET /users/me
 * Authenticated profile endpoint returning exactly your required fields.
 */
router.get('/me', auth, async (req, res) => {
  try {
    const u = await User.findById(req.userId).lean();
    if (!u) return res.status(404).json({ error: 'Not found' });

    return res.json({
      _id: u._id,
      gymCode: u.gymCode,
      gymId: u.gymId,
      joinDate: u.joinDate,
      membershipDuration: u.membershipDuration,
      membershipEndDate: u.membershipEndDate,
      membershipFees: u.membershipFees,
      membershipStartDate: u.membershipStartDate,
      name: u.name,
      phone: u.phone,
      weight: u.weight,
      height: u.height,
      profileImage: u.profileImage ,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * PATCH /users/update
 * Update authenticated user's profile fields (currently only profilePhoto)
 */
router.patch('/update', auth, async (req, res) => {
  try {
    // Only allow these fields to be updated
    const allowedFields = ['name', 'phone', 'weight', 'height', 'profileImage'];
    const update = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true, runValidators: true, context: 'query' }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'Not found' });
    return res.json({
      _id: updated._id,
      gymCode: updated.gymCode,
      gymId: updated.gymId,
      joinDate: updated.joinDate,
      membershipDuration: updated.membershipDuration,
      membershipEndDate: updated.membershipEndDate,
      membershipFees: updated.membershipFees,
      membershipStartDate: updated.membershipStartDate,
      name: updated.name,
      phone: updated.phone,
      weight: updated.weight,
      height: updated.height,
      profileImage: updated.profileImage,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});


module.exports = router;
