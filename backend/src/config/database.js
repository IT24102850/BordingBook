const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('✓ MongoDB connected successfully');
    return mongoose;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    throw error;
  }
}

module.exports = {
  connectDatabase,
};
