const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    const payment = await db.collection('studentpayments').findOne({ status: 'submitted' }, { sort: { createdAt: -1 } });
    
    console.log('Payment Record in DB:');
    console.log(JSON.stringify({
      _id: payment._id,
      paymentAmount: payment.paymentAmount,
      paymentSlipUrl: payment.paymentSlipUrl,
      paymentSlipPath: payment.paymentSlipPath,
      uploadedAt: payment.uploadedAt,
      status: payment.status
    }, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('DB failed:', e.message);
  process.exit(1);
});
