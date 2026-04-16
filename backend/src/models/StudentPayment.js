const mongoose = require('mongoose');

const studentPaymentSchema = new mongoose.Schema({
  // Identifiers
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
    index: true,
  },
  boardingHouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoardingHouse',
    required: true,
    index: true,
  },
  bookingAgreementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookingAgreement',
    required: true,
    index: true,
  },

  // Payment Details
  paymentAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  remarks: {
    type: String,
    default: '',
    trim: true,
  },

  // File Upload
  paymentSlipPath: {
    type: String,
    default: '',
  },
  paymentSlipUrl: {
    type: String,
    default: '',
  },
  uploadedAt: {
    type: Date,
    default: null,
  },
  fileType: {
    type: String,
    default: '',
  },
  fileSize: {
    type: Number,
    default: 0,
  },

  // Cycle Information
  cycleNumber: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  cycleStartDate: {
    type: Date,
    default: null,
    index: true,
  },
  dueDate: {
    type: Date,
    default: null,
    index: true,
  },
  isOverdue: {
    type: Boolean,
    default: false,
    index: true,
  },

  // Status Tracking
  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected'],
    default: 'submitted',
    index: true,
  },

  // Owner Approval
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    default: '',
    trim: true,
  },
  rejectedAt: {
    type: Date,
    default: null,
  },

  // Generated Receipt
  receiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentReceipt',
    default: null,
  },

  // Timestamps
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
studentPaymentSchema.index({ studentId: 1, cycleNumber: 1 });
studentPaymentSchema.index({ boardingHouseId: 1, status: 1 });
studentPaymentSchema.index({ dueDate: 1, isOverdue: 1 });

// Update overdue status before saving
studentPaymentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  // Calculate isOverdue if dueDate exists
  if (this.dueDate && this.status !== 'approved' && this.status !== 'rejected') {
    this.isOverdue = new Date() > this.dueDate;
  }

  next();
});

module.exports = mongoose.model('StudentPayment', studentPaymentSchema);
