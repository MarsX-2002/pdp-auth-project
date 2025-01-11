const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetToken, origin) => {
  const resetURL = `${origin}/reset-password?token=${resetToken}`;
  
  const html = `
    <h1>Password Reset Request</h1>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    <a href="${resetURL}" style="
      display: inline-block;
      padding: 10px 20px;
      background-color: #4F46E5;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    ">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
    <p>This link will expire in 10 minutes.</p>
  `;

  await sendEmail({
    email,
    subject: 'Password Reset Request',
    html,
  });
};

const sendWelcomeEmail = async (email, username) => {
  const html = `
    <h1>Welcome to Our Platform!</h1>
    <p>Hello ${username},</p>
    <p>Thank you for registering with us. We're excited to have you on board!</p>
    <p>If you have any questions, feel free to reach out to our support team.</p>
  `;

  await sendEmail({
    email,
    subject: 'Welcome to Our Platform',
    html,
  });
};

const send2FASetupEmail = async (email, username, qrCodeUrl) => {
  const html = `
    <h1>Two-Factor Authentication Setup</h1>
    <p>Hello ${username},</p>
    <p>You've enabled two-factor authentication for your account.</p>
    <p>Scan the QR code below with your authenticator app:</p>
    <img src="${qrCodeUrl}" alt="2FA QR Code" style="margin: 20px 0;">
    <p>Keep this QR code safe and don't share it with anyone.</p>
  `;

  await sendEmail({
    email,
    subject: '2FA Setup Instructions',
    html,
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  send2FASetupEmail,
};
