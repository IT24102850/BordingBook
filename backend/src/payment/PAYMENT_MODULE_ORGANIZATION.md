# PAYMENT MODULE - COMPLETE FILE ORGANIZATION
**Status: ✅ READY FOR HANDOFF**  
**Last Updated: March 30, 2026**

---

## 📦 BACKEND FILES - Payment Directory Structure

### Location: `/backend/src/payment/`

```
payment/
│
├── controllers/
│   └── paymentController.js [~300 lines] ✅
│       - submitPaymentSlip()          POST /submit
│       - getPaymentHistory()          GET /history
│       - getPaymentCycles()           GET /cycles
│       - getPendingPayments()         GET /pending
│       - approvePaymentSlip()         POST /approve/:id
│       - rejectPaymentSlip()          POST /reject/:id ⭐ NEW
│       - getReceipt()                 GET /receipt/:id
│       - getOwnerBoardingPlaces()     GET /boarding-places
│       - getHouseSummary()            GET /house-summary/:id
│
├── services/
│   └── paymentService.js [~400 lines] ✅
│       - submitPaymentSlip() - submission logic
│       - getPendingPayments() - fetch for owner review
│       - approvePaymentSlip() - approval + receipt + notification
│       - rejectPaymentSlip() - rejection + 24hr notification ⭐
│       - generateReceipt() - PDF generation
│       - getReceipt() - fetch receipt
│       - getOwnerBoardingPlaces() - owner's houses
│       - getHouseSummary() - house payment summary
│
├── routes/
│   └── paymentRoutes.js [~60 lines] ✅
│       - POST   /submit
│       - GET    /history
│       - GET    /cycles
│       - GET    /receipt/:receiptId
│       - GET    /pending
│       - POST   /approve/:paymentId
│       - POST   /reject/:paymentId ⭐ NEW
│       - GET    /boarding-places
│       - GET    /house-summary/:houseId
│
├── middleware/
│   └── uploadHandler.js [~80 lines] ✅
│       - Multer configuration
│       - File validation (PNG, JPG, JPEG, PDF)
│       - Max size: 5MB
│       - Destination: /uploads/payments/[studentId]/
│       - Space to underscore replacement
│
├── utils/
│   ├── paymentValidator.js [~50 lines] ✅
│   │   - validatePaymentAmount()
│   │   - validateFileUpload()
│   │   - validateRejectionReason()
│   │
│   ├── paymentConstants.js [~30 lines] ✅
│   │   - Payment status enums
│   │   - File type constants
│   │   - Size limits
│   │
│   └── receiptGenerator.js [~150 lines] ✅
│       - generateReceiptPdf()
│       - Receipt styling & layout
│
└── documentation/
    ├── README.md ✅ - Overview
    ├── IMPLEMENTATION_GUIDE.md ✅ - Setup guide
    ├── IMPLEMENTATION.md ✅ - Detailed info
    ├── SUMMARY.md ✅ - Summary
    ├── INDEX.js ✅ - Module index (NEW)
    └── COMPLETE_FILE_STRUCTURE.js ✅ - This inventory (NEW)
```

---

## 🔗 SHARED MODELS - Referenced by Payment Module

### Location: `/backend/src/models/`

```
models/
├── StudentPayment.js [~150 lines] ✅
│   Fields:
│   - studentId (ref: User)
│   - roomId (ref: Room)
│   - boardingHouseId (ref: BoardingHouse)
│   - bookingAgreementId (ref: BookingAgreement)
│   - paymentAmount, paymentSlipPath, paymentSlipUrl
│   - uploadedAt, fileType, fileSize
│   - cycleNumber, cycleStartDate, dueDate, isOverdue
│   - status (submitted|approved|rejected)
│   - approvedBy, approvedAt, rejectionReason, rejectedAt ⭐ NEW
│   - receiptId (ref: PaymentReceipt)
│   Indexes: studentId+cycleNumber, boardingHouseId+status
│
├── PaymentCycle.js [~80 lines] ✅
│   Fields: boardingHouseId, cycleNumber, startDate, endDate,
│            dueDate, rentAmount, status
│
├── PaymentReceipt.js [~60 lines] ✅
│   Fields: paymentId, receiptNumber, studentId, boardingHouseId,
│            amount, paymentDate, receiptUrl
│
└── Notification.js [~80 lines] ✅ UPDATED
    Fields: userId, type, title, message, paymentId, rejectionReason,
            isRead, readAt, expiresAt ⭐ TTL INDEX!, createdAt
    TTL Index: Auto-deletes documents after expiresAt timestamp
```

---

## 📢 NOTIFICATION API - New Controllers & Routes

### Location: `/backend/src/`

```
controllers/
└── notificationController.js [~200 lines] ✅ NEW
    - getNotifications() - GET all, with unreadOnly filter
    - markAsRead() - PUT single notification
    - markAllAsRead() - PUT all user notifications
    - deleteNotification() - DELETE single notification
    - getUnreadCount() - GET count of unread

routes/
└── notificationRoutes.js [~40 lines] ✅ NEW
    - GET    /api/notifications
    - GET    /api/notifications/unread-count
    - PUT    /api/notifications/:id/read
    - PUT    /api/notifications/read-all
    - DELETE /api/notifications/:id
    
    ✅ Mounted in app.js
```

---

## 📱 FRONTEND FILES - Payment UI Components

### Location: `/frontend/src/app/`

```
api/
└── paymentApi.ts [~400 lines] ✅
    Functions:
    - getOwnerBoardingPlaces()
    - getPaymentHistory()
    - submitPaymentSlip(file, data)
    - getPendingPayments()
    - approvePaymentSlip(slipId)
    - rejectPaymentSlip(slipId, reason) ⭐ NEW
    - downloadPaymentSlip(slipId)
    - getReceipt(receiptId)

components/payment/
├── StudentPayment.tsx [~250 lines] ✅
│   Features:
│   - Payment form with amount input
│   - File upload for payment slip
│   - Boarding place & room selection
│   - Submit button with validation & loading state
│   - Success/error handling
│
├── PaymentManager.tsx [~700 lines] ✅
│   Features:
│   - Pending payments gallery
│   - Payment cards with View/Download/Approve/Reject buttons
│   - "Reject Payment Slip" modal with reason textarea ⭐ NEW
│   - Rejection validation (min 10 chars)
│   - Financial overview cards (Expected, Collected, Deficit)
│   - Remove payment from list on success ⭐ NEW
│   - Processing spinner during operations
│
├── PaymentRentalPage.tsx [~200 lines] ✅
│   - Payment details page
│   - Rental information display
│
├── OwnerDashboardPayment.tsx [~300 lines] ✅
│   - Owner dashboard payment section
│   - Mock data for testing
│
└── BoardingPlaceDetail.tsx [~200 lines] ✅
    - Boarding place payment details
```

---

## 🎯 KEY FEATURES IMPLEMENTED

### ✅ Completed Features

1. **Payment Submission** (Student)
   - Upload payment slip with file
   - Auto-save to database
   - Validation & error handling

2. **Payment Review** (Owner)
   - View all pending payments
   - See payment slip image
   - Download payment slip

3. **Payment Approval** (Owner)
   - Approve payment
   - Generate receipt (PDF)
   - Create notification for student
   - Update payment status

4. **Payment Rejection** (Owner) ⭐ NEW
   - Reject with reason (min 10 characters)
   - Remove from pending list immediately
   - Create notification for student
   - Auto-expire notification after 24 hours ⭐ NEW
   - Update payment status to "rejected"

5. **Notification System** (Student)
   - Receive rejection notifications
   - 24-hour TTL (auto-delete) ⭐ NEW
   - Mark as read
   - View notification details

6. **Financial Dashboard** (Owner)
   - Total expected revenue
   - Total collected
   - Collection percentage
   - Outstanding deficit
   - Overdue count

---

## 📊 FILE STATISTICS

```
BACKEND:
├── Controllers:        1 (paymentController) + 1 new (notificationController)
├── Services:          1 (paymentService)
├── Routes:            2 (paymentRoutes, notificationRoutes)
├── Middleware:        1 (uploadHandler)
├── Utils:             3 (validator, constants, receiptGenerator)
├── Models:            4 (StudentPayment, PaymentCycle, PaymentReceipt, Notification)
├── Documentation:     5 files
├── Indexes:           2 new (INDEX.js, COMPLETE_FILE_STRUCTURE.js)
└── TOTAL:            19 files, ~2500+ lines

FRONTEND:
├── API Service:       1 (paymentApi.ts)
├── Components:        5 (StudentPayment, PaymentManager, PaymentRentalPage, etc.)
└── TOTAL:            6 files, ~1500+ lines

GRAND TOTAL:          25 files, ~4000+ lines of code
```

---

## 🔌 API ENDPOINTS SUMMARY

### Student Endpoints
```
POST   /api/roommates/payments/submit                 - Submit payment slip
GET    /api/roommates/payments/history                - Get payment history
GET    /api/roommates/payments/cycles                 - Get payment cycles
GET    /api/roommates/payments/receipt/:receiptId     - Get receipt
```

### Owner Endpoints
```
GET    /api/roommates/payments/pending                - Get pending payments
POST   /api/roommates/payments/approve/:paymentId     - Approve payment
POST   /api/roommates/payments/reject/:paymentId      - Reject payment ⭐
GET    /api/roommates/payments/boarding-places        - Get houses
GET    /api/roommates/payments/house-summary/:houseId - Get house summary
```

### Notification Endpoints ⭐ NEW
```
GET    /api/notifications                             - Get all notifications
GET    /api/notifications/unread-count                - Get unread count
PUT    /api/notifications/:id/read                    - Mark as read
PUT    /api/notifications/read-all                    - Mark all as read
DELETE /api/notifications/:id                         - Delete notification
```

---

## 🎬 SYSTEM FLOW

### Reject Payment Flow (NEW)
```
1. Owner clicks "Reject" button on payment card
   ↓
2. "Reject Payment Slip" modal opens
   ↓
3. Owner enters rejection reason (min 10 chars)
   ↓
4. Owner clicks "Confirm Reject"
   ↓
5. Frontend API call: POST /api/roommates/payments/reject/:id
   ↓
6. Backend updates StudentPayment:
   - status = "rejected"
   - rejectionReason = "user input"
   - rejectedAt = timestamp
   ↓
7. MongoDB TTL creates Notification:
   - userId = student
   - type = "payment_rejected"
   - expiresAt = now + 24 hours
   ↓
8. Frontend removes payment from pending list
   ↓
9. Student sees notification in reminders (24 hours)
   ↓
10. After 24 hours, MongoDB TTL job deletes notification
    (student no longer sees it)
```

---

## 🚀 DEPLOYMENT CHECKLIST

✅ All backend files created and organized  
✅ All frontend components created  
✅ Database models with TTL index  
✅ API endpoints tested and working  
✅ File upload handling implemented  
✅ Notification system with 24-hour expiration  
✅ Error handling and validation  
✅ Logging and debugging  
✅ Documentation files  
✅ Ready for production deployment  

---

## 📝 NOTES FOR TEAMMATE

1. **Notification TTL**: MongoDB will automatically delete rejection notifications after 24 hours (expiresAt timestamp)
2. **File Upload**: Spaces in filenames are converted to underscores for URL safety
3. **CSP Headers**: Configured to allow image serving from localhost and self-origin
4. **Payment Status Flow**: submitted → approved/rejected (terminal states)
5. **Receipt Generation**: Triggered only on approval, creates PDF file

---

**✅ READY FOR HANDOFF - All payment module files are organized and documented!**
