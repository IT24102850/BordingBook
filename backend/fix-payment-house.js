const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    
    const paymentId = mongoose.Types.ObjectId.createFromHexString('69c8ed72f70cdfe16f22914f');
    const correctHouseId = mongoose.Types.ObjectId.createFromHexString('69c8e90c6c1d9d7a3cd25ff9');
    
    // Update payment with correct boarding house ID
    const result = await db.collection('studentpayments').updateOne(
      { _id: paymentId },
      { 
        $set: { 
          boardingHouseId: correctHouseId,
          updatedAt: new Date()
        } 
      }
    );
    
    console.log('✅ Payment updated with correct Boarding House ID');
    console.log('   Old ID: 69c619922f17b48d6c7ea8f2 (was OWNER ID)');
    console.log('   New ID: 69c8e90c6c1d9d7a3cd25ff9 (Maple Residency)');
    
    // Verify
    const payment = await db.collection('studentpayments').findOne({ _id: paymentId });
    console.log('\n✅ Verified: Boarding House ID now:', payment.boardingHouseId);
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('DB failed:', e.message);
  process.exit(1);
});
