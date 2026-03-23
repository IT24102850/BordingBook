const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/auth');

const signupValidation = [
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
	body('role').optional().isIn(['student', 'owner']).withMessage('Role must be student or owner'),
	body('fullName').optional().trim(),
	body('phoneNumber').optional().trim(),
	body('companyName').optional().trim(),
	body('propertyCount').optional().isInt({ min: 0 }).withMessage('Property count must be 0 or greater'),
];

const verifyEmailValidation = [
	query('token').isString().notEmpty().withMessage('Verification token is required'),
];

const resendValidation = [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()];
const signinValidation = [
	body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
	body('password').notEmpty().withMessage('Password is required'),
];

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (student or owner)
 * @access  Public
 */
router.post('/signup', signupValidation, validateRequest, authController.signup);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify user email with token
 * @access  Public
 */
router.get('/verify-email', verifyEmailValidation, validateRequest, authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post('/resend-verification', resendValidation, validateRequest, authController.resendVerification);

/**
 * @route   POST /api/auth/signin
 * @desc    Sign in user
 * @access  Public
 */
router.post('/signin', signinValidation, validateRequest, authController.signin);

router.get('/me', requireAuth, authController.getMe);

module.exports = router;
