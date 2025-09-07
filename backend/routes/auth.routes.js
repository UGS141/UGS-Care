const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, restrictTo } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/refresh-token', authController.refreshToken);
router.post('/password/forgot', authController.forgotPassword);
router.post('/password/reset', authController.resetPassword);

// Protected routes
router.use(authenticate); // All routes below this middleware require authentication

router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.post('/password/change', authController.changePassword);

// 2FA routes
router.post('/2fa/enable', authController.enable2FA);
router.post('/2fa/disable', authController.disable2FA);

// KYC routes
router.post('/kyc/submit', authController.submitKYC);
router.get('/kyc/status', authController.getKYCStatus);

// Admin-only routes
router.post(
  '/kyc/verify',
  restrictTo('admin'),
  authController.verifyKYC
);

module.exports = router;