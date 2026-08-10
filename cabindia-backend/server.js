// cabindia-backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken'); // ADD THIS - missing import

// Import routes
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const rideRoutes = require('./routes/rideRoutes');
const driverRoutes = require('./routes/driverRoutes');

// Import database
const db = require('./config/db');

const app = express();
const server = http.createServer(app);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Import auth middleware
const auth = require('./middleware/authMiddleware');

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_ride', (rideId) => {
    socket.join(`ride_${rideId}`);
    console.log(`Socket ${socket.id} joined ride room: ride_${rideId}`);
  });

  socket.on('join_drivers', () => {
    socket.join('drivers_room');
    console.log(`Socket ${socket.id} joined drivers_room`);
  });

  socket.on('leave_drivers', () => {
    socket.leave('drivers_room');
    console.log(`Socket ${socket.id} left drivers_room`);
  });

  socket.on('driver_online', (data) => {
    console.log(`Driver ${data.driverId} is online`);
    socket.join('drivers_room');
  });

  socket.on('driver_offline', (data) => {
    console.log(`Driver ${data.driverId} is offline`);
    socket.leave('drivers_room');
  });

  socket.on('update_location', (data) => {
    console.log(`📍 Driver ${data.driverId} location update for ride ${data.rideId}:`, data.latitude, data.longitude);
    io.to(`ride_${data.rideId}`).emit(`location_${data.rideId}`, data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Attach io to the app
app.set('socketio', io);

// ============================================
// DISTANCE CALCULATION ENDPOINT
// ============================================
// @route   POST /api/rides/distance
// @desc    Calculate distance between two coordinates using Google Maps Distance Matrix API
// @access  Public
app.post('/api/rides/distance', async (req, res) => {
  const { originLat, originLon, destLat, destLon } = req.body;
  
  if (!originLat || !originLon || !destLat || !destLon) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required coordinates: originLat, originLon, destLat, destLon' 
    });
  }

  try {
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not configured');
      return res.status(500).json({ 
        success: false, 
        message: 'Google Maps API key not configured' 
      });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLon}&destinations=${destLat},${destLon}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.rows && data.rows.length > 0 && data.rows[0].elements && data.rows[0].elements.length > 0) {
      const element = data.rows[0].elements[0];
      if (element.status === 'OK') {
        return res.json({
          success: true,
          distance: element.distance.value / 1000, // Convert meters to km
          duration: element.duration.value / 60, // Convert seconds to minutes
          distanceText: element.distance.text,
          durationText: element.duration.text,
        });
      } else if (element.status === 'ZERO_RESULTS') {
        return res.status(400).json({ 
          success: false, 
          message: 'No route found between the two locations' 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: `Distance API error: ${element.status}` 
        });
      }
    }
    
    res.status(400).json({ 
      success: false, 
      message: 'Could not calculate distance' 
    });
  } catch (error) {
    console.error('Distance calculation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error calculating distance' 
    });
  }
});

// ============================================
// USER PROFILE ROUTES
// ============================================

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
app.put('/api/user/profile', auth, async (req, res) => {
  const userId = req.user.id;
  const { name, email, mobile } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  try {
    // Check if email is taken by another user
    if (email) {
      const [existing] = await db.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
    }

    // Check if mobile is taken by another user
    if (mobile) {
      const [existing] = await db.execute('SELECT id FROM users WHERE mobile = ? AND id != ?', [mobile, userId]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Mobile number already in use' });
      }
    }

    await db.execute(
      'UPDATE users SET name = ?, email = ?, mobile = ? WHERE id = ?',
      [name, email || null, mobile || null, userId]
    );

    const [updated] = await db.execute('SELECT id, name, email, mobile FROM users WHERE id = ?', [userId]);

    // Generate new token with updated user data
    const payload = {
      user: {
        id: updated[0].id,
        email: updated[0].email,
        name: updated[0].name,
        mobile: updated[0].mobile,
      },
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ 
      success: true, 
      user: updated[0],
      token: token
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/user/payment-methods
// @desc    Get user payment methods
// @access  Private
app.get('/api/user/payment-methods', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const [methods] = await db.execute(
      'SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC',
      [userId]
    );

    if (methods.length === 0) {
      // Create default payment methods for new user
      const defaultMethods = [
        { user_id: userId, method_type: 'cash', is_enabled: true, is_default: true },
        { user_id: userId, method_type: 'upi', is_enabled: true, is_default: false },
        { user_id: userId, method_type: 'card', is_enabled: false, is_default: false },
        { user_id: userId, method_type: 'wallet', is_enabled: false, is_default: false },
      ];

      for (const method of defaultMethods) {
        await db.execute(
          'INSERT INTO payment_methods (user_id, method_type, is_enabled, is_default) VALUES (?, ?, ?, ?)',
          [method.user_id, method.method_type, method.is_enabled ? 1 : 0, method.is_default ? 1 : 0]
        );
      }

      const [newMethods] = await db.execute(
        'SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC',
        [userId]
      );
      return res.json({ success: true, methods: newMethods });
    }

    res.json({ success: true, methods });
  } catch (error) {
    console.error('Payment methods fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/user/payment-methods
// @desc    Update user payment methods
// @access  Private
app.post('/api/user/payment-methods', auth, async (req, res) => {
  const userId = req.user.id;
  const { methods, defaultMethod } = req.body;

  if (!methods || !Array.isArray(methods)) {
    return res.status(400).json({ success: false, message: 'Invalid methods data' });
  }

  try {
    // Update each method
    for (const method of methods) {
      await db.execute(
        'UPDATE payment_methods SET is_enabled = ?, is_default = ? WHERE user_id = ? AND method_type = ?',
        [method.enabled ? 1 : 0, method.id === defaultMethod ? 1 : 0, userId, method.id]
      );
    }

    // Ensure only one default
    if (defaultMethod) {
      await db.execute(
        'UPDATE payment_methods SET is_default = 0 WHERE user_id = ? AND method_type != ?',
        [userId, defaultMethod]
      );
      await db.execute(
        'UPDATE payment_methods SET is_default = 1 WHERE user_id = ? AND method_type = ?',
        [userId, defaultMethod]
      );
    }

    const [updated] = await db.execute(
      'SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC',
      [userId]
    );

    res.json({ success: true, methods: updated });
  } catch (error) {
    console.error('Payment methods update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// DRIVER VEHICLE ROUTES
// ============================================

// @route   GET /api/drivers/vehicle
// @desc    Get driver vehicle details
// @access  Private
app.get('/api/drivers/vehicle', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    // Get driver ID
    const [driver] = await db.execute('SELECT id FROM drivers WHERE user_id = ?', [userId]);
    if (driver.length === 0) {
      return res.status(404).json({ success: false, message: 'Driver profile not found' });
    }

    const driverId = driver[0].id;

    // Get vehicle details
    const [vehicle] = await db.execute(
      'SELECT * FROM vehicles WHERE driver_id = ?',
      [driverId]
    );

    if (vehicle.length === 0) {
      return res.json({ 
        success: true, 
        vehicle: {
          vehicleType: 'Sedan',
          vehicleModel: '',
          licensePlate: '',
          vehicleColor: '',
          rcNumber: '',
          chassisNumber: '',
          pollutionValid: true,
          insuranceValid: true,
        }
      });
    }

    // Map database fields to frontend expected fields
    const vehicleData = {
      vehicleType: vehicle[0].type || 'Sedan',
      vehicleModel: vehicle[0].model || '',
      licensePlate: vehicle[0].license_plate || '',
      vehicleColor: vehicle[0].make || '',
      rcNumber: vehicle[0].rc_number || '',
      chassisNumber: vehicle[0].chassis_number || '',
      pollutionValid: vehicle[0].pollution_valid === 1,
      insuranceValid: vehicle[0].insurance_valid === 1,
    };

    res.json({ success: true, vehicle: vehicleData });
  } catch (error) {
    console.error('Vehicle fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/drivers/vehicle
// @desc    Update driver vehicle details
// @access  Private
app.put('/api/drivers/vehicle', auth, async (req, res) => {
  const userId = req.user.id;
  const { 
    vehicleType, 
    vehicleModel, 
    licensePlate, 
    vehicleColor,
    rcNumber,
    chassisNumber,
    pollutionValid,
    insuranceValid 
  } = req.body;

  if (!vehicleModel || !licensePlate) {
    return res.status(400).json({ success: false, message: 'Vehicle Model and License Plate are required' });
  }

  try {
    // Get driver ID
    const [driver] = await db.execute('SELECT id FROM drivers WHERE user_id = ?', [userId]);
    if (driver.length === 0) {
      return res.status(404).json({ success: false, message: 'Driver profile not found' });
    }

    const driverId = driver[0].id;

    // Check if vehicle exists
    const [existing] = await db.execute('SELECT id FROM vehicles WHERE driver_id = ?', [driverId]);

    if (existing.length === 0) {
      // Insert new vehicle
      await db.execute(
        `INSERT INTO vehicles (
          driver_id, type, model, license_plate, make, 
          rc_number, chassis_number, pollution_valid, insurance_valid
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          driverId,
          vehicleType || 'Sedan',
          vehicleModel,
          licensePlate,
          vehicleColor || '',
          rcNumber || '',
          chassisNumber || '',
          pollutionValid ? 1 : 0,
          insuranceValid ? 1 : 0,
        ]
      );
    } else {
      // Update existing vehicle
      await db.execute(
        `UPDATE vehicles SET 
          type = ?, model = ?, license_plate = ?, make = ?,
          rc_number = ?, chassis_number = ?,
          pollution_valid = ?, insurance_valid = ?
        WHERE driver_id = ?`,
        [
          vehicleType || 'Sedan',
          vehicleModel,
          licensePlate,
          vehicleColor || '',
          rcNumber || '',
          chassisNumber || '',
          pollutionValid ? 1 : 0,
          insuranceValid ? 1 : 0,
          driverId,
        ]
      );
    }

    res.json({ success: true, message: 'Vehicle details updated successfully' });
  } catch (error) {
    console.error('Vehicle update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// USER SETTINGS ROUTES
// ============================================

// @route   GET /api/user/settings
// @desc    Get user settings
// @access  Private
app.get('/api/user/settings', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const [settings] = await db.execute('SELECT * FROM user_settings WHERE user_id = ?', [userId]);

    if (settings.length === 0) {
      // Create default settings for new user
      await db.execute(
        `INSERT INTO user_settings (
          user_id, notifications, dark_mode, location_tracking, 
          share_data, auto_book, auto_accept, sound_effects, vibration, 
          language, measurement_unit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, 1, 1, 1, 0, 0, 0, 1, 1, 'English', 'km']
      );

      const [newSettings] = await db.execute('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
      return res.json({ success: true, settings: newSettings[0] });
    }

    res.json({ success: true, settings: settings[0] });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/user/settings
// @desc    Update user settings
// @access  Private
app.post('/api/user/settings', auth, async (req, res) => {
  const userId = req.user.id;
  const { 
    notifications, 
    darkMode, 
    locationTracking, 
    shareData, 
    autoBook,
    autoAccept,
    soundEffects,
    vibration,
    language,
    measurementUnit 
  } = req.body;

  try {
    // Check if settings exist
    const [existing] = await db.execute('SELECT id FROM user_settings WHERE user_id = ?', [userId]);

    // Prepare update fields
    const updates = [];
    const values = [];

    if (notifications !== undefined) {
      updates.push('notifications = ?');
      values.push(notifications ? 1 : 0);
    }
    if (darkMode !== undefined) {
      updates.push('dark_mode = ?');
      values.push(darkMode ? 1 : 0);
    }
    if (locationTracking !== undefined) {
      updates.push('location_tracking = ?');
      values.push(locationTracking ? 1 : 0);
    }
    if (shareData !== undefined) {
      updates.push('share_data = ?');
      values.push(shareData ? 1 : 0);
    }
    if (autoBook !== undefined) {
      updates.push('auto_book = ?');
      values.push(autoBook ? 1 : 0);
    }
    if (autoAccept !== undefined) {
      updates.push('auto_accept = ?');
      values.push(autoAccept ? 1 : 0);
    }
    if (soundEffects !== undefined) {
      updates.push('sound_effects = ?');
      values.push(soundEffects ? 1 : 0);
    }
    if (vibration !== undefined) {
      updates.push('vibration = ?');
      values.push(vibration ? 1 : 0);
    }
    if (language !== undefined) {
      updates.push('language = ?');
      values.push(language);
    }
    if (measurementUnit !== undefined) {
      updates.push('measurement_unit = ?');
      values.push(measurementUnit);
    }

    if (existing.length === 0) {
      // Insert new settings
      await db.execute(
        `INSERT INTO user_settings (
          user_id, notifications, dark_mode, location_tracking, 
          share_data, auto_book, auto_accept, sound_effects, vibration, 
          language, measurement_unit
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          notifications !== undefined ? (notifications ? 1 : 0) : 1,
          darkMode !== undefined ? (darkMode ? 1 : 0) : 1,
          locationTracking !== undefined ? (locationTracking ? 1 : 0) : 1,
          shareData !== undefined ? (shareData ? 1 : 0) : 0,
          autoBook !== undefined ? (autoBook ? 1 : 0) : 0,
          autoAccept !== undefined ? (autoAccept ? 1 : 0) : 0,
          soundEffects !== undefined ? (soundEffects ? 1 : 0) : 1,
          vibration !== undefined ? (vibration ? 1 : 0) : 1,
          language || 'English',
          measurementUnit || 'km',
        ]
      );
    } else if (updates.length > 0) {
      // Update existing settings
      values.push(userId);
      await db.execute(
        `UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`,
        values
      );
    }

    // Fetch updated settings
    const [updated] = await db.execute('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
    res.json({ success: true, settings: updated[0] });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// REGISTER API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/drivers', driverRoutes);

// ============================================
// HEALTH CHECK / TEST ROUTE
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'CabIndia Backend API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      contact: '/api/contact',
      rides: '/api/rides',
      drivers: '/api/drivers',
      distance: '/api/rides/distance',
      user: '/api/user/profile, /api/user/payment-methods, /api/user/settings',
      vehicle: '/api/drivers/vehicle'
    }
  });
});

// ============================================
// 404 HANDLER - Undefined Routes
// ============================================
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.url} not found` 
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error',
    error: err.message 
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Test the API at: http://localhost:${PORT}/`);
  console.log(`🔐 Auth routes at: http://localhost:${PORT}/api/auth`);
  console.log(`🚗 Rides routes at: http://localhost:${PORT}/api/rides`);
  console.log(`👤 Drivers routes at: http://localhost:${PORT}/api/drivers`);
  console.log(`📏 Distance endpoint at: http://localhost:${PORT}/api/rides/distance`);
  console.log(`👤 User profile routes at: http://localhost:${PORT}/api/user/`);
  console.log(`🚗 Vehicle routes at: http://localhost:${PORT}/api/drivers/vehicle`);
  console.log(`⚙️  Settings routes at: http://localhost:${PORT}/api/user/settings`);
  console.log(`🌐 CORS allowed origins: ${process.env.CORS_ORIGIN || '*'}`);
});