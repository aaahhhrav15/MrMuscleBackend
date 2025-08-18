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
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * GET /users/by-phone?phone=...
 * Dev helper to fetch a user without auth, tolerant to phone formats.
 * Useful while wiring the app before JWT is fully in place.
 * Consider removing or protecting this route in production.
 */
router.get('/by-phone', async (req, res) => {
  try {
    const input = req.query.phone || '';
    const phone = normalize(input);
    const last = tail10(input);

    const u = await User.findOne({
      $or: [
        { phone: phone },
        { phone: last },
        { phone: new RegExp(last + '$') },
      ],
    }).lean();

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
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * (Optional) DEV: quick peek to verify DB contents by partial phone.
 * GET /users/__dev__peek?q=9812
 */
router.get('/__dev__count', async (req, res) => {
  if (process.env.DEV_MODE !== 'true') return res.status(404).end();
  const total = await User.countDocuments({});
  const sample = await User.find({})
    .select('_id name phone phoneNumber contact.phone contact.phoneNumber mobile mobileNumber')
    .limit(5).lean();
  res.json({ total, sample });
});


module.exports = router;
