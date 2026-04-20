const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    
    const studentId = mongoose.Types.ObjectId.createFromHexString('69c43b43a7bff225fbbe4b79');
    const ownerId = mongoose.Types.ObjectId.createFromHexString('69c619922f17b48d6c7ea8f2');

    // Get the first room that was created
    const room = await db.collection('rooms').findOne({ 
      ownerId: ownerId
    });

    if (!room) {
      console.error('❌ Room not found');
      process.exit(1);
    }

    console.log('Found room:', room.name, 'with houseId:', room.houseId);

    console.log('Found room:', room.name, 'with houseId:', room.houseId);

    // Get the boarding house
    const house = await db.collection('boardinghouses').findOne({ 
      _id: new mongoose.Types.ObjectId(room.houseId.toString())
    });

    if (!house) {
      console.error('❌ Boarding house not found with id:', room.houseId);
      // Try fetching any house and listing
      const allHouses = await db.collection('boardinghouses').find({}).toArray();
      console.log('Available houses:', allHouses.map(h => ({ name: h.name, id: h._id })));
      process.exit(1);
    }

    // Create Booking Agreement
    const agreementId = new mongoose.Types.ObjectId();
    const agreement = {
      _id: agreementId,
      studentId: studentId,
      ownerId: ownerId,
      roomId: room._id,
      houseId: house._id,
      agreementType: 'Boarding Agreement',
      studentName: 'Student Name',
      studentEmail: 'it24102850@my.sliit.lk',
      studentPhone: '0712345678',
      roomNumber: room.roomNumber,
      roomName: room.name,
      houseName: house.name,
      houseAddress: house.address,
      houseCity: house.city,
      monthlyRent: room.price,
      deposit: room.deposit,
      availableFrom: room.availableFrom,
      leaseTermMonths: 6,
      termsAccepted: true,
      agreementStatus: 'Active',
      signedDate: new Date(),
      startDate: new Date('2026-03-26'),
      endDate: new Date('2026-09-26'),
      paymentCycle: 30,
      features: house.features || [],
      amenities: room.amenities || [],
      rules: room.rules || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('bookingagreements').insertOne(agreement);
    console.log('✅ Booking Agreement Created:');
    console.log(`   _id: ${agreementId}`);
    console.log(`   studentId: ${studentId}`);
    console.log(`   roomId: ${room._id}`);
    console.log(`   Room: ${room.name}`);
    console.log(`   House: ${house.name}`);
    console.log(`   Monthly Rent: Rs.${room.price}`);
    console.log(`   Status: Active`);

    // Create Booking Request (for history/reference)
    const bookingRequest = {
      _id: new mongoose.Types.ObjectId(),
      studentId: studentId,
      ownerId: ownerId,
      roomId: room._id,
      houseId: house._id,
      studentName: 'Student Name',
      studentEmail: 'it24102850@my.sliit.lk',
      roomName: room.name,
      houseName: house.name,
      requestStatus: 'Approved',
      approvedDate: new Date(),
      agreementId: agreementId,
      createdAt: new Date('2026-03-20'),
      updatedAt: new Date(),
    };

    await db.collection('bookingrequests').insertOne(bookingRequest);
    console.log('\n✅ Booking Request Created:');
    console.log(`   _id: ${bookingRequest._id}`);
    console.log(`   studentId: ${studentId}`);
    console.log(`   requestStatus: Approved`);
    console.log(`   agreementId linked: ${agreementId}`);

    // Update room occupancy
    await db.collection('rooms').updateOne(
      { _id: room._id },
      { 
        $set: { 
          occupancy: 1,
          userId: studentId,
          updatedAt: new Date()
        }
      }
    );
    console.log('\n✅ Room Occupancy Updated:');
    console.log(`   Room ${room.roomNumber} - Occupancy: 1/${room.totalSpots}`);

    console.log('\n🎉 Booking request and agreement created successfully!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('❌ DB connection failed:', e.message);
  process.exit(1);
});
