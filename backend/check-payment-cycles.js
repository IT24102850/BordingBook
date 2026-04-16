/**
 * Quick script to check PaymentCycle data for a specific student
 * Usage: node check-payment-cycles.js <studentId>
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './config/.env.local' });

const PaymentCycle = require('./src/models/PaymentCycle');

const studentId = process.argv[2] || '69c43b43a7bff225fbbe4b79';

async function checkPaymentCycles() {
  try {
    console.log('\n📊 Checking PaymentCycles for Student:', studentId);
    console.log('═'.repeat(80));

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Query all cycles for this student
    const allCycles = await PaymentCycle.find({ studentId })
      .sort({ cycleNumber: 1 })
      .lean();

    console.log(`\n📋 Total Cycles Found: ${allCycles.length}\n`);

    if (allCycles.length === 0) {
      console.log('❌ NO PAYMENT CYCLES FOUND for this student!');
      console.log('   This means:');
      console.log('   1. No payments have been approved yet');
      console.log('   2. Student may not have any accepted booking agreements\n');
    } else {
      allCycles.forEach((cycle, idx) => {
        console.log(`\n📌 CYCLE ${idx + 1}:`);
        console.log('   _id:', cycle._id);
        console.log('   studentId:', cycle.studentId);
        console.log('   cycleNumber:', cycle.cycleNumber);
        console.log('   startDate:', cycle.startDate?.toISOString());
        console.log('   dueDate:', cycle.dueDate?.toISOString());
        console.log('   dueDate (Local):', cycle.dueDate?.toLocaleDateString());
        console.log('   paymentStatus:', cycle.paymentStatus);
        console.log('   isActive:', cycle.isActive);
        console.log('   expectedAmount:', cycle.expectedAmount);
      });

      console.log('\n' + '═'.repeat(80));
      
      // Find PENDING cycles
      const pendingCycles = allCycles.filter(c => c.paymentStatus === 'pending');
      console.log(`\n✅ PENDING CYCLES: ${pendingCycles.length}`);
      pendingCycles.forEach(c => {
        console.log(`   Cycle ${c.cycleNumber}: Due ${c.dueDate?.toLocaleDateString()}`);
      });

      // Find ACTIVE cycles
      const activeCycles = allCycles.filter(c => c.isActive === true);
      console.log(`\n✅ ACTIVE CYCLES: ${activeCycles.length}`);
      activeCycles.forEach(c => {
        console.log(`   Cycle ${c.cycleNumber}: Status ${c.paymentStatus}, Due ${c.dueDate?.toLocaleDateString()}`);
      });

      // Find ACTIVE + PENDING (what API should return)
      const nextDueCycle = allCycles.find(c => c.isActive === true && c.paymentStatus === 'pending');
      console.log('\n' + '═'.repeat(80));
      if (nextDueCycle) {
        console.log('\n✅ NEXT DUE DATE (what API should return):');
        console.log(`   dueDate: ${nextDueCycle.dueDate?.toISOString()}`);
        console.log(`   dueDate (Local): ${nextDueCycle.dueDate?.toLocaleDateString()}`);
        console.log(`   cycleNumber: ${nextDueCycle.cycleNumber}`);
      } else {
        console.log('\n❌ NO ACTIVE PENDING CYCLE FOUND');
        console.log('   This is why the calendar is not highlighting!\n');
      }
    }

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPaymentCycles();
