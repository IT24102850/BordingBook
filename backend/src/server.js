const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Start server immediately so the frontend doesn't get connection-refused
// while MongoDB (Atlas free tier) is waking up. Mongoose buffers queries
// automatically until the connection is established.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000, // wait up to 30s for Atlas to wake up
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
