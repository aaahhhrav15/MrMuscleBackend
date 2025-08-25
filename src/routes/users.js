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
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});


module.exports = router;
