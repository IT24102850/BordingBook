# 💾 Payment System Database Files & Responsibility

Complete guide to all database models used in the payment process.

---

## 🏗️ Core Payment Models

### **1. StudentPayment.js** ⭐ PRIMARY
**Location:** `/backend/src/models/StudentPayment.js`

**Responsibility:**
- Track payment submissions from students
- Store payment slip files (path & URL)
- Monitor payment status & approval
- Track overdue payments

**Key Fields:**
```javascript
{
  // Student & Room Info
  studentId: ObjectId,           // Reference to student
  roomId: ObjectId,              // Which room (single/shared)
  boardingHouseId: ObjectId,     // Which boarding house
  bookingAgreementId: ObjectId,  // Booking agreement reference
  
  // Payment Details
  paymentAmount: Number,         // Amount paid (Rs.)
  remarks: String,               // Student's notes
  
  // File Upload
  paymentSlipPath: String,       // Server file location
  paymentSlipUrl: String,        // HTTP accessible URL
  uploadedAt: Date,              // When uploaded
  fileType: String,              // 'pdf', 'png', 'jpg'
  fileSize: Number,              // File size in bytes
  
  // Cycle Info
  cycleNumber: Number,           // Which payment cycle (1, 2, 3...)
  cycleStartDate: Date,          // First payment date
  dueDate: Date,                 // When payment is due
  isOverdue: Boolean,            // Past due date?
  
  // Status
  status: 'submitted' | 'approved' | 'rejected',
  
  // Owner Approval
  approvedBy: ObjectId,          // Owner/admin who approved
  approvedAt: Date,              // When approved
  rejectionReason: String,       // If rejected, why?
  rejectedAt: Date,              // When rejected
  
  // Generated Receipt
  receiptId: ObjectId,           // Link to generated receipt
  
  // Timestamps
  createdAt: Date,               // When submitted
  updatedAt: Date
}
```

**When Used:**
- ✅ Student submits payment slip
- ✅ Owner reviews pending payments
- ✅ Owner approves payment (receipt auto-generated)
- ✅ Owner rejects payment
- ✅ Student views payment history
- ✅ Track overdue payments

---

### **2. PaymentReceipt.js** 📄 GENERATED
**Location:** `/backend/src/models/PaymentReceipt.js`

**Responsibility:**
- Store auto-generated receipt after owner approval
- Track receipt numbering (unique ID per receipt)
- Store receipt PDF file
- Link to original payment

**Key Fields:**
```javascript
{
  // Relationships
  studentPaymentId: ObjectId,    // Link to submitted payment
  studentId: ObjectId,           // Student who paid
  roomId: ObjectId,              // Room paid for
  boardingHouseId: ObjectId,     // Boarding house
  
  // Receipt Info
  receiptNumber: String,         // Unique: REC-2026-03-29-69c43-001
  receiptDate: Date,             // Date receipt created
  paymentAmount: Number,         // Amount on receipt
  paymentMethod: 'file_upload' | 'online' | 'cash',
  
  // Student Notes
  studentRemarks: String,        // What student wrote
  
  // Receipt File (PDF)
  receiptPath: String,           // Server file location
  receiptUrl: String,            // HTTP accessible URL
  
  // Approval Info
  approvedBy: ObjectId,          // Owner/admin who approved
  
  // Timestamps
  generatedAt: Date,             // When receipt PDF created
  createdAt: Date,
  updatedAt: Date
}
```

**When Used:**
- ✅ Owner clicks "Approve" payment
- ✅ Backend auto-generates PDF receipt
- ✅ Receipt saved to: `/uploads/receipts/REC-YYYY-MM-DD-[id].pdf`
- ✅ Student can download approved receipt
- ✅ Track receipt numbers sequentially

---

### **3. PaymentCycle.js** 📅 CYCLES
**Location:** `/backend/src/models/PaymentCycle.js`

**Responsibility:**
- Track 30-day payment cycles
- Manage cycle start & due dates
- Track which payment belongs to which cycle
- Monitor cycle payment status

**Key Fields:**
```javascript
{
  // Identifiers
  studentId: ObjectId,           // Student in cycle
  bookingAgreementId: ObjectId,  // Booking agreement
  roomId: ObjectId,              // Room rented
  boardingHouseId: ObjectId,     // Boarding house
  
  // Cycle Details
  cycleNumber: Number,           // 1st, 2nd, 3rd cycle...
  startDate: Date,               // First payment date
  dueDate: Date,                 // 30 days after start
  expectedAmount: Number,        // Expected payment amount
  
  // Status
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'rejected',
  paymentId: ObjectId,           // Link to StudentPayment
  isActive: Boolean,             // Currently active?
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Example Timeline:**
```
Cycle 1: Jan 20 - Feb 19 (Due: Jan 20 + 30 days)
Cycle 2: Feb 20 - Mar 21 (Due: Feb 20 + 30 days)
Cycle 3: Mar 22 - Apr 21 (Due: Mar 22 + 30 days)
```

**When Used:**
- ✅ Student accepts booking agreement
- ✅ Create payment cycle (automatically)
- ✅ Track which payment cycle student is in
- ✅ Calculate due dates
- ✅ Show overdue status

---

### **4. Notification.js** 🔔 ALERTS
**Location:** `/backend/src/models/Notification.js`

**Responsibility:**
- Send alerts to students about payment status
- Notify owner of pending payments
- Track notification read status

**Key Fields:**
```javascript
{
  // Recipient
  userId: ObjectId,              // Who gets notification
  
  // Type
  type: 'payment_approved' | 'payment_rejected' | 'payment_overdue' | ...,
  
  // Content
  title: String,                 // "Payment Approved"
  message: String,               // Detailed message
  
  // Related Data
  paymentId: ObjectId,           // Which payment
  receiptId: ObjectId,           // Which receipt
  rejectionReason: String,       // If rejected
  data: Object,                  // Flexible data
  
  // Status
  isRead: Boolean,               // Student read it?
  readAt: Date,
  
  // Timestamps
  createdAt: Date
}
```

**Notifications Created:**
- ✅ `payment_approved` - Owner approved payment
- ✅ `payment_rejected` - Owner rejected payment
- ✅ `payment_overdue` - Payment is now overdue

**When Used:**
- ✅ Owner approves payment → notify student
- ✅ Owner rejects payment → notify student with reason
- ✅ Payment becomes overdue → notify student

---

## 🔗 Supporting Models (Used in Payment)

### **5. User.js**
**Role:** User identity & authentication
```javascript
{
  _id: ObjectId,
  email: String,
  role: 'student' | 'owner' | 'admin',
  // ... other fields
}
```
- Stores student & owner information
- Referenced by: StudentPayment, PaymentReceipt, Notification

---

### **6. Room.js**
**Role:** Room pricing & details
```javascript
{
  _id: ObjectId,
  name: String,
  bedCount: Number,
  price: Number,                 // Monthly rent
  boardingHouseId: ObjectId,
  // ... other fields
}
```
- Stores room rent amount
- Used to validate payment amount
- Referenced by: StudentPayment, PaymentReceipt

---

### **7. BookingAgreement.js**
**Role:** Active booking/lease agreement
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  roomId: ObjectId,
  status: 'accepted' | 'pending' | 'rejected',
  // ... other fields
}
```
- Links student to room
- Referenced by: StudentPayment, PaymentCycle

---

### **8. BoardingHouse.js**
**Role:** Boarding house details & owner
```javascript
{
  _id: ObjectId,
  ownerId: ObjectId,
  name: String,
  // ... other fields
}
```
- Stores owner information
- Referenced by: StudentPayment, PaymentReceipt

---

## 📊 Data Flow in Payment Process

### **Step 1: Student Submits Payment**
```
Frontend Form
    ↓
POST /api/roommates/payments/submit
    ↓
StudentPayment Model Created {
  status: 'submitted',
  paymentSlipPath: '/uploads/payments/[studentId]/[file]',
  uploadedAt: now
}
    ↓
File saved: /uploads/payments/[studentId]/[timestamp]_[filename]
```

### **Step 2: Owner Reviews Payment**
```
GET /api/owner/payments/pending
    ↓
Returns: StudentPayment records with status='submitted'
    ↓
Owner views payment slip image/PDF
    ↓
Owner clicks "Approve" or "Reject"
```

### **Step 3: Owner Approves**
```
POST /api/owner/payments/approve/:paymentId
    ↓
StudentPayment updated: {
  status: 'approved',
  approvedBy: ownerId,
  approvedAt: now
}
    ↓
AUTO: PaymentReceipt Created {
  receiptNumber: 'REC-2026-03-29-69c43-001',
  receiptPath: '/uploads/receipts/REC-...-001.pdf'
}
    ↓
AUTO: PaymentCycle updated {
  paymentStatus: 'paid',
  paymentId: [studentPaymentId]
}
    ↓
AUTO: Notification Created {
  type: 'payment_approved',
  userId: studentId
}
    ↓
File saved: /uploads/receipts/REC-2026-03-29-69c43-001.pdf
```

### **Step 4: Student Views Results**
```
GET /api/roommates/payments/history
    ↓
Returns: StudentPayment records (submitted, approved, rejected)

GET /api/roommates/payments/cycles
    ↓
Returns: PaymentCycle records with status, due dates

GET /api/roommates/payments/receipt/:id
    ↓
Returns: PaymentReceipt, allows PDF download
```

---

## 🗄️ Database Collections Summary

| Model | Collection | Purpose | Records | Example |
|-------|-----------|---------|---------|---------|
| **StudentPayment** | studentpayments | Track payment submissions | ~100s/month | Student submits Rs. 7,500 |
| **PaymentReceipt** | paymentreceipts | Store approved receipts | ~50s/month | REC-2026-03-29-... |
| **PaymentCycle** | paymentcycles | Track 30-day cycles | ~3/student/year | Cycle 1, 2, 3... |
| **Notification** | notifications | Alert system | ~100s/month | Payment approved alert |
| **User** | users | Student/Owner accounts | ~1,000s | Student profile |
| **Room** | rooms | Room pricing | ~100s | Rs. 15,000/month |
| **BookingAgreement** | bookinagreements | Active leases | ~1,000s | Student-Room link |
| **BoardingHouse** | boardinghouses | Properties | ~100s | Owner's house |

---

## 🔍 Key Indexes for Performance

```javascript
// StudentPayment Indexes
studentId + cycleNumber         // Find payments by student & cycle
boardingHouseId + status        // Find pending payments for owner
dueDate + isOverdue             // Find overdue payments

// PaymentReceipt Indexes
studentId + createdAt           // Student receipt history
boardingHouseId + createdAt     // Owner receipt history

// PaymentCycle Indexes
studentId + cycleNumber         // Find cycle by student
dueDate + paymentStatus         // Find pending cycles
boardingHouseId + isActive      // Find active cycles

// Notification Indexes
userId + isRead                 // Find unread notifications
createdAt                       // Time-based queries
```

---

## ✅ Complete Reference

### **Responsibilities**
```
StudentPayment     → Store payment submissions & track status
PaymentReceipt     → Auto-generated receipt after approval
PaymentCycle       → Track 30-day payment cycles
Notification       → Send alerts to students/owners
User               → Student/Owner identity
Room               → Room rent amount
BookingAgreement   → Link student to room
BoardingHouse      → Property & owner info
```

### **File Storage**
```
Payment Slips:  /uploads/payments/[studentId]/[timestamp]_[filename]
Receipts:       /uploads/receipts/REC-YYYY-MM-DD-[id]-[num].pdf
```

### **API Endpoints**
```
POST   /api/roommates/payments/submit              → Create StudentPayment
GET    /api/roommates/payments/history             → StudentPayment list
GET    /api/owner/payments/pending                 → Pending for owner
POST   /api/owner/payments/approve/:id             → Approve + create Receipt
POST   /api/owner/payments/reject/:id              → Reject payment
GET    /api/roommates/payments/cycles              → PaymentCycle list
GET    /api/roommates/payments/receipt/:id         → Download receipt
```

---

## 🎯 Summary

**Total Models Used: 8**
- **Payment Models: 4** (StudentPayment, PaymentReceipt, PaymentCycle, Notification)
- **Supporting Models: 4** (User, Room, BookingAgreement, BoardingHouse)

**Total Collections Created: 8**

**When Complete Payment Flow Happens:**
1. StudentPayment created
2. Owner approves → PaymentReceipt auto-created
3. PaymentCycle updated
4. Notification sent to student
5. Student can download receipt

All connected via MongoDB references & indexes for optimal performance! 🚀
