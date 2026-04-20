# Payment System Implementation Guide

## Overview
Complete payment system for student boarding house rental payments with owner approval workflow and receipt generation.

## Features Implemented

### 1. **Payment Submission** ✅
- Students submit payment slips (PNG/JPG/PDF, max 5MB)
- File uploaded to `/uploads/payments/[studentId]/`
- Status: `submitted` (awaiting owner review)

### 2. **Owner Review Gallery** ✅
- Owner views all pending payment slips
- Student info, room details, payment amount displayed
- Approve or Reject actions available

### 3. **Payment Approval** ✅
- Owner approves payment slip
- Auto-generates Receipt PDF
- Creates PaymentCycle record (30-day period)
- Sends student notification
- Receipt stored in database and `/uploads/receipts/`

### 4. **Payment Rejection** ✅
- Owner rejects with reason
- Student receives notification with reason
- Displayed in student reminder section
- Payment can be resubmitted

### 5. **Receipt Generation** ✅
- PDF generated automatically on approval
- Includes: Receipt #, Student info, Room details, Amount, Cycle dates
- Stored in `/uploads/receipts/REC-*.pdf`
- Downloadable from student dashboard

### 6. **Payment Cycles** ✅
- Cycle #1 starts at first approval
- Each cycle = 30 days
- Due date = Approval date + 30 days
- Next cycle due = Previous due + 30 days
- OVERDUE badge if past due date

### 7. **Notifications** ✅
- Approval: Receipt generated notification
- Rejection: Reason displayed in reminder section
- Overdue: Alert when payment overdue
- Real-time updates

## Database Collections

### StudentPayment
```javascript
{
  studentId: ObjectId,
  bookingAgreementId: ObjectId,
  paymentAmount: Number,
  remarks: String,
  paymentSlipPath: String,
  paymentSlipUrl: String,
  cycleNumber: Number,
  cycleStartDate: Date (null if pending),
  dueDate: Date (null if pending),
  isOverdue: Boolean,
  status: 'submitted' | 'approved' | 'rejected',
  approvedBy: ObjectId,
  approvedAt: Date,
  rejectionReason: String,
  receiptId: ObjectId,
  createdAt: Date
}
```

### PaymentReceipt
```javascript
{
  studentPaymentId: ObjectId,
  studentId: ObjectId,
  receiptNumber: String (e.g., REC-2026-03-29-69c43b43-001),
  paymentAmount: Number,
  receiptPath: String (/uploads/receipts/REC-*.pdf),
  receiptUrl: String,
  approvedBy: ObjectId,
  generatedAt: Date,
  createdAt: Date
}
```

### PaymentCycle
```javascript
{
  studentId: ObjectId,
  bookingAgreementId: ObjectId,
  cycleNumber: Number,
  startDate: Date (approval date),
  dueDate: Date (startDate + 30 days),
  expectedAmount: Number,
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'rejected',
  paymentId: ObjectId (ref to StudentPayment),
  isActive: Boolean,
  createdAt: Date
}
```

### Notification
```javascript
{
  userId: ObjectId,
  type: 'payment_approved' | 'payment_rejected' | 'payment_overdue',
  title: String,
  message: String,
  paymentId: ObjectId,
  receiptId: ObjectId,
  rejectionReason: String,
  isRead: Boolean,
  createdAt: Date
}
```

## API Endpoints

### Student Endpoints

#### 1. Submit Payment Slip
```
POST /api/roommates/payments/submit
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- paymentSlip: File (PNG/JPG/PDF, max 5MB)
- bookingAgreementId: String
- paymentAmount: Number
- remarks: String (optional)

Response:
{
  success: true,
  message: "Payment slip submitted for review",
  data: {
    paymentId: ObjectId,
    cycleNumber: Number
  }
}
```

#### 2. Get Payment History
```
GET /api/roommates/payments/history
Authorization: Bearer {token}

Response:
{
  success: true,
  count: Number,
  data: [
    {
      _id: ObjectId,
      paymentAmount: Number,
      status: String,
      cycleNumber: Number,
      approvedAt: Date,
      receiptId: ObjectId,
      boardingHouseId: { name, address }
    }
  ]
}
```

#### 3. Get Payment Cycles
```
GET /api/roommates/payments/cycles
Authorization: Bearer {token}

Response:
{
  success: true,
  count: Number,
  data: [
    {
      cycleNumber: Number,
      startDate: Date,
      dueDate: Date,
      expectedAmount: Number,
      paymentStatus: String,
      isOverdue: Boolean,
      roomId: { name, price }
    }
  ]
}
```

#### 4. Get Receipt
```
GET /api/roommates/payments/receipt/:receiptId
Authorization: Bearer {token}

Response:
{
  success: true,
  data: {
    _id: ObjectId,
    receiptNumber: String,
    receiptUrl: String,
    paymentAmount: Number,
    approvedAt: Date
  }
}
```

### Owner Endpoints

#### 1. Get Pending Payments (Gallery)
```
GET /api/owner/payments/pending
Authorization: Bearer {token}

Response:
{
  success: true,
  count: Number,
  data: [
    {
      _id: ObjectId,
      paymentAmount: Number,
      paymentSlipUrl: String,
      cycleNumber: Number,
      uploadedAt: Date,
      studentId: { name, email, phone },
      roomId: { name, bedCount, price }
    }
  ]
}
```

#### 2. Approve Payment
```
POST /api/owner/payments/approve/:paymentId
Authorization: Bearer {token}

Response:
{
  success: true,
  message: "Payment approved successfully",
  data: {
    paymentId: ObjectId,
    receiptId: ObjectId,
    receiptNumber: String,
    cycleStartDate: Date,
    dueDate: Date
  }
}
```

#### 3. Reject Payment
```
POST /api/owner/payments/reject/:paymentId
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  rejectionReason: String
}

Response:
{
  success: true,
  message: "Payment rejected successfully",
  data: {
    paymentId: ObjectId
  }
}
```

#### 4. Get House Summary
```
GET /api/payment/house-summary/:houseId
Authorization: Bearer {token}

Response:
{
  success: true,
  data: {
    houseName: String,
    totalPayments: Number,
    approvedPayments: Number,
    rejectedPayments: Number,
    pendingPayments: Number,
    overduePayments: Number,
    totalRevenue: Number,
    collectionRate: String (percentage)
  }
}
```

## File Structure

```
backend/src/payment/
├── controllers/
│   └── paymentController.js         ✅ All endpoints implemented
├── services/
│   └── paymentService.js             ✅ Business logic complete
├── routes/
│   └── paymentRoutes.js              ✅ All routes defined
├── middleware/
│   └── uploadHandler.js              ✅ File upload handling
├── utils/
│   ├── receiptGenerator.js           ✅ PDF generation
│   ├── paymentConstants.js           ✅ Constants defined
│   └── paymentValidator.js           ✅ Validation functions
└── models/
    └── (symlinks to main models)

models/ (main directory)
├── StudentPayment.js                 ✅ Created
├── PaymentReceipt.js                 ✅ Created
├── PaymentCycle.js                   ✅ Created
└── Notification.js                   ✅ Created
```

## Workflow Example

### Scenario: Student Pays Rs. 7,500 (Shared Room)

**Step 1: Student Submits (Mar 29, 2026)**
```
POST /api/roommates/payments/submit
- File: payment_slip.pdf (uploaded)
- Amount: 7500
- Remarks: "Payment for March-April cycle"
→ StudentPayment created with status='submitted'
```

**Step 2: Owner Reviews Gallery**
```
GET /api/owner/payments/pending
→ Shows pending payment for owner to review
```

**Step 3: Owner Approves**
```
POST /api/owner/payments/approve/:paymentId
→ StudentPayment status='approved'
→ cycleStartDate=2026-03-29, dueDate=2026-04-28
→ PaymentReceipt created (REC-2026-03-29-69c43b43-001)
→ PaymentCycle created for Cycle #1
→ Receipt PDF generated at /uploads/receipts/REC-*.pdf
→ Notification sent to student
```

**Step 4: Student Sees Notification & Receipt**
```
GET /api/roommates/payments/history
→ Shows approved payment with receipt link
GET /api/roommates/payments/cycles
→ Shows active cycle: Due Apr 28, Amount Rs. 7500
After Apr 28 (overdue):
→ isOverdue=true, OVERDUE badge shown
```

## Configuration

### File Upload
- Location: `/uploads/payments/[studentId]/`
- Max Size: 5MB
- Allowed Types: PNG, JPG, PDF

### PDF Receipts
- Location: `/uploads/receipts/`
- Format: REC-YYYY-MM-DD-[studentId]-[cycleNum].pdf
- Auto-generated on approval

### Payment Cycle
- Duration: 30 days
- First cycle: Cycle #1 (from first approval)
- Next cycle: Previous due date + 30 days

## Testing Endpoints

### Create Test Data (First Run)
```bash
# User already has test booking agreement with shared room (2 beds)
bookingAgreementId: "69c80bfd064e185a204f8197"
studentId: "69c43b43a7bff225fbbe4b79"
roomPrice: Rs. 15,000
splitAmount: Rs. 7,500
```

### Test Payment Submission
```bash
curl -X POST http://localhost:5000/api/roommates/payments/submit \
  -H "Authorization: Bearer {token}" \
  -F "paymentSlip=@payment_slip.jpg" \
  -F "bookingAgreementId=69c80bfd064e185a204f8197" \
  -F "paymentAmount=7500" \
  -F "remarks=Payment for current cycle"
```

### Test Owner Review
```bash
curl -X GET http://localhost:5000/api/owner/payments/pending \
  -H "Authorization: Bearer {owner_token}"
```

### Test Payment Approval
```bash
curl -X POST http://localhost:5000/api/owner/payments/approve/[paymentId] \
  -H "Authorization: Bearer {owner_token}"
```

## Next Steps

1. **Frontend Integration**
   - Update StudentPayment component to call submit endpoint
   - Create owner Payment Slip Review Gallery
   - Add receipt download functionality
   - Display notifications

2. **Background Jobs**
   - Overdue payment detection (run daily)
   - Automatic reminders for overdue payments

3. **Admin Dashboard**
   - Payment verification/tracking
   - Revenue reports
   - Collection statistics

4. **Email Notifications**
   - Send email on approval with PDF receipt
   - Send email on rejection with reason

## Dependencies

- `multer` - File upload handling
- `pdfkit` - PDF generation
- All existing backend modules

## Notes

- All timestamps in UTC
- Payment amounts in Rs. (Pakistani Rupee)
- Receipt numbers are unique per student per cycle
- Overdue status calculated real-time based on dueDate
- File uploads stored with student isolation for security
