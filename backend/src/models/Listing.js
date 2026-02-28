const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        type: { type: String, enum: ['house', 'apartment', 'room', 'hostel'], required: true },
        address: { type: String, required: true },
        bedrooms: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        priceUnit: { type: String, default: 'per month' },
        imageUrl: { type: String, default: '' },
        available: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
