const mongoose = require('mongoose');

const paymentReceiptSchema = new mongoose.Schema({
  // Relationships
  studentPaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentPayment',
    required: true,
    unique: true,
    index: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  boardingHouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoardingHouse',
    required: true,
    index: true,
  },

  // Receipt Information
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
    // Format: REC-2026-03-29-69c43b43a7bff225fbbe4b79-001
  },
  receiptDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  paymentAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMethod: {
    type: String,
    default: 'file_upload',
    enum: ['file_upload', 'online', 'cash'],
  },

  // Payment Cycle Validity Period
  validFromDate: {
    type: Date,
    required: true,
  },
  validToDate: {
    type: Date,
    required: true,
  },
  cycleNumber: {
    type: Number,
    required: true,
  },

  // Student Notes
  studentRemarks: {
    type: String,
    default: '',
    trim: true,
  },

  // Receipt File
  receiptPath: {
    type: String,
    default: '',
  },
  receiptUrl: {
    type: String,
    default: '',
  },

  // Approval Info
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Timestamps
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for query optimization
paymentReceiptSchema.index({ studentId: 1, createdAt: -1 });
paymentReceiptSchema.index({ boardingHouseId: 1, createdAt: -1 });

// Update timestamp on save
paymentReceiptSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PaymentReceipt', paymentReceiptSchema);
