const path = require('path');
const dotenv = require('dotenv');

// ✅ Change to this
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

<<<<<<< HEAD
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];

// Check for required environment variables
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

module.exports = {
  mongoUri: process.env.MONGODB_URI,
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5176'],
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  allowedOrigins: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5176'],
};

// Load from backend's .env first  
const backendEnvPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: backendEnvPath });
if (result.error) {
  console.warn(`[ENV] Warning: Could not load from ${backendEnvPath}`);
} else {
  console.log(`[ENV] Loaded from ${backendEnvPath}, variables: ${Object.keys(result.parsed || {}).join(', ')}`);
}

// Also try from root as fallback
const rootEnvPath = path.resolve(process.cwd(), '.env');
if (rootEnvPath !== backendEnvPath) {
  dotenv.config({ path: rootEnvPath });
}

=======
>>>>>>> 3e40b5965f6b81066515973ab4691af39c4f662f
function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function parseAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';
  return raw.split(',').map(o => o.trim()).filter(Boolean);
}

function getFrontendUrl() {
  const value = process.env.FRONTEND_URL || 'http://localhost:5173';
  return value.replace(/\/$/, '');
}

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) throw new Error('Missing required environment variable: MONGO_URI');

const env = {
  nodeEnv:          process.env.NODE_ENV || 'development',
  port:             Number(process.env.PORT || 5000),
  mongoUri,
  jwtSecret:        requireEnv('JWT_SECRET'),
  jwtExpiresIn:     process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl:      getFrontendUrl(),
  allowedOrigins:   parseAllowedOrigins(),
  emailHost:        process.env.EMAIL_HOST || '',
  emailPort:        Number(process.env.EMAIL_PORT || 587),
  emailUser:        process.env.EMAIL_USER || '',
  emailPassword:    process.env.EMAIL_PASSWORD || '',
  emailFromName:    process.env.EMAIL_FROM_NAME || 'Boarding Book',
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || '',
};

console.log('[ENV] mongoUri loaded:', mongoUri ? '✅ Found' : '❌ Missing');

module.exports = env;