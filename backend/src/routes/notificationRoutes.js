<<<<<<< Updated upstream
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Get all notifications (optionally unread only)
router.get('/', requireAuth, notificationController.getNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', requireAuth, notificationController.markAsRead);

// Mark all as read
router.patch('/read-all', requireAuth, notificationController.markAllAsRead);

// Delete a notification
=======
/**
 * FILE: notificationRoutes.js
 * PURPOSE: Define API routes for notification endpoints
 * DESCRIPTION: Maps HTTP methods and URL paths to notification controller functions
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 * BEFORE other GET routes so it doesn't match /:id
 */
router.get('/unread-count', requireAuth, notificationController.getUnreadCount);

/**
 * POST /api/notifications/test-reminder
 * Create a test reminder for testing without waiting for dates
 */
router.post('/test-reminder', requireAuth, notificationController.createTestReminder);

/**
 * POST /api/notifications/generate-all
 * Generate reminders for all students based on payment cycle dates
 */
router.post('/generate-all', requireAuth, notificationController.generateAllReminders);

/**
 * POST /api/notifications/cleanup-old
 * Clean up old auto-generated reminders
 */
router.post('/cleanup-old', requireAuth, notificationController.cleanupOldReminders);

/**
 * GET /api/notifications
 * Get all notifications for authenticated user
 * Query: ?unreadOnly=true (optional)
 */
router.get('/', requireAuth, notificationController.getNotifications);

/**
 * PUT /api/notifications/:notificationId/read
 * Mark specific notification as read
 */
router.put('/:notificationId/read', requireAuth, notificationController.markAsRead);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', requireAuth, notificationController.markAllAsRead);

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
>>>>>>> Stashed changes
router.delete('/:notificationId', requireAuth, notificationController.deleteNotification);

module.exports = router;
