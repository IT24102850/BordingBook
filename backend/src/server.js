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
    process.exit(1);
  }
}

startServer();
