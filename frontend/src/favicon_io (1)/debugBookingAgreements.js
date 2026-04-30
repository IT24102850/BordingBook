/**
 * Debug script to check booking agreements and tenant data
 */
require('dotenv').config({ path: '/../../.env' });
const mongoose = require('mongoose');
const env = require('../config/env');
const BookingAgreement = require('../models/BookingAgreement');
const PaymentCycle = require('../models/PaymentCycle');
const Room = require('../models/Room');
const User = require('../models/User');

const BOARDING_HOUSE_ID = '69c8e90c6c1d9d7a3cd25ff9';
const ROOM_101_ID = '69c61c826fbe4a654a1bbb92';

(async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(env.mongoUri);
    console.log('✅ Connected\n');

    // Check all booking agreements for this boarding house
    console.log('📋 All Booking Agreements for this Boarding House:');
    const allAgreements = await BookingAgreement.find({
      boardingHouseId: BOARDING_HOUSE_ID
    }).populate('studentId', 'fullName email').populate('roomId', 'roomNumber');
    
    console.log(`   Total: ${allAgreements.length}\n`);
    allAgreements.forEach((agr, idx) => {
      console.log(`   ${idx + 1}. Student: ${agr.studentId?.fullName || 'Unknown'}`);
      console.log(`      Room: ${agr.roomId?.roomNumber || 'Unknown'}`);
      console.log(`      Status: ${agr.status}`);
      console.log(`      Check-in: ${agr.checkInDate}\n`);
    });

    // Check specifically for Room 101
    console.log('🏠 Booking Agreements for Room 101:');
    const room101Agreements = await BookingAgreement.find({
      roomId: ROOM_101_ID
    }).populate('studentId', 'fullName email').populate('roomId', 'roomNumber');
    
    console.log(`   Total: ${room101Agreements.length}\n`);
    room101Agreements.forEach((agr, idx) => {
      console.log(`   ${idx + 1}. Student: ${agr.studentId?.fullName || 'Unknown'}`);
      console.log(`      Status: ${agr.status}`);
      console.log(`      ID: ${agr._id}\n`);
    });

    // Check for "accepted" status agreements
    console.log('✅ ACCEPTED Booking Agreements for Room 101:');
    const acceptedAgreements = await BookingAgreement.find({
      roomId: ROOM_101_ID,
      status: 'accepted'
    }).populate('studentId', 'fullName email');
    
    console.log(`   Total: ${acceptedAgreements.length}\n`);
    if (acceptedAgreements.length === 0) {
      console.log('   ⚠️  No accepted agreements found!');
      console.log('   This might be why tenants aren\'t displaying.\n');
    }

    // Check room 101 data
    console.log('📍 Room 101 Details:');
    const room101 = await Room.findById(ROOM_101_ID);
    console.log(`   Name: ${room101?.name}`);
    console.log(`   Number: ${room101?.roomNumber}`);
    console.log(`   Beds: ${room101?.bedCount}`);
    console.log(`   Price: ${room101?.price}\n`);

    // Check payment cycles
    console.log('💳 Payment Cycles for this Boarding House:');
    const cycles = await PaymentCycle.find({
      boardingHouseId: BOARDING_HOUSE_ID
    }).populate('studentId', 'fullName').populate('roomId', 'roomNumber');
    
    console.log(`   Total: ${cycles.length}\n`);
    cycles.forEach((cycle, idx) => {
      console.log(`   ${idx + 1}. Student: ${cycle.studentId?.fullName || 'Unknown'}`);
      console.log(`      Room: ${cycle.roomId?.roomNumber || 'Unknown'}`);
      console.log(`      Status: ${cycle.paymentStatus}`);
      console.log(`      Due: ${cycle.dueDate}\n`);
    });

    console.log('✅ Debug complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
