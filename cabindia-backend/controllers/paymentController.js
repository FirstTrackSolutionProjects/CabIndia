// cabindia-backend/controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ============================================
// CREATE PAYMENT ORDER
// ============================================
exports.createOrder = async (req, res) => {
  const { amount, currency = 'INR', receipt, rideId, userId } = req.body;

  if (!amount || amount < 1) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: receipt || `ride_${rideId || Date.now()}`,
      payment_capture: 1,
      notes: {
        rideId: rideId || '',
        userId: userId || req.user?.id || '',
      }
    };

    const order = await razorpay.orders.create(options);

    // Save order to database
    await db.execute(
      `INSERT INTO payment_orders 
       (order_id, ride_id, user_id, amount, currency, status, receipt, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [order.id, rideId, userId || req.user?.id, amount, currency, 'created', order.receipt]
    );

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// ============================================
// VERIFY PAYMENT
// ============================================
exports.verifyPayment = async (req, res) => {
  const { orderId, paymentId, signature, rideId, amount } = req.body;

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ success: false, message: 'Missing payment details' });
  }

  try {
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update order status
    await db.execute(
      'UPDATE payment_orders SET payment_id = ?, status = "paid", paid_at = NOW() WHERE order_id = ?',
      [paymentId, orderId]
    );

    // Update ride payment status
    if (rideId) {
      await db.execute(
        'UPDATE rides SET payment_status = "paid" WHERE id = ?',
        [rideId]
      );
    }

    // Record payment
    await db.execute(
      `INSERT INTO payments 
       (user_id, ride_id, order_id, payment_id, amount, status, created_at) 
       VALUES (?, ?, ?, ?, ?, "paid", NOW())`,
      [req.user?.id || null, rideId, orderId, paymentId, amount || 0]
    );

    res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: paymentId,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

// ============================================
// PROCESS REFUND
// ============================================
exports.processRefund = async (req, res) => {
  const { rideId, reason, amount, userId } = req.body;

  if (!rideId || !reason || !amount) {
    return res.status(400).json({ success: false, message: 'Missing refund details' });
  }

  try {
    // Check if ride exists and is eligible for refund
    const [ride] = await db.execute(
      'SELECT id, user_id, payment_status, final_price, status FROM rides WHERE id = ?',
      [rideId]
    );

    if (ride.length === 0) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    const rideData = ride[0];

    // Check if user owns this ride
    if (rideData.user_id !== (userId || req.user?.id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized refund request' });
    }

    // Check if ride can be refunded
    if (rideData.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Ride is not eligible for refund' });
    }

    // Check if already refunded
    const [existingRefund] = await db.execute(
      'SELECT id FROM refunds WHERE ride_id = ? AND status != "rejected"',
      [rideId]
    );
    if (existingRefund.length > 0) {
      return res.status(400).json({ success: false, message: 'Refund already requested for this ride' });
    }

    // Get payment details
    const [payment] = await db.execute(
      'SELECT payment_id, amount FROM payments WHERE ride_id = ? AND status = "paid"',
      [rideId]
    );

    if (payment.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment not found for this ride' });
    }

    // Calculate refund amount (minus cancellation fee if applicable)
    let refundAmount = parseFloat(amount);
    let cancellationFee = 0;

    // Determine cancellation fee based on ride status
    if (rideData.status === 'accepted') {
      cancellationFee = Math.min(refundAmount * 0.1, 20); // 10% or ₹20
    } else if (rideData.status === 'started') {
      cancellationFee = Math.min(refundAmount * 0.25, 50); // 25% or ₹50
    } else if (rideData.status === 'pending') {
      cancellationFee = 0; // Full refund for pending
    }

    refundAmount = refundAmount - cancellationFee;

    // Create refund record
    const refundId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    await db.execute(
      `INSERT INTO refunds 
       (refund_id, ride_id, user_id, amount, cancellation_fee, reason, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [refundId, rideId, rideData.user_id, refundAmount, cancellationFee, reason]
    );

    // If using Razorpay, initiate refund
    let razorpayRefund = null;
    if (payment[0].payment_id) {
      try {
        razorpayRefund = await razorpay.payments.refund(payment[0].payment_id, {
          amount: Math.round(refundAmount * 100),
          speed: 'normal',
          notes: {
            reason: reason,
            rideId: rideId,
            refundId: refundId,
          }
        });

        // Update refund with razorpay details
        await db.execute(
          'UPDATE refunds SET razorpay_refund_id = ?, status = "processed" WHERE id = ?',
          [razorpayRefund.id, refundId]
        );
      } catch (razorpayError) {
        console.error('Razorpay refund error:', razorpayError);
        // Still keep the refund as pending
      }
    }

    // Update ride payment status
    await db.execute(
      'UPDATE rides SET payment_status = "refunded" WHERE id = ?',
      [rideId]
    );

    res.json({
      success: true,
      message: 'Refund request submitted successfully',
      refundId: refundId,
      refundAmount: refundAmount,
      cancellationFee: cancellationFee,
      razorpayRefund: razorpayRefund,
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ success: false, message: 'Failed to process refund' });
  }
};

// ============================================
// GET REFUND STATUS
// ============================================
exports.getRefundStatus = async (req, res) => {
  const { refundId } = req.params;
  const userId = req.user?.id;

  try {
    const [refund] = await db.execute(
      `SELECT r.*, u.name, u.email, ri.pickup_address, ri.dropoff_address 
       FROM refunds r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN rides ri ON r.ride_id = ri.id
       WHERE r.refund_id = ? AND r.user_id = ?`,
      [refundId, userId]
    );

    if (refund.length === 0) {
      return res.status(404).json({ success: false, message: 'Refund not found' });
    }

    res.json({ success: true, refund: refund[0] });
  } catch (error) {
    console.error('Refund status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// GET USER REFUNDS
// ============================================
exports.getUserRefunds = async (req, res) => {
  const userId = req.user?.id;

  try {
    const [refunds] = await db.execute(
      `SELECT r.*, ri.pickup_address, ri.dropoff_address, ri.status as ride_status
       FROM refunds r
       LEFT JOIN rides ri ON r.ride_id = ri.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({ success: true, refunds });
  } catch (error) {
    console.error('User refunds error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// CANCEL RIDE WITH REFUND
// ============================================
exports.cancelRideWithRefund = async (req, res) => {
  const { rideId } = req.params;
  const { cancellationReason } = req.body;
  const userId = req.user?.id;

  try {
    // Check ride exists
    const [ride] = await db.execute(
      'SELECT id, user_id, status, payment_status, estimated_price, final_price FROM rides WHERE id = ?',
      [rideId]
    );

    if (ride.length === 0) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    const rideData = ride[0];

    // Check ownership
    if (rideData.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Not your ride' });
    }

    // Check if already cancelled or completed
    if (rideData.status === 'cancelled' || rideData.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: `Ride is already ${rideData.status}` 
      });
    }

    // Calculate refund amount
    let refundAmount = 0;
    let cancellationFee = 0;
    const totalAmount = parseFloat(rideData.final_price || rideData.estimated_price || 0);

    if (rideData.payment_status === 'paid') {
      if (rideData.status === 'pending') {
        refundAmount = totalAmount;
        cancellationFee = 0;
      } else if (rideData.status === 'accepted') {
        refundAmount = totalAmount * 0.9;
        cancellationFee = totalAmount * 0.1;
      } else if (rideData.status === 'started') {
        refundAmount = totalAmount * 0.75;
        cancellationFee = totalAmount * 0.25;
      } else {
        refundAmount = totalAmount;
      }
    }

    // Update ride status
    await db.execute(
      'UPDATE rides SET status = "cancelled", cancellation_reason = ?, cancelled_at = NOW() WHERE id = ?',
      [cancellationReason || 'Cancelled by user', rideId]
    );

    // Update driver status if assigned
    if (rideData.driver_id) {
      await db.execute(
        'UPDATE drivers SET status = "online" WHERE id = ?',
        [rideData.driver_id]
      );
    }

    // Process refund if payment was made
    if (refundAmount > 0) {
      // Get payment details
      const [payment] = await db.execute(
        'SELECT payment_id FROM payments WHERE ride_id = ? AND status = "paid"',
        [rideId]
      );

      if (payment.length > 0) {
        const refundId = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        await db.execute(
          `INSERT INTO refunds 
           (refund_id, ride_id, user_id, amount, cancellation_fee, reason, status, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
          [refundId, rideId, userId, refundAmount, cancellationFee, cancellationReason || 'Ride cancelled']
        );

        // Try Razorpay refund
        if (payment[0].payment_id) {
          try {
            const razorpayRefund = await razorpay.payments.refund(payment[0].payment_id, {
              amount: Math.round(refundAmount * 100),
              speed: 'normal',
              notes: {
                reason: cancellationReason || 'Ride cancelled',
                rideId: rideId,
                refundId: refundId,
              }
            });

            await db.execute(
              'UPDATE refunds SET razorpay_refund_id = ?, status = "processed" WHERE id = ?',
              [razorpayRefund.id, refundId]
            );
          } catch (error) {
            console.error('Razorpay refund error:', error);
          }
        }

        await db.execute(
          'UPDATE rides SET payment_status = "refunded" WHERE id = ?',
          [rideId]
        );
      }
    }

    res.json({
      success: true,
      message: 'Ride cancelled successfully',
      refundAmount: refundAmount,
      cancellationFee: cancellationFee,
      rideId: rideId,
    });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};