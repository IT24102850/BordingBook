const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const fileStore = require('./lib/fileStore');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const isDevelopment = env.nodeEnv !== 'production';

// Behind Render/Vercel proxies: trust the first hop so rate limiting sees real client IPs
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 5000 : 1500,
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit on credential endpoints to slow down password guessing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

app.use(
  helmet({
    // The frontend is served from a different origin and embeds images/PDFs from this API
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (env.isAllowedOrigin(origin)) return callback(null, true);
      console.warn('[CORS] Blocked origin:', origin);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: false, limit: '25mb' }));
app.use('/api', limiter);
app.use(['/api/auth/signin', '/api/auth/signup', '/api/auth/forgot-password', '/api/admin/login'], authLimiter);
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/agreements', fileStore.serve('agreements'));
app.use('/uploads', fileStore.serve('uploads'));

// Import routes
const authRoutes = require('./routes/authRoutes');
const roommateRoutes = require('./routes/roommateRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./payment/routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const kycRoutes = require('./routes/kycRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/roommates', roommateRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Server is running',
    environment: env.nodeEnv,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Public platform stats (no auth required)
app.get('/api/stats', async (req, res) => {
  try {
    const User = require('./models/User');
    const BoardingHouse = require('./models/BoardingHouse');
    const Review = require('./admin/models/Review');

    const [listings, students, owners, reviewAgg] = await Promise.all([
      BoardingHouse.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'owner' }),
      Review.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
    ]);

    const avgRating = reviewAgg.length > 0 ? Math.round(reviewAgg[0].avg * 10) / 10 : 4.9;

    res.status(200).json({ success: true, data: { listings, students, owners, avgRating } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
