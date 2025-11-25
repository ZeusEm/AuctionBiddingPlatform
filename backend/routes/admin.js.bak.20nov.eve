const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const ExcelJS = require('exceljs');
const { query } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');
const {
  validateAdminLogin,
  validatePaintingCreation,
  validatePaintingUpdate,
  validateAuctionSettings,
  validateIdParam
} = require('../middleware/validation');

// Admin Login
router.post('/login', validateAdminLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const result = await query(
      'SELECT id, username, password_hash, email FROM admins WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const admin = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await query(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [admin.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: admin.id,
        username: admin.username,
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// Create Painting (Protected)
router.post('/paintings', authenticateAdmin, validatePaintingCreation, async (req, res) => {
  try {
    const { artistName, paintingName, basePrice, imageUrl } = req.body;

    // Generate unique QR code data
    const qrCodeData = `PAINT${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Insert painting
    const result = await query(
      `INSERT INTO paintings (artist_name, painting_name, base_price, image_url, qr_code_data, status) 
       VALUES ($1, $2, $3, $4, $5, 'active') 
       RETURNING *`,
      [artistName, paintingName, basePrice, imageUrl || null, qrCodeData]
    );

    const painting = result.rows[0];

    // Generate QR code as data URL
    const paintingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/painting/${painting.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(paintingUrl);

    res.status(201).json({
      success: true,
      message: 'Painting created successfully',
      data: {
        painting: {
          id: painting.id,
          artistName: painting.artist_name,
          paintingName: painting.painting_name,
          basePrice: parseFloat(painting.base_price),
          imageUrl: painting.image_url,
          status: painting.status,
          qrCode: qrCodeDataUrl,
          paintingUrl
        }
      }
    });
  } catch (error) {
    console.error('Create painting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create painting'
    });
  }
});

// Get All Paintings (Protected)
router.get('/paintings', authenticateAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        p.*,
        COALESCE(MAX(b.bid_amount), p.base_price) as current_price,
        COUNT(DISTINCT b.user_id) as total_bidders,
        COUNT(b.id) as total_bids
      FROM paintings p
      LEFT JOIN bids b ON p.id = b.painting_id AND b.status = 'active'
      GROUP BY p.id
      ORDER BY p.created_at DESC`
    );

    const paintings = result.rows.map(painting => ({
      id: painting.id,
      artistName: painting.artist_name,
      paintingName: painting.painting_name,
      basePrice: parseFloat(painting.base_price),
      currentPrice: parseFloat(painting.current_price),
      imageUrl: painting.image_url,
      status: painting.status,
      totalBidders: parseInt(painting.total_bidders),
      totalBids: parseInt(painting.total_bids),
      createdAt: painting.created_at
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

// Get Single Painting with QR Code (Protected)
router.get('/paintings/:id/qrcode', authenticateAdmin, validateIdParam, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM paintings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    const painting = result.rows[0];
    const paintingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/painting/${painting.id}`;
    
    // Generate QR code with text
    const { createCanvas, loadImage } = require('canvas');
    
    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(paintingUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Load QR code image
    const qrImage = await loadImage(qrCodeBuffer);
    
    // Create canvas with extra space for text
    const canvas = createCanvas(500, 600);
    const ctx = canvas.getContext('2d');
    
    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 500, 600);
    
    // Draw painting name at top (ALL CAPS)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    const paintingName = painting.painting_name.toUpperCase();
    
    // Word wrap for long names
    const maxWidth = 480;
    const words = paintingName.split(' ');
    let line = '';
    let y = 40;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, 250, y);
        line = words[i] + ' ';
        y += 35;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 250, y);
    
    // Draw QR code in center
    const qrY = y + 20;
    ctx.drawImage(qrImage, 50, qrY, 400, 400);
    
    // Draw "SCAN TO BID" at bottom
    ctx.font = 'bold 32px Arial';
    ctx.fillText('SCAN TO BID', 250, qrY + 440);
    
    // Convert canvas to data URL
    const qrCodeDataUrl = canvas.toDataURL('image/png');

    res.status(200).json({
      success: true,
      data: {
        painting: {
          id: painting.id,
          artistName: painting.artist_name,
          paintingName: painting.painting_name,
          qrCode: qrCodeDataUrl,
          paintingUrl
        }
      }
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    });
  }
});

// Update Painting (Protected)
router.put('/paintings/:id', authenticateAdmin, validatePaintingUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { artistName, paintingName, basePrice, imageUrl, status } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (artistName !== undefined) {
      updates.push(`artist_name = $${paramCount++}`);
      values.push(artistName);
    }
    if (paintingName !== undefined) {
      updates.push(`painting_name = $${paramCount++}`);
      values.push(paintingName);
    }
    if (basePrice !== undefined) {
      updates.push(`base_price = $${paramCount++}`);
      values.push(basePrice);
    }
    if (imageUrl !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(imageUrl);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);
    const result = await query(
      `UPDATE paintings SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    const painting = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Painting updated successfully',
      data: {
        painting: {
          id: painting.id,
          artistName: painting.artist_name,
          paintingName: painting.painting_name,
          basePrice: parseFloat(painting.base_price),
          imageUrl: painting.image_url,
          status: painting.status
        }
      }
    });
  } catch (error) {
    console.error('Update painting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update painting'
    });
  }
});

// Delete Painting (Protected)
router.delete('/paintings/:id', authenticateAdmin, validateIdParam, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM paintings WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Painting deleted successfully'
    });
  } catch (error) {
    console.error('Delete painting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete painting'
    });
  }
});

// Get All Bids (Protected)
router.get('/bids', authenticateAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        b.id,
        b.bid_amount,
        b.bid_time,
        b.status,
        p.id as painting_id,
        p.painting_name,
        p.artist_name,
        u.first_name,
        u.last_name,
        u.mobile,
        RANK() OVER (PARTITION BY b.painting_id ORDER BY b.bid_amount DESC, b.bid_time ASC) as rank
      FROM bids b
      JOIN paintings p ON b.painting_id = p.id
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'active'
      ORDER BY p.painting_name, b.bid_amount DESC, b.bid_time ASC`
    );

    const bids = result.rows.map(bid => ({
      id: bid.id,
      bidAmount: parseFloat(bid.bid_amount),
      bidTime: bid.bid_time,
      rank: parseInt(bid.rank),
      painting: {
        id: bid.painting_id,
        name: bid.painting_name,
        artist: bid.artist_name
      },
      user: {
        firstName: bid.first_name,
        lastName: bid.last_name,
        mobile: bid.mobile
      }
    }));

    res.status(200).json({
      success: true,
      data: { bids }
    });
  } catch (error) {
    console.error('Get bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bids'
    });
  }
});

// Get/Update Auction Settings (Protected)
router.get('/auction-settings', authenticateAdmin, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM auction_settings WHERE is_active = true ORDER BY created_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active auction settings found'
      });
    }

    const settings = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        settings: {
          id: settings.id,
          startDate: settings.start_date,
          endDate: settings.end_date,
          isActive: settings.is_active
        }
      }
    });
  } catch (error) {
    console.error('Get auction settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auction settings'
    });
  }
});

router.put('/auction-settings', authenticateAdmin, validateAuctionSettings, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Deactivate all existing settings
    await query('UPDATE auction_settings SET is_active = false');

    // Insert new settings
    const result = await query(
      `INSERT INTO auction_settings (start_date, end_date, is_active)
       VALUES ($1, $2, true)
       RETURNING *`,
      [startDate, endDate]
    );

    const settings = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Auction settings updated successfully',
      data: {
        settings: {
          id: settings.id,
          startDate: settings.start_date,
          endDate: settings.end_date,
          isActive: settings.is_active
        }
      }
    });
  } catch (error) {
    console.error('Update auction settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update auction settings'
    });
  }
});

// Dashboard Statistics (Protected)
router.get('/dashboard-stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM paintings WHERE status = 'active') as total_paintings,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM bids WHERE status = 'active') as total_bids,
        (SELECT COALESCE(SUM(bid_amount), 0) FROM (
          SELECT DISTINCT ON (painting_id) bid_amount 
          FROM bids 
          WHERE status = 'active' 
          ORDER BY painting_id, bid_amount DESC, bid_time ASC
        ) as highest_bids) as total_bid_value
    `);

    res.status(200).json({
      success: true,
      data: {
        totalPaintings: parseInt(stats.rows[0].total_paintings),
        totalUsers: parseInt(stats.rows[0].total_users),
        totalBids: parseInt(stats.rows[0].total_bids),
        totalBidValue: parseFloat(stats.rows[0].total_bid_value)
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});


//Excel Generation Route - CORRECTED
router.get('/generate-bidding-rank-excel', authenticateAdmin, async (req, res) => {
  try {
    // Fetch all bids with user and painting information
    const sqlQuery = `
      SELECT 
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.mobile as user_mobile,
        p.painting_name as painting_title,
        b.bid_amount,
        b.bid_time,
        (
          SELECT COUNT(*) + 1 
          FROM bids b2 
          WHERE b2.painting_id = b.painting_id 
          AND b2.bid_amount > b.bid_amount
          AND b2.status = 'active'
        ) as rank
      FROM bids b
      JOIN users u ON b.user_id = u.id
      JOIN paintings p ON b.painting_id = p.id
      WHERE b.status = 'active'
      ORDER BY user_name, p.painting_name, b.bid_amount DESC
    `;

    const result = await query(sqlQuery);
    const bids = result.rows;

    // Group bids by user
    const userBids = {};
    bids.forEach(bid => {
      const key = `${bid.user_name}|${bid.user_mobile}`;
      if (!userBids[key]) {
        userBids[key] = {
          name: bid.user_name,
          mobile: bid.user_mobile,
          paintings: []
        };
      }
      
      // Only keep the highest bid per painting for each user
      const existingPainting = userBids[key].paintings.find(
        p => p.title === bid.painting_title
      );
      
      if (!existingPainting) {
        userBids[key].paintings.push({
          title: bid.painting_title,
          rank: bid.rank,
          amount: bid.bid_amount
        });
      }
    });

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bidding Rankings', {
      pageSetup: { 
        paperSize: 9, 
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1
      }
    });

    // Set column widths
    worksheet.columns = [
      { key: 'name', width: 25 },
      { key: 'mobile', width: 18 },
      { key: 'paintings', width: 60 }
    ];

    // Add title row
    worksheet.mergeCells('A1:C1');
    const titleRow = worksheet.getCell('A1');
    titleRow.value = 'STUDENT PAINTING AUCTION - BIDDING RANKINGS';
    titleRow.font = { 
      name: 'Arial', 
      size: 16, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    titleRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0066CC' }
    };
    titleRow.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    worksheet.getRow(1).height = 30;

    // Add timestamp row
    worksheet.mergeCells('A2:C2');
    const timestampRow = worksheet.getCell('A2');
    timestampRow.value = `Generated on: ${new Date().toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    timestampRow.font = { 
      name: 'Arial', 
      size: 10, 
      italic: true 
    };
    timestampRow.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    worksheet.getRow(2).height = 20;

    // Add header row with emojis and two-line text in third column
    const headerRow = worksheet.addRow(['Name', 'Mobile Number', '🎨 Painting Auction Status\n📋 Painting Name With Rank']);
    headerRow.font = { 
      name: 'Arial', 
      size: 12, 
      bold: true, 
      color: { argb: 'FFFFFFFF' } 
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF404040' }
    };
    headerRow.alignment = { 
      vertical: 'middle', 
      horizontal: 'center',
      wrapText: true  // Enable text wrapping for multi-line header
    };
    headerRow.height = 35;  // Increased height for two lines

    // Style header cells with borders
    ['A3', 'B3', 'C3'].forEach(cell => {
      worksheet.getCell(cell).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });

    // Add data rows
    let rowIndex = 4;
    Object.values(userBids).forEach((user, index) => {
      // Format paintings with emojis and numbered list
      const paintingsList = user.paintings
        .map((p, i) => {
          // Choose emoji based on rank
          let rankEmoji = '📌'; // Default
          if (p.rank === 1) rankEmoji = '🏆'; // Trophy for 1st
          else if (p.rank === 2) rankEmoji = '🥈'; // Silver for 2nd
          else if (p.rank === 3) rankEmoji = '🥉'; // Bronze for 3rd
          
          return `${i + 1}. ${rankEmoji} ${p.title} (Rank #${p.rank})`;
        })
        .join('\n');
      
      const paintingsText = `🎨 Painting Auction Status\n📋 Painting Name With Rank\n${paintingsList}`;

      const row = worksheet.addRow([
        user.name,
        user.mobile,
        paintingsText
      ]);

      // Alternate row colors
      const fillColor = index % 2 === 0 ? 'FFF5F5F5' : 'FFFFFFFF';
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
        };
        cell.alignment = { 
          vertical: 'top', 
          horizontal: 'left',
          wrapText: true 
        };
        cell.font = { 
          name: 'Arial', 
          size: 11 
        };
      });

      // Make name bold
      row.getCell(1).font = { 
        name: 'Arial', 
        size: 11, 
        bold: true 
      };

      // Center align mobile number
      row.getCell(2).alignment = { 
        vertical: 'top', 
        horizontal: 'center',
        wrapText: true 
      };

      // Auto height for rows with multiple paintings
      const paintingCount = user.paintings.length;
      row.height = Math.max(25, paintingCount * 18);

      rowIndex++;
    });

    // Add summary row
    const summaryRow = worksheet.addRow([]);
    summaryRow.height = 5;
    
    const totalRow = worksheet.addRow([
      `Total Bidders: ${Object.keys(userBids).length}`,
      '',
      `Total Bids: ${bids.length}`
    ]);
    totalRow.font = { 
      name: 'Arial', 
      size: 11, 
      bold: true 
    };
    totalRow.alignment = { 
      vertical: 'middle', 
      horizontal: 'center' 
    };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFE4B5' }
    };

    // Set response headers for download
    const fileName = `Bidding_Rankings_${Date.now()}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate Excel file',
      details: error.message 
    });
  }
});
//Excel EOF


// Get All Users (Protected) - SIMPLE VERSION
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔍 Fetching users...');
    
    const result = await query(
      `SELECT 
        id,
        first_name,
        last_name,
        mobile,
        created_at
      FROM users
      ORDER BY created_at DESC`
    );

    console.log('✅ Found users:', result.rows.length);

    const users = result.rows.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      mobile: user.mobile,
      totalBids: 0,  // We'll add this later
      createdAt: user.created_at
    }));

    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

module.exports = router;