const express = require('express');
const router = express.Router();

// Temporary Admin Login (for testing)
// You can later replace this with a proper controller + bcrypt + JWT
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Admin login attempt:', email);

  // Simple check for now (change this to real authentication later)
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

// Get current admin info
router.get('/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 'admin001',
      name: 'BoardingBook Admin',
      email: 'admin@boardingbook.cc',
      lastLogin: new Date()
    }
  });
});

module.exports = router;