/**
 * FILE: fixPaymentCycleRooms.js
 * PURPOSE: Utility to fix missing roomId references in PaymentCycle records
 * DESCRIPTION: This script identifies payment cycles without room information
 *              and links them to the correct rooms via booking agreements
 * 
 * USAGE: node src/payment/utils/fixPaymentCycleRooms.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const PaymentCycle = require('../../models/PaymentCycle');
const BookingAgreement = require('../../models/BookingAgreement');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boarding-book');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

/**
 * Fix payment cycles that have missing or null roomId
 */
const fixPaymentCycleRooms = async () => {
  try {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  FIXING PAYMENT CYCLE ROOM REFERENCES              ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    // Find all payment cycles
    const allCycles = await PaymentCycle.find({}).populate('studentId', 'fullName email');
    console.log(`📊 Total payment cycles in database: ${allCycles.length}\n`);

    // Identify cycles with missing roomId
    const cyclesWithoutRoom = allCycles.filter(cycle => !cycle.roomId || !cycle.roomId._id);
    console.log(`🔍 Cycles without roomId: ${cyclesWithoutRoom.length}`);

    if (cyclesWithoutRoom.length === 0) {
      console.log('✅ All cycles already have room references! No fixes needed.\n');
      return;
    }

    let fixedCount = 0;
    let errorCount = 0;

    for (const cycle of cyclesWithoutRoom) {
      try {
        console.log(`\n📋 Processing cycle for student: ${cycle.studentId?.fullName || 'Unknown'}`);
        console.log(`   Cycle ID: ${cycle._id}`);
        console.log(`   Student ID: ${cycle.studentId._id}`);
        console.log(`   Boarding House ID: ${cycle.boardingHouseId}`);

        // Find the booking agreement for this student and boarding house
        const agreement = await BookingAgreement.findOne({
          studentId: cycle.studentId._id,
          boardingHouseId: cycle.boardingHouseId,
          status: 'accepted'
        }).populate('roomId');

        if (!agreement) {
          console.log(`   ⚠️  No accepted booking agreement found`);
          errorCount++;
          continue;
        }

        if (!agreement.roomId) {
          console.log(`   ⚠️  Booking agreement exists but no room linked`);
          errorCount++;
          continue;
        }

        // Update the payment cycle with the roomId from agreement
        cycle.roomId = agreement.roomId._id;
        await cycle.save();

        console.log(`   ✅ Fixed! Linked to Room: ${agreement.roomId.roomNumber}`);
        fixedCount++;
      } catch (error) {
        console.error(`   ❌ Error processing cycle: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║  SUMMARY                                           ║`);
    console.log(`╚════════════════════════════════════════════════════╝`);
    console.log(`✅ Cycles fixed: ${fixedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${cyclesWithoutRoom.length}\n`);

  } catch (error) {
    console.error('❌ Error during fix process:', error);
  }
};

/**
 * Verify all cycles now have room references
 */
const verifyFix = async () => {
  try {
    console.log('\n🔍 VERIFICATION CHECK:\n');

    const cyclesWithoutRoom = await PaymentCycle.find({ roomId: { $in: [null, undefined, ''] } });
    const allCycles = await PaymentCycle.find({});

    console.log(`📊 Total cycles: ${allCycles.length}`);
    console.log(`✅ Cycles with room: ${allCycles.length - cyclesWithoutRoom.length}`);
    console.log(`❌ Cycles without room: ${cyclesWithoutRoom.length}`);

    if (cyclesWithoutRoom.length === 0) {
      console.log('\n✅ SUCCESS: All payment cycles now have room references!\n');
    } else {
      console.log('\n⚠️  WARNING: Some cycles still missing rooms. Details:\n');
      for (const cycle of cyclesWithoutRoom) {
        const student = await cycle.populate('studentId', 'fullName');
        console.log(`   - Student: ${student.studentId?.fullName}, Board House: ${cycle.boardingHouseId}`);
      }
      console.log();
    }
  } catch (error) {
    console.error('❌ Verification error:', error);
  }
};

/**
 * Main function to run the fix
 */
const runFix = async () => {
  try {
    await connectDB();
    await fixPaymentCycleRooms();
    await verifyFix();
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
};

// Run if executed directly
if (require.main === module) {
  runFix();
}

module.exports = { fixPaymentCycleRooms, verifyFix };
