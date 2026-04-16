const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    
    const brId = mongoose.Types.ObjectId.createFromHexString('69c8ebc7baf9e70c2f090f48');
    const baId = mongoose.Types.ObjectId.createFromHexString('69c8ebc7baf9e70c2f090f4a');
    const ownerId = mongoose.Types.ObjectId.createFromHexString('69c619922f17b48d6c7ea8f2');
    
    // Update booking request status to approved
    const brResult = await db.collection('bookingrequests').updateOne(
      { _id: brId },
      { 
        $set: { 
          status: 'approved',
          processedAt: new Date(),
          processedBy: ownerId,
          updatedAt: new Date()
        } 
      }
    );
    
    // Update booking agreement status to accepted
    const baResult = await db.collection('bookingagreements').updateOne(
      { _id: baId },
      { 
        $set: { 
          status: 'accepted',
          acceptedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    
    console.log('✅ Booking Request Updated:');
    console.log('   Status: pending -> approved');
    console.log('   Processed By (Owner ID): ' + ownerId);
    console.log('   Processed At: ' + new Date().toISOString());
    
    console.log('\n✅ Booking Agreement Updated:');
    console.log('   Status: sent -> accepted');
    console.log('   Accepted At: ' + new Date().toISOString());
    
    // Verify updates
    const updatedBr = await db.collection('bookingrequests').findOne({ _id: brId });
    const updatedBa = await db.collection('bookingagreements').findOne({ _id: baId });
    
    console.log('\n📋 VERIFICATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Booking Request Status: ' + updatedBr.status);
    console.log('Booking Agreement Status: ' + updatedBa.status);
    console.log('Agreement Accepted At: ' + updatedBa.acceptedAt.toDateString());
    console.log('\n🎉 Both documents successfully updated!');
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('DB failed:', e.message);
  process.exit(1);
});
