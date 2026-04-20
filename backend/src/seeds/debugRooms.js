/**
 * Debug script to check if rooms exist in database for a specific boarding house
 * Boarding House ID: 69c8e90c6c1d9d7a3cd25ff9
 * Owner ID: 69c619922f17b48d6c7ea8f2
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Room = require('../models/Room');
const BoardingHouse = require('../models/BoardingHouse');

const BOARDING_HOUSE_ID = '69c8e90c6c1d9d7a3cd25ff9';
const OWNER_ID = '69c619922f17b48d6c7ea8f2';

async function checkRooms() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if boarding house exists
    console.log('📍 Checking Boarding House:');
    const boardingHouse = await BoardingHouse.findById(BOARDING_HOUSE_ID);
    console.log('   Boarding House ID:', BOARDING_HOUSE_ID);
    
    if (boardingHouse) {
      console.log('   ✅ FOUND!');
      console.log('   Name:', boardingHouse.name);
      console.log('   Owner ID:', boardingHouse.ownerId?.toString());
      console.log('   Owner ID Match:', boardingHouse.ownerId?.toString() === OWNER_ID ? '✅ YES' : '❌ NO');
    } else {
      console.log('   ❌ NOT FOUND!');
    }

    // Check all rooms in database
    console.log('\n📋 All Rooms in Database:');
    const allRooms = await Room.find({});
    console.log('   Total rooms:', allRooms.length);
    
    if (allRooms.length > 0) {
      allRooms.forEach((room, i) => {
        console.log(`\n   Room ${i+1}:`);
        console.log(`      ID: ${room._id}`);
        console.log(`      Name: ${room.name}`);
        console.log(`      Number: ${room.roomNumber}`);
        console.log(`      House ID: ${room.houseId}`);
        console.log(`      Owner ID: ${room.ownerId}`);
        console.log(`      Price: ${room.price}`);
      });
    }

    // Check rooms for THIS boarding house
    console.log('\n\n🏠 Rooms for THIS Boarding House:');
    console.log('   Searching with houseId:', BOARDING_HOUSE_ID);
    
    const roomsForHouse = await Room.find({ houseId: BOARDING_HOUSE_ID });
    console.log('   Found:', roomsForHouse.length, 'rooms');
    
    if (roomsForHouse.length > 0) {
      roomsForHouse.forEach((room, i) => {
        console.log(`\n   Room ${i+1}:`);
        console.log(`      ID: ${room._id}`);
        console.log(`      Name: ${room.name}`);
        console.log(`      Number: ${room.roomNumber}`);
        console.log(`      House ID: ${room.houseId}`);
        console.log(`      Owner ID: ${room.ownerId}`);
        console.log(`      Price: Rs. ${room.price}`);
        console.log(`      Beds: ${room.bedCount}`);
        console.log(`      Location: ${room.location}`);
      });
    } else {
      console.log('   ❌ NO ROOMS FOUND for this boarding house!');
    }

    // Check by ObjectId
    console.log('\n\n🔎 Checking with ObjectId conversion:');
    const houseObjectId = new mongoose.Types.ObjectId(BOARDING_HOUSE_ID);
    const roomsByObjectId = await Room.find({ houseId: houseObjectId });
    console.log('   Found:', roomsByObjectId.length, 'rooms');

    console.log('\n✅ Debug complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkRooms();
