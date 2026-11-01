const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return sendError(res, 'Not authorized. No token provided.', 401, 'NO_TOKEN');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return sendError(res, 'User not found.', 401, 'USER_NOT_FOUND');
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return sendError(res, 'Invalid token.', 401, 'INVALID_TOKEN');
    if (err.name === 'TokenExpiredError') return sendError(res, 'Token expired.', 401, 'TOKEN_EXPIRED');
    return sendError(res, 'Authorization error.', 500);
  }
};

module.exports = { protect };
