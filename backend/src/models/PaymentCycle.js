const mongoose = require('mongoose');

const paymentCycleSchema = new mongoose.Schema({
  // Identifiers
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  bookingAgreementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookingAgreement',
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

  // Cycle Details
  cycleNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  startDate: {
    type: Date,
    required: true,
    index: true,
  },
  dueDate: {
    type: Date,
    required: true,
    index: true,
  },
  expectedAmount: {
    type: Number,
    required: true,
    min: 0,
  },

  // Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'rejected'],
    default: 'pending',
    index: true,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentPayment',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
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
paymentCycleSchema.index({ studentId: 1, cycleNumber: 1 });
paymentCycleSchema.index({ dueDate: 1, paymentStatus: 1 });
paymentCycleSchema.index({ boardingHouseId: 1, isActive: 1 });

// Update timestamp on save
paymentCycleSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PaymentCycle', paymentCycleSchema);
