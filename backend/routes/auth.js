const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

// User Registration
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { firstName, lastName, mobile, password } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE mobile = $1',
      [mobile]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Mobile number already registered'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      `INSERT INTO users (first_name, last_name, mobile, password_hash) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, first_name, last_name, mobile, created_at`,
      [firstName, lastName, mobile, passwordHash]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        mobile: user.mobile,
        type: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          mobile: user.mobile
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// User Login
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Find user by mobile
    const result = await query(
      'SELECT id, first_name, last_name, mobile, password_hash FROM users WHERE mobile = $1',
      [mobile]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid mobile number or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        mobile: user.mobile,
        type: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          mobile: user.mobile
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Check Mobile Availability
router.get('/check-mobile/:mobile', async (req, res) => {
  try {
    const { mobile } = req.params;

    // Validate mobile format
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number format'
      });
    }

    const result = await query(
      'SELECT id FROM users WHERE mobile = $1',
      [mobile]
    );

    res.status(200).json({
      success: true,
      available: result.rows.length === 0
    });
  } catch (error) {
    console.error('Check mobile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking mobile availability'
    });
  }
});

module.exports = router;
