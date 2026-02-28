require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[INFO] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[ERROR] MongoDB connection failed:', err);
    process.exit(1);
  }
}

start();
