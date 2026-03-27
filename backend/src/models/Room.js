const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BoardingHouse',
  },
  name: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: String,
    default: '',
  },
  floor: {
    type: Number,
    default: 1,
    min: 1,
  },
  bedCount: {
    type: Number,
    default: 1,
    min: 1,
  },
  location: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 5000,
    max: 50000,
  },
  totalSpots: {
    type: Number,
    required: true,
    min: 1,
  },
  occupancy: {
    type: Number,
    default: 0,
    min: 0,
  },
  facilities: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    default: '',
  },
  roomType: {
    type: String,
    default: 'Single Room',
  },
  genderPreference: {
    type: String,
    default: 'Any',
  },
  availableFrom: {
    type: String,
    default: '',
  },
  deposit: {
    type: Number,
    default: 0,
    min: 0,
  },
  roommateCount: {
    type: String,
    default: 'None',
  },
  owner: {
    type: String,
    default: '',
  },
  ownerPhone: {
    type: String,
    default: '',
  },
  ownerEmail: {
    type: String,
    default: '',
  },
  images: {
    type: [String],
    default: [],
  },
  amenities: {
    type: [String],
    default: [],
  },
  rules: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for vacancy
roomSchema.virtual('vacancy').get(function () {
  return this.totalSpots - this.occupancy;
});

// Update timestamp on save
roomSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Room', roomSchema);
