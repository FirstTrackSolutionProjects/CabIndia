// cabindia-backend/controllers/rideController.js
const db = require('../config/db');

// @route   POST /api/rides/request
// @desc    Request a new ride
// @access  Private (User)
exports.requestRide = async (req, res) => {
    // Ensure userId is available from authMiddleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User ID not found in token.', success: false });
    }
    const userId = req.user.id;

    const { pickupAddress, dropoffAddress, vehicleType, pickupLat, pickupLon, dropoffLat, dropoffLon, estimatedPrice } = req.body;

    // Basic validation
    if (!pickupAddress || !dropoffAddress || !vehicleType || !pickupLat || !pickupLon || !dropoffLat || !dropoffLon || !estimatedPrice) {
        return res.status(400).json({ message: 'Missing required ride details.', success: false });
    }

    try {
        // 1. Create the ride record in DB with 'pending' status
        const [result] = await db.execute(
            'INSERT INTO rides (user_id, pickup_address, pickup_lat, pickup_lon, dropoff_address, dropoff_lat, dropoff_lon, vehicle_type_requested, estimated_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, pickupAddress, pickupLat, pickupLon, dropoffAddress, dropoffLat, dropoffLon, vehicleType, estimatedPrice, 'pending']
        );

        const rideId = result.insertId;

        // 2. Logic to find nearest available drivers
        // In a real app, you'd use spatial queries (ST_Distance_Sphere in MySQL 8+)
        // For simplicity, we'll fetch a few available drivers and simulate assignment.
        const [drivers] = await db.execute(
            'SELECT id, user_id, current_lat, current_lon FROM drivers WHERE is_available = 1 AND status = "online" LIMIT 5'
        );

        if (drivers.length === 0) {
            // No drivers found, ideally mark ride as 'no_drivers_found' and allow user to retry
            // For now, return a message, ride is still 'pending'
            return res.status(404).json({ success: false, message: "No drivers available nearby. Please try again shortly.", rideId });
        }

        // 3. In a full system, you'd use WebSockets (e.g., Socket.IO) to notify these drivers
        // and handle driver acceptance/rejection. For this example, we'll just indicate search started.

        res.status(201).json({ success: true, rideId, message: "Ride requested. Searching for available drivers..." });

    } catch (error) {
        console.error('Error requesting ride:', error);
        res.status(500).json({ message: 'Server error during ride request.', success: false });
    }
};

// @route   POST /api/rides/:rideId/accept
// @desc    Driver accepts a ride request
// @access  Private (Driver)
exports.acceptRide = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: Driver ID not found in token.', success: false });
    }
    const driverUserId = req.user.id;
    const { rideId } = req.params;

    try {
        // Verify if the user is a registered driver
        const [driverCheck] = await db.execute('SELECT id FROM drivers WHERE user_id = ?', [driverUserId]);
        if (driverCheck.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Not a registered driver.', success: false });
        }
        const driverId = driverCheck[0].id;

        // Update ride status and assign driver
        const [result] = await db.execute(
            'UPDATE rides SET driver_id = ?, status = "accepted", accepted_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "pending"',
            [driverId, rideId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Ride not found or already accepted/cancelled.', success: false });
        }

        // Also set driver status to 'on_trip' or similar
        await db.execute('UPDATE drivers SET status = "on_trip" WHERE id = ?', [driverId]);

        res.status(200).json({ message: 'Ride accepted successfully.', success: true });

    } catch (error) {
        console.error('Error accepting ride:', error);
        res.status(500).json({ message: 'Server error during ride acceptance.', success: false });
    }
};

// @route   POST /api/rides/:rideId/start
// @desc    Driver starts the ride
// @access  Private (Driver)
exports.startRide = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: Driver ID not found in token.', success: false });
    }
    const driverUserId = req.user.id;
    const { rideId } = req.params;

    try {
        const [driverCheck] = await db.execute('SELECT id FROM drivers WHERE user_id = ?', [driverUserId]);
        if (driverCheck.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Not a registered driver.', success: false });
        }
        const driverId = driverCheck[0].id;

        const [result] = await db.execute(
            'UPDATE rides SET status = "started", started_at = CURRENT_TIMESTAMP WHERE id = ? AND driver_id = ? AND status = "accepted"',
            [rideId, driverId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Ride not found, not assigned to this driver, or not in "accepted" status.', success: false });
        }

        res.status(200).json({ message: 'Ride started successfully.', success: true });

    } catch (error) {
        console.error('Error starting ride:', error);
        res.status(500).json({ message: 'Server error during ride start.', success: false });
    }
};

// @route   POST /api/rides/:rideId/complete
// @desc    Driver completes the ride
// @access  Private (Driver)
exports.completeRide = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: Driver ID not found in token.', success: false });
    }
    const driverUserId = req.user.id;
    const { rideId } = req.params;
    const { finalPrice, distanceKm } = req.body; // Driver submits final details

    // Basic validation for final details
    if (!finalPrice || !distanceKm) {
      return res.status(400).json({ message: 'Missing final price or distance.', success: false });
    }

    try {
        const [driverCheck] = await db.execute('SELECT id FROM drivers WHERE user_id = ?', [driverUserId]);
        if (driverCheck.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Not a registered driver.', success: false });
        }
        const driverId = driverCheck[0].id;

        const [result] = await db.execute(
            'UPDATE rides SET status = "completed", completed_at = CURRENT_TIMESTAMP, final_price = ?, distance_km = ?, payment_status = "pending" WHERE id = ? AND driver_id = ? AND status = "started"',
            [finalPrice, distanceKm, rideId, driverId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Ride not found, not assigned to this driver, or not in "started" status.', success: false });
        }

        // Set driver status back to 'online'/'available'
        await db.execute('UPDATE drivers SET status = "online" WHERE id = ?', [driverId]);


        res.status(200).json({ message: 'Ride completed successfully. Payment pending.', success: true });

    } catch (error) {
        console.error('Error completing ride:', error);
        res.status(500).json({ message: 'Server error during ride completion.', success: false });
    }
};

// @route   POST /api/rides/:rideId/cancel
// @desc    User or Driver cancels a ride
// @access  Private (User or Driver)
exports.cancelRide = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found in token.', success: false });
    }
    const requestorUserId = req.user.id; // User or Driver's user_id
    const { rideId } = req.params;
    const { cancellationReason } = req.body;

    try {
        const [ride] = await db.execute('SELECT user_id, driver_id, status FROM rides WHERE id = ?', [rideId]);

        if (ride.length === 0) {
            return res.status(404).json({ message: 'Ride not found.', success: false });
        }

        const currentRide = ride[0];

        // Determine if requestor is the user or the driver
        const isUser = currentRide.user_id === requestorUserId;
        const [driverCheck] = await db.execute('SELECT id FROM drivers WHERE user_id = ?', [requestorUserId]);
        const isDriver = driverCheck.length > 0 && currentRide.driver_id === driverCheck[0].id;

        if (!isUser && !isDriver) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to cancel this ride.', success: false });
        }

        // Prevent cancellation if ride is already completed or cancelled
        if (currentRide.status === 'completed' || currentRide.status === 'cancelled') {
            return res.status(400).json({ message: `Ride already ${currentRide.status}.`, success: false });
        }

        // Update ride status to cancelled
        const [result] = await db.execute(
            'UPDATE rides SET status = "cancelled", cancellation_reason = ?, cancelled_at = CURRENT_TIMESTAMP WHERE id = ?',
            [cancellationReason || 'No reason provided', rideId]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: 'Failed to cancel ride.', success: false });
        }

        // If a driver was assigned, set their status back to 'online' or 'available'
        if (currentRide.driver_id && currentRide.status !== 'pending') {
            await db.execute('UPDATE drivers SET status = "online" WHERE id = ?', [currentRide.driver_id]);
        }

        res.status(200).json({ message: 'Ride cancelled successfully.', success: true });

    } catch (error) {
        console.error('Error cancelling ride:', error);
        res.status(500).json({ message: 'Server error during ride cancellation.', success: false });
    }
};

// @route   GET /api/rides/history/user
// @desc    Get all rides for the authenticated user
// @access  Private (User)
exports.getUserRideHistory = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found in token.', success: false });
    }
    const userId = req.user.id;

    try {
        const [rides] = await db.execute(
            'SELECT r.id, r.pickup_address, r.dropoff_address, r.vehicle_type_requested, r.estimated_price, r.final_price, r.status, r.requested_at, r.completed_at, d.user_id AS driver_user_id, u.name AS driver_name, v.make AS driver_vehicle_make, v.model AS driver_vehicle_model, v.license_plate FROM rides r LEFT JOIN drivers d ON r.driver_id = d.id LEFT JOIN users u ON d.user_id = u.id LEFT JOIN vehicles v ON d.vehicle_id = v.id WHERE r.user_id = ? ORDER BY r.requested_at DESC',
            [userId]
        );
        res.status(200).json({ success: true, rides });
    } catch (error) {
        console.error('Error fetching user ride history:', error);
        res.status(500).json({ message: 'Server error fetching ride history.', success: false });
    }
};

// @route   GET /api/rides/history/driver
// @desc    Get all rides for the authenticated driver
// @access  Private (Driver)
exports.getDriverRideHistory = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: Driver ID not found in token.', success: false });
    }
    const driverUserId = req.user.id;

    try {
        const [driverCheck] = await db.execute('SELECT id FROM drivers WHERE user_id = ?', [driverUserId]);
        if (driverCheck.length === 0) {
            return res.status(403).json({ message: 'Forbidden: Not a registered driver.', success: false });
        }
        const driverId = driverCheck[0].id;

        const [rides] = await db.execute(
            'SELECT r.id, r.pickup_address, r.dropoff_address, r.vehicle_type_requested, r.estimated_price, r.final_price, r.status, r.requested_at, r.completed_at, u.name AS customer_name FROM rides r LEFT JOIN users u ON r.user_id = u.id WHERE r.driver_id = ? ORDER BY r.requested_at DESC',
            [driverId]
        );
        res.status(200).json({ success: true, rides });
    } catch (error) {
        console.error('Error fetching driver ride history:', error);
        res.status(500).json({ message: 'Server error fetching ride history.', success: false });
    }
};

// @route   GET /api/rides/:rideId
// @desc    Get details of a specific ride
// @access  Private (User or Driver of the ride)
exports.getRideDetails = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found in token.', success: false });
    }
    const requestorUserId = req.user.id;
    const { rideId } = req.params;

    try {
        const [ride] = await db.execute(
            'SELECT r.*, u.name AS customer_name, d.user_id AS driver_user_id, du.name AS driver_name, v.make AS driver_vehicle_make, v.model AS driver_vehicle_model, v.license_plate FROM rides r LEFT JOIN users u ON r.user_id = u.id LEFT JOIN drivers d ON r.driver_id = d.id LEFT JOIN users du ON d.user_id = du.id LEFT JOIN vehicles v ON d.vehicle_id = v.id WHERE r.id = ?',
            [rideId]
        );

        if (ride.length === 0) {
            return res.status(404).json({ message: 'Ride not found.', success: false });
        }

        const currentRide = ride[0];

        // Check if the requestor is the user who booked the ride or the assigned driver
        const [driverCheck] = await db.execute('SELECT id FROM drivers WHERE user_id = ?', [requestorUserId]);
        const isDriverOfRide = driverCheck.length > 0 && currentRide.driver_id === driverCheck[0].id;

        if (currentRide.user_id !== requestorUserId && !isDriverOfRide) {
            return res.status(403).json({ message: 'Forbidden: You are not authorized to view this ride.', success: false });
        }

        res.status(200).json({ success: true, ride: currentRide });

    } catch (error) {
        console.error('Error fetching ride details:', error);
        res.status(500).json({ message: 'Server error fetching ride details.', success: false });
    }
};
