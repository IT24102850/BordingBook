const User = require('../models/User');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function isStudentEmail(email) {
  return email.endsWith('@sliit.lk') || email.endsWith('@my.sliit.lk');
}

function validatePasswordByRole(password, role) {
  if (role === 'student') {
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8 || !hasNumber || !hasUppercase || !hasSymbol) {
      return 'Student password must be at least 8 characters and include uppercase, number, and symbol';
    }
  }

  return null;
}

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
exports.signup = async (req, res) => {
  try {
    const { email, password, role = 'student', fullName, phoneNumber, companyName, propertyCount } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedFullName = typeof fullName === 'string' ? fullName.trim() : '';
    const normalizedPhoneNumber = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';

    const rolePasswordError = validatePasswordByRole(password, role);
    if (rolePasswordError) {
      return res.status(400).json({ success: false, message: rolePasswordError });
    }

    if (role === 'student') {
      if (!isStudentEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Students must use @sliit.lk or @my.sliit.lk email',
        });
      }
    } else if (role === 'owner') {
      if (isStudentEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Property owners must use a business or personal email',
        });
      }

      if (!normalizedFullName || !normalizedPhoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Full name and phone number are required for property owners',
        });
      }
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (!existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please verify your email.',
          needsVerification: true,
        });
      }

      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const userData = {
      email: normalizedEmail,
      password,
      role,
      isVerified: false,
    };

    if (role === 'owner') {
      userData.fullName = normalizedFullName;
      userData.phoneNumber = normalizedPhoneNumber;
      userData.companyName = (companyName || '').trim();
      userData.propertyCount = Number(propertyCount) || 0;
    }

    const user = new User(userData);
    const verificationToken = user.generateVerificationToken();

    await user.save();

    // Return response immediately with verification link (non-blocking email send)
    const verificationUrl = `${env.frontendUrl}/verify-email?token=${verificationToken}`;
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        verificationUrl: verificationUrl,
        verificationToken: verificationToken, // For development/testing
      },
    });

    // Send email in the background (non-blocking)
    setImmediate(async () => {
      try {
        const emailResult = await emailService.sendVerificationEmail(normalizedEmail, verificationToken);
        if (emailResult.success) {
          console.log(`Verification email sent to ${normalizedEmail}`);
        } else {
          console.warn(`Email not sent to ${normalizedEmail}: ${emailResult.reason}`);
          console.warn(`Fallback: User can verify via: ${verificationUrl}`);
        }
      } catch (emailError) {
        console.error('Background email send error:', emailError.message);
      }
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.name === 'ValidationError' ? 'Please fill all required fields correctly' : 'Failed to create account',
    });
  }
};

/**
 * Verify email with token
 * GET /api/auth/verify-email?token=xxx
 */
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.params.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    // Send welcome email in background so verification response is never blocked by SMTP.
    setImmediate(async () => {
      try {
        await emailService.sendWelcomeEmail(
          user.email,
          user.role === 'owner' ? user.fullName : user.email.split('@')[0]
        );
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError.message);
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now sign in.',
      data: {
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify email',
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
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

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

    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Return response immediately with verification link (non-blocking email send)
    const verificationUrl = `${env.frontendUrl}/verify-email?token=${verificationToken}`;
    
    res.status(200).json({
      success: true,
      message: 'Verification link ready. Check your email or use the link below.',
      data: {
        email: user.email,
        verificationUrl: verificationUrl,
        verificationToken: verificationToken, // For development/testing
      },
    });

    // Send email in the background (non-blocking)
    setImmediate(async () => {
      try {
        const emailResult = await emailService.sendVerificationEmail(normalizedEmail, verificationToken);
        if (emailResult.success) {
          console.log(`Resend email sent to ${normalizedEmail}`);
        } else {
          console.warn(`Email not sent to ${normalizedEmail}: ${emailResult.reason}`);
          console.warn(`Fallback: User can verify via: ${verificationUrl}`);
        }
      } catch (emailError) {
        console.error('Background resend email error:', emailError.message);
      }
    });
  } catch (error) {
    console.error('Resend verification error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
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
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before signing in',
        needsVerification: true,
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          companyName: user.companyName,
          propertyCount: user.propertyCount,
          profileCompleted: user.profileCompleted,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('Signin error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to sign in',
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-verificationToken -verificationTokenExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        companyName: user.companyName,
        propertyCount: user.propertyCount,
        profileCompleted: user.profileCompleted,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
    });
  }
};
