require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const env = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Middleware
app.use(
  cors({
    origin: env.allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: false, limit: '25mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Import routes
const authRoutes = require('./routes/authRoutes');
const roommateRoutes = require('./routes/roommateRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/roommates', roommateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Server is running',
    environment: env.nodeEnv,
  });
});

// Debug endpoint - list all rooms 
app.get('/api/debug/rooms', async (req, res) => {
  try {
    const Room = require('./models/Room');
    const rooms = await Room.find({}).limit(5);
    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms.map(r => ({
        id: String(r._id),
        name: r.name,
        price: r.price,
        campus: r.campus,
        rating: r.rating,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
