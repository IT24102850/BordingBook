#!/usr/bin/env node

/**
 * Database Seeding Script
 * Populates MongoDB with test room data
 * Run: node backend/seed-rooms.js
 */

const mongoose = require('mongoose');
const env = require('./src/config/env');
const Room = require('./src/models/Room');

const testRooms = [
  {
    name: 'Modern Single Room - Malabe',
    location: 'Malabe',
    price: 12000,
    totalSpots: 1,
    occupancy: 0,
    roomType: 'Single',
    facilities: ['WiFi', 'AC', 'Parking'],
    description: 'Modern single room with high-speed internet and air conditioning',
    owner: 'Mr. Perera',
    ownerPhone: '+94771234567',
    ownerEmail: 'perera@email.com',
    campus: 'SLIIT Malabe',
    distKm: 0.5,
    rating: 4.5,
    reviewCount: 12,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506911-5c200b0e2f4b?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Furnished', 'Attached Bathroom', 'Fan', 'Curtains'],
    rules: ['No smoking', 'No pets', 'Quiet hours 10 PM - 8 AM'],
    genderPreference: 'Any',
    deposit: 24000,
    coordinates: {
      type: 'Point',
      coordinates: [80.6338, 6.9157], // Malabe coordinates
    },
    isActive: true,
  },
  {
    name: 'Master Room with WiFi & Meals',
    location: 'Nugegoda',
    price: 18000,
    totalSpots: 2,
    occupancy: 1,
    roomType: 'Master',
    facilities: ['WiFi', 'Meals', 'Laundry', 'Security'],
    description: 'Spacious master room with meals included and common kitchen',
    owner: 'Mrs. Silva',
    ownerPhone: '+94772345678',
    ownerEmail: 'silva@email.com',
    campus: 'UOM',
    distKm: 3.2,
    rating: 4.8,
    reviewCount: 24,
    images: [
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Furnished', 'Attached Bathroom', 'Kitchen Access', 'Balcony'],
    rules: ['No smoking', 'Guest policy - 1 night per week', 'Shared laundry'],
    genderPreference: 'Female',
    deposit: 36000,
    coordinates: {
      type: 'Point',
      coordinates: [80.6450, 6.8889], // Nugegoda coordinates
    },
    isActive: true,
  },
  {
    name: 'Affordable Shared Room - Homagama',
    location: 'Homagama',
    price: 9000,
    totalSpots: 3,
    occupancy: 1,
    roomType: 'Sharing',
    facilities: ['WiFi', 'Parking'],
    description: 'Budget-friendly shared room in secure boarding environment',
    owner: 'Mr. Jayarathne',
    ownerPhone: '+94773456789',
    ownerEmail: 'jayarathne@email.com',
    campus: 'NSBM',
    distKm: 1.8,
    rating: 4.2,
    reviewCount: 18,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Basic Furniture', 'Shared Bathroom', 'Common Area'],
    rules: ['No smoking', 'Visitors by permission', 'Quiet hours 11 PM - 7 AM'],
    genderPreference: 'Male',
    deposit: 18000,
    coordinates: {
      type: 'Point',
      coordinates: [80.7003, 6.8242], // Homagama coordinates
    },
    isActive: true,
  },
  {
    name: 'Premium Single with AC & Meals',
    location: 'Colombo 3',
    price: 16000,
    totalSpots: 1,
    occupancy: 0,
    roomType: 'Single',
    facilities: ['WiFi', 'AC', 'Meals', 'Security'],
    description: 'Premium single room with breakfast included, 24/7 security',
    owner: 'Dr. Kodithuwakku',
    ownerPhone: '+94774567890',
    ownerEmail: 'kodithuwakku@email.com',
    campus: 'UOC',
    distKm: 2.1,
    rating: 5.0,
    reviewCount: 8,
    images: [
      'https://images.unsplash.com/photo-1598928506911-5c200b0e2f4b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Fully Furnished', 'Attached Bathroom', 'Study Area', 'Hot Water'],
    rules: ['No smoking', 'No pets'],
    genderPreference: 'Any',
    deposit: 32000,
    coordinates: {
      type: 'Point',
      coordinates: [80.7566, 6.8847], // Colombo 3 coordinates
    },
    isActive: true,
  },
  {
    name: 'Student Sharing Room - Kaduwela',
    location: 'Kaduwela',
    price: 10500,
    totalSpots: 2,
    occupancy: 0,
    roomType: 'Sharing',
    facilities: ['WiFi', 'Parking', 'Laundry'],
    description: 'Comfortable sharing room for students, near bus stand',
    owner: 'Mr. Fernando',
    ownerPhone: '+94775678901',
    ownerEmail: 'fernando@email.com',
    campus: 'USJP',
    distKm: 2.5,
    rating: 4.3,
    reviewCount: 15,
    images: [
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Furnished', 'Shared Bathroom', 'Common Kitchen', 'TV Room'],
    rules: ['No smoking in rooms', 'Visitors 2-5 PM', 'Shared cooking time'],
    genderPreference: 'Female',
    deposit: 21000,
    coordinates: {
      type: 'Point',
      coordinates: [80.5989, 6.8511], // Kaduwela coordinates
    },
    isActive: true,
  },
  {
    name: 'Annex with Independent Entrance',
    location: 'Nawala',
    price: 14000,
    totalSpots: 1,
    occupancy: 0,
    roomType: 'Annex',
    facilities: ['WiFi', 'AC', 'Parking'],
    description: 'Semi-independent annex with kitchenette and private entrance',
    owner: 'Ms. Gunasekera',
    ownerPhone: '+94776789012',
    ownerEmail: 'gunasekera@email.com',
    campus: 'SLIIT Malabe',
    distKm: 4.2,
    rating: 4.6,
    reviewCount: 10,
    images: [
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Fully Furnished', 'Kitchenette', 'Attached Bathroom', 'Independent Entrance'],
    rules: ['No parties', 'No pets', '1 month notice for vacation'],
    genderPreference: 'Any',
    deposit: 28000,
    coordinates: {
      type: 'Point',
      coordinates: [80.6172, 6.8725], // Nawala coordinates
    },
    isActive: true,
  },
  {
    name: 'Luxury Master with Gym',
    location: 'Kirulapone',
    price: 22000,
    totalSpots: 2,
    occupancy: 1,
    roomType: 'Master',
    facilities: ['WiFi', 'AC', 'Meals', 'Gym', 'Security'],
    description: 'Luxury master room with access to in-house gym and pool',
    owner: 'Mr. Wickramasinghe',
    ownerPhone: '+94777890123',
    ownerEmail: 'wickramasinghe@email.com',
    campus: 'UOM',
    distKm: 5.1,
    rating: 4.9,
    reviewCount: 20,
    images: [
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506911-5c200b0e2f4b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: [
      'Fully Furnished',
      'Attached Bathroom',
      'Balcony',
      'Gym Access',
      'Pool Access',
      'Common Lounge',
    ],
    rules: ['No smoking', 'Guest policy - 1 night per week', 'Respectful behavior'],
    genderPreference: 'Any',
    deposit: 44000,
    coordinates: {
      type: 'Point',
      coordinates: [80.5881, 6.9131], // Kirulapone coordinates
    },
    isActive: true,
  },
  {
    name: 'Budget Single Room - Malabe',
    location: 'Malabe',
    price: 8500,
    totalSpots: 1,
    occupancy: 0,
    roomType: 'Single',
    facilities: ['WiFi'],
    description: 'Simple and clean single room for budget-conscious students',
    owner: 'Mr. Senaratne',
    ownerPhone: '+94778901234',
    ownerEmail: 'senaratne@email.com',
    campus: 'SLIIT Malabe',
    distKm: 0.8,
    rating: 3.9,
    reviewCount: 22,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Basic Furniture', 'Shared Bathroom', 'Common Area'],
    rules: ['No smoking', 'No loud noise', 'Visitors by permission'],
    genderPreference: 'Male',
    deposit: 17000,
    coordinates: {
      type: 'Point',
      coordinates: [80.6338, 6.9157], // Malabe coordinates
    },
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('Connected to MongoDB');

    // Clear existing rooms
    await Room.deleteMany({});
    console.log('Cleared existing rooms');

    // Insert test rooms
    const insertedRooms = await Room.insertMany(testRooms);
    console.log(`Successfully inserted ${insertedRooms.length} test rooms`);

    // Show inserted rooms
    const rooms = await Room.find({});
    console.log('\nInserted Rooms:');
    rooms.forEach((room) => {
      console.log(`- ${room.name} (Rs. ${room.price}, Rating: ${room.rating})`);
    });

    console.log('\nDatabase seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
