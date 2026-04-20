const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    
    // Check boarding houses
    const houses = await db.collection('boardinghouses').find({}).toArray();
    console.log('✅ Total houses:', houses.length);
    
    // Check if payment's house exists
    const paymentHouseId = '69c619922f17b48d6c7ea8f2';
    const paymentHouse = await db.collection('boardinghouses').findOne({ 
      _id: mongoose.Types.ObjectId.createFromHexString(paymentHouseId) 
    });
    
    console.log('\n🔍 Payment house exists?', paymentHouse ? '✅ YES' : '❌ NO');
    
    if (paymentHouse) {
      console.log('   Name:', paymentHouse.name);
      console.log('   Owner:', paymentHouse.ownerId);
    } else {
      console.log('\n⚠️ The payment references a MISSING house!');
      console.log('Here are all available houses:');
      houses.forEach(h => {
        console.log(`  - ${h._id} : ${h.name}`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('❌ DB connection failed:', e.message);
  process.exit(1);
});
