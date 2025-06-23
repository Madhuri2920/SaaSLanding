const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure this is loaded

router.post('/submit', async (req, res) => {
  try {
    console.log('Form received:', req.body);
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // 1. Save to MongoDB
    const newLead = new Lead({ name, email, message });
    await newLead.save();

    // 2. Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS, // This should be the **Gmail App Password**
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: 'New Lead Submitted',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent');

    // 3. Respond Success
    res.json({ message: 'Form submitted successfully' });

  } catch (err) {
    console.error('❌ Backend Error:', err.message);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
});

module.exports = router;
