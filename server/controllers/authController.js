const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, branch, year } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, 'Email already registered.', 409, 'EMAIL_EXISTS');
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password, // hashed by pre-save hook
      branch: branch || '',
      year: year || 1
    });

    const token = generateToken(user._id);
    return sendSuccess(res, { token, user }, 'Registration successful', 201);
  } catch (err) {
    return sendError(res, err.message || 'Registration failed', 500);
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken(user._id);
    return sendSuccess(res, { token, user: user.toJSON() }, 'Login successful');
  } catch (err) {
    return sendError(res, err.message || 'Login failed', 500);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  // JWT is stateless; client must discard the token
  return sendSuccess(res, {}, 'Logged out successfully');
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, { user }, 'User retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

exports.registerValidators = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('year').optional().isInt({ min: 1, max: 5 })
];

exports.loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];
