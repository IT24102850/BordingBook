const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
<<<<<<< Updated upstream
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 30000,  // was 10000, Atlas needs more time
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,                  // reuse up to 10 connections
      minPoolSize: 2,                   // keep 2 alive — avoids cold starts
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,      // ping Atlas every 10s to stay alive
    });

    console.log('✓ MongoDB connected successfully');

    // Monitor connection health
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✓ MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('✗ MongoDB error:', err.message);
    });

    return mongoose;

=======
  let retries = 3;
  let lastError;

  try {
    mongoose.set('strictQuery', true);

    while (retries > 0) {
      try {
        console.log(`🔄 Attempting MongoDB connection (${4 - retries} of 3)...`);
        
        await mongoose.connect(env.mongoUri, {
          serverSelectionTimeoutMS: 30000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 30000,
          retryWrites: true,
          maxPoolSize: 10,
        });

        console.log('✓ MongoDB connected successfully');
        return mongoose;
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0) {
          console.log(`⏳ Connection failed, retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    throw lastError;
>>>>>>> Stashed changes
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    console.error('   Full error:', error);
    throw error;
  }
<<<<<<< Updated upstream
  // ✅ Removed duplicate dead code that was here
=======
>>>>>>> Stashed changes
}

module.exports = { connectDatabase };