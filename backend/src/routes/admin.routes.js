const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { ApiError } = require('../utils/error.util');

// Get User Statistics
router.get('/stats', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('username email createdAt');

    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      recentUsers
    });
  } catch (error) {
    next(error);
  }
});

// List Users (Paginated)
router.get('/users', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    next(error);
  }
});

// Update User Role
router.patch('/users/:id/role', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate User
router.patch('/users/:id/deactivate', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    user.isActive = false;
    await user.save();

    res.json({
      message: 'User deactivated successfully',
      user: {
        id: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
