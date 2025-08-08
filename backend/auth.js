const express = require('express');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid Username or password' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid Username or password' });
    // Enforce role based strictly on password
    if (password === 'Welcome@123') {
      if (user.role !== 'Employee') {
        return res.status(401).json({ error: 'Invalid Username or password' });
      }
    } else if (password === 'Manager@2024') {
      if (!(user.role === 'Manager' || user.role === 'Lead')) {
        return res.status(401).json({ error: 'Invalid Username or password' });
      }
    } else {
      // No other passwords allowed
      return res.status(401).json({ error: 'Invalid Username or password' });
    }
    res.json({ username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
