const express = require('express');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const ownerController = require('../controllers/ownerController');

const ownerPaymentDashboardController = require('../controllers/payment/ownerPaymentDashboardController');
const noticeController = require('../controllers/noticeController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// Notice CRUD endpoints
router.get('/notices', requireAuth, noticeController.getNotices);
router.post('/notices', requireAuth, [
  body('title').isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('message').isLength({ min: 5, max: 2000 }).withMessage('Message must be 5-2000 characters'),
], validateRequest, noticeController.createNotice);
router.patch('/notices/:noticeId', requireAuth, [
  body('title').optional().isLength({ min: 3, max: 100 }),
  body('message').optional().isLength({ min: 5, max: 2000 }),
], validateRequest, noticeController.updateNotice);
router.delete('/notices/:noticeId', requireAuth, noticeController.deleteNotice);


router.get('/public/houses', ownerController.getPublicHouses);


router.get('/houses', requireAuth, ownerController.getHouses);

router.post(
  '/houses',
  requireAuth,
  [
    body('name').notEmpty().withMessage('House name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('monthlyPrice').optional().isNumeric().withMessage('Price must be a number'),
    body('deposit').optional().isNumeric().withMessage('Deposit must be a number'),
    body('genderPreference')
      .optional()
      .isIn(['any', 'girls', 'boys'])
      .withMessage('Gender preference must be any, girls, or boys'),
  ],
  validateRequest,
  ownerController.createHouse
);

router.patch('/houses/:houseId', requireAuth, ownerController.updateHouse);
router.delete('/houses/:houseId', requireAuth, ownerController.deleteHouse);

router.get('/rooms', requireAuth, ownerController.getRooms);

router.post(
  '/rooms',
  requireAuth,
  [
    body('location').notEmpty().withMessage('Location is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('bedCount').isInt({ min: 1 }).withMessage('Bed count must be at least 1'),
    body('roomNumber').notEmpty().withMessage('Room number is required'),
  ],
  validateRequest,
  ownerController.createRoom
);

router.patch('/rooms/:roomId', requireAuth, ownerController.updateRoom);
router.delete('/rooms/:roomId', requireAuth, ownerController.deleteRoom);

// Payment-related endpoints
router.get('/payment-slips', requireAuth, ownerController.getPendingPaymentSlips);
router.get('/payment-slips/:slipId/download', requireAuth, ownerController.downloadPaymentSlip);
router.post('/payment-slips/:slipId/approve', requireAuth, ownerController.approvePaymentSlip);
router.post('/payment-slips/:slipId/reject', requireAuth, ownerController.rejectPaymentSlip);

// Financial overview
router.get('/financial-overview', requireAuth, ownerController.getFinancialOverview);
router.get('/payment-history', requireAuth, ownerController.getPaymentHistory);

// Booking requests and digital agreements
router.get('/booking-requests', requireAuth, bookingController.getOwnerBookingRequests);
router.patch(
  '/booking-requests/:requestId/status',
  requireAuth,
  [body('status').isIn(['approved', 'rejected'])],
  validateRequest,
  bookingController.updateBookingRequestStatus
);
router.get('/agreements', requireAuth, bookingController.getOwnerAgreements);
router.get('/agreements/:agreementId/download', requireAuth, bookingController.downloadAgreement);
router.get('/agreement-templates', requireAuth, bookingController.getAgreementTemplates);
router.post(
  '/agreement-templates',
  requireAuth,
  [
    body('title').isLength({ min: 5, max: 200 }).withMessage('title must be 5-200 characters'),
    body('content').notEmpty().withMessage('content is required'),
  ],
  validateRequest,
  bookingController.createAgreementTemplate
);
router.post(
  '/agreements',
  requireAuth,
  [
    body('bookingRequestId').isMongoId().withMessage('bookingRequestId is required'),
    body('title').isLength({ min: 5, max: 200 }).withMessage('title must be 5-200 characters'),
    body('terms').isLength({ min: 20, max: 10000 }).withMessage('terms must be 20-10000 characters'),
    body('rentAmount').isFloat({ min: 0 }).withMessage('rentAmount must be a positive number'),
    body('depositAmount').optional().isFloat({ min: 0 }).withMessage('depositAmount must be positive'),
    body('periodStart').isISO8601().withMessage('periodStart must be a valid date'),
    body('periodEnd').isISO8601().withMessage('periodEnd must be a valid date'),
  ],
  validateRequest,
  bookingController.createAgreementForRequest
);

// **DASHBOARD ENDPOINTS** - Owner payment & rental management
router.get('/boarding-houses/:boardingHouseId/stats', requireAuth, ownerPaymentDashboardController.getDashboardStats);
router.get('/boarding-houses/:boardingHouseId/rooms-overview', requireAuth, ownerPaymentDashboardController.getRoomsOverview);
router.get('/boarding-houses/:boardingHouseId/payment-ledger', requireAuth, ownerPaymentDashboardController.getPaymentLedger);
router.get('/tenants/:studentId/next-payment-cycle', requireAuth, ownerPaymentDashboardController.getNextPaymentCycleDate);
router.post('/tenants/:studentId/send-reminder', requireAuth, ownerPaymentDashboardController.sendPaymentReminder);
router.delete('/agreements/:agreementId', requireAuth, ownerPaymentDashboardController.cancelAgreement);
router.get('/students/:studentId/receipts', requireAuth, ownerPaymentDashboardController.getStudentReceiptsForOwner);
router.get('/students/:studentId/receipts/:receiptNumber/download', requireAuth, ownerPaymentDashboardController.downloadStudentReceipt);

// **DEBUG ENDPOINT** - Check what's in database
router.get('/debug/boarding-house/:boardingHouseId', requireAuth, async (req, res) => {
  try {
    const BoardingHouse = require('../models/BoardingHouse');
    const Room = require('../models/Room');
    const { boardingHouseId } = req.params;
    const ownerId = req.user.userId;

    console.log('🔍 DEBUG: Checking boarding house data');
    console.log('   boardingHouseId:', boardingHouseId);
    console.log('   ownerId:', ownerId);

    const boardingHouse = await BoardingHouse.findById(boardingHouseId);
    const rooms = await Room.find({ houseId: boardingHouseId });

    console.log('   Boarding House:', boardingHouse ? { _id: boardingHouse._id, name: boardingHouse.name, ownerId: boardingHouse.ownerId } : 'NOT FOUND');
    console.log('   Rooms found:', rooms.length);
    rooms.forEach((r, i) => {
      console.log(`     Room ${i+1}: ${r.roomNumber} (${r.name}) - houseId: ${r.houseId}`);
    });

    return res.status(200).json({
      success: true,
      debug: {
        boardingHouseId,
        ownerId,
        boardingHouse: boardingHouse ? {
          _id: boardingHouse._id.toString(),
          name: boardingHouse.name,
          ownerId: boardingHouse.ownerId.toString(),
          ownerIdMatch: boardingHouse.ownerId.toString() === ownerId,
        } : null,
        roomsCount: rooms.length,
        rooms: rooms.map((r) => ({
          _id: r._id.toString(),
          roomNumber: r.roomNumber,
          name: r.name,
          price: r.price,
          houseId: r.houseId?.toString(),
        })),
      },
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
