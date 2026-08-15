// cabindia-backend/routes/authRoutes.js
const express = require('express');
const { 
  register, 
  login, 
  googleLogin,
  forgotPassword,
  resetPassword,
  changePassword,
  logout
} = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Log routes for debugging
console.log('Setting up auth routes');

// Test route to check if auth routes are working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth routes are working!' });
});

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/change-password', auth, changePassword);
router.post('/logout', auth, logout);

module.exports = router;