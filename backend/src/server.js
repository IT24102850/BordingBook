const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = require('./app');                    // Your Express app
const env = require('./config/env');
const { connectDatabase } = require('./config/database');
const { setupChatSocket } = require('./socket/chatSocket');

// Import your route files here
const adminRoutes = require('./routes/admin');     // ← Add this
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/user');
// etc.

let server;

async function startServer() {
  try {
    await connectDatabase();
    console.log('✓ Database connected');

    // ====================== MOUNT ALL ROUTES HERE ======================
    // Important: Put these BEFORE any 404 handler

    app.use('/api/admin', adminRoutes);           // ← This was missing!
    // app.use('/api/auth', authRoutes);
    // app.use('/api/users', userRoutes);
    // app.use('/api/roommates', roommateRoutes);
    // ... add all your other route groups

    // Optional: Health check route
    app.get('/api/health', (req, res) => {
      res.json({ 
        success: true, 
        message: 'Server is healthy',
        environment: env.nodeEnv,
        timestamp: new Date().toISOString()
      });
    });

    // ====================== 404 HANDLER (MUST BE LAST) ======================
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
      });
    });

    // ====================== START SERVER ======================
    const httpServer = http.createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: env.allowedOrigins,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true,
      },
    });

    setupChatSocket(io);
    app.locals.io = io;   // if you need it elsewhere

    server = httpServer.listen(env.port, () => {
      console.log(`✓ Server running on port ${env.port}`);
      console.log(`✓ Environment: ${env.nodeEnv}`);
      console.log(`✓ Health check → http://localhost:${env.port}/api/health`);
      console.log(`✓ Admin login → /api/admin/login`);
    });

  } catch (error) {
    console.error('✗ Server startup failed:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);
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