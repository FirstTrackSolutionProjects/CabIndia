// cabindia-backend/controllers/contactController.js
const nodemailer = require('nodemailer');
const db = require('../config/db'); // To save messages to DB
require('dotenv').config();

// @route   POST /api/contact
// @desc    Submit contact form and send email
exports.submitContact = async (req, res) => {
  const { name, email, mobile, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, Email, and Message are required', success: false });
  }

  try {
    // Save to database
    await db.execute(
      'INSERT INTO contact_messages (name, email, mobile, message) VALUES (?, ?, ?, ?)',
      [name, email, mobile || null, message]
    );

    // Send email
    let transporter = nodemailer.createTransport({
      service: 'gmail', // Or other service/host
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_SERVICE_EMAIL,
      subject: `Contact form submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile || 'N/A'}\n\nMessage:\n${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Nodemailer error:', error);
        // We still consider it a success if saved to DB, but might want to log email failure
        return res.status(200).json({ message: 'Contact form submitted, but email failed to send.', success: true, emailSent: false });
      }
      res.status(200).json({ message: 'Contact form submitted successfully', success: true, emailSent: true });
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ message: 'Server error during contact form submission', success: false });
  }
};
