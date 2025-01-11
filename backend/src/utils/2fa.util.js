const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generate2FASecret = (username) => {
  const secret = speakeasy.generateSecret({
    name: `PDP Auth:${username}`,
    issuer: 'PDP Auth'
  });
  
  return {
    otpauthUrl: secret.otpauth_url,
    base32: secret.base32
  };
};

const generate2FAQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

const verify2FAToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 30 seconds clock skew
  });
};

module.exports = {
  generate2FASecret,
  generate2FAQRCode,
  verify2FAToken
};
