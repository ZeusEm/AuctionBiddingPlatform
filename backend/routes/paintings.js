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

// Place Bid - Support both authenticated and guest users
router.post('/bid', async (req, res) => {
  console.log('🎯 BID ROUTE HIT!');
  console.log('Body:', req.body);
  console.log('Auth header:', req.headers.authorization);
  
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcrypt');
  
  try {
    const { paintingId, bidAmount, name, mobile } = req.body;
    let userId;
    let user;
    let token;
    let isNewUser = false;

    // Try to get user from auth token first
    const authHeader = req.headers.authorization;
    const authToken = authHeader?.split(' ')[1];

    if (authToken && authToken !== 'null' && authToken !== 'undefined') {
      // User has auth token - verify it
      try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        userId = decoded.userId;
        
        const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }
        user = userResult.rows[0];
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
    } else if (name && mobile) {
      // Guest user - check/create account
      
      // Validate mobile
      if (!/^[0-9]{10}$/.test(mobile)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number. Must be 10 digits'
        });
      }

      // Check if user exists
      const existingUserResult = await query(
        'SELECT * FROM users WHERE mobile = $1',
        [mobile]
      );

      if (existingUserResult.rows.length > 0) {
        // User exists
        user = existingUserResult.rows[0];
        const existingName = `${user.first_name} ${user.last_name}`.toLowerCase().trim();
        const providedName = name.toLowerCase().trim();
        
        // Allow login regardless of name match for simplicity
        userId = user.id;
      } else {
        // Create new user
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;
        
        const passwordHash = await bcrypt.hash(mobile, 10);
        
        const newUserResult = await query(
          `INSERT INTO users (first_name, last_name, mobile, password_hash)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [firstName, lastName, mobile, passwordHash]
        );
        
        user = newUserResult.rows[0];
        userId = user.id;
        isNewUser = true;
      }

      // Generate token
      token = jwt.sign(
        { userId: userId, mobile: mobile, type: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    } else {
      // No auth and no name/mobile
      return res.status(401).json({
        success: false,
        message: 'Please provide your name and mobile number to place a bid.'
      });
    }

    // Check if auction is active
    const auctionResult = await query(
      'SELECT * FROM auction_settings WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
    );

    if (auctionResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active auction found'
      });
    }

    const settings = auctionResult.rows[0];
    const now = new Date();
    
    if (now < new Date(settings.start_date)) {
      return res.status(400).json({
        success: false,
        message: 'Auction has not started yet'
      });
    }

    if (now > new Date(settings.end_date)) {
      return res.status(400).json({
        success: false,
        message: 'Auction has ended'
      });
    }

    // Check if painting exists and is active
    const paintingResult = await query(
      'SELECT * FROM paintings WHERE id = $1 AND status = $2',
      [paintingId, 'active']
    );

    if (paintingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Painting not found or not available for bidding'
      });
    }

    const painting = paintingResult.rows[0];

    // Check if bid amount is greater than base price
    if (bidAmount < painting.base_price) {
      return res.status(400).json({
        success: false,
        message: `Bid amount must be at least ₹${painting.base_price}`
      });
    }

    // Get current highest bid
    const highestBidResult = await query(
      'SELECT MAX(bid_amount) as highest_bid FROM bids WHERE painting_id = $1 AND status = $2',
      [paintingId, 'active']
    );

    const highestBid = highestBidResult.rows[0].highest_bid;

    // Check if new bid is higher than current highest
    if (highestBid && bidAmount <= highestBid) {
      return res.status(400).json({
        success: false,
        message: `Bid amount must be greater than current highest bid of ₹${highestBid}`
      });
    }

    // Check if user already has a bid
    const existingBidResult = await query(
      'SELECT * FROM bids WHERE painting_id = $1 AND user_id = $2 AND status = $3',
      [paintingId, userId, 'active']
    );

    let bid;
    if (existingBidResult.rows.length > 0) {
      // Update existing bid
      const updateResult = await query(
        `UPDATE bids SET bid_amount = $1, bid_time = CURRENT_TIMESTAMP
         WHERE painting_id = $2 AND user_id = $3 AND status = 'active'
         RETURNING *`,
        [bidAmount, paintingId, userId]
      );
      bid = updateResult.rows[0];
    } else {
      // Insert new bid
      const insertResult = await query(
        `INSERT INTO bids (painting_id, user_id, bid_amount, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING *`,
        [paintingId, userId, bidAmount]
      );
      bid = insertResult.rows[0];
    }

    // Get user's rank
    const rankResult = await query(
      `SELECT rank FROM user_bid_rankings WHERE bid_id = $1`,
      [bid.id]
    );

    // Prepare response
    const response = {
      success: true,
      message: isNewUser 
        ? 'Welcome! Your bid has been placed successfully.' 
        : existingBidResult.rows.length > 0
        ? 'Your bid has been updated successfully!'
        : 'Bid placed successfully!',
      data: {
        bid: {
          id: bid.id,
          bidAmount: parseFloat(bid.bid_amount),
          bidTime: bid.bid_time,
          rank: rankResult.rows.length > 0 ? parseInt(rankResult.rows[0].rank) : 1
        }
      }
    };

    // Add token and user data for guest bids
    if (token) {
      response.token = token;
      response.user = {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        mobile: user.mobile,
        firstName: user.first_name,
        lastName: user.last_name
      };
    }

    res.status(201).json(response);
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place bid'
    });
  }
});

// Get Single Painting Details (Public with optional auth)
router.get('/:id', optionalAuth, validateIdParam, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get painting with current highest bid
    const paintingResult = await query(
      `SELECT 
        p.*,
        COALESCE(MAX(b.bid_amount), p.base_price) as current_price,
        COUNT(DISTINCT b.user_id) as total_bidders
      FROM paintings p
      LEFT JOIN bids b ON p.id = b.painting_id AND b.status = 'active'
      WHERE p.id = $1
      GROUP BY p.id`,
      [id]
    );

    if (paintingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    const painting = paintingResult.rows[0];

    // Check if painting is active
    if (painting.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This painting is not available for bidding'
      });
    }

    // Check auction dates
    const auctionResult = await query(
      'SELECT * FROM auction_settings WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
    );

    let auctionActive = false;
    if (auctionResult.rows.length > 0) {
      const settings = auctionResult.rows[0];
      const now = new Date();
      auctionActive = now >= new Date(settings.start_date) && now <= new Date(settings.end_date);
    }

    // Get user's bid info if authenticated
    let userBidInfo = null;
    if (userId) {
      const userBidResult = await query(
        `SELECT 
          b.id,
          b.bid_amount,
          b.bid_time,
          r.rank
        FROM bids b
        LEFT JOIN user_bid_rankings r ON b.id = r.bid_id
        WHERE b.painting_id = $1 AND b.user_id = $2 AND b.status = 'active'
        ORDER BY b.bid_amount DESC, b.bid_time ASC
        LIMIT 1`,
        [id, userId]
      );

      if (userBidResult.rows.length > 0) {
        const userBid = userBidResult.rows[0];
        userBidInfo = {
          bidAmount: parseFloat(userBid.bid_amount),
          rank: parseInt(userBid.rank),
          bidTime: userBid.bid_time
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        painting: {
          id: painting.id,
          artistName: painting.artist_name,
          paintingName: painting.painting_name,
          imageUrl: painting.image_url,
          basePrice: parseFloat(painting.base_price),
          currentPrice: parseFloat(painting.current_price),
          totalBidders: parseInt(painting.total_bidders),
          auctionActive
        },
        userBidInfo
      }
    });
  } catch (error) {
    console.error('Get painting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch painting details'
    });
  }
});


module.exports = router;
