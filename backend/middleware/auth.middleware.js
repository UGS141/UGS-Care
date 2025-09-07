const jwt = require('jsonwebtoken');
const { AuthToken } = require('../models/security.model');
const User = require('../models/user.model');
const rbacService = require('../services/rbac.service');

/**
 * Middleware to authenticate users using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is in database and not revoked
    const tokenRecord = await AuthToken.findOne({
      token,
      type: 'access',
      isRevoked: false,
    });

    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.',
      });
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }

    // Get user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.status}. Please contact support.`,
      });
    }

    // Update last used timestamp
    tokenRecord.lastUsedAt = new Date();
    await tokenRecord.save({ validateBeforeSave: false });

    // Add user to request object
    req.user = user;
    req.token = tokenRecord;

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.',
    });
  }
};

/**
 * Middleware to authorize users based on permissions
 * @param {string|string[]} permissions - Required permissions
 * @returns {Function} - Express middleware
 */
exports.authorize = (permissions) => {
  return async (req, res, next) => {
    try {
      // Check if user exists in request (authenticate middleware should be called first)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in.',
        });
      }

      // Get user permissions
      const userPermissions = await rbacService.getUserPermissions(req.user._id);

      // Check if user has admin permission
      if (userPermissions.includes('*')) {
        return next();
      }

      // Convert single permission to array
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

      // Check if user has all required permissions
      const hasPermission = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource.',
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error. Please try again.',
      });
    }
  };
};

/**
 * Middleware to restrict access to specific roles
 * @param {string|string[]} roles - Allowed roles
 * @returns {Function} - Express middleware
 */
exports.restrictTo = (roles) => {
  return (req, res, next) => {
    // Check if user exists in request (authenticate middleware should be called first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    // Convert single role to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Check if user role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This resource is restricted to ${allowedRoles.join(', ')} roles.`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if 2FA is required
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.check2FA = async (req, res, next) => {
  try {
    // Check if user exists in request (authenticate middleware should be called first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    // Check if 2FA is enabled for user
    if (req.user.twoFactorEnabled && !req.user.twoFactorVerified) {
      return res.status(403).json({
        success: false,
        message: 'Two-factor authentication required.',
        requiresTwoFactor: true,
      });
    }

    next();
  } catch (error) {
    console.error('2FA check error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.',
    });
  }
};

/**
 * Middleware to log API access
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.logApiAccess = (req, res, next) => {
  // Get request details
  const { method, originalUrl, ip } = req;
  const userAgent = req.headers['user-agent'];
  const userId = req.user ? req.user._id : 'unauthenticated';

  // Log access
  console.log(`API Access: ${method} ${originalUrl} by ${userId} from ${ip} using ${userAgent}`);

  // TODO: Implement more sophisticated logging with AuditLog model

  next();
};

/**
 * Optional authentication middleware
 * Authenticates the user if token is provided, but doesn't require it
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.optionalAuthenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // If no token, continue without authentication
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is in database and not revoked
    const tokenRecord = await AuthToken.findOne({
      token,
      type: 'access',
      isRevoked: false,
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return next();
    }

    // Get user
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.status !== 'active') {
      return next();
    }

    // Update last used timestamp
    tokenRecord.lastUsedAt = new Date();
    await tokenRecord.save({ validateBeforeSave: false });

    // Add user to request object
    req.user = user;
    req.token = tokenRecord;

    next();
  } catch (error) {
    // Continue without authentication on any error
    next();
  }
};