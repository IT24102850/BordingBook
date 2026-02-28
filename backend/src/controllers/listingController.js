const Listing = require('../models/Listing');

/**
 * GET /api/listings
 * Query params: ?type=room|house|apartment|hostel
 */
async function getListings(req, res, next) {
    try {
        const filter = { available: true };
        if (req.query.type) {
            filter.type = req.query.type;
        }
        const listings = await Listing.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: listings.length, data: listings });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/listings/:id
 */
async function getListingById(req, res, next) {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ success: false, error: 'Listing not found' });
        }
        res.json({ success: true, data: listing });
    } catch (err) {
        next(err);
    }
}

module.exports = { getListings, getListingById };
