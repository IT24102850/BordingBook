const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    
    // Delete all StudentPayment records
    const result = await db.collection('studentpayments').deleteMany({});
    
    console.log('✅ All StudentPayment records deleted!');
    console.log('   Deleted count:', result.deletedCount);
    
    // Verify deletion
    const remaining = await db.collection('studentpayments').countDocuments();
    console.log('   Remaining records:', remaining);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('❌ DB connection failed:', e.message);
  process.exit(1);
});
