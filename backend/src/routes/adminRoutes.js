const express = require('express');
const router = express.Router();

// ====================== ADMIN LOGIN ======================
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('[ADMIN LOGIN ATTEMPT]', { email, hasPassword: !!password });

  // Simple admin login for testing
  if (email === 'admin@boardingbook.cc' && password && password.length > 0) {
    return res.json({
      success: true,
      data: {
        token: 'admin-jwt-token-' + Date.now(),
        admin: {
          id: 'admin001',
          name: 'BoardingBook Admin',
          email: email,
          role: 'admin'
        }
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid admin email or password'
  });
});

// ====================== GET CURRENT ADMIN ======================
router.get('/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'admin001',
      name: 'BoardingBook Admin',
      email: 'admin@boardingbook.cc'
    }
  });
});

module.exports = router;