const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    
    const studentId = mongoose.Types.ObjectId.createFromHexString('69c43b43a7bff225fbbe4b79');
    const ownerId = mongoose.Types.ObjectId.createFromHexString('69c619922f17b48d6c7ea8f2');
    
    // Get one of the rooms we just created (Room 102 - Shared Double from first house)
    const room = await db.collection('rooms').findOne({
      ownerId: ownerId,
      roomNumber: '102'
    });

    if (!room) {
      console.error('❌ Room not found');
      process.exit(1);
    }

    console.log(`📍 Using Room: ${room.name} (ID: ${room._id})`);

    // Create booking request
    const bookingRequestData = {
      _id: new mongoose.Types.ObjectId(),
      studentId: studentId,
      ownerId: ownerId,
      roomId: room._id,
      bookingType: 'individual',
      groupName: '',
      groupSize: 1,
      moveInDate: new Date('2026-04-01'),
      durationMonths: 6,
      message: 'Looking for a comfortable shared room near campus. Very interested in this property.',
      status: 'pending',
      rejectionReason: '',
      agreementId: null,
      processedAt: null,
      processedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const bookingRequest = await db.collection('bookingrequests').insertOne(bookingRequestData);
    console.log(`\n✅ Created Booking Request: ${bookingRequest.insertedId}`);

    // Calculate dates for agreement
    const periodStart = new Date('2026-04-01');
    const periodEnd = new Date('2026-10-01');

    // Create booking agreement
    const agreementTerms = `BOARDING HOUSE RENTAL AGREEMENT

1. PARTIES
This agreement is entered into between:
   Owner: ${room.owner || 'Owner Name'}
   Student: Student ID ${studentId}

2. PROPERTY DETAILS
   Address: ${room.location}
   Room: ${room.name}
   Room Number: ${room.roomNumber}
   Bed Count: ${room.bedCount}

3. RENTAL DETAILS
   Monthly Rent: Rs. ${room.price}
   Security Deposit: Rs. ${room.deposit || 0}
   Move-in Date: ${periodStart.toDateString()}
   Contract Period: 6 months
   Move-out Date: ${periodEnd.toDateString()}

4. PAYMENT TERMS
   - Rent is payable on or before the 1st of each month
   - Security deposit is refundable at the end of tenancy (less any deductions)
   - Late payment charges: Rs. 500 per day after the due date

5. HOUSE RULES
   - Quiet hours: 10 PM - 8 AM
   - Visitors must be registered and allowed until 8 PM
   - Smoking and alcohol consumption not permitted
   - Cleanliness of shared spaces is mandatory

6. MAINTENANCE & REPAIRS
   - Owner responsible for structural maintenance
   - Student responsible for maintaining cleanliness and minor repairs
   - Report maintenance issues within 24 hours

7. TERMINATION
   - Either party must provide 30 days written notice for termination
   - Security deposit will be returned within 7 days of move-out

8. DEFAULT & CONSEQUENCES
   - Non-payment of rent for 15 days is grounds for immediate eviction
   - Violation of house rules may result in termination

9. GOVERNING LAW
   - This agreement shall be governed by the laws of Sri Lanka

10. DISPUTE RESOLUTION
    - Any disputes shall be resolved through mutual discussion
    - If unresolved, matter will be escalated to legal authorities`;

    const bookingAgreementData = {
      _id: new mongoose.Types.ObjectId(),
      ownerId: ownerId,
      studentId: studentId,
      roomId: room._id,
      bookingRequestId: bookingRequest.insertedId,
      title: `Boarding Agreement - ${room.name}`,
      terms: agreementTerms,
      rentAmount: room.price,
      depositAmount: room.deposit || 0,
      periodStart: periodStart,
      periodEnd: periodEnd,
      additionalClauses: [
        'Student must maintain a valid national ID at all times',
        'Owner reserves the right to conduct room inspections with 24 hours notice',
        'No sub-letting permitted without written consent',
        'All utilities included in rental price',
      ],
      status: 'sent',
      sentAt: new Date(),
      acceptedAt: null,
      rejectedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const bookingAgreement = await db.collection('bookingagreements').insertOne(bookingAgreementData);
    console.log(`✅ Created Booking Agreement: ${bookingAgreement.insertedId}`);

    // Update booking request to link agreement
    await db.collection('bookingrequests').updateOne(
      { _id: bookingRequest.insertedId },
      { $set: { agreementId: bookingAgreement.insertedId } }
    );

    console.log('\n📋 Booking Request Details:');
    console.log(`   Student ID: ${studentId}`);
    console.log(`   Owner ID: ${ownerId}`);
    console.log(`   Room: ${room.name}`);
    console.log(`   Move-in Date: 2026-04-01`);
    console.log(`   Duration: 6 months`);
    console.log(`   Monthly Rent: Rs. ${room.price}`);
    console.log(`   Security Deposit: Rs. ${room.deposit || 0}`);

    console.log('\n✅ Booking Agreement Details:');
    console.log(`   Agreement ID: ${bookingAgreement.insertedId}`);
    console.log(`   Status: sent (awaiting student acceptance)`);
    console.log(`   Terms: 10-clause standard agreement`);
    console.log(`   Additional Clauses: 4`);

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
