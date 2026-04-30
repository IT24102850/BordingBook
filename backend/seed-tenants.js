const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;

    // Find up to 6 student users to become tenants
    let students = await db.collection('users').find({ role: 'student' }).limit(6).toArray();

    // If no students exist, create a few test student users
    if (!students || students.length === 0) {
      const now = new Date();
      const sample = [
        { email: 'tenant1@example.com', fullName: 'Tenant One', role: 'student', password: 'password' },
        { email: 'tenant2@example.com', fullName: 'Tenant Two', role: 'student', password: 'password' },
        { email: 'tenant3@example.com', fullName: 'Tenant Three', role: 'student', password: 'password' },
      ].map(u => ({ ...u, createdAt: now, updatedAt: now }));

      const res = await db.collection('users').insertMany(sample);
      students = await db.collection('users').find({ _id: { $in: Object.values(res.insertedIds) } }).toArray();
      console.log(`✓ Created ${students.length} test student users`);
    }

    // Find rooms with available spots
    const roomsCursor = await db.collection('rooms').find({ $expr: { $lt: ['$occupancy', '$totalSpots'] } }).limit(students.length);
    const rooms = await roomsCursor.toArray();

    if (!rooms || rooms.length === 0) {
      console.log('No available rooms found to assign tenants. Run seed-boarding-places first.');
      process.exit(0);
    }

    // For each student -> assign to a room by creating booking request + accepted agreement
    for (let i = 0; i < Math.min(students.length, rooms.length); i++) {
      const student = students[i];
      const room = rooms[i];

      const ownerId = room.ownerId;
      const studentId = student._id;

      // Create a booking request
      const bookingRequestData = {
        _id: new mongoose.Types.ObjectId(),
        studentId: studentId,
        ownerId: ownerId,
        roomId: room._id,
        bookingType: 'individual',
        groupName: '',
        groupSize: 1,
        moveInDate: new Date(),
        durationMonths: 6,
        message: 'Seed: Auto-created booking for sample tenant',
        status: 'accepted',
        rejectionReason: '',
        agreementId: null,
        processedAt: new Date(),
        processedBy: ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const bookingReq = await db.collection('bookingrequests').insertOne(bookingRequestData);

      // agreement period
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 6);

      const agreementData = {
        _id: new mongoose.Types.ObjectId(),
        ownerId: ownerId,
        studentId: studentId,
        roomId: room._id,
        bookingRequestId: bookingReq.insertedId,
        title: `Seeded Agreement - ${room.name}`,
        terms: `Seed agreement for ${student.fullName} in room ${room.name}`,
        rentAmount: room.price || 0,
        depositAmount: room.deposit || 0,
        periodStart,
        periodEnd,
        additionalClauses: [],
        status: 'accepted',
        sentAt: new Date(),
        acceptedAt: new Date(),
        rejectedAt: null,
        cancelledAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const bookingAgreement = await db.collection('bookingagreements').insertOne(agreementData);

      // Link agreement to booking request
      await db.collection('bookingrequests').updateOne(
        { _id: bookingReq.insertedId },
        { $set: { agreementId: bookingAgreement.insertedId, status: 'accepted', updatedAt: new Date() } }
      );

      // Update room occupancy
      await db.collection('rooms').updateOne(
        { _id: room._id },
        { $inc: { occupancy: 1 }, $set: { updatedAt: new Date() } }
      );

      console.log(`✓ Assigned ${student.fullName} (${student.email}) to ${room.name}`);
    }

    console.log('\n🎉 Tenants seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding tenants:', err.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('❌ DB connection failed:', e.message);
  process.exit(1);
});
