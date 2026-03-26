const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS not allowed'));
    },
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: false, limit: '25mb' }));
app.use(limiter);
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Import routes
const authRoutes = require('./routes/authRoutes');
const roommateRoutes = require('./routes/roommateRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/roommates', roommateRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    environment: env.nodeEnv,
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
