const mongoose = require('mongoose');

const bookingAgreementSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    bookingRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookingRequest',
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    terms: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 10000,
    },
    rentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    depositAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    additionalClauses: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'signed', 'expired', 'partially_signed', 'rejected'],
      default: 'pending',
      index: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    signedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    groupMemberSignatures: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        memberName: String,
        memberEmail: String,
        status: {
          type: String,
          enum: ['pending', 'signed', 'rejected'],
          default: 'pending',
        },
        signedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    acknowledgedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingAgreementSchema.index({ ownerId: 1, status: 1, createdAt: -1 });
bookingAgreementSchema.index({ studentId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('BookingAgreement', bookingAgreementSchema);
