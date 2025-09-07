const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const Doctor = require('../models/doctor.model');
const Pharmacy = require('../models/pharmacy.model');
const Hospital = require('../models/hospital.model');
const { AuthToken, OTP } = require('../models/security.model');
const AuditLog = require('../models/audit-log.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Enhanced authentication service with support for multiple roles and verification
 */
class AuthService {
  /**
   * Register a new user with role-specific data
   * @param {Object} userData - Basic user data
   * @param {Object} roleData - Role-specific data
   * @returns {Object} - Created user and role-specific data
   */
  async register(userData, roleData = {}) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { phone: userData.phone }],
      });

      if (existingUser) {
        throw new Error('User with this email or phone already exists');
      }

      // Create new user
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: userData.role,
        consentGiven: userData.consentGiven || false,
        consentTimestamp: userData.consentGiven ? Date.now() : undefined,
        privacyPolicyAccepted: userData.privacyPolicyAccepted || false,
        termsAccepted: userData.termsAccepted || false,
        status: 'pending', // All users start as pending until verified
      });

      // Create role-specific profile based on user role
      let roleProfile = null;
      
      if (userData.role === 'patient' && roleData) {
        roleProfile = await Patient.create({
          userId: user._id,
          ...roleData,
        });
      } else if (userData.role === 'doctor' && roleData) {
        roleProfile = await Doctor.create({
          userId: user._id,
          ...roleData,
          licenseVerified: false,
          kycStatus: 'pending',
        });
      } else if (userData.role === 'pharmacy' && roleData) {
        roleProfile = await Pharmacy.create({
          ownerId: user._id,
          ...roleData,
          licenseVerified: false,
          status: 'pending',
        });
      } else if (userData.role === 'hospital' && roleData) {
        roleProfile = await Hospital.create({
          ownerId: user._id,
          ...roleData,
          licenseVerified: false,
          status: 'pending',
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateAuthTokens(user._id);

      // Log the registration event
      await this.logAuditEvent(user._id, 'register', 'user', 'success', {
        role: userData.role,
        email: userData.email,
        phone: userData.phone,
      });

      // Remove password from output
      user.password = undefined;

      return {
        user,
        roleProfile,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login a user with email/phone and password
   * @param {Object} credentials - Login credentials
   * @returns {Object} - User data and tokens
   */
  async login(credentials) {
    try {
      const { email, phone, password, deviceInfo } = credentials;

      // Check if email/phone and password exist
      if ((!email && !phone) || !password) {
        throw new Error('Please provide email/phone and password');
      }

      // Find user by email or phone
      const query = {};
      if (email) query.email = email;
      if (phone) query.phone = phone;

      // Get user with password
      const user = await User.findOne(query).select('+password');

      // Check if user exists and password is correct
      if (!user || !(await bcrypt.compare(password, user.password))) {
        // Log failed login attempt
        await this.logSecurityEvent('login_failure', user ? user._id : null, {
          email,
          phone,
          ip: deviceInfo?.ip,
          userAgent: deviceInfo?.userAgent,
        });
        
        throw new Error('Incorrect email/phone or password');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new Error(`Your account is ${user.status}. Please contact support.`);
      }

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateAuthTokens(user._id, deviceInfo);

      // Update last login
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      // Log successful login
      await this.logSecurityEvent('login_success', user._id, {
        email: user.email,
        phone: user.phone,
        ip: deviceInfo?.ip,
        userAgent: deviceInfo?.userAgent,
      });

      // Remove password from output
      user.password = undefined;

      // Get role-specific data
      const roleData = await this.getRoleData(user);

      return {
        user,
        roleData,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Generate and send OTP for verification
   * @param {Object} data - Contact information
   * @returns {Object} - OTP details (for dev only)
   */
  async sendOTP(data) {
    try {
      const { phone, email, type = 'verification', userId, deviceInfo } = data;

      if (!phone && !email) {
        throw new Error('Please provide phone or email');
      }

      // Generate OTP (6-digit number)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Hash OTP for storage
      const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

      // Set expiration (10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Create OTP record
      const otpRecord = await OTP.create({
        userId,
        phone,
        email,
        otp: hashedOTP,
        type,
        expiresAt,
        deviceInfo,
      });

      // TODO: Implement actual SMS/email sending
      // For now, we'll just return the OTP (for development purposes only)

      return {
        message: 'OTP sent successfully',
        otpId: otpRecord._id,
        // Only include OTP in development mode
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  /**
   * Verify OTP and complete the verification process
   * @param {Object} data - Verification data
   * @returns {Object} - User data and tokens
   */
  async verifyOTP(data) {
    try {
      const { phone, email, otp, otpId, type = 'verification', deviceInfo } = data;

      if ((!phone && !email) || !otp) {
        throw new Error('Please provide phone/email and OTP');
      }

      // Find the OTP record
      const query = { _id: otpId };
      if (email) query.email = email;
      if (phone) query.phone = phone;
      if (type) query.type = type;

      const otpRecord = await OTP.findOne(query);

      if (!otpRecord) {
        throw new Error('Invalid OTP request');
      }

      // Check if OTP is expired
      if (otpRecord.expiresAt < new Date()) {
        throw new Error('OTP has expired');
      }

      // Check if OTP is blocked
      if (otpRecord.isBlocked) {
        throw new Error('Too many failed attempts. Please request a new OTP.');
      }

      // Hash the provided OTP and compare
      const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
      const isValidOTP = hashedOTP === otpRecord.otp;

      if (!isValidOTP) {
        // Increment attempts
        otpRecord.attempts += 1;
        
        // Block after max attempts
        if (otpRecord.attempts >= otpRecord.maxAttempts) {
          otpRecord.isBlocked = true;
          otpRecord.blockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Block for 30 minutes
        }
        
        await otpRecord.save();
        
        throw new Error(`Invalid OTP. ${otpRecord.maxAttempts - otpRecord.attempts} attempts remaining.`);
      }

      // Mark OTP as verified
      otpRecord.isVerified = true;
      otpRecord.verifiedAt = new Date();
      await otpRecord.save();

      // Find or create user
      let user = null;
      let isNewUser = false;
      
      if (otpRecord.userId) {
        // Existing user
        user = await User.findById(otpRecord.userId);
        
        if (!user) {
          throw new Error('User not found');
        }
        
        // Update verification status
        if (email) user.emailVerified = true;
        if (phone) user.phoneVerified = true;
        
        // If both email and phone are verified, activate the account
        if (user.emailVerified && user.phoneVerified && user.status === 'pending') {
          user.status = 'active';
        }
        
        await user.save({ validateBeforeSave: false });
      } else {
        // New user registration via OTP
        isNewUser = true;
        
        // Create a temporary password
        const tempPassword = crypto.randomBytes(8).toString('hex');
        
        // Create new user with minimal info
        user = await User.create({
          email,
          phone,
          name: 'New User', // Placeholder name
          password: tempPassword,
          role: 'patient', // Default role
          status: 'active',
          emailVerified: !!email,
          phoneVerified: !!phone,
        });
        
        // Create patient profile
        await Patient.create({
          userId: user._id,
          // Minimal required fields
          dateOfBirth: new Date('2000-01-01'), // Placeholder
          gender: 'prefer_not_to_say', // Placeholder
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateAuthTokens(user._id, deviceInfo);

      // Log the verification event
      await this.logSecurityEvent(
        isNewUser ? 'registration' : 'verification', 
        user._id, 
        {
          method: 'otp',
          email: user.email,
          phone: user.phone,
          ip: deviceInfo?.ip,
          userAgent: deviceInfo?.userAgent,
        }
      );

      // Get role-specific data
      const roleData = await this.getRoleData(user);

      return {
        user,
        roleData,
        accessToken,
        refreshToken,
        isNewUser,
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} - New access and refresh tokens
   */
  async refreshToken(refreshToken) {
    try {
      // Find the refresh token in the database
      const tokenRecord = await AuthToken.findOne({
        token: refreshToken,
        type: 'refresh',
        isRevoked: false,
      });

      if (!tokenRecord) {
        throw new Error('Invalid refresh token');
      }

      // Check if token is expired
      if (tokenRecord.expiresAt < new Date()) {
        throw new Error('Refresh token has expired');
      }

      // Get user
      const user = await User.findById(tokenRecord.userId);

      if (!user || user.status !== 'active') {
        throw new Error('User not found or inactive');
      }

      // Revoke the old refresh token
      tokenRecord.isRevoked = true;
      tokenRecord.revokedAt = new Date();
      tokenRecord.revokedReason = 'refreshed';
      await tokenRecord.save();

      // Generate new tokens
      const tokens = await this.generateAuthTokens(user._id, tokenRecord.deviceInfo);

      return tokens;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  /**
   * Logout user by revoking tokens
   * @param {string} userId - User ID
   * @param {string} refreshToken - Refresh token to revoke
   * @param {boolean} revokeAll - Whether to revoke all tokens for the user
   * @returns {Object} - Logout status
   */
  async logout(userId, refreshToken, revokeAll = false) {
    try {
      if (revokeAll) {
        // Revoke all refresh tokens for the user
        await AuthToken.updateMany(
          { userId, type: 'refresh', isRevoked: false },
          { isRevoked: true, revokedAt: new Date(), revokedReason: 'logout' }
        );
      } else if (refreshToken) {
        // Revoke specific refresh token
        await AuthToken.findOneAndUpdate(
          { token: refreshToken, type: 'refresh', isRevoked: false },
          { isRevoked: true, revokedAt: new Date(), revokedReason: 'logout' }
        );
      }

      // Log the logout event
      await this.logSecurityEvent('logout', userId, {});

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Generate access and refresh tokens for a user
   * @param {string} userId - User ID
   * @param {Object} deviceInfo - Device information
   * @returns {Object} - Access and refresh tokens
   */
  async generateAuthTokens(userId, deviceInfo = {}) {
    // Generate JWT access token
    const accessToken = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );

    // Generate refresh token
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Calculate expiration dates
    const accessExpiresAt = new Date(
      Date.now() + this.parseJwtExpiry(process.env.JWT_ACCESS_EXPIRES_IN || '15m')
    );
    
    const refreshExpiresAt = new Date(
      Date.now() + this.parseJwtExpiry(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
    );

    // Store refresh token in database
    await AuthToken.create({
      userId,
      token: refreshToken,
      type: 'refresh',
      expiresAt: refreshExpiresAt,
      deviceInfo,
      lastUsedAt: new Date(),
    });

    // Store access token in database for tracking
    await AuthToken.create({
      userId,
      token: accessToken,
      type: 'access',
      expiresAt: accessExpiresAt,
      deviceInfo,
      lastUsedAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
    };
  }

  /**
   * Parse JWT expiry string to milliseconds
   * @param {string} expiryString - JWT expiry string (e.g., '7d', '15m')
   * @returns {number} - Expiry in milliseconds
   */
  parseJwtExpiry(expiryString) {
    const match = expiryString.match(/^(\d+)([smhdy])$/);
    if (!match) return 15 * 60 * 1000; // Default to 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000; // seconds
      case 'm': return value * 60 * 1000; // minutes
      case 'h': return value * 60 * 60 * 1000; // hours
      case 'd': return value * 24 * 60 * 60 * 1000; // days
      case 'y': return value * 365 * 24 * 60 * 60 * 1000; // years (approximate)
      default: return 15 * 60 * 1000; // Default to 15 minutes
    }
  }

  /**
   * Get role-specific data for a user
   * @param {Object} user - User object
   * @returns {Object} - Role-specific data
   */
  async getRoleData(user) {
    try {
      let roleData = null;

      switch (user.role) {
        case 'patient':
          roleData = await Patient.findOne({ userId: user._id });
          break;
        case 'doctor':
          roleData = await Doctor.findOne({ userId: user._id });
          break;
        case 'pharmacy':
          roleData = await Pharmacy.findOne({ ownerId: user._id });
          break;
        case 'hospital':
          roleData = await Hospital.findOne({ ownerId: user._id });
          break;
        default:
          break;
      }

      return roleData;
    } catch (error) {
      console.error('Get role data error:', error);
      return null;
    }
  }

  /**
   * Log security events
   * @param {string} eventType - Type of security event
   * @param {string} userId - User ID
   * @param {Object} details - Event details
   */
  async logSecurityEvent(eventType, userId, details = {}) {
    try {
      // TODO: Implement security event logging
      // This will be implemented when we create the security event model
      console.log('Security event:', { eventType, userId, details });
    } catch (error) {
      console.error('Log security event error:', error);
    }
  }

  /**
   * Log audit events
   * @param {string} userId - User ID
   * @param {string} action - Action performed
   * @param {string} entityType - Type of entity
   * @param {string} status - Status of the action
   * @param {Object} details - Additional details
   */
  async logAuditEvent(userId, action, entityType, status, details = {}) {
    try {
      await AuditLog.create({
        actor: {
          userId,
          role: details.role,
          email: details.email,
          phone: details.phone,
          ipAddress: details.ip,
          userAgent: details.userAgent,
        },
        action,
        entityType,
        entityId: userId,
        status,
        details,
      });
    } catch (error) {
      console.error('Log audit event error:', error);
    }
  }
}

module.exports = new AuthService();