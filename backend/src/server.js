const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const env = require('./config/env');
const { connectDatabase } = require('./config/database');
const { setupChatSocket } = require('./socket/chatSocket');

let server;

async function startServer() {
  try {
    await connectDatabase();

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: env.allowedOrigins,
        methods: ['GET', 'POST', 'PATCH'],
        credentials: true,
      },
    });

    setupChatSocket(io);
    app.locals.io = io;

    server = httpServer.listen(env.port, () => {
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
