/**
 * FILE: paymentValidator.js
 * PURPOSE: Validation functions for payment-related operations
 * DESCRIPTION: Centralized validation logic for payment submissions,
 *              amounts, and file uploads
 */

const { FILE_CONFIG } = require('./paymentConstants');

/**
 * Validate payment submission data
 * @param {Object} data - Payment submission data
 * @returns {Object} { isValid: boolean, errors: Array<string> }
 */
exports.validatePaymentSubmission = (data) => {
  const errors = [];

  if (!data.bookingAgreementId) {
    errors.push('Booking agreement ID is required');
  }

  if (!data.paymentAmount) {
    errors.push('Payment amount is required');
  } else if (data.paymentAmount <= 0) {
    errors.push('Payment amount must be greater than 0');
  } else if (!Number.isFinite(data.paymentAmount)) {
    errors.push('Payment amount must be a valid number');
  }

  if (!data.studentId) {
    errors.push('Student ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate file for upload
 * @param {Object} file - File object from multer
 * @returns {Object} { isValid: boolean, error: string }
 */
exports.validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    return {
      isValid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum 5MB`,
    };
  }

  // Check file type
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `File type not allowed. Accepted: PNG, JPG, PDF`,
    };
  }

  return { isValid: true };
};

/**
 * Validate rejection reason
 * @param {String} reason - Rejection reason text
 * @returns {Object} { isValid: boolean, error: string }
 */
exports.validateRejectionReason = (reason) => {
  if (!reason || typeof reason !== 'string') {
    return { isValid: false, error: 'Rejection reason is required' };
  }

  if (reason.trim().length === 0) {
    return { isValid: false, error: 'Rejection reason cannot be empty' };
  }

  if (reason.length > 500) {
    return { isValid: false, error: 'Rejection reason must not exceed 500 characters' };
  }

  return { isValid: true };
};

/**
 * Validate payment amount against room price
 * @param {Number} paymentAmount - Amount submitted by student
 * @param {Number} splitAmount - Expected split amount for shared room
 * @param {Number} tolerance - Tolerance percentage (default: 5%)
 * @returns {Object} { isValid: boolean, message: string }
 */
exports.validatePaymentAmount = (paymentAmount, splitAmount, tolerance = 5) => {
  const lowerBound = splitAmount * (1 - tolerance / 100);
  const upperBound = splitAmount * (1 + tolerance / 100);

  if (paymentAmount >= lowerBound && paymentAmount <= upperBound) {
    return {
      isValid: true,
      message: 'Payment amount is within acceptable range',
    };
  }

  return {
    isValid: false,
    message: `Payment amount should be approximately Rs. ${splitAmount}. Accepted range: Rs. ${lowerBound.toFixed(2)} - Rs. ${upperBound.toFixed(2)}`,
  };
};

/**
 * Validate payment date
 * @param {Date} paymentDate - Payment date
 * @returns {Object} { isValid: boolean, error: string }
 */
exports.validatePaymentDate = (paymentDate) => {
  // Normalize dates to just the date part (midnight) for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const normalizedPaymentDate = new Date(paymentDate);
  normalizedPaymentDate.setHours(0, 0, 0, 0);
  
  const nintyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Allow today's date or earlier (but not future dates)
  if (normalizedPaymentDate > today) {
    return { isValid: false, error: 'Payment date cannot be in the future' };
  }

  if (normalizedPaymentDate < nintyDaysAgo) {
    return { isValid: false, error: 'Payment date cannot be older than 90 days' };
  }

  return { isValid: true };
};

/**
 * Validate object ID format
 * @param {String} id - ID to validate
 * @returns {boolean} True if valid MongoDB ObjectId
 */
exports.isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};
