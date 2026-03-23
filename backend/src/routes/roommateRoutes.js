const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

// Import controllers
const roommateController = require('../controllers/roommateController');
const requestController = require('../controllers/requestController');
const groupController = require('../controllers/groupController');
const roomController = require('../controllers/roomController');

// ============ ROOMMATE PROFILE ROUTES ============

// Create or update profile
router.post(
  '/profile',
  requireAuth,
  [
    body('budget').isInt({ min: 5000, max: 50000 }),
    body('gender').isIn(['Male', 'Female', 'Other']),
    body('academicYear').isIn(['1st Year', '2nd Year', '3rd Year', '4th Year']),
    body('roomType').isIn(['Single Room', 'Shared Room']),
    body('availableFrom').isISO8601().toDate(),
  ],
  validateRequest,
  roommateController.createOrUpdateProfile
);

// Get current user's profile
router.get('/profile', requireAuth, roommateController.getMyProfile);

// Browse roommate profiles (with filters)
router.get('/browse', requireAuth, roommateController.browseProfiles);

// Swipe on profile (Tinder-style)
router.post(
  '/swipe',
  requireAuth,
  [
    body('profileId').isMongoId(),
    body('action').isIn(['like', 'pass']),
  ],
  validateRequest,
  roommateController.swipeProfile
);

// Get liked profiles
router.get('/liked', requireAuth, roommateController.getLikedProfiles);

// ============ ROOMMATE REQUEST ROUTES ============

// Send request
router.post(
  '/request/send',
  requireAuth,
  [
    body('recipientId').isMongoId(),
    body('message').isLength({ min: 10, max: 500 }),
  ],
  validateRequest,
  requestController.sendRequest
);

// Get inbox requests
router.get('/request/inbox', requireAuth, requestController.getInboxRequests);

// Get sent requests
router.get('/request/sent', requireAuth, requestController.getSentRequests);

// Get specific request
router.get('/request/:requestId', requireAuth, requestController.getRequest);

// Accept request
router.patch(
  '/request/:requestId/accept',
  requireAuth,
  requestController.acceptRequest
);

// Reject request
router.patch(
  '/request/:requestId/reject',
  requireAuth,
  requestController.rejectRequest
);

// ============ BOOKING GROUP ROUTES ============

// Create group
router.post(
  '/group',
  requireAuth,
  [body('name').isLength({ min: 5, max: 100 })],
  validateRequest,
  groupController.createGroup
);

// Get user's groups
router.get('/groups', requireAuth, groupController.getUserGroups);

// Get specific group
router.get('/group/:groupId', requireAuth, groupController.getGroup);

// Add member to group
router.post(
  '/group/:groupId/member',
  requireAuth,
  [body('memberEmail').isEmail()],
  validateRequest,
  groupController.addGroupMember
);

// Remove member from group
router.delete(
  '/group/:groupId/member/:memberId',
  requireAuth,
  groupController.removeGroupMember
);

// Respond to group invite
router.patch(
  '/group/:groupId/respond',
  requireAuth,
  [body('status').isIn(['accepted', 'rejected'])],
  validateRequest,
  groupController.respondToGroupInvite
);

// Update group status
router.patch(
  '/group/:groupId/status',
  requireAuth,
  [body('status').isIn(['forming', 'ready', 'booked'])],
  validateRequest,
  groupController.updateGroupStatus
);

// ============ ROOM ROUTES ============

// Get all rooms
router.get('/rooms', roomController.getAllRooms);

// Get specific room
router.get('/room/:roomId', roomController.getRoom);

// Create room (admin/owner only)
router.post(
  '/room',
  requireAuth,
  [
    body('name').notEmpty(),
    body('location').notEmpty(),
    body('price').isInt({ min: 5000, max: 50000 }),
    body('totalSpots').isInt({ min: 1 }),
  ],
  validateRequest,
  roomController.createRoom
);

// Update room
router.patch(
  '/room/:roomId',
  requireAuth,
  roomController.updateRoom
);

// Update room occupancy
router.patch(
  '/room/:roomId/occupancy',
  requireAuth,
  [body('occupancy').isInt({ min: 0 })],
  validateRequest,
  roomController.updateOccupancy
);

module.exports = router;
