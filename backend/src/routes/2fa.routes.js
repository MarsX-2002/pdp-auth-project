const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const { ApiError } = require('../utils/error.util');
const { 
  generate2FASecret, 
  generate2FAQRCode, 
  verify2FAToken 
} = require('../utils/2fa.util');
const { send2FASetupEmail } = require('../utils/email.util');

// Initiate 2FA Setup
router.post('/setup', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.twoFactorEnabled) {
      throw new ApiError('2FA is already enabled', 400);
    }

    const { otpauthUrl, base32 } = generate2FASecret(user.username);
    const qrCodeUrl = await generate2FAQRCode(otpauthUrl);

    // Temporarily store secret
    user.twoFactorSecret = base32;
    await user.save();

    // Send email with QR code
    await send2FASetupEmail(user.email, user.username, qrCodeUrl);

    res.json({
      message: '2FA setup initiated',
      qrCodeUrl
    });
  } catch (error) {
    next(error);
  }
});

// Verify and Enable 2FA
router.post('/verify', protect, async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

// Disable 2FA
router.post('/disable', protect, async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

module.exports = router;
