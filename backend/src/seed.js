require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Listing = require('./models/Listing');

const SAMPLE_LISTINGS = [
    {
        title: 'Cozy Single Room — Colombo 3',
        description: 'Clean, furnished single room close to university. Includes WiFi and water. Quiet neighbourhood with easy bus access.',
        type: 'room',
        address: '12 Galle Road, Colombo 3',
        bedrooms: 1,
        price: 15000,
        priceUnit: 'per month',
        imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
        available: true,
    },
    {
        title: 'Modern Apartment — Nugegoda',
        description: 'Spacious 2-bedroom apartment, fully furnished. Ideal for two students sharing. 5 minutes walk from the station.',
        type: 'apartment',
        address: '45 High Level Road, Nugegoda',
        bedrooms: 2,
        price: 35000,
        priceUnit: 'per month',
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
        available: true,
    },
    {
        title: 'Student Hostel Room — Kandy',
        description: 'Affordable hostel accommodation for students. Meals included. Shared bathroom, common study room available.',
        type: 'hostel',
        address: '8 Peradeniya Road, Kandy',
        bedrooms: 1,
        price: 10000,
        priceUnit: 'per month',
        imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
        available: true,
    },
    {
        title: 'Spacious House — Dehiwala',
        description: 'Full house available for a group of students. 4 bedrooms, garden, parking. Very close to main road.',
        type: 'house',
        address: '22 Station Road, Dehiwala',
        bedrooms: 4,
        price: 65000,
        priceUnit: 'per month',
        imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
        available: true,
    },
    {
        title: 'Furnished Room — Moratuwa',
        description: 'Single furnished room in a shared house. Attached bathroom, AC, WiFi included. Safe and quiet environment.',
        type: 'room',
        address: '5 New Road, Moratuwa',
        bedrooms: 1,
        price: 12000,
        priceUnit: 'per month',
        imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80',
        available: true,
    },
    {
        title: 'Studio Apartment — Rajagiriya',
        description: 'Compact studio apartment ideal for a single working student. Kitchenette, AC, attached bathroom. Walking distance to IT park.',
        type: 'apartment',
        address: '17 Parliament Road, Rajagiriya',
        bedrooms: 1,
        price: 28000,
        priceUnit: 'per month',
        imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
        available: true,
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('[INFO] Connected to MongoDB.');

        await Listing.deleteMany({});
        console.log('[INFO] Cleared existing listings.');

        await Listing.insertMany(SAMPLE_LISTINGS);
        console.log(`[INFO] Inserted ${SAMPLE_LISTINGS.length} sample listings.`);
    } catch (err) {
        console.error('[ERROR] Seed failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('[INFO] Done.');
    }
}

seed();
