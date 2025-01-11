const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  register,
  login,
  refresh,
  logout,
  getProtected
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/protected', protect, getProtected);

module.exports = router;
