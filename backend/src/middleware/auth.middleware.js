const jwt = require('jsonwebtoken');
const { createError } = require('../utils/error.util');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw createError(401, 'Not authorized to access this route');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Get user from token
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw createError(401, 'User not found');
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw createError(401, 'Token expired');
      }
      throw createError(401, 'Not authorized to access this route');
    }
  } catch (error) {
    next(error);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'Not authorized to access this route'));
    }
    next();
  };
};
