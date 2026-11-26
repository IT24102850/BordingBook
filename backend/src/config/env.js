const path = require('path');
const dotenv = require('dotenv');

// ✅ Change to this
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function parseAllowedOrigins() {
  const raw = [process.env.CORS_ORIGIN, process.env.FRONTEND_URL, 'http://localhost:5173']
    .filter(Boolean)
    .join(',');
  return [...new Set(raw.split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean))];
}

// Supports exact origins and wildcards such as "https://*.vercel.app"
function makeOriginMatcher(origins) {
  const patterns = origins.map((o) =>
    o.includes('*')
      ? new RegExp(`^${o.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9-]+')}$`, 'i')
      : o
  );
  return (origin) => {
    if (!origin) return true; // same-origin, curl, server-to-server
    return patterns.some((p) => (typeof p === 'string' ? p === origin : p.test(origin)));
  };
}

function getFrontendUrl() {
  const value = process.env.FRONTEND_URL || 'http://localhost:5173';
  return value.replace(/\/$/, '');
}

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) throw new Error('Missing required environment variable: MONGO_URI');

const jwtSecret = requireEnv('JWT_SECRET');
if ((process.env.NODE_ENV === 'production') && (jwtSecret.length < 32 || /change|your|secret-key/i.test(jwtSecret))) {
  throw new Error('JWT_SECRET is too weak for production — set a random value of at least 32 characters');
}
const allowedOrigins = parseAllowedOrigins();

const env = {
  nodeEnv:          process.env.NODE_ENV || 'development',
  port:             Number(process.env.PORT || 5000),
  mongoUri,
  jwtSecret,
  jwtExpiresIn:     process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl:      getFrontendUrl(),
  allowedOrigins,
  isAllowedOrigin:  makeOriginMatcher(allowedOrigins),
  emailHost:        process.env.EMAIL_HOST || '',
  emailPort:        Number(process.env.EMAIL_PORT || 587),
  emailUser:        process.env.EMAIL_USER || '',
  emailPassword:    process.env.EMAIL_PASSWORD || '',
  emailFromName:    process.env.EMAIL_FROM_NAME || 'Boarding Book',
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || '',
};


module.exports = env;