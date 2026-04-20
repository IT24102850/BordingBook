# 📁 Payment Slip File Storage Location

## **Main Directory Path**

```
f:\BordingBook\uploads\payments\
```

---

## **Full File Storage Structure**

When a student submits a payment slip, the file is saved at:

```
f:\BordingBook\uploads\payments\[studentId]\[timestamp]_[filename]
```

### **Example:**

```
f:\BordingBook\uploads\payments\69c43b43a7bff225fbbe4b79\1711616589234_payment_slip.pdf
                                 ↑                          ↑                  ↑
                            Student ID              Timestamp         Original Filename
```

---

## **File Storage Configuration** 

From: `/backend/src/payment/middleware/uploadHandler.js`

```javascript
// Line 12: Base directory
const uploadsDir = path.join(__dirname, '../../..', 'uploads', 'payments');
// Resolves to: f:\BordingBook\uploads\payments\

// Line 20-27: Student-specific subdirectory
destination: (req, file, cb) => {
  const studentId = req.user?.userId;
  const studentDir = path.join(uploadsDir, studentId);
  // Creates: f:\BordingBook\uploads\payments\[studentId]\

// Line 30-35: Unique filename with timestamp
filename: (req, file, cb) => {
  const timestamp = Date.now();
  const ext = path.extname(file.originalname);
  const name = path.basename(file.originalname, ext);
  cb(null, `${timestamp}_${name}${ext}`);
  // Result: 1711616589234_payment_slip.pdf
}
```

---

## **Data Stored in Database**

File path information is stored in MongoDB `studentpayments` collection:

```javascript
{
  _id: ObjectId,
  studentId: "69c43b43a7bff225fbbe4b79",
  
  // Filesystem path (absolute)
  paymentSlipPath: "f:\BordingBook\uploads\payments\69c43b43a7bff225fbbe4b79\1711616589234_payment_slip.pdf",
  
  // HTTP URL (browser accessible)
  paymentSlipUrl: "/uploads/payments/69c43b43a7bff225fbbe4b79/1711616589234_payment_slip.pdf",
  
  // Metadata
  originalname: "payment_slip.pdf",
  fileType: "pdf",
  fileSize: 245678,
  mimetype: "application/pdf",
  
  // Other fields
  paymentAmount: 7500,
  status: "submitted",
  createdAt: "2026-03-29T10:30:00Z"
}
```

---

## **How to Access/View the File**

### **1. Direct File System Access (Server)**
```powershell
# List all payment slips for a student
Get-ChildItem -Path "f:\BordingBook\uploads\payments\69c43b43a7bff225fbbe4b79\"

# Delete a specific file
Remove-Item "f:\BordingBook\uploads\payments\69c43b43a7bff225fbbe4b79\1711616589234_payment_slip.pdf"

# Check total uploaded files
Get-ChildItem -Recurse "f:\BordingBook\uploads\payments\" | Measure-Object
```

### **2. Via HTTP URL (Browser)**
```
http://localhost:5000/uploads/payments/69c43b43a7bff225fbbe4b79/1711616589234_payment_slip.pdf
```

### **3. From Database Query**
```javascript
const payment = await StudentPayment.findById(paymentId);
console.log(payment.paymentSlipPath);  // File system path
console.log(payment.paymentSlipUrl);   // HTTP accessible URL
```

---

## **Directory Structure After Multiple Uploads**

```
f:\BordingBook\
├── uploads\
│   └── payments\
│       ├── 69c43b43a7bff225fbbe4b79\          ← Student 1 folder
│       │   ├── 1711616589234_receipt.jpg
│       │   ├── 1711616601456_payment.pdf
│       │   └── 1711616615789_slip.png
│       │
│       ├── 68d34d32b8eff334ebad8c88\          ← Student 2 folder
│       │   ├── 1711616620123_payment.pdf
│       │   └── 1711616645678_receipt.jpg
│       │
│       └── [other student folders]...
│
└── [other directories]...
```

---

## **Important Configuration Details**

### **Allowed File Types**
- ✅ PNG (image/png)
- ✅ JPG/JPEG (image/jpeg)
- ✅ PDF (application/pdf)

### **File Size Limits**
- **Maximum:** 5MB
- Configured in: `uploadHandler.js` line 65
```javascript
limits: {
  fileSize: 5 * 1024 * 1024, // 5MB max
}
```

### **Filename Format**
- **Pattern:** `[timestamp]_[original_name].[ext]`
- **Example:** `1711616589234_payment_slip.pdf`
- **Timestamp:** JavaScript `Date.now()` (milliseconds since epoch)

---

## **Security Features**

1. **Student-Isolated Directories**
   - Each student has their own folder
   - Cannot access other students' files

2. **File Type Validation**
   - Frontend validation (PNG, JPG, PDF only)
   - Backend validation (double-check)
   - MIME type verification

3. **Size Restrictions**
   - Maximum 5MB per file
   - Prevents storage overflow

4. **Authentication Required**
   - Only authenticated students can upload
   - JWT token required in request header

5. **Error Handling**
   - If upload fails, file is deleted
   - Database record only created on success

---

## **Related Files in Codebase**

| File | Purpose | Location |
|------|---------|----------|
| `uploadHandler.js` | Multer configuration, file storage setup | `/backend/src/payment/middleware/` |
| `paymentController.js` | Handles file upload API request | `/backend/src/payment/controllers/` |
| `paymentService.js` | Business logic for saving to DB | `/backend/src/payment/services/` |
| `StudentPayment.js` | Database model storing file path | `/backend/src/models/` |
| `paymentRoutes.js` | API endpoint: POST /submit | `/backend/src/payment/routes/` |

---

## **Quick Reference**

| Item | Location |
|------|----------|
| **Files Saved At** | `f:\BordingBook\uploads\payments\[studentId]\` |
| **Single File Path** | `f:\...\uploads\payments\69c43...789\1711616589234_slip.pdf` |
| **HTTP Access URL** | `http://localhost:5000/uploads/payments/69c43.../1711616589234_slip.pdf` |
| **Database Storage** | MongoDB `studentpayments` collection → `paymentSlipPath` field |
| **Config File** | `uploadHandler.js` in `/backend/src/payment/middleware/` |

---

## ✅ Summary

**When student uploads:** `payment_slip.pdf` (250KB)

**Saved as:**
- **Path:** `f:\BordingBook\uploads\payments\69c43b43a7bff225fbbe4b79\1711616589234_payment_slip.pdf`
- **URL:** `http://localhost:5000/uploads/payments/69c43b43a7bff225fbbe4b79/1711616589234_payment_slip.pdf`
- **Database:** StudentPayment record with `paymentSlipPath` pointing to above location

