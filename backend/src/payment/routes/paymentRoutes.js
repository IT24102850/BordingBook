/**
 * FILE: paymentRoutes.js
 * PURPOSE: Define API routes for payment-related endpoints
 * DESCRIPTION: Maps HTTP methods and URL paths to their corresponding
 *              controller functions. All routes require authentication.
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../../middleware/auth');
const {
  paymentSlipUpload,
  validateUploadedFile,
  handleUploadError,
} = require('../middleware/uploadHandler');

// ==================== STUDENT ROUTES ====================

/**
 * POST /api/roommates/payments/submit
 * Submit payment slip for a booking agreement
 * Requires: File upload (paymentSlip), booking agreement ID, payment amount
 */
router.post(
  '/submit',
  requireAuth,
  paymentSlipUpload.single('paymentSlip'),
  validateUploadedFile,
  handleUploadError,
  paymentController.submitPaymentSlip
);

/**
 * GET /api/roommates/payments/history
 * Get payment submission history for student
 */
router.get('/history', requireAuth, paymentController.getPaymentHistory);

/**
 * GET /api/roommates/payments/cycles
 * Get payment cycles for student
 */
router.get('/cycles', requireAuth, paymentController.getPaymentCycles);

/**
 * GET /api/roommates/payments/receipts
 * Get all receipts for logged-in student (for Download Receipts section)
 */
router.get('/receipts', requireAuth, paymentController.getStudentReceipts);

/**
 * GET /api/roommates/payments/next-due
 * Get next payment due date for calendar highlighting
 */
router.get('/next-due', requireAuth, paymentController.getNextDueDate);

/**
 * GET /api/payments/receipt/download/:receiptNumber
 * Download a generated receipt PDF (must be before /:receiptId for proper routing)
 */
router.get('/receipt/download/:receiptNumber', requireAuth, paymentController.downloadReceiptPdf);

/**
 * GET /api/roommates/payments/receipt/:receiptId
 * Download or view receipt details
 */
router.get('/receipt/:receiptId', requireAuth, paymentController.getReceipt);

// ==================== OWNER ROUTES ====================

/**
 * GET /api/owner/payments/pending
 * Get all pending payment slips for owner review (Payment Slip Gallery)
 */
router.get('/pending', requireAuth, paymentController.getPendingPayments);

/**
 * POST /api/owner/payments/approve/:paymentId
 * Owner approves payment slip
 * Triggers: Receipt generation, cycle creation, student notification
 */
router.post(
  '/approve/:paymentId',
  requireAuth,
  paymentController.approvePaymentSlip
);

/**
 * POST /api/owner/payments/reject/:paymentId
 * Owner rejects payment slip
 * Requires: rejectionReason in request body
 * Triggers: Student notification with reason
 */
router.post(
  '/reject/:slipId', // Changed from paymentId to slipId to match frontend
  requireAuth,
  paymentController.rejectPaymentSlip
);

// ==================== OWNER DASHBOARD ROUTES ====================

/**
 * GET /api/payments/boarding-places
 * Get all boarding houses for owner dashboard (only their owned houses)
 */
router.get('/boarding-places', requireAuth, paymentController.getOwnerBoardingPlaces);
router.get('/boarding-places-v2', requireAuth, paymentController.getOwnerBoardingPlacesWithTenants);

/**
 * GET /api/payment/house-summary/:houseId
 * Get payment summary for specific house
 */
router.get('/house-summary/:houseId', requireAuth, paymentController.getHouseSummary);

/**
 * GET /api/payment/download/:id
 * Download payment slip
 */
router.get('/download/:id', requireAuth, paymentController.downloadPaymentSlip);

module.exports = router;
