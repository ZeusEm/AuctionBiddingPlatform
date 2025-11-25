#!/bin/bash

# Backend Route Fix Script
# Reorders routes in paintings.js to fix the "user-bids" issue

echo "🔧 Fixing backend route order..."

cd ~/Documents/painting-auction/backend/routes

# Backup original
cp paintings.js paintings.js.backup
echo "✓ Backup created: paintings.js.backup"

# Create the fixed version
cat > paintings.js.fixed << 'FIXED_ROUTES'
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateUser, optionalAuth } = require('../middleware/auth');
const { validateBidCreation, validateIdParam, validateMobileQuery } = require('../middleware/validation');

// Get All Active Paintings (Public)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        p.id,
        p.artist_name,
        p.painting_name,
        p.image_url,
        p.base_price,
        COALESCE(MAX(b.bid_amount), p.base_price) as current_price,
        COUNT(DISTINCT b.user_id) as total_bidders
      FROM paintings p
      LEFT JOIN bids b ON p.id = b.painting_id AND b.status = 'active'
      WHERE p.status = 'active'
      GROUP BY p.id
      ORDER BY p.created_at DESC`
    );

    const paintings = result.rows.map(painting => ({
      id: painting.id,
      artistName: painting.artist_name,
      paintingName: painting.painting_name,
      imageUrl: painting.image_url,
      basePrice: parseFloat(painting.base_price),
      currentPrice: parseFloat(painting.current_price),
      totalBidders: parseInt(painting.total_bidders)
    }));

    res.status(200).json({
      success: true,
      data: { paintings }
    });
  } catch (error) {
    console.error('Get paintings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch paintings'
    });
  }
});

// Get User's All Bids (by mobile) - MUST BE BEFORE /:id route!
router.get('/user-bids', validateMobileQuery, async (req, res) => {
  try {
    const { mobile } = req.query;

    // Get user ID
    const userResult = await query(
      'SELECT id FROM users WHERE mobile = $1',
      [mobile]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userId = userResult.rows[0].id;

    // Get all user bids with paintings and rankings
    const bidsResult = await query(
      `SELECT 
        b.id,
        b.bid_amount,
        b.bid_time,
        p.id as painting_id,
        p.painting_name,
        p.artist_name,
        p.image_url,
        COALESCE(r.rank, 999) as rank,
        COALESCE(MAX(b2.bid_amount), p.base_price) as current_highest_bid
      FROM bids b
      JOIN paintings p ON b.painting_id = p.id
      LEFT JOIN user_bid_rankings r ON b.id = r.bid_id
      LEFT JOIN bids b2 ON p.id = b2.painting_id AND b2.status = 'active'
      WHERE b.user_id = $1 AND b.status = 'active'
      GROUP BY b.id, b.bid_amount, b.bid_time, p.id, p.painting_name, p.artist_name, p.image_url, r.rank
      ORDER BY b.bid_time DESC`,
      [userId]
    );

    const bids = bidsResult.rows.map(bid => ({
      id: bid.id,
      bidAmount: parseFloat(bid.bid_amount),
      bidTime: bid.bid_time,
      rank: parseInt(bid.rank),
      currentHighestBid: parseFloat(bid.current_highest_bid),
      painting: {
        id: bid.painting_id,
        name: bid.painting_name,
        artist: bid.artist_name,
        imageUrl: bid.image_url
      }
    }));

    res.status(200).json({
      success: true,
      data: { bids }
    });
  } catch (error) {
    console.error('Get user bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user bids'
    });
  }
});

FIXED_ROUTES

# Append the POST /bid route (keep original from line 108)
sed -n '108,217p' paintings.js.backup >> paintings.js.fixed

# Append the GET /:id route (keep original from line 7)  
sed -n '7,106p' paintings.js.backup >> paintings.js.fixed

# Add module.exports
echo "" >> paintings.js.fixed
echo "module.exports = router;" >> paintings.js.fixed

# Replace original with fixed version
mv paintings.js.fixed paintings.js

echo "✅ Route order fixed!"
echo ""
echo "Now restart your backend:"
echo "  cd ~/Documents/painting-auction/backend"
echo "  npm start"
echo ""
echo "Then test:"
echo "  curl \"http://localhost:5000/api/paintings/user-bids?mobile=9821751181\""
