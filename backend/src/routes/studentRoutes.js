const express = require('express');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const bookingController = require('../controllers/bookingController');
const Notification = require('../models/Notification');

const router = express.Router();

// Agreements endpoints
router.post(
  '/agreements/:agreementId/sign',
  requireAuth,
  [
    body('action').isIn(['sign', 'reject']).withMessage('action must be sign or reject'),
  ],
  validateRequest,
  bookingController.signAgreement
);

router.get('/agreements', requireAuth, bookingController.getMyAgreements);

router.get('/agreements/:agreementId/download', requireAuth, bookingController.downloadAgreement);

// Notifications endpoints
router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
});

router.patch('/notifications/:notificationId/read', requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
});

router.patch('/notifications/mark-all-read', requireAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.userId, read: false },
      { read: true }
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message,
    });
  }
});

// Booking endpoints
router.post(
  '/booking-requests',
  requireAuth,
  [
    body('roomId').optional().isMongoId(),
    body('houseId').optional().isMongoId(),
    body('moveInDate').isISO8601().withMessage('moveInDate must be a valid date'),
    body('durationMonths').isInt({ min: 1, max: 36 }).withMessage('durationMonths must be 1-36'),
    body('contactNumber').isString().trim(),
    body('message').optional().isString().trim().isLength({ max: 1000 }),
  ],
  validateRequest,
  bookingController.createBookingRequest
);

router.get('/booking-requests', requireAuth, bookingController.getMyBookingRequests);

module.exports = router;
