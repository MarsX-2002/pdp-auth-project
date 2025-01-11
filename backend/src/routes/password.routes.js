const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/user.model');
const { ApiError } = require('../utils/error.util');
const { 
  sendPasswordResetEmail 
} = require('../utils/email.util');

// Request Password Reset
router.post('/forgot', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError('No user found with this email', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set reset token and expiry
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send reset email
    const resetURL = `${process.env.FRONTEND_URL}${process.env.PASSWORD_RESET_URL}?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetURL);

    res.status(200).json({
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    next(error);
  }
});

// Reset Password
router.post('/reset', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError('Invalid or expired reset token', 400);
    }

    // Set new password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
