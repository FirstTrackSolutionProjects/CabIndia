// cabindia-backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Already in package.json
require('dotenv').config();
const http = require('http'); // New: Import http module
const { Server } = require('socket.io'); // New: Import Server from socket.io

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const rideRoutes = require('./routes/rideRoutes');
const app = express();
const server = http.createServer(app); // New: Create HTTP server using express app

// New: Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*" // Allow all origins for WebSocket connections
  }
});

// New: Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Driver updates location
  socket.on('update_location', (data) => {
    // data: { rideId, latitude, longitude }
    io.emit(`location_${data.rideId}`, data); // Emit location update to specific ride room
  });

  // Join a specific ride room
  socket.on('join_ride', (rideId) => {
    socket.join(`ride_${rideId}`);
    console.log(`Socket ${socket.id} joined ride room: ride_${rideId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // To parse JSON request bodies

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/rides', rideRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.send('CabIndia Backend API is running!');
});

const PORT = process.env.PORT || 5000;

// Change app.listen to server.listen for Socket.IO integration
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
