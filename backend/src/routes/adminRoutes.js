const express = require('express');
const router = express.Router();

// Temporary simple admin login (you can replace this with real controller later)
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // For testing - change this later to use real admin authentication
  if (email === 'admin@boardingbook.cc' && password) {
    return res.json({
      success: true,
      data: {
        token: 'admin-jwt-token-' + Date.now(),
        admin: {
          id: 'admin001',
          name: 'BoardingBook Admin',
          email: email
        }
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid admin credentials'
  });
});

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

// Add other admin routes later (stats, users, kyc, etc.)
// router.get('/stats', adminController.getStats);
// router.get('/users', ...);

module.exports = router;