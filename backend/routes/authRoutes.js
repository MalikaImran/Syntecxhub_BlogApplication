const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// TEMPORARY ROUTE — apne aap ko admin banane ke liye
// Use: POST /api/auth/make-admin  Body: { "email": "your@email.com", "secret": "setup123" }
// ⚠️ Production mein is route ko DELETE kar dena
router.post('/make-admin', async (req, res) => {
  const { email, secret } = req.body;
  if (secret !== 'setup123') return res.status(403).json({ message: 'Wrong secret' });
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: `✅ ${user.name} is now Admin!`, role: user.role });
});

module.exports = router;
