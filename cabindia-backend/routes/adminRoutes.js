// cabindia-backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const [user] = await db.execute(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (user.length === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// ADMIN LOGIN
// ============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const payload = {
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error generating token' });
        }
        res.json({
          success: true,
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
      }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// ADMIN STATISTICS
// ============================================
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [driverCount] = await db.execute('SELECT COUNT(*) as count FROM drivers');
    const [rideCount] = await db.execute('SELECT COUNT(*) as count FROM rides');
    const [completedRides] = await db.execute(
      'SELECT COUNT(*) as count FROM rides WHERE status = "completed"'
    );
    const [pendingRides] = await db.execute(
      'SELECT COUNT(*) as count FROM rides WHERE status = "pending"'
    );
    const [ticketCount] = await db.execute('SELECT COUNT(*) as count FROM support_tickets');
    const [openTickets] = await db.execute(
      'SELECT COUNT(*) as count FROM support_tickets WHERE status != "resolved"'
    );
    const [totalRevenue] = await db.execute(
      'SELECT SUM(final_price) as total FROM rides WHERE status = "completed" AND payment_status = "paid"'
    );

    res.json({
      success: true,
      stats: {
        users: userCount[0].count,
        drivers: driverCount[0].count,
        rides: rideCount[0].count,
        completedRides: completedRides[0].count,
        pendingRides: pendingRides[0].count,
        tickets: ticketCount[0].count,
        openTickets: openTickets[0].count,
        totalRevenue: totalRevenue[0].total || 0,
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// USERS MANAGEMENT
// ============================================
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, mobile, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id', auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, role } = req.body;

  try {
    await db.execute(
      'UPDATE users SET name = ?, email = ?, mobile = ?, role = ? WHERE id = ?',
      [name, email, mobile, role, id]
    );
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('User delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// DRIVERS MANAGEMENT
// ============================================
router.get('/drivers', auth, isAdmin, async (req, res) => {
  try {
    const [drivers] = await db.execute(`
      SELECT d.*, u.name, u.email, u.mobile, v.model, v.license_plate, v.type as vehicle_type
      FROM drivers d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN vehicles v ON d.id = v.driver_id
      ORDER BY d.created_at DESC
    `);
    res.json({ success: true, drivers });
  } catch (error) {
    console.error('Drivers fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/drivers/:id/verify', auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.execute(
      'UPDATE drivers SET status = ? WHERE id = ?',
      [status, id]
    );
    res.json({ success: true, message: 'Driver status updated successfully' });
  } catch (error) {
    console.error('Driver verify error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// RIDES MANAGEMENT
// ============================================
router.get('/rides', auth, isAdmin, async (req, res) => {
  try {
    const [rides] = await db.execute(`
      SELECT r.*, u.name as user_name, u.email as user_email,
             d.status as driver_status, v.model as vehicle_model
      FROM rides r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN drivers d ON r.driver_id = d.id
      LEFT JOIN vehicles v ON d.vehicle_id = v.id
      ORDER BY r.requested_at DESC
      LIMIT 100
    `);
    res.json({ success: true, rides });
  } catch (error) {
    console.error('Rides fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// SUPPORT TICKETS
// ============================================
router.get('/tickets', auth, isAdmin, async (req, res) => {
  try {
    const [tickets] = await db.execute(`
      SELECT t.*, u.name, u.email, u.mobile
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Tickets fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/tickets/:id', auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, priority } = req.body;

  try {
    await db.execute(
      'UPDATE support_tickets SET status = ?, priority = ?, updated_at = NOW() WHERE id = ?',
      [status, priority, id]
    );
    res.json({ success: true, message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Ticket update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// CONTACT MESSAGES
// ============================================
router.get('/messages', auth, isAdmin, async (req, res) => {
  try {
    const [messages] = await db.execute(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// PAYMENTS / REFUNDS
// ============================================
router.get('/payments', auth, isAdmin, async (req, res) => {
  try {
    const [payments] = await db.execute(`
      SELECT p.*, u.name, u.email, r.pickup_address, r.dropoff_address
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN rides r ON p.ride_id = r.id
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Payments fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/refund/:paymentId', auth, isAdmin, async (req, res) => {
  const { paymentId } = req.params;
  const { reason } = req.body;

  try {
    // Process refund logic
    await db.execute(
      'UPDATE payments SET status = "refunded", refund_reason = ?, refunded_at = NOW() WHERE id = ?',
      [reason, paymentId]
    );
    
    // Also update ride payment status
    const [payment] = await db.execute('SELECT ride_id FROM payments WHERE id = ?', [paymentId]);
    if (payment.length > 0 && payment[0].ride_id) {
      await db.execute(
        'UPDATE rides SET payment_status = "refunded" WHERE id = ?',
        [payment[0].ride_id]
      );
    }
    
    res.json({ success: true, message: 'Refund processed successfully' });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;