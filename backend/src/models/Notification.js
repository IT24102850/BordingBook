const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'group_invite',
      'group_invite_accepted',
      'group_invite_rejected',
      'group_message',
      'agreement_pending',
      'agreement_signed',
      'agreement_reminder',
      'system',
      'payment_rejected',
      'payment_approved',
      'payment_overdue',
      'payment_pre_payment',
      'other',
    ],
    default: 'other',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    default: {},
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
