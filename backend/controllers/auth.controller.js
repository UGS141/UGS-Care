'use strict';
const crypto = require('crypto');
const User = require('../models/user.model'); // ensure model path is correct
const authService = require('../services/auth.service');
const otpService = require('../services/otp.service');
const kycService = require('../services/kyc.service');
const { catchAsync } = require('../utils/error-handler');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = catchAsync(async (req, res) => {
  const { userData, roleData } = req.body;
  
  // Get device info from request
  const deviceInfo = {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };
  
  // Register user
  const result = await authService.register(userData, roleData);
  
  // Send verification OTP if email or phone is provided
  if (userData.email || userData.phone) {
    await otpService.generateOTP({
      userId: result.user._id,
      email: userData.email,
      phone: userData.phone,
      type: 'verification',
      deviceInfo,
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = catchAsync(async (req, res) => {
  const { email, phone, password } = req.body;
  
  // Get device info from request
  const deviceInfo = {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };
  
  // Login user
  const result = await authService.login({
    email,
    phone,
    password,
    deviceInfo,
  });
  
  // Check if 2FA is required
  if (result.user.twoFactorEnabled && !result.user.twoFactorVerified) {
    // Send 2FA OTP
    const otpResult = await otpService.generateOTP({
      userId: result.user._id,
      email: result.user.email,
      phone: result.user.phone,
      type: '2fa',
      deviceInfo,
    });
    
    return res.status(200).json({
      success: true,
      message: '2FA verification required',
      requiresTwoFactor: true,
      otpId: otpResult.otpId,
      user: {
        _id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
      },
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

/**
 * Send OTP for verification
 * @route POST /api/auth/send-otp
 */
exports.sendOTP = catchAsync(async (req, res) => {
  const { phone, email, type, userId } = req.body;
  
  // Get device info from request
  const deviceInfo = {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };
  
  // Generate and send OTP
  const result = await otpService.generateOTP({
    userId,
    phone,
    email,
    type: type || 'verification',
    deviceInfo,
  });
  
  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      otpId: result.otpId,
      expiresAt: result.expiresAt,
      // Only include OTP in development mode
      otp: process.env.NODE_ENV === 'development' ? result.otp : undefined,
    },
  });
});

/**
 * Verify OTP
 * @route POST /api/auth/verify-otp
 */
exports.verifyOTP = catchAsync(async (req, res) => {
  const { phone, email, otp, otpId, type } = req.body;
  
  // Get device info from request
  const deviceInfo = {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };
  
  // Verify OTP
  const otpResult = await otpService.verifyOTP({
    phone,
    email,
    otp,
    otpId,
    type: type || 'verification',
  });
  
  // If OTP is for 2FA, complete login
  if (type === '2fa' && otpResult.userId) {
    // Complete login with 2FA
    const loginResult = await authService.verifyOTP({
      phone,
      email,
      otp,
      otpId,
      type: '2fa',
      deviceInfo,
    });
    
    return res.status(200).json({
      success: true,
      message: '2FA verification successful',
      data: loginResult,
    });
  }
  
  // If OTP is for verification, complete verification
  if (type === 'verification' && otpResult.userId) {
    // Complete verification
    const verificationResult = await authService.verifyOTP({
      phone,
      email,
      otp,
      otpId,
      type: 'verification',
      deviceInfo,
    });
    
    return res.status(200).json({
      success: true,
      message: 'Verification successful',
      data: verificationResult,
    });
  }
  
  // For other OTP types
  res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
    data: otpResult,
  });
});

/**
 * Refresh access token
 * @route POST /api/auth/refresh-token
 */
exports.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token is required',
    });
  }
  
  // Refresh token
  const result = await authService.refreshToken(refreshToken);
  
  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result,
  });
});

/**
 * Logout user
 * @route POST /api/auth/logout
 */
exports.logout = catchAsync(async (req, res) => {
  const { refreshToken, logoutAll } = req.body;
  const userId = req.user ? req.user._id : null;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }
  
  // Logout user
  await authService.logout(userId, refreshToken, logoutAll);
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
exports.getMe = catchAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }
  
  // Get user profile
  const result = await authService.getRoleData(req.user);
  
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
      roleData: result,
    },
  });
});

/**
 * Submit KYC documents
 * @route POST /api/auth/kyc/submit
 */
exports.submitKYC = catchAsync(async (req, res) => {
  const { role, documents } = req.body;
  const userId = req.user._id;
  
  // Submit KYC documents
  const result = await kycService.submitDocuments(userId, role, documents);
  
  res.status(200).json({
    success: true,
    message: 'KYC documents submitted successfully',
    data: result,
  });
});

/**
 * Get KYC status
 * @route GET /api/auth/kyc/status
 */
exports.getKYCStatus = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;
  
  // Get KYC status
  const result = await kycService.getKYCStatus(userId, role);
  
  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Verify KYC documents (admin only)
 * @route POST /api/auth/kyc/verify
 */
exports.verifyKYC = catchAsync(async (req, res) => {
  const { userId, role, status, remarks } = req.body;
  const adminId = req.user._id;
  
  // Verify KYC documents
  const result = await kycService.verifyDocuments(
    userId,
    role,
    { status, remarks },
    adminId
  );
  
  res.status(200).json({
    success: true,
    message: `KYC verification ${status}`,
    data: result,
  });
});

/**
 * Enable two-factor authentication
 * @route POST /api/auth/2fa/enable
 */
exports.enable2FA = catchAsync(async (req, res) => {
  const userId = req.user._id;
  
  // Update user to enable 2FA
  await User.findByIdAndUpdate(userId, {
    twoFactorEnabled: true,
    twoFactorMethod: req.body.method || 'otp',
  });
  
  res.status(200).json({
    success: true,
    message: 'Two-factor authentication enabled',
  });
});

/**
 * Disable two-factor authentication
 * @route POST /api/auth/2fa/disable
 */
exports.disable2FA = catchAsync(async (req, res) => {
  const userId = req.user._id;
  
  // Update user to disable 2FA
  await User.findByIdAndUpdate(userId, {
    twoFactorEnabled: false,
    twoFactorMethod: null,
  });
  
  res.status(200).json({
    success: true,
    message: 'Two-factor authentication disabled',
  });
});

/**
 * Request password reset
 * @route POST /api/auth/password/forgot
 */
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email, phone } = req.body;
  
  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email or phone',
    });
  }
  
  // Find user
  const query = {};
  if (email) query.email = email;
  if (phone) query.phone = phone;
  
  const user = await User.findOne(query);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No user found with that email or phone',
    });
  }
  
  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  
  // Send OTP for password reset
  const deviceInfo = {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };
  
  const otpResult = await otpService.generateOTP({
    userId: user._id,
    email: user.email,
    phone: user.phone,
    type: 'password_reset',
    deviceInfo,
  });
  
  res.status(200).json({
    success: true,
    message: 'Password reset OTP sent',
    data: {
      otpId: otpResult.otpId,
      resetToken,
      // Only include OTP in development mode
      otp: process.env.NODE_ENV === 'development' ? otpResult.otp : undefined,
    },
  });
});

/**
 * Reset password
 * @route POST /api/auth/password/reset
 */
exports.resetPassword = catchAsync(async (req, res) => {
  const { resetToken, otp, otpId, password } = req.body;
  
  if (!resetToken || !otp || !otpId || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide reset token, OTP, and new password',
    });
  }
  
  // Verify OTP first
  const otpResult = await otpService.verifyOTP({
    otpId,
    otp,
    type: 'password_reset',
  });
  
  if (!otpResult.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP',
    });
  }
  
  // Find user with reset token
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Token is invalid or has expired',
    });
  }
  
  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  
  // Log the password reset
  await authService.logSecurityEvent('password_reset', user._id, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

/**
 * Change password
 * @route POST /api/auth/password/change
 */
exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current and new password',
    });
  }
  
  // Get user with password
  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }
  
  // Check if current password is correct
  const isPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  // Log the password change
  await authService.logSecurityEvent('password_change', user._id, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});