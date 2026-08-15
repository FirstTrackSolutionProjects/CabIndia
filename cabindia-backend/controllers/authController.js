// cabindia-backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const axios = require('axios');

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

    // Insert new user with default role 'user'
    await db.execute(
      'INSERT INTO users (name, email, mobile, password, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, email, mobile, hashedPassword, 'user']
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
    const [users] = await db.execute('SELECT id, name, email, password, role FROM users WHERE email = ?', [email]);
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
        role: user.role || 'user',
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
            email: user.email,
            role: user.role || 'user'
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

// @route   POST /api/auth/google
// @desc    Authenticate user with Google OAuth
exports.googleLogin = async (req, res) => {
  console.log('Google login request received');
  const { idToken, email, name, picture } = req.body;

  if (!idToken || !email) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: idToken and email'
    });
  }

  try {
    // Verify the Google ID Token
    const googleResponse = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    const payload = googleResponse.data;

    // Verify the email matches
    if (payload.email !== email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    // Check if user exists with this email
    let [users] = await db.execute('SELECT id, name, email, role FROM users WHERE email = ?', [email]);

    let userId;
    let userName = name || email.split('@')[0];

    if (users.length === 0) {
      // Create a new user with Google credentials
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      const [result] = await db.execute(
        'INSERT INTO users (name, email, mobile, password, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [userName, email, 'google_user', hashedPassword, 'user']
      );
      
      userId = result.insertId;
      console.log('New Google user created:', email);
    } else {
      userId = users[0].id;
      userName = users[0].name;
    }

    // Generate JWT
    const payloadJWT = {
      user: {
        id: userId,
        email: email,
        name: userName,
        role: users.length > 0 ? users[0].role : 'user',
      },
    };

    jwt.sign(
      payloadJWT,
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

        console.log('Google login successful for:', email);
        res.json({
          success: true,
          message: 'Authentication successful',
          token,
          user: {
            id: userId,
            name: userName,
            email: email,
            picture: picture || null,
            role: users.length > 0 ? users[0].role : 'user',
          }
        });
      }
    );

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google login',
      error: error.message
    });
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const [users] = await db.execute('SELECT id, email FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email address' 
      });
    }

    const user = users[0];
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET + user.email,
      { expiresIn: '1h' }
    );

    // Save reset token to database
    await db.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
      [resetToken, user.id]
    );

    // Send reset email (you need to implement this)
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // Use your email service to send the reset link
    
    res.json({ 
      success: true, 
      message: 'Password reset link sent to your email. Please check your inbox.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
exports.resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }

  try {
    // Find user by reset token
    const [users] = await db.execute(
      'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ 
      success: true, 
      message: 'Password reset successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   POST /api/auth/change-password
// @desc    Change password (authenticated user)
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }

  try {
    const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate token)
exports.logout = async (req, res) => {
  try {
    // The client will remove the token from storage
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};