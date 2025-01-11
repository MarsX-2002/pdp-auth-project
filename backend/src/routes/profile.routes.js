const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { upload, processImage, deleteOldProfilePicture } = require('../middleware/upload.middleware');
const User = require('../models/user.model');
const { ApiError } = require('../utils/error.util');
const { generate2FASecret, generate2FAQRCode, verify2FAToken } = require('../utils/2fa.util');
const { send2FASetupEmail } = require('../utils/email.util');

// Get user profile
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// Update profile
router.patch('/me', protect, async (req, res) => {
  const allowedUpdates = ['firstName', 'lastName', 'bio'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw new ApiError('Invalid updates', 400);
  }

  const user = await User.findById(req.user.id);
  updates.forEach(update => user[update] = req.body[update]);
  await user.save();

  res.json(user);
});

// Update profile picture
router.patch('/me/picture', protect, upload, processImage, async (req, res) => {
  if (!req.processedFile) {
    throw new ApiError('No file uploaded', 400);
  }

  const user = await User.findById(req.user.id);
  
  // Delete old profile picture if exists
  if (user.profilePicture) {
    await deleteOldProfilePicture(user.profilePicture);
  }

  user.profilePicture = req.processedFile.url;
  await user.save();

  res.json({
    message: 'Profile picture updated successfully',
    profilePicture: user.profilePicture
  });
});

// Change password
router.patch('/me/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new ApiError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

// Enable 2FA
router.post('/me/2fa/enable', protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (user.twoFactorEnabled) {
    throw new ApiError('2FA is already enabled', 400);
  }

  const secret = generate2FASecret(user.username);
  const qrCode = await generate2FAQRCode(secret.otpauthUrl);
  
  user.twoFactorSecret = secret.base32;
  await user.save();

  // Send email with QR code
  await send2FASetupEmail(user.email, user.username, qrCode);

  res.json({
    message: '2FA setup initiated',
    qrCode,
    secret: secret.base32
  });
});

// Verify and activate 2FA
router.post('/me/2fa/verify', protect, async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id).select('+twoFactorSecret');

  if (!user.twoFactorSecret) {
    throw new ApiError('2FA setup not initiated', 400);
  }

  const isValid = verify2FAToken(token, user.twoFactorSecret);
  if (!isValid) {
    throw new ApiError('Invalid 2FA token', 401);
  }

  user.twoFactorEnabled = true;
  await user.save();

  res.json({ message: '2FA enabled successfully' });
});

// Disable 2FA
router.post('/me/2fa/disable', protect, async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id).select('+twoFactorSecret');

  if (!user.twoFactorEnabled) {
    throw new ApiError('2FA is not enabled', 400);
  }

  const isValid = verify2FAToken(token, user.twoFactorSecret);
  if (!isValid) {
    throw new ApiError('Invalid 2FA token', 401);
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();

  res.json({ message: '2FA disabled successfully' });
});

module.exports = router;
