/**
 * Test script to verify the rooms-overview API endpoint
 * This will make an authenticated request to the API and verify the response
 */
const jwt = require('jsonwebtoken');

const BOARDING_HOUSE_ID = '69c8e90c6c1d9d7a3cd25ff9';
const OWNER_ID = '69c619922f17b48d6c7ea8f2';
const API_BASE_URL = 'http://localhost:5000/api';

// Create a test JWT token
const testToken = jwt.sign(
  {
    userId: OWNER_ID,
    email: 'owner@test.com',
    role: 'owner',
  },
  'your-super-secret-jwt-key-change-this-in-production',
  { expiresIn: '24h' }
);

console.log('🧪 Testing API Endpoint');
console.log('   Boarding House ID:', BOARDING_HOUSE_ID);
console.log('   Owner ID:', OWNER_ID);
console.log('   Test Token:', testToken.substring(0, 50) + '...');

// Make API call
(async () => {
  try {
    const url = `${API_BASE_URL}/owner/boarding-houses/${BOARDING_HOUSE_ID}/rooms-overview`;
    console.log('\n📡 Making API call to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`,
      },
    });

    console.log('📊 Response Status:', response.status);
    console.log('   Response OK:', response.ok);

    const data = await response.json();
    console.log('\n📋 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log('\n✅ SUCCESS! API returned', data.data.length, 'rooms');
      console.log('   Rooms:');
      data.data.forEach((room, idx) => {
        console.log(`   ${idx + 1}. Room ${room.roomNumber}: ${room.name} (${room.occupancyStatus})`);
      });
    } else {
      console.log('\n❌ API returned error:', data.message);
    }
  } catch (error) {
    console.error('❌ Error making API call:', error.message);
  }
})();
