const mongoose = require('mongoose');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://boardingbook:QEoN6Cw5gCQPRVSB@boardingbookcluster.pqo9c.mongodb.net/boardingbook?retryWrites=true&w=majority';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    checkPaymentCycles();
  })
  .catch(err => {
    console.error('❌ Failed to connect:', err);
    process.exit(1);
  });

async function checkPaymentCycles() {
  try {
    // Define PaymentCycle schema (minimal for query)
    const paymentCycleSchema = new mongoose.Schema({}, { strict: false });
    const PaymentCycle = mongoose.model('paymentcycle', paymentCycleSchema);

    const studentId = '69c43b43a7bff225fbbe4b79';

    console.log('\n📅 Fetching ALL PaymentCycles for student:', studentId);
    console.log('================================================\n');

    // Find ALL cycles for this student
    const allCycles = await PaymentCycle.find({ studentId }).sort({ cycleNumber: 1 });

    if (allCycles.length === 0) {
      console.log('⚠️  NO payment cycles found for this student');
    } else {
      console.log(`✅ Found ${allCycles.length} payment cycle(s):\n`);
      allCycles.forEach((cycle, index) => {
        console.log(`📋 Cycle ${index + 1}:`);
        console.log('   _id:', cycle._id);
        console.log('   cycleNumber:', cycle.cycleNumber);
        console.log('   isActive:', cycle.isActive);
        console.log('   paymentStatus:', cycle.paymentStatus);
        console.log('   startDate:', cycle.startDate);
        console.log('   dueDate:', cycle.dueDate);
        console.log('   expectedAmount:', cycle.expectedAmount);
        console.log('');
      });
    }

    // Specifically check for active pending cycles
    console.log('\n🔍 Checking for ACTIVE PENDING cycles:');
    console.log('=====================================\n');

    const activePending = await PaymentCycle.findOne({
      studentId,
      isActive: true,
      paymentStatus: 'pending',
    });

    if (activePending) {
      console.log('✅ FOUND active pending cycle:');
      console.log('   _id:', activePending._id);
      console.log('   cycleNumber:', activePending.cycleNumber);
      console.log('   dueDate:', activePending.dueDate);
      console.log('   startDate:', activePending.startDate);
    } else {
      console.log('❌ NO active pending cycle found');
      console.log('   This is why the API returns null!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}
