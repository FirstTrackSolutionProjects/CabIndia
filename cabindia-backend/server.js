// cabindia-backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const rideRoutes = require('./routes/rideRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a specific ride room
  socket.on('join_ride', (rideId) => {
    socket.join(`ride_${rideId}`);
    console.log(`Socket ${socket.id} joined ride room: ride_${rideId}`);
  });

  // Drivers join a global drivers room to receive requests
  socket.on('join_drivers', () => {
    socket.join('drivers_room');
    console.log(`Socket ${socket.id} joined drivers_room`);
  });

  // Driver updates location
  socket.on('update_location', (data) => {
    io.to(`ride_${data.rideId}`).emit(`location_${data.rideId}`, data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Attach io to the app
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/rides', rideRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.send('CabIndia Backend API is running!');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});