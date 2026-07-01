const express = require('express');
const router = express.Router();

// Mock database or actual DB logic for rides
router.post('/book', (req, res) => {
    const { pickup, dropoff, userId } = req.body;
    console.log(`Ride booked from ${pickup} to ${dropoff}`);
    res.status(201).json({ message: "Ride booked successfully", rideId: Date.now() });
});

router.get('/history/:userId', (req, res) => {
    res.json({ message: "Ride history fetched", history: [] });
});

module.exports = router;
