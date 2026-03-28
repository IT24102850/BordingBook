const env = require('../config/env');
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  console.log('🔐 AUTH MIDDLEWARE DEBUG:');
  console.log('   Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'NO HEADER');
  console.log('   Scheme:', scheme);
  console.log('   Token exists:', !!token);
  console.log('   Token length:', token?.length);
  console.log('   JWT_SECRET exists:', !!env.jwtSecret);
  console.log('   JWT_SECRET length:', env.jwtSecret?.length);

  if (scheme !== 'Bearer' || !token) {
    console.log('   ❌ FAIL: Missing Bearer scheme or token');
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    console.log('   ✅ SUCCESS: Token verified');
    console.log('   Payload:', payload);
    req.user = payload;
    return next();
  } catch (error) {
    console.log('   ❌ FAIL: Token verification failed');
    console.log('   Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

module.exports = {
  requireAuth,
};

