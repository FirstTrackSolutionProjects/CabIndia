// cabindia-backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Already in package.json
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const rideRoutes = require('./routes/rideRoutes');
const app = express();

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
