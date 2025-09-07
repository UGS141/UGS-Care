const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/user.model');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email or phone already exists',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      consentGiven: true,
      consentTimestamp: Date.now(),
      privacyPolicyAccepted: true,
      termsAccepted: true,
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Check if email/phone and password exist
    if ((!email && !phone) || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email/phone and password',
      });
    }

    // Find user by email or phone
    const query = {};
    if (email) query.email = email;
    if (phone) query.phone = phone;

    // Get user with password
    const user = await User.findOne(query).select('+password');

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email/phone or password',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        status: 'error',
        message: `Your account is ${user.status}. Please contact support.`,
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Send OTP for login/registration
exports.sendOTP = async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide phone or email',
      });
    }

    // Generate OTP (6-digit number)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real implementation, we would send the OTP via SMS or email
    // For now, we'll just return it (for development purposes only)
    
    // TODO: Implement actual SMS/email sending
    // TODO: Store OTP in Redis with expiration

    res.status(200).json({
      status: 'success',
      message: 'OTP sent successfully',
      data: {
        // Only include OTP in development mode
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      },
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error sending OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, email, otp } = req.body;

    if ((!phone && !email) || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide phone/email and OTP',
      });
    }

    // TODO: Verify OTP from Redis
    // For now, we'll assume OTP is valid (for development purposes only)
    const isValidOTP = true;

    if (!isValidOTP) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired OTP',
      });
    }

    // Find or create user
    let user = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (!user) {
      // If user doesn't exist, create a new one with minimal info
      user = await User.create({
        email,
        phone,
        name: 'New User', // Placeholder name
        password: crypto.randomBytes(16).toString('hex'), // Random password
        role: 'patient', // Default role
        status: 'active',
      });
    } else {
      // Update verification status
      if (email) user.emailVerified = true;
      if (phone) user.phoneVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error verifying OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error getting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with that email',
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send email with reset token
    // TODO: Implement actual email sending

    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email',
      data: {
        // Only include token in development mode
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      },
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error sending reset token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide token and new password',
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired',
      });
    }

    // Update password and clear reset fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Generate new token
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token: jwtToken,
      message: 'Password reset successful',
    });
  } catch (error) {
    // Log error without using console.error
    process.env.NODE_ENV === 'development' && require('util').log(`Reset password error: ${error}`);
    res.status(500).json({
      status: 'error',
      message: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide current and new password',
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check if current password is correct
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};