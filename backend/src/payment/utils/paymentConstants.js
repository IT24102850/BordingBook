/**
 * FILE: paymentConstants.js
 * PURPOSE: Define constants used across payment module
 * DESCRIPTION: Centralized location for enums, status codes, and configuration values
 */

module.exports = {
  // Payment Status
  PAYMENT_STATUS: {
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },

  // Notification Types
  NOTIFICATION_TYPE: {
    PAYMENT_APPROVED: 'payment_approved',
    PAYMENT_REJECTED: 'payment_rejected',
    PAYMENT_OVERDUE: 'payment_overdue',
  },

  // Payment Cycle Status
  CYCLE_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    OVERDUE: 'overdue',
    REJECTED: 'rejected',
  },

  // File Upload
  FILE_CONFIG: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/png', 'image/jpeg', 'application/pdf'],
    ALLOWED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.pdf'],
    UPLOAD_DIR: 'uploads/payments',
    RECEIPT_DIR: 'uploads/receipts',
  },

  // Payment Cycle
  PAYMENT_CYCLE: {
    DURATION_DAYS: 30,
    FIRST_CYCLE_NUMBER: 1,
  },

  // Error Messages
  ERROR_MESSAGES: {
    BOOKING_NOT_FOUND: 'Booking agreement not found',
    BOOKING_NOT_ACCEPTED: 'Booking agreement is not accepted',
    PAYMENT_NOT_FOUND: 'Payment not found',
    PAYMENT_INVALID_STATUS: 'Payment is not in valid status for this operation',
    INVALID_FILE_TYPE: 'Invalid file type. Allowed: PNG, JPG, JPEG, PDF',
    FILE_TOO_LARGE: 'File size exceeds 5MB limit',
    HOUSE_NOT_FOUND: 'Boarding house not found',
    UNAUTHORIZED: 'Unauthorized access',
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    PAYMENT_SUBMITTED: 'Payment slip submitted for review',
    PAYMENT_APPROVED: 'Payment approved successfully',
    PAYMENT_REJECTED: 'Payment rejected successfully',
    HISTORY_FETCHED: 'Payment history fetched successfully',
    CYCLES_FETCHED: 'Payment cycles fetched successfully',
    RECEIPT_FETCHED: 'Receipt fetched successfully',
  },
};
