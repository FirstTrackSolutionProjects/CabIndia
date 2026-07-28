// cabindia-backend/routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// Log routes for debugging
console.log('Setting up auth routes');

// Test route to check if auth routes are working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes are working!' });
});

router.post('/register', register);
router.post('/login', login);

module.exports = router;