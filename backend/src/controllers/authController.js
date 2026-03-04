const User = require('../models/User');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
exports.signup = async (req, res) => {
  try {
    const { email, password, role, fullName, phoneNumber, companyName, propertyCount } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Validate email format based on role
    if (role === 'student') {
      if (!email.endsWith('@sliit.lk') && !email.endsWith('@my.sliit.lk')) {
        return res.status(400).json({
          success: false,
          message: 'Students must use @sliit.lk or @my.sliit.lk email',
        });
      }
    } else if (role === 'owner') {
      if (email.endsWith('@sliit.lk') || email.endsWith('@my.sliit.lk')) {
        return res.status(400).json({
          success: false,
          message: 'Property owners must use a business or personal email',
        });
      }
      
      // Validate owner-specific required fields
      if (!fullName || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Full name and phone number are required for property owners',
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create new user (not verified yet)
    const userData = {
      email,
      password,
      role: role || 'student',
      isVerified: false,
    };

    // Add owner-specific fields if role is owner
    if (role === 'owner') {
      userData.fullName = fullName;
      userData.phoneNumber = phoneNumber;
      userData.companyName = companyName || '';
      userData.propertyCount = propertyCount || 0;
    }

    const user = new User(userData);

    // Generate verification token
    const verificationToken = user.generateVerificationToken();

    // Save user to database
    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails - user can request resend
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
      error: error.message,
    });
  }
};

/**
 * Verify email with token
 * GET /api/auth/verify-email?token=xxx
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    // Hash the token to match stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with matching token and check expiry
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Update user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(
        user.email,
        user.role === 'owner' ? user.fullName : user.email.split('@')[0]
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if welcome email fails
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now sign in.',
      data: {
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: error.message,
    });
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: error.message,
    });
  }
};

/**
 * Sign in user
 * POST /api/auth/signin
 */
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before signing in',
        needsVerification: true,
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign in',
      error: error.message,
    });
  }
};
