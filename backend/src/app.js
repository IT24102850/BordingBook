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

// Debug endpoint - list all users (remove in production)
app.get('/api/debug/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find({}).select('_id email fullName role profilePicture');
    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        id: String(u._id),
        email: u.email,
        fullName: u.fullName || '(no name)',
        role: u.role,
        avatar: u.profilePicture || '',
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoint - list all conversations (remove in production)
app.get('/api/debug/conversations', async (req, res) => {
  try {
    const ChatConversation = require('./models/ChatConversation');
    const conversations = await ChatConversation.find({})
      .populate('participants.user', '_id email fullName role')
      .populate('lastMessage.sender', '_id email fullName');
    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations: conversations.map(c => ({
        id: String(c._id),
        type: c.type,
        directKey: c.directKey,
        name: c.name,
        participants: (c.participants || []).map(p => ({
          userId: p.user ? String(p.user._id) : 'unknown',
          email: p.user?.email || 'unknown',
          fullName: p.user?.fullName || 'unknown',
        })),
        lastMessage: c.lastMessage?.text?.substring(0, 50) || 'none',
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
