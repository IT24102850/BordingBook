const path = require('path');
const dotenv = require('dotenv');


// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];

// Check for required environment variables
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

module.exports = {
  mongoUri: process.env.MONGO_URI,
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT,
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  allowedOrigins: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : ['http://localhost:3000', 'http://localhost:5173'],
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

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseAllowedOrigins() {
  const devDefaultOrigin = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '';
  const raw = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || devDefaultOrigin;

  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}


function getFrontendUrl() {
  const devDefaultOrigin = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '';
  const value = process.env.FRONTEND_URL || devDefaultOrigin;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error('Missing required environment variable in production: FRONTEND_URL');
  }
  return value.replace(/\/$/, '');
}


const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: requireEnv('MONGO_URI'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: getFrontendUrl(),

  allowedOrigins: parseAllowedOrigins(),
  emailHost: process.env.EMAIL_HOST || '',
  emailPort: Number(process.env.EMAIL_PORT || 587),
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  emailFromName: process.env.EMAIL_FROM_NAME || 'Boarding Book',
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || '',
};

module.exports = env;

