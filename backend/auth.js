const express = require('express');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ associateId: Number(username) });
    if (!user) return res.status(401).json({ error: 'Invalid Username or password' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid Username or password' });
    // Only enforce role-based restrictions for default passwords
    if (password === 'Welcome@123' && user.role !== 'Employee') {
      return res.status(401).json({ error: 'Invalid Username or password' });
    }
    if (password === 'Manager@2024' && !(user.role === 'Manager' || user.role === 'Lead')) {
      return res.status(401).json({ error: 'Invalid Username or password' });
    }
    res.json({ associateId: user.associateId, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
