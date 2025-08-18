// src/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');                 // points to musclecrm.customers via your model
const { setOtp, getOtp, deleteOtp } = require('../otp/otpStore');
const { normalize, tail10 } = require('../util/phone'); // simple helpers (+91 default, last10, etc.)

const router = express.Router();
const OTP_TTL = parseInt(process.env.OTP_TTL_SECONDS || '300', 10);

// 6-digit numeric OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Build robust matcher for the single `phone` field
function phoneMatcher(input) {
  const norm = normalize(input);            // e.g., +919812345678
  const last = tail10(input);               // e.g., 9812345678
  const lastNum = last ? Number(last) : NaN;

  const or = [
    { phone: norm },                        // exact E.164 string
    { phone: last },                        // exact last-10 string
  ];
  if (last) or.push({ phone: new RegExp(`${last}$`) }); // ends-with last10 (string)
  if (!Number.isNaN(lastNum)) or.push({ phone: lastNum }); // exact number (if stored as Number)

  return { norm, or };
}

/**
 * POST /auth/login-phone
 * body: { phone }
 * returns: { ok: true, ttl }  (OTP printed to console in DEV_MODE)
 */
router.post('/login-phone', async (req, res) => {
  try {
    const input = req.body.phone || '';
    const { norm, or } = phoneMatcher(input);

    console.log('[login-phone]', { input, norm, last10: tail10(input) });

    const user = await User.findOne({ $or: or }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // simple throttle: 45s between sends
    const existing = getOtp(norm);
    if (existing && Date.now() - existing.lastSentAt < 45_000) {
      return res.status(429).json({ error: 'OTP already sent. Try again soon.' });
    }

    const code = generateOtp();
    setOtp(norm, code, OTP_TTL);

    if (process.env.DEV_MODE === 'true') {
      console.log(`[DEV] OTP for ${norm}: ${code}`);
    } else {
      // TODO: integrate SMS provider here (e.g., Twilio)
    }

    return res.json({ ok: true, ttl: OTP_TTL });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

/**
 * POST /auth/verify-otp
 * body: { phone, otp }
 * returns: { token, user: { _id, name, phone, gymCode, gymId } }
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const input = req.body.phone || '';
    const otp = (req.body.otp || '').toString();
    const { norm, or } = phoneMatcher(input);

    console.log('[verify-otp]', { input, norm, last10: tail10(input), otp });

    const rec = getOtp(norm);
    if (!rec) return res.status(400).json({ error: 'OTP expired or not requested' });
    if (rec.code !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    const user = await User.findOne({ $or: or });
    if (!user) return res.status(404).json({ error: 'User not found' });

    deleteOtp(norm);

    const token = jwt.sign(
      { sub: user._id.toString(), phone: String(user.phone) },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: String(user.phone),
        gymCode: user.gymCode,
        gymId: user.gymId,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
