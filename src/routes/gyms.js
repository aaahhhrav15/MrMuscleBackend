const express = require('express');
const router = express.Router();
const Gym = require('../models/Gym');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /gyms/fetch - Get gym data for the authenticated user's gymid
router.get('/fetch', auth, async (req, res) => {
  try {
    // Assuming req.user is set by auth middleware and contains gymid
    const user = await User.findById(req.user._id);
    if (!user || !user.gymid) {
      return res.status(404).json({ message: 'User or gymid not found' });
    }
    const gym = await Gym.findById(user.gymid);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }
    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
