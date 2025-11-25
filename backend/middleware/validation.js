const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 100 }).withMessage('First name must be 2-100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('First name can only contain letters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Last name must be 2-100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Last name can only contain letters'),
  
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian mobile number (10 digits, starting with 6-9)'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  validate
];

// User login validation
const validateUserLogin = [
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid mobile number'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

// Admin login validation
const validateAdminLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

// Painting creation validation
const validatePaintingCreation = [
  body('artistName')
    .trim()
    .notEmpty().withMessage('Artist name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Artist name must be 2-200 characters'),
  
  body('paintingName')
    .trim()
    .notEmpty().withMessage('Painting name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Painting name must be 2-200 characters'),
  
  body('basePrice')
    .notEmpty().withMessage('Base price is required')
    .isFloat({ min: 0.01 }).withMessage('Base price must be greater than 0')
    .toFloat(),
  
  validate
];

// Painting update validation
const validatePaintingUpdate = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid painting ID')
    .toInt(),
  
  body('artistName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Artist name must be 2-200 characters'),
  
  body('paintingName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Painting name must be 2-200 characters'),
  
  body('basePrice')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Base price must be greater than 0')
    .toFloat(),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'sold']).withMessage('Invalid status'),
  
  validate
];

// Bid creation validation
const validateBidCreation = [
  body('paintingId')
    .notEmpty().withMessage('Painting ID is required')
    .isInt({ min: 1 }).withMessage('Invalid painting ID')
    .toInt(),
  
  body('bidAmount')
    .notEmpty().withMessage('Bid amount is required')
    .isFloat({ min: 0.01 }).withMessage('Bid amount must be greater than 0')
    .toFloat(),
  
  validate
];

// Guest bid validation - name and mobile are optional
const validateBidCreationGuest = [
  body('paintingId')
    .notEmpty().withMessage('Painting ID is required')
    .isInt({ min: 1 }).withMessage('Invalid painting ID')
    .toInt(),
  
  body('bidAmount')
    .notEmpty().withMessage('Bid amount is required')
    .isFloat({ min: 0.01 }).withMessage('Bid amount must be greater than 0')
    .toFloat(),
  
  // Name and mobile are optional
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  
  body('mobile')
    .optional()
    .matches(/^[0-9]{10}$/).withMessage('Invalid mobile number'),
  
  validate
];

// Auction settings validation
const validateAuctionSettings = [
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid date format')
    .toDate(),
  
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid date format')
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  validate
];

// ID parameter validation
const validateIdParam = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid ID')
    .toInt(),
  validate
];

// Mobile query validation
const validateMobileQuery = [
  query('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid mobile number'),
  validate
];

module.exports = {
  validate,
  validateUserRegistration,
  validateUserLogin,
  validateAdminLogin,
  validatePaintingCreation,
  validatePaintingUpdate,
  validateBidCreation,
  validateBidCreationGuest,  // ADD THIS
  validateAuctionSettings,
  validateIdParam,
  validateMobileQuery
};
