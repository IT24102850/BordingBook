const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    
    const studentId = mongoose.Types.ObjectId.createFromHexString('69c43b43a7bff225fbbe4b79');
    const ownerId = mongoose.Types.ObjectId.createFromHexString('69c619922f17b48d6c7ea8f2');
    
    // Get the payment submitted by student
    const payment = await db.collection('studentpayments').findOne({ studentId }, { sort: { createdAt: -1 } });
    
    if (!payment) {
      console.log('❌ No payment found for student');
      process.exit(1);
    }
    
    console.log('📄 STUDENT PAYMENT DETAILS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Payment ID:', payment._id);
    console.log('Student ID:', payment.studentId);
    console.log('Room ID:', payment.roomId);
    console.log('Boarding House ID:', payment.boardingHouseId);
    console.log('Status:', payment.status);
    console.log('Amount:', payment.amount);
    console.log('Payment Slip URL:', payment.paymentSlipUrl);
    
    // Check room details
    const room = await db.collection('rooms').findOne({ _id: payment.roomId });
    console.log('\n🏠 ROOM DETAILS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Room Name:', room ? room.name : 'NOT FOUND');
    console.log('Room Owner ID:', room ? room.ownerId : 'N/A');
    console.log('Room Owner ID matches expected owner?', room && room.ownerId.toString() === ownerId.toString() ? 'YES ✅' : 'NO ❌');
    
    // Check boarding house details
    const house = await db.collection('boardinghouses').findOne({ _id: payment.boardingHouseId });
    console.log('\n🏢 BOARDING HOUSE DETAILS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('House Name:', house ? house.name : 'NOT FOUND');
    console.log('House Owner ID:', house ? house.ownerId : 'N/A');
    console.log('House Owner ID matches expected owner?', house && house.ownerId.toString() === ownerId.toString() ? 'YES ✅' : 'NO ❌');
    
    // Check owner's boarding houses
    const ownerHouses = await db.collection('boardinghouses').find({ ownerId }).toArray();
    console.log('\n📍 OWNER BOARDING HOUSES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Total houses owned by this owner:', ownerHouses.length);
    ownerHouses.forEach(h => {
      console.log('  - ' + h.name + ' (ID: ' + h._id + ')');
    });
    
    // Check if payment's house is in owner's houses
    const paymentHouseInOwnerList = ownerHouses.find(h => h._id.toString() === payment.boardingHouseId.toString());
    console.log('\nIs payment house in owner list?', paymentHouseInOwnerList ? 'YES ✅' : 'NO ❌');
    
    // Simulate what backend getPendingPayments does
    console.log('\n🔍 SIMULATING BACKEND getPendingPayments');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const houseIds = ownerHouses.map(h => h._id);
    console.log('House IDs:', houseIds);
    
    const pendingPayments = await db.collection('studentpayments').find({
      boardingHouseId: { $in: houseIds },
      status: 'submitted'
    }).toArray();
    
    console.log('Pending payments found:', pendingPayments.length);
    if (pendingPayments.length > 0) {
      pendingPayments.forEach(p => {
        console.log('  - Payment ID:', p._id, 'Amount: Rs.' + p.amount, 'Status:', p.status);
      });
    }
    
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
