/**
 * FILE: uploadHandler.js
 * PURPOSE: Middleware for handling payment slip file uploads
 * DESCRIPTION: Manages file uploads for payment slips with validation,
 *              size checks, type restrictions, and storage configuration
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../..', 'uploads', 'payments');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create student-specific subdirectory
    const studentId = req.user?.userId;
    const studentDir = path.join(uploadsDir, studentId);

    if (!fs.existsSync(studentDir)) {
      fs.mkdirSync(studentDir, { recursive: true });
    }

    cb(null, studentDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp_originalname (replace spaces with underscores)
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    let name = path.basename(file.originalname, ext);
    // Replace spaces with underscores to avoid encoding issues
    name = name.replace(/\s+/g, '_');
    cb(null, `${timestamp}_${name}${ext}`);
  },
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/png', 'image/jpeg', 'application/pdf'];
  const allowedExts = ['.png', '.jpg', '.jpeg', '.pdf'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedMimes.includes(mime) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: PNG, JPG, JPEG, PDF. Received: ${ext}`
      )
    );
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

/**
 * Middleware to handle single file upload
 * Usage: paymentSlipUpload.single('paymentSlip')
 */
exports.paymentSlipUpload = upload;

/**
 * Custom middleware to validate and prepare file data
 */
exports.validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // Add file info to request
  req.uploadedFile = {
    path: req.file.path,
    url: `/uploads/payments/${req.user.userId}/${req.file.filename}`,
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    extension: path.extname(req.file.originalname).toLowerCase().replace('.', ''),
  };

  next();
};

/**
 * Error handler for multer upload errors
 */
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded',
      });
    }
  }

  if (err && err.message) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

/**
 * Delete uploaded file (for cleanup in case of failure)
 * @param {String} filePath - Full path to file
 */
exports.deleteUploadedFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting uploaded file:', error);
  }
};
