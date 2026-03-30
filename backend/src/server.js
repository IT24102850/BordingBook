const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = require('./app');
const env = require('./config/env');
const { connectDatabase } = require('./config/database');
const { setupChatSocket } = require('./socket/chatSocket');

let server;

async function startServer() {
  try {
    await connectDatabase();
    console.log('✓ Database connected successfully');

    // ====================== MOUNT ALL ROUTES HERE ======================
    // Use the exact filenames from your routes folder

    // Admin Routes - We will create this file next
    try {
      const adminRoutes = require('./routes/adminRoutes');
      app.use('/api/admin', adminRoutes);
      console.log('✓ Admin routes mounted successfully');
    } catch (err) {
      console.warn('⚠️ Could not load adminRoutes:', err.message);
    }

    // Other existing routes (uncomment when ready)
    try {
      const authRoutes = require('./routes/authRoutes');
      app.use('/api/auth', authRoutes);
      console.log('✓ Auth routes mounted');
    } catch (err) {
      console.warn('⚠️ Could not load authRoutes');
    }

    try {
      const ownerRoutes = require('./routes/ownerRoutes');
      app.use('/api/owner', ownerRoutes);
      console.log('✓ Owner routes mounted');
    } catch (err) {
      console.warn('⚠️ Could not load ownerRoutes');
    }

    try {
      const roommateRoutes = require('./routes/roommateRoutes');
      app.use('/api/roommates', roommateRoutes);
      console.log('✓ Roommate routes mounted');
    } catch (err) {
      console.warn('⚠️ Could not load roommateRoutes');
    }

    try {
      const chatRoutes = require('./routes/chatRoutes');
      app.use('/api/chat', chatRoutes);
      console.log('✓ Chat routes mounted');
    } catch (err) {
      console.warn('⚠️ Could not load chatRoutes');
    }

    // Health check route (very useful)
    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'Server is healthy',
        environment: env.nodeEnv || 'production',
        timestamp: new Date().toISOString()
      });
    });

    // ====================== 404 HANDLER - MUST BE LAST ======================
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
        origin: env.allowedOrigins || '*',
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
      console.log(`✓ Try admin login: /api/admin/login`);
    });

  } catch (error) {
    console.error('✗ Server startup failed:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
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