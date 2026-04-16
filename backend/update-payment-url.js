const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    
    const newUrl = '/uploads/payments/69c43b43a7bff225fbbe4b79/1774775666394_WhatsApp_Image_2026-03-28_at_19.53.28.jpeg';
    const newPath = '1774775666394_WhatsApp_Image_2026-03-28_at_19.53.28.jpeg';
    
    const result = await db.collection('studentpayments').updateOne(
      { _id: mongoose.Types.ObjectId.createFromHexString('69c8ed72f70cdfe16f22914f') },
      { $set: { paymentSlipUrl: newUrl, paymentSlipPath: newPath } }
    );
    
    console.log('✅ Payment URL updated');
    console.log('   Old URL: /uploads/payments/69c43b43a7bff225fbbe4b79/1774775666394_WhatsApp Image 2026-03-28 at 19.53.28.jpeg');
    console.log('   New URL: ' + newUrl);
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('DB failed:', e.message);
  process.exit(1);
});
