const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/otp/send', authController.sendOTP);
router.post('/otp/verify', authController.verifyOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes (require authentication)
router.use(protect);
router.get('/me', authController.getCurrentUser);
router.patch('/update-password', authController.updatePassword);

module.exports = router;