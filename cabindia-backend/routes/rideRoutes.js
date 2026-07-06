const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const rideController = require('../controllers/rideController');

// @route   POST /api/rides/request
// @desc    Request a new ride
// @access  Private (User)
router.post('/request', auth, rideController.requestRide);

// @route   POST /api/rides/:rideId/accept
// @desc    Driver accepts a ride request
// @access  Private (Driver)
router.post('/:rideId/accept', auth, rideController.acceptRide);

// @route   POST /api/rides/:rideId/start
// @desc    Driver starts the ride
// @access  Private (Driver)
router.post('/:rideId/start', auth, rideController.startRide);

// @route   POST /api/rides/:rideId/complete
// @desc    Driver completes the ride
// @access  Private (Driver)
router.post('/:rideId/complete', auth, rideController.completeRide);

// @route   POST /api/rides/:rideId/cancel
// @desc    User or Driver cancels a ride
// @access  Private (User or Driver)
router.post('/:rideId/cancel', auth, rideController.cancelRide);

// @route   GET /api/rides/history/user
// @desc    Get all rides for the authenticated user
// @access  Private (User)
router.get('/history/user', auth, rideController.getUserRideHistory);

// @route   GET /api/rides/history/driver
// @desc    Get all rides for the authenticated driver
// @access  Private (Driver)
router.get('/history/driver', auth, rideController.getDriverRideHistory);

// @route   GET /api/rides/:rideId
// @desc    Get details of a specific ride
// @access  Private (User or Driver of the ride)
router.get('/:rideId', auth, rideController.getRideDetails);

module.exports = router;
