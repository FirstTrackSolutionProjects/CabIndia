// cabindia-backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @route   POST /api/auth/register
// @desc    Register a new user
exports.register = async (req, res) => {
  console.log('Register request received:', req.body);
  const { name, email, mobile, password, confirmPassword } = req.body;

  if (!name || !email || !mobile || !password || !confirmPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing Fields - name, email, mobile, password, confirmPassword are required' 
    });
  }
  
  if (password !== confirmPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be same in both fields' 
    });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'User Already Exists with this email' 
      });
    }

    // Check if mobile already exists
    const [existingMobile] = await db.execute('SELECT id FROM users WHERE mobile = ?', [mobile]);
    if (existingMobile.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Mobile number already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    await db.execute(
      'INSERT INTO users (name, email, mobile, password) VALUES (?, ?, ?, ?)',
      [name, email, mobile, hashedPassword]
    );

    console.log('User registered successfully:', email);
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
exports.login = async (req, res) => {
  console.log('Login request received:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and Password are required' 
    });
  }

  try {
    // Check if user exists
    const [users] = await db.execute('SELECT id, name, email, password FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials - user not found' 
      });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials - wrong password' 
      });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT error:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error generating token' 
          });
        }
        
        console.log('Login successful for:', email);
        res.json({ 
          success: true, 
          message: 'Authentication successful', 
          token, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email 
          } 
        });
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login',
      error: error.message 
    });
  }
};