const mongoose = require('mongoose');
const env = require('./src/config/env');

mongoose.connect(env.mongoUri).then(async () => {
  try {
    const db = mongoose.connection;
    const ownerId = mongoose.Types.ObjectId.createFromHexString('69c619922f17b48d6c7ea8f2');

    // Create 3 boarding houses with full schema
    const houses = await db.collection('boardinghouses').insertMany([
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Maple Residency',
        address: '45, Galle Road',
        city: 'Colombo 3',
        country: 'Sri Lanka',
        monthlyPrice: 25000,
        roomType: 'Shared Room',
        availableFrom: '2026-03-26',
        deposit: 14000,
        genderPreference: 'Any',
        ownerId: ownerId,
        description: 'Modern premium student boarding with high-speed internet, gym facilities.',
        features: ['WiFi', 'Laundry', 'Parking', 'Common Kitchen', 'Study Room'],
        rating: 0,
        totalReviews: 0,
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
        images: [],
        amenities: ['WiFi', 'Laundry', 'Parking', 'Common Kitchen', 'Study Room', 'Hot Water'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Palm Grove Hostel',
        address: '123 Independence Avenue',
        city: 'Colombo 7',
        country: 'Sri Lanka',
        monthlyPrice: 18000,
        roomType: 'Shared Room',
        availableFrom: '2026-03-26',
        deposit: 12000,
        genderPreference: 'Any',
        ownerId: ownerId,
        description: 'Cozy hostel near university campus with excellent amenities.',
        features: ['WiFi', 'Gym', 'Study Room', 'Common Area'],
        rating: 0,
        totalReviews: 0,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
        images: [],
        amenities: ['WiFi', 'Gym', 'Study Room', 'Common Kitchen', 'Laundry'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Sunrise Apartments',
        address: '78, Hill Road',
        city: 'Colombo 5',
        country: 'Sri Lanka',
        monthlyPrice: 22000,
        roomType: 'Shared Room',
        availableFrom: '2026-03-26',
        deposit: 13000,
        genderPreference: 'Any',
        ownerId: ownerId,
        description: 'Modern apartments with excellent facilities and peaceful environment.',
        features: ['WiFi', 'AC', 'Hot Water', 'Garden', 'Parking'],
        rating: 0,
        totalReviews: 0,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        images: [],
        amenities: ['WiFi', 'AC', 'Hot Water', 'Garden', 'Parking', 'Common Kitchen'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log('✅ Created 3 boarding houses:');
    const houseIds = houses.insertedIds;
    Object.values(houseIds).forEach((id, idx) => {
      console.log(`   ${idx + 1}. House ID: ${id}`);
    });

    // Create 2 rooms for each house with full schema
    const rooms = [];
    const houseDetails = [
      { name: 'Maple Residency', location: '45, Galle Road, Colombo 3' },
      { name: 'Palm Grove Hostel', location: '123 Independence Avenue, Colombo 7' },
      { name: 'Sunrise Apartments', location: '78, Hill Road, Colombo 5' },
    ];

    for (let i = 0; i < Object.keys(houseIds).length; i++) {
      const houseId = Object.values(houseIds)[i];
      const houseName = houseDetails[i].name;
      const location = houseDetails[i].location;

      // Room 1 - 1 bed/Single Room
      rooms.push({
        _id: new mongoose.Types.ObjectId(),
        ownerId: ownerId,
        userId: null,
        houseId: houseId,
        name: `Room 101 - Premium Single`,
        roomNumber: `${101 + i}`,
        floor: 1,
        bedCount: 1,
        location: location,
        price: 28000,
        totalSpots: 1,
        occupancy: 0,
        facilities: ['AC', 'WiFi', 'Attached Bathroom'],
        description: `Single Room in ${houseName}`,
        roomType: 'Single Room',
        genderPreference: 'Any',
        availableFrom: '2026-03-26',
        deposit: 14000,
        roommateCount: 'None',
        owner: 'snsn',
        ownerPhone: '0705283968',
        ownerEmail: 'yasithsnewjp@gmail.com',
        images: [],
        amenities: ['AC', 'WiFi', 'Attached Bathroom', 'Hot Water'],
        rules: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Room 2 - 2 beds/Shared Room
      rooms.push({
        _id: new mongoose.Types.ObjectId(),
        ownerId: ownerId,
        userId: null,
        houseId: houseId,
        name: `Room 102 - Shared Double`,
        roomNumber: `${102 + i}`,
        floor: 1,
        bedCount: 2,
        location: location,
        price: 34000,
        totalSpots: 2,
        occupancy: 0,
        facilities: ['AC', 'WiFi', 'Shared Bathroom'],
        description: `Shared Room with 2 beds in ${houseName}`,
        roomType: 'Shared Room',
        genderPreference: 'Any',
        availableFrom: '2026-03-26',
        deposit: 16000,
        roommateCount: '1',
        owner: 'snsn',
        ownerPhone: '0705283968',
        ownerEmail: 'yasithsnewjp@gmail.com',
        images: [],
        amenities: ['AC', 'WiFi', 'Shared Bathroom', 'Hot Water', 'Common Kitchen'],
        rules: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await db.collection('rooms').insertMany(rooms);

    console.log('\n✅ Created 6 rooms (2 per house):');
    rooms.forEach((room, idx) => {
      console.log(`   ${idx + 1}. ${room.name} (${room.bedCount} bed) - Rs.${room.price}`);
    });

    console.log('\n🎉 Boarding places seeded successfully!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}).catch(e => {
  console.error('❌ DB connection failed:', e.message);
  process.exit(1);
});
