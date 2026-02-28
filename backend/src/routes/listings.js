const express = require('express');
const router = express.Router();
const { getListings, getListingById } = require('../controllers/listingController');

router.get('/', getListings);
router.get('/:id', getListingById);

module.exports = router;
