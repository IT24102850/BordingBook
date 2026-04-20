/**
 * PAYMENT MODULE INDEX
 * =====================================================
 * 
 * This file documents the complete structure of the payment module.
 * All payment-related functionality is organized under the /payment directory.
 * 
 * DIRECTORY STRUCTURE:
 * ===================================================== */

/*
payment/
├── controllers/
│   ├── paymentController.js        ✅ Handle HTTP requests for payments
│   └── STATUS: Complete with all endpoints
│
├── models/ (reference to main models directory)
│   ├── StudentPayment.js           ✅ Main payment record model
│   ├── PaymentCycle.js             ✅ Payment cycle tracking
│   └── PaymentReceipt.js           ✅ Receipt generation
│   └── STATUS: All models in /src/models/
│
├── services/
│   ├── paymentService.js           ✅ Business logic layer
│   └── STATUS: Complete with all payment operations
│
├── routes/
│   ├── paymentRoutes.js            ✅ API route definitions
│   └── STATUS: All endpoints mapped
│
├── middleware/
│   ├── uploadHandler.js            ✅ File upload configuration
│   └── STATUS: Multer setup with validation
│
├── utils/
│   ├── paymentValidator.js         ✅ Validation logic
│   ├── paymentConstants.js         ✅ Constants & enums
│   └── receiptGenerator.js         ✅ PDF receipt generation
│   └── STATUS: All utilities complete
│
└── documentation/
    ├── README.md                   ✅ Overview
    ├── IMPLEMENTATION_GUIDE.md     ✅ Setup guide
    ├── IMPLEMENTATION.md           ✅ Details
    └── SUMMARY.md                  ✅ Summary
*/

// ===================================================== 
// PAYMENT FEATURES CHECKLIST
// ===================================================== 

/**
 * STUDENT SIDE:
 * ✅ Submit payment slip (with file upload)
 * ✅ View payment history
 * ✅ View payment cycles
 * ✅ Get payment receipt
 * ✅ Receive rejection notifications (24-hour TTL)
 * ✅ Receive approval notifications
 * 
 * OWNER SIDE:
 * ✅ View pending payments for review
 * ✅ Approve payment slip (generates receipt)
 * ✅ Reject payment slip (with reason)
 * ✅ Get financial overview
 * ✅ Get boarding house summary
 * ✅ See which payments removed after rejection
 * 
 * SYSTEM:
 * ✅ Auto-delete rejection notifications after 24 hours (TTL index)
 * ✅ File upload handling (spaces removed from filenames)
 * ✅ CSP headers configured for image serving
 * ✅ Database indexes for performance
 * ✅ Comprehensive error handling
 * ✅ Detailed logging
 */

// ===================================================== 
// API ENDPOINTS
// ===================================================== 

/**
 * STUDENT ENDPOINTS:
 * 
 * POST   /api/roommates/payments/submit
 *        Submit payment slip with file
 *        Body: { bookingAgreementId, paymentAmount, remarks, paymentSlip: file }
 * 
 * GET    /api/roommates/payments/history
 *        Get student's payment history
 * 
 * GET    /api/roommates/payments/cycles
 *        Get student's payment cycles
 * 
 * GET    /api/roommates/payments/receipt/:receiptId
 *        Download or view receipt
 */

/**
 * OWNER ENDPOINTS:
 * 
 * GET    /api/roommates/payments/pending
 *        Get all pending payments for review
 * 
 * POST   /api/roommates/payments/approve/:paymentId
 *        Approve a payment slip
 * 
 * POST   /api/roommates/payments/reject/:paymentId
 *        Reject a payment slip
 *        Body: { rejectionReason: "reason text" }
 * 
 * GET    /api/roommates/payments/boarding-places
 *        Get all boarding houses
 * 
 * GET    /api/roommates/payments/house-summary/:houseId
 *        Get summary for specific house
 */

/**
 * NOTIFICATION ENDPOINTS:
 * 
 * GET    /api/notifications
 *        Get all notifications (with ?unreadOnly=true)
 * 
 * GET    /api/notifications/unread-count
 *        Get count of unread notifications
 * 
 * PUT    /api/notifications/:notificationId/read
 *        Mark notification as read
 * 
 * DELETE /api/notifications/:notificationId
 *        Delete a notification
 */

// ===================================================== 
// DATABASE MODELS
// ===================================================== 

/**
 * StudentPayment Schema:
 * - studentId (ref to User)
 * - roomId (ref to Room)
 * - boardingHouseId (ref to BoardingHouse)
 * - bookingAgreementId (ref to BookingAgreement)
 * - paymentAmount (Number)
 * - paymentSlipPath (String)
 * - paymentSlipUrl (String)
 * - uploadedAt (Date)
 * - fileType (String)
 * - fileSize (Number)
 * - cycleNumber (Number)
 * - cycleStartDate (Date)
 * - dueDate (Date)
 * - isOverdue (Boolean)
 * - status (enum: submitted|approved|rejected)
 * - approvedBy (ref to User)
 * - approvedAt (Date)
 * - rejectionReason (String)
 * - rejectedAt (Date)
 * - receiptId (ref to PaymentReceipt)
 * - createdAt (Date)
 * - updatedAt (Date)
 */

/**
 * PaymentCycle Schema:
 * - boardingHouseId (ref to BoardingHouse)
 * - cycleNumber (Number)
 * - startDate (Date)
 * - endDate (Date)
 * - dueDate (Date)
 * - rentAmount (Number)
 * - status (enum: active|completed|cancelled)
 * - createdAt (Date)
 */

/**
 * PaymentReceipt Schema:
 * - paymentId (ref to StudentPayment)
 * - receiptNumber (String)
 * - studentId (ref to User)
 * - boardingHouseId (ref to BoardingHouse)
 * - amount (Number)
 * - paymentDate (Date)
 * - receiptUrl (String)
 * - createdAt (Date)
 */

/**
 * Notification Schema (with TTL):
 * - userId (ref to User)
 * - type (enum: payment_rejected|payment_approved|...)
 * - title (String)
 * - message (String)
 * - paymentId (ref to StudentPayment)
 * - rejectionReason (String)
 * - isRead (Boolean)
 * - readAt (Date)
 * - expiresAt (Date) ← TTL index auto-deletes after this time
 * - createdAt (Date)
 */

// ===================================================== 
// FILE UPLOAD CONFIGURATION
// ===================================================== 

/**
 * Multer Configuration:
 * - Destination: /backend/uploads/payments/[studentId]/
 * - File types: PNG, JPG, JPEG, PDF
 * - Max size: 5MB
 * - Filename: [timestamp]_[originalname_with_underscores]
 * 
 * Space Replacement: All spaces in filenames are replaced with underscores
 * Example: "1234567890_WhatsApp_Image_2026-03-28_at_19.53.28.jpeg"
 */

// ===================================================== 
// RECENT IMPLEMENTATIONS
// ===================================================== 

/**
 * 1. REJECT PAYMENT FUNCTIONALITY (COMPLETED):
 *    - Owner rejects payment with reason
 *    - Notification created for student
 *    - Payment removed from owner's pending list
 *    - Status updated to "rejected" in database
 * 
 * 2. 24-HOUR EXPIRATION FOR REJECTION NOTIFICATIONS (COMPLETED):
 *    - Notification model updated with expiresAt field
 *    - MongoDB TTL index auto-deletes after expiration
 *    - Rejection service sets expiresAt to current time + 24 hours
 *    - Student no longer sees notification after 24 hours
 * 
 * 3. NOTIFICATION API ENDPOINTS (COMPLETED):
 *    - GET  /api/notifications - Fetch user's notifications
 *    - GET  /api/notifications/unread-count - Get unread count
 *    - PUT  /api/notifications/:id/read - Mark as read
 *    - DELETE /api/notifications/:id - Delete notification
 * 
 * 4. PAYMENT APPROVAL FUNCTIONALITY (COMPLETED):
 *    - Receipt generation as PDF
 *    - Approval notification sent to student
 *    - Payment cycle created
 *    - Status updated to "approved"
 */

// ===================================================== 
// TO-DO / FUTURE ENHANCEMENTS
// ===================================================== 

/**
 * [ ] Partial payment handling
 * [ ] Payment extension/late payment logic
 * [ ] Automated payment reminders
 * [ ] Multi-step verification by owner
 * [ ] Payment analytics dashboard
 * [ ] Bulk payment processing
 * [ ] Payment plan creation
 * [ ] Refund mechanism
 */

module.exports = {
  endpoints: {
    payments: {
      student: [
        'POST /api/roommates/payments/submit',
        'GET /api/roommates/payments/history',
        'GET /api/roommates/payments/cycles',
        'GET /api/roommates/payments/receipt/:receiptId',
      ],
      owner: [
        'GET /api/roommates/payments/pending',
        'POST /api/roommates/payments/approve/:paymentId',
        'POST /api/roommates/payments/reject/:paymentId',
        'GET /api/roommates/payments/boarding-places',
        'GET /api/roommates/payments/house-summary/:houseId',
      ],
    },
    notifications: [
      'GET /api/notifications',
      'GET /api/notifications/unread-count',
      'PUT /api/notifications/:id/read',
      'DELETE /api/notifications/:id',
    ],
  },
  features: {
    completed: [
      'Payment submission with file upload',
      'Owner approval workflow',
      'Owner rejection with reasons',
      'Receipt generation',
      'Notification system with 24-hour TTL',
      'Financial overview dashboard',
      'Payment history tracking',
      'Cycle management',
      'Image serving with CSP headers',
      'File upload validation',
    ],
  },
};
