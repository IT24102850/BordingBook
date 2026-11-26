/**
 * FILE: uploadHandler.js
 * PURPOSE: Middleware for handling payment slip file uploads
 * DESCRIPTION: Manages file uploads for payment slips with validation,
 *              size checks, type restrictions, and storage configuration
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const crypto = require('crypto');
const fileStore = require('../../lib/fileStore');

// Files are kept in memory, then persisted to durable storage (MongoDB GridFS)
// in validateUploadedFile — local disk is wiped on every deploy on hosts like Render.
const storage = multer.memoryStorage();

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
exports.validateUploadedFile = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Student ID not found.',
    });
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const base = path
      .basename(req.file.originalname, path.extname(req.file.originalname))
      .replace(/[^\w.-]+/g, '_')
      .slice(0, 60);
    const filename = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${base}${ext}`;
    const key = `uploads/payments/${req.user.userId}/${filename}`;
    await fileStore.saveFile(key, req.file.buffer, req.file.mimetype);

    req.uploadedFile = {
      path: key,
      url: `/${key}`,
      filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      extension: ext.replace('.', ''),
    };
    return next();
  } catch (error) {
    console.error('Failed to store payment slip:', error);
    return res.status(500).json({ success: false, message: 'Failed to store uploaded file' });
  }
};

/**
 * Error handler for multer upload errors
 */
exports.handleUploadError = (err, req, res, next) => {
  if (!err) {
    return next();
  }

  console.error('📤 Upload middleware error:', err.message);

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
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
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
  fileStore.deleteFile(filePath).catch((error) => console.error('Error deleting uploaded file:', error));
};
