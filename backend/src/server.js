const app = require('./app');

const { connectDatabase } = require('./config/database');
const env = require('./config/env');

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start HTTP server
    const server = app.listen(env.port, () => {
      console.log(`✓ Server running on http://localhost:${env.port}`);
      console.log(`✓ Environment: ${env.nodeEnv}`);
      console.log(`✓ Health check: http://localhost:${env.port}/api/health`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n✗ SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('\n✗ SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);

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
