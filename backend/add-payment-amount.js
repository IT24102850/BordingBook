const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    
    const paymentId = mongoose.Types.ObjectId.createFromHexString('69c8ed72f70cdfe16f22914f');
    const roomId = mongoose.Types.ObjectId.createFromHexString('69c61c826fbe4a654a1bbb92');
    
    const room = await db.collection('rooms').findOne({ _id: roomId });
    const roomPrice = room.price;
    
    // Update payment with amount
    await db.collection('studentpayments').updateOne(
      { _id: paymentId },
      { $set: { amount: roomPrice, updatedAt: new Date() } }
    );
    
    console.log('✅ Payment amount added: Rs.' + roomPrice);
    
    const payment = await db.collection('studentpayments').findOne({ _id: paymentId });
    console.log('Verified Amount:', payment.amount);
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('DB failed:', e.message);
  process.exit(1);
});
