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

<<<<<<< Updated upstream
    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails - user can request resend
    }
=======
    const emailSendResult = await emailService
      .sendVerificationEmail(normalizedEmail, verificationToken)
      .catch((emailError) => {
        console.error('Failed to send verification email:', emailError.message);
        return { success: false, reason: emailError.message || 'Email send failed' };
      });

    const signupMessage = emailSendResult.success
      ? 'Account created successfully. Please check your email to verify your account.'
      : 'Account created, but verification email could not be sent. Please contact support or try resend later.';
>>>>>>> Stashed changes

    res.status(201).json({
      success: true,
      message: signupMessage,
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        emailSent: Boolean(emailSendResult.success),
        emailError: emailSendResult.reason || null,
        verificationUrl:
          env.nodeEnv === 'development' && !emailSendResult.success
            ? emailSendResult.verificationUrl || null
            : null,
      },
    });
  } catch (error) {
<<<<<<< Updated upstream
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
      error: error.message,
=======
    console.error('Signup error:', error.message);

    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: env.nodeEnv === 'development' ? error.message : 'Failed to create account',
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken);
=======
    const emailSendResult = await emailService
      .sendVerificationEmail(normalizedEmail, verificationToken)
      .catch((emailError) => {
        console.error('Failed to resend verification email:', emailError.message);
        return { success: false, reason: emailError.message || 'Email send failed' };
      });

    if (!emailSendResult.success) {
      if (env.nodeEnv === 'development' && emailSendResult.verificationUrl) {
        return res.status(200).json({
          success: true,
          message: 'Email service unavailable in development. Use provided verification URL.',
          verificationUrl: emailSendResult.verificationUrl,
          emailError: emailSendResult.reason || 'Unknown email delivery error',
        });
      }

      return res.status(503).json({
        success: false,
        message: 'Verification email service is unavailable. Please try again later.',
        emailError: emailSendResult.reason || 'Unknown email delivery error',
      });
    }
>>>>>>> Stashed changes

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
          profileCompleted: user.profileCompleted,
        },
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign in',
<<<<<<< Updated upstream
      error: error.message,
=======
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
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        bio: user.bio,
        minBudget: user.minBudget,
        maxBudget: user.maxBudget,
        distance: user.distance,
        selectedLocation: user.selectedLocation,
        gender: user.gender,
        academicYear: user.academicYear,
        roommatePreference: user.roommatePreference,
        roomType: user.roomType,
        lifestylePrefs: user.lifestylePrefs,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
>>>>>>> Stashed changes
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const {
      profilePicture,
      bio,
      minBudget,
      maxBudget,
      distance,
      selectedLocation,
      gender,
      academicYear,
      roommatePreference,
      roomType,
      lifestylePrefs,
    } = req.body;

    const parsedMinBudget = Number(minBudget);
    const parsedMaxBudget = Number(maxBudget);

    if (!Number.isNaN(parsedMinBudget) && !Number.isNaN(parsedMaxBudget) && parsedMaxBudget < parsedMinBudget) {
      return res.status(400).json({
        success: false,
        message: 'Maximum budget must be greater than or equal to minimum budget',
      });
    }

    if (typeof profilePicture === 'string') user.profilePicture = profilePicture;
    if (typeof bio === 'string') user.bio = bio.trim();
    if (!Number.isNaN(parsedMinBudget)) user.minBudget = parsedMinBudget;
    if (!Number.isNaN(parsedMaxBudget)) user.maxBudget = parsedMaxBudget;
    if (!Number.isNaN(Number(distance))) user.distance = Number(distance);
    if (typeof selectedLocation === 'string') user.selectedLocation = selectedLocation.trim();
    if (typeof gender === 'string') user.gender = gender.trim();
    if (typeof academicYear === 'string') user.academicYear = academicYear.trim();
    if (typeof roommatePreference === 'string') user.roommatePreference = roommatePreference.trim();
    if (typeof roomType === 'string') user.roomType = roomType.trim();
    if (Array.isArray(lifestylePrefs)) {
      user.lifestylePrefs = lifestylePrefs.filter((item) => typeof item === 'string').map((item) => item.trim());
    }

    user.profileCompleted = Boolean(
      user.bio &&
        user.minBudget > 0 &&
        user.maxBudget > 0 &&
        user.distance > 0 &&
        user.gender &&
        user.academicYear &&
        user.roommatePreference
    );

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to save profile',
    });
  }
};
