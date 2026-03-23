const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['student', 'owner', 'admin'],
      default: 'student',
    },
    
    // Owner-specific fields
    fullName: {
      type: String,
      required: function() {
        return this.role === 'owner';
      },
    },
    phoneNumber: {
      type: String,
      required: function() {
        return this.role === 'owner';
      },
      trim: true,
    },
    companyName: {
      type: String,
      default: '',
    },
    propertyCount: {
      type: Number,
      default: 0,
    },
    
    // Email verification fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false, // Don't return token by default
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },
    
    // Optional profile fields
    profilePicture: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash password if it has been modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate verification token
userSchema.methods.generateVerificationToken = function () {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  // Token expires in 24 hours
  this.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
  
  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
