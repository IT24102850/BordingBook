const app = require('./app');
const mongoose = require('mongoose');
const env = require('./config/env');
const { connectDatabase } = require('./config/database');

let server;

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);
  if (server) {
    server.close(async () => {
      await mongoose.connection.close(false);
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
