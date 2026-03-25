const express = require('express');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const ownerController = require('../controllers/ownerController');

const router = express.Router();

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

module.exports = router;
