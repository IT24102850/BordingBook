const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    const ownerId = mongoose.Types.ObjectId.createFromHexString('69c619922f17b48d6c7ea8f2');
    
    const houses = await db.collection('boardinghouses').find({ ownerId }).toArray();
    const houseIds = houses.map(h => h._id);
    
    const payment = await db.collection('studentpayments').findOne({
      boardingHouseId: { $in: houseIds },
      status: 'submitted'
    });
    
    console.log('✅ PAYMENT FOUND IN OWNER GALLERY QUERY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Payment ID:', payment._id);
    console.log('Student ID:', payment.studentId);
    console.log('Amount: Rs.' + payment.amount);
    console.log('Status:', payment.status);
    console.log('Slip URL:', payment.paymentSlipUrl);
    console.log('Boarding House:', houses.find(h => h._id.toString() === payment.boardingHouseId.toString()).name);
    
    console.log('\n🎉 Payment is now ready to display in owner dashboard!');
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}).catch(e => {
  console.error('DB failed:', e.message);
  process.exit(1);
});
