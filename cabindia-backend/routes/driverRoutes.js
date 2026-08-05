// cabindia-backend/routes/driverRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  applyAsCaptain,
  getDriverStats,
  updateDriverStatus,
  getDriverRideHistory
} = require('../controllers/driverController');

// @route   POST /api/drivers/apply
// @desc    Apply to become a captain
// @access  Private
router.post('/apply', auth, applyAsCaptain);

// @route   GET /api/drivers/stats
// @desc    Get driver statistics
// @access  Private
router.get('/stats', auth, getDriverStats);

// @route   POST /api/drivers/status
// @desc    Update driver online/offline status
// @access  Private
router.post('/status', auth, updateDriverStatus);

// @route   GET /api/drivers/rides
// @desc    Get driver ride history
// @access  Private
router.get('/rides', auth, getDriverRideHistory);

module.exports = router;