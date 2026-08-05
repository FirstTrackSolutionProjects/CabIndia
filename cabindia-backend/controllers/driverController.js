// cabindia-backend/controllers/driverController.js
const db = require('../config/db');

// @route   POST /api/drivers/apply
// @desc    Apply to become a captain
// @access  Private
exports.applyAsCaptain = async (req, res) => {
  const { userId, vehicleModel, licensePlate, vehicleType, licenseNumber, experience } = req.body;
  
  if (!userId || !vehicleModel || !licensePlate || !vehicleType || !licenseNumber) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: userId, vehicleModel, licensePlate, vehicleType, licenseNumber' 
    });
  }

  try {
    // Check if user already applied
    const [existingDriver] = await db.execute(
      'SELECT id FROM drivers WHERE user_id = ?',
      [userId]
    );
    
    if (existingDriver.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'You have already applied to become a captain' 
      });
    }

    // Insert new driver with pending verification
    const [result] = await db.execute(
      'INSERT INTO drivers (user_id, license_number, status) VALUES (?, ?, ?)',
      [userId, licenseNumber, 'pending_verification']
    );
    
    const driverId = result.insertId;
    
    // Insert vehicle
    await db.execute(
      'INSERT INTO vehicles (driver_id, make, model, license_plate, type) VALUES (?, ?, ?, ?, ?)',
      [driverId, 'Unknown', vehicleModel, licensePlate, vehicleType]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully. We will review your documents within 48 hours.' 
    });
  } catch (err) {
    console.error('Apply as captain error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// @route   GET /api/drivers/stats
// @desc    Get driver statistics
// @access  Private
exports.getDriverStats = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const userId = req.user.id;
  
  try {
    // Get driver ID
    const [driver] = await db.execute(
      'SELECT id FROM drivers WHERE user_id = ?',
      [userId]
    );
    
    if (driver.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Driver profile not found. Please apply to become a captain.' 
      });
    }
    
    const driverId = driver[0].id;
    
    // Get today's rides
    const [todayRides] = await db.execute(
      `SELECT COUNT(*) as count, COALESCE(SUM(final_price), 0) as earnings 
       FROM rides 
       WHERE driver_id = ? AND DATE(requested_at) = CURDATE() 
       AND status = 'completed'`,
      [driverId]
    );
    
    // Get total rides
    const [totalRides] = await db.execute(
      `SELECT COUNT(*) as count FROM rides WHERE driver_id = ? AND status = 'completed'`,
      [driverId]
    );
    
    // Get average rating (mock for now - you'll need a ratings table)
    const rating = 4.8;
    
    // Get current status
    const [status] = await db.execute(
      'SELECT status, is_available FROM drivers WHERE id = ?',
      [driverId]
    );
    
    res.status(200).json({
      success: true,
      data: {
        todayRides: parseInt(todayRides[0]?.count) || 0,
        todayEarnings: parseFloat(todayRides[0]?.earnings) || 0,
        rating: rating,
        totalRides: parseInt(totalRides[0]?.count) || 0,
        status: status[0]?.status || 'offline',
        isAvailable: status[0]?.is_available || false,
      }
    });
  } catch (error) {
    console.error('Error fetching driver stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   POST /api/drivers/status
// @desc    Update driver online/offline status
// @access  Private
exports.updateDriverStatus = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const { online, lat, lng } = req.body;
  const userId = req.user.id;
  
  try {
    // Get driver ID
    const [driver] = await db.execute(
      'SELECT id FROM drivers WHERE user_id = ?',
      [userId]
    );
    
    if (driver.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Driver profile not found' 
      });
    }
    
    const driverId = driver[0].id;
    
    await db.execute(
      `UPDATE drivers 
       SET is_available = ?, 
           status = ?, 
           current_lat = ?, 
           current_lon = ? 
       WHERE id = ?`,
      [online ? 1 : 0, online ? 'online' : 'offline', lat || null, lng || null, driverId]
    );
    
    res.status(200).json({ 
      success: true, 
      message: online ? 'You are now online' : 'You are now offline',
      status: online ? 'online' : 'offline'
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/drivers/rides
// @desc    Get driver ride history
// @access  Private
exports.getDriverRideHistory = async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const userId = req.user.id;
  
  try {
    // Get driver ID
    const [driver] = await db.execute(
      'SELECT id FROM drivers WHERE user_id = ?',
      [userId]
    );
    
    if (driver.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Driver profile not found' 
      });
    }
    
    const driverId = driver[0].id;
    
    const [rides] = await db.execute(
      `SELECT r.*, u.name as customer_name, u.mobile as customer_mobile,
              v.model as vehicle_model, v.license_plate as vehicle_plate
       FROM rides r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN vehicles v ON r.vehicle_type_requested = v.type
       WHERE r.driver_id = ?
       ORDER BY r.requested_at DESC`,
      [driverId]
    );
    
    res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error('Error fetching driver ride history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};