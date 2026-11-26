const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = require('./app');
const env = require('./config/env');
const { connectDatabase } = require('./config/database');
const { setupChatSocket } = require('./socket/chatSocket');

let server;
let keepAliveInterval; // ✅ track it so we can clear on shutdown

async function startServer() {
  try {
    await connectDatabase();
    console.log('✓ Database connected successfully');

    // ====================== KEEP ATLAS ALIVE ======================
    // Pings Atlas every 5 min so M0 free tier never goes cold
    keepAliveInterval = setInterval(async () => {
      try {
        await mongoose.connection.db.admin().ping();
      } catch (err) {
        console.warn('⚠️ Keep-alive ping failed:', err.message);
      }
    }, 5 * 60 * 1000); // every 5 minutes

    // All routes, the health check and error handlers are registered in app.js

    // ====================== START SERVER ======================
    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: (origin, cb) => cb(null, env.isAllowedOrigin(origin)),
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true,
      },
    });

    setupChatSocket(io);
    app.locals.io = io;

    server = httpServer.listen(env.port, () => {
      console.log(`✓ Server running on port ${env.port}`);
      console.log(`✓ Environment: ${env.nodeEnv}`);
      console.log(`✓ Health check: /api/health`);
      console.log(`✓ Atlas keep-alive: every 5 minutes`);
    });

  } catch (error) {
    console.error('✗ Server startup failed:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);
  clearInterval(keepAliveInterval); // ✅ stop ping on shutdown
  if (server) {
    server.close(async () => {
      await mongoose.connection.close(false);
      console.log('✓ Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();