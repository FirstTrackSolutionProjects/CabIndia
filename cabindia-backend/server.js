// cabindia-backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

// Import routes
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const rideRoutes = require('./routes/rideRoutes');
const driverRoutes = require('./routes/driverRoutes');

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Log all requests for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Socket.IO connection handling with better error handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join_ride', (rideId) => {
    if (rideId) {
      socket.join(`ride_${rideId}`);
      console.log(`Socket ${socket.id} joined ride room: ride_${rideId}`);
    }
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
    if (data?.driverId) {
      console.log(`Driver ${data.driverId} is online`);
      socket.join('drivers_room');
    }
  });

  socket.on('driver_offline', (data) => {
    if (data?.driverId) {
      console.log(`Driver ${data.driverId} is offline`);
      socket.leave('drivers_room');
    }
  });

  socket.on('update_location', (data) => {
    if (data?.driverId && data?.rideId) {
      console.log(`📍 Driver ${data.driverId} location update for ride ${data.rideId}`);
      io.to(`ride_${data.rideId}`).emit(`location_${data.rideId}`, data);
    }
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
app.post('/api/rides/distance', async (req, res) => {
  const { originLat, originLon, destLat, destLon } = req.body;
  
  if (!originLat || !originLon || !destLat || !destLon) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required coordinates' 
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
          distance: element.distance.value / 1000,
          duration: element.duration.value / 60,
          distanceText: element.distance.text,
          durationText: element.duration.text,
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
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      contact: '/api/contact',
      rides: '/api/rides',
      drivers: '/api/drivers',
      distance: '/api/rides/distance'
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
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Test the API at: http://localhost:${PORT}/`);
  console.log(`🔐 Auth routes at: http://localhost:${PORT}/api/auth`);
  console.log(`🚗 Rides routes at: http://localhost:${PORT}/api/rides`);
  console.log(`👤 Drivers routes at: http://localhost:${PORT}/api/drivers`);
  console.log(`🌐 CORS allowed origins: ${process.env.CORS_ORIGIN || '*'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});