/**
 * Seed script to add rooms to Maple Residency boarding house
 * Boarding House ID: 69c8e90c6c1d9d7a3cd25ff9
 * Owner ID: 69c619922f17b48d6c7ea8f2
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Room = require('../models/Room');
const BoardingHouse = require('../models/BoardingHouse');

const BOARDING_HOUSE_ID = '69c8e90c6c1d9d7a3cd25ff9';
const OWNER_ID = '69c619922f17b48d6c7ea8f2';

async function seedRooms() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Verify boarding house exists
    const boardingHouse = await BoardingHouse.findById(BOARDING_HOUSE_ID);
    if (!boardingHouse) {
      throw new Error('Boarding house not found!');
    }
    console.log('✅ Boarding house verified:', boardingHouse.name);

    // Room 1: Single Room with Study Area
    const room1 = new Room({
      _id: new mongoose.Types.ObjectId('69c61c826fbe4a654a1bbb92'),
      ownerId: new mongoose.Types.ObjectId(OWNER_ID),
      houseId: new mongoose.Types.ObjectId(BOARDING_HOUSE_ID),
      name: 'Single Room with Study Area',
      roomNumber: '101',
      floor: 1,
      bedCount: 1,
      location: 'Ground Floor, Left Wing',
      price: 35000,
      totalSpots: 1,
      occupancy: 0,
      roomType: 'single',
      description: 'Peaceful single room with dedicated study area and window view',
      availableFrom: new Date(),
      genderPreference: 'Any',
      amenities: ['WiFi', 'Desk', 'Wardrobe', 'Window'],
    });

    // Room 2: Modern Double Room
    const room2 = new Room({
      ownerId: new mongoose.Types.ObjectId(OWNER_ID),
      houseId: new mongoose.Types.ObjectId(BOARDING_HOUSE_ID),
      name: 'Modern Double Room',
      roomNumber: '102',
      floor: 1,
      bedCount: 2,
      location: 'First Floor, Right Wing',
      price: 42000,
      totalSpots: 2,
      occupancy: 0,
      roomType: 'double',
      description: 'Spacious double room with modern amenities and walking distance to SLIIT campus',
      availableFrom: new Date(),
      genderPreference: 'Any',
      amenities: ['WiFi', 'AC', 'Attached Bathroom', 'Wardrobe', 'Study Table'],
    });

    // Room 3: Shared Triple Room
    const room3 = new Room({
      ownerId: new mongoose.Types.ObjectId(OWNER_ID),
      houseId: new mongoose.Types.ObjectId(BOARDING_HOUSE_ID),
      name: 'Shared Triple Room',
      roomNumber: '103',
      floor: 2,
      bedCount: 3,
      location: 'Second Floor, Center',
      price: 28000,
      totalSpots: 3,
      occupancy: 0,
      roomType: 'shared',
      description: 'Cost-effective shared triple room with common area access and balcony space',
      availableFrom: new Date(),
      genderPreference: 'Girls',
      amenities: ['WiFi', 'Common Area', 'Balcony Access', 'Shared Bathroom'],
    });

    // Room 4: Premium Double with Balcony
    const room4 = new Room({
      ownerId: new mongoose.Types.ObjectId(OWNER_ID),
      houseId: new mongoose.Types.ObjectId(BOARDING_HOUSE_ID),
      name: 'Premium Double with Balcony',
      roomNumber: '104',
      floor: 2,
      bedCount: 2,
      location: 'Second Floor, Corner',
      price: 48000,
      totalSpots: 2,
      occupancy: 0,
      roomType: 'premium',
      description: 'Premium room with private balcony, air conditioning, and premium furnishings',
      availableFrom: new Date(),
      genderPreference: 'Any',
      amenities: ['WiFi', 'AC', 'Private Balcony', 'Premium Furniture', 'Attached Bathroom', 'TV'],
    });

    console.log('\n📝 Adding rooms to database...\n');

    // Save all rooms
    const savedRoom1 = await room1.save();
    console.log('✅ Room 1 added:', savedRoom1.name, `(${savedRoom1.roomNumber})`);

    const savedRoom2 = await room2.save();
    console.log('✅ Room 2 added:', savedRoom2.name, `(${savedRoom2.roomNumber})`);

    const savedRoom3 = await room3.save();
    console.log('✅ Room 3 added:', savedRoom3.name, `(${savedRoom3.roomNumber})`);

    const savedRoom4 = await room4.save();
    console.log('✅ Room 4 added:', savedRoom4.name, `(${savedRoom4.roomNumber})`);

    console.log('\n📊 Summary:');
    console.log('   Boarding House:', boardingHouse.name);
    console.log('   Rooms Added: 4');
    console.log(`   Room 1: ${savedRoom1.name} - Rs. ${savedRoom1.price}`);
    console.log(`   Room 2: ${savedRoom2.name} - Rs. ${savedRoom2.price}`);
    console.log(`   Room 3: ${savedRoom3.name} - Rs. ${savedRoom3.price}`);
    console.log(`   Room 4: ${savedRoom4.name} - Rs. ${savedRoom4.price}`);

    // Verify rooms were added
    const rooms = await Room.find({ houseId: BOARDING_HOUSE_ID });
    console.log('\n✅ Total rooms in boarding house:', rooms.length);

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding rooms:', error.message);
    process.exit(1);
  }
}

seedRooms();
