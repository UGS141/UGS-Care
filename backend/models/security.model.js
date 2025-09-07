const mongoose = require('mongoose');
const crypto = require('crypto');

// Schema for authentication tokens
const authTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['access', 'refresh', 'reset_password', 'email_verification', 'phone_verification', 'device', 'api_key'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: Date,
    revokedReason: String,
    revokedBy: mongoose.Schema.Types.ObjectId,
    deviceInfo: {
      deviceId: String,
      deviceType: String,
      deviceName: String,
      os: String,
      osVersion: String,
      browser: String,
      browserVersion: String,
      ip: String,
      userAgent: String,
      appVersion: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastUsedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Schema for OTP (One-Time Password)
const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    phone: String,
    email: String,
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['login', 'registration', 'reset_password', 'verification', 'two_factor'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedUntil: Date,
    deviceInfo: {
      deviceId: String,
      ip: String,
      userAgent: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Schema for user sessions
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
    endReason: {
      type: String,
      enum: ['logout', 'expired', 'terminated', 'superseded', 'security_concern'],
    },
    deviceInfo: {
      deviceId: String,
      deviceType: String,
      deviceName: String,
      os: String,
      osVersion: String,
      browser: String,
      browserVersion: String,
      ip: String,
      userAgent: String,
      appVersion: String,
      location: {
        country: String,
        region: String,
        city: String,
        coordinates: {
          type: [Number], // [longitude, latitude]
          index: '2dsphere',
        },
      },
    },
    authMethod: {
      type: String,
      enum: ['password', 'otp', 'oauth', 'token', 'api_key', 'sso'],
      required: true,
    },
    activities: [{
      timestamp: Date,
      action: String,
      resource: String,
      ip: String,
      userAgent: String,
    }],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Schema for role-based access control
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    permissions: [{
      resource: {
        type: String,
        required: true,
      },
      actions: [{
        type: String,
        enum: ['create', 'read', 'update', 'delete', 'manage', 'approve', 'reject', 'export', 'import', 'assign'],
        required: true,
      }],
      conditions: mongoose.Schema.Types.Mixed, // JSON conditions for fine-grained access control
    }],
    isSystem: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Schema for API keys
const apiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['server', 'client', 'webhook', 'integration'],
      required: true,
    },
    permissions: [{
      resource: String,
      actions: [String],
    }],
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: Date,
    usageCount: {
      type: Number,
      default: 0,
    },
    rateLimit: {
      requests: Number,
      period: Number, // in seconds
    },
    ipRestrictions: [String], // IP addresses or CIDR ranges
    referrerRestrictions: [String], // Allowed referrers
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Schema for security events
const securityEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'login_success',
        'login_failure',
        'logout',
        'password_change',
        'password_reset',
        'account_locked',
        'account_unlocked',
        'account_created',
        'account_deleted',
        'role_change',
        'permission_change',
        'api_key_created',
        'api_key_deleted',
        'api_key_used',
        'suspicious_activity',
        'brute_force_attempt',
        'session_hijacking_attempt',
        'unauthorized_access_attempt',
        'data_export',
        'sensitive_data_access',
        'configuration_change',
        'two_factor_enabled',
        'two_factor_disabled',
        'two_factor_challenge',
        'ip_blocked',
        'ip_unblocked',
        'other',
      ],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: String,
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning', 'info'],
      required: true,
    },
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      region: String,
      city: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
    },
    deviceInfo: {
      deviceId: String,
      deviceType: String,
      os: String,
      browser: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    relatedEvents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SecurityEvent',
    }],
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Schema for two-factor authentication
const twoFactorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    methods: [{
      type: {
        type: String,
        enum: ['app', 'sms', 'email', 'backup_codes'],
        required: true,
      },
      isEnabled: {
        type: Boolean,
        default: false,
      },
      secret: String, // For TOTP app
      phone: String, // For SMS
      email: String, // For email
      backupCodes: [{
        code: String,
        isUsed: {
          type: Boolean,
          default: false,
        },
        usedAt: Date,
      }],
      lastUsed: Date,
    }],
    recoveryEmail: String,
    recoveryPhone: String,
    enabledAt: Date,
    lastVerifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Schema for encryption keys
const encryptionKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['symmetric', 'asymmetric', 'hmac'],
      required: true,
    },
    algorithm: {
      type: String,
      required: true,
    },
    keyMaterial: {
      type: String,
      required: true,
    },
    iv: String, // For symmetric encryption
    publicKey: String, // For asymmetric encryption
    privateKey: String, // For asymmetric encryption
    keySize: Number,
    purpose: {
      type: String,
      enum: ['data_encryption', 'token_signing', 'api_signing', 'document_signing', 'general'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'compromised', 'rotated', 'archived'],
      default: 'active',
    },
    version: {
      type: Number,
      default: 1,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    activatedAt: Date,
    expiresAt: Date,
    rotatedAt: Date,
    rotatedToKeyId: mongoose.Schema.Types.ObjectId,
    rotatedFromKeyId: mongoose.Schema.Types.ObjectId,
    lastUsedAt: Date,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Schema for IP blacklist
const ipBlacklistSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['single', 'range', 'subnet'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['manual', 'automatic', 'api', 'threat_intelligence'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: Date,
    incidents: [{
      timestamp: Date,
      description: String,
      eventId: mongoose.Schema.Types.ObjectId,
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create TTL indexes for auto-expiry
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Create indexes for faster queries
authTokenSchema.index({ userId: 1, type: 1 });
authTokenSchema.index({ token: 1 });
authTokenSchema.index({ isRevoked: 1 });

otpSchema.index({ userId: 1 });
otpSchema.index({ phone: 1 });
otpSchema.index({ email: 1 });
otpSchema.index({ otp: 1 });
otpSchema.index({ isVerified: 1 });

sessionSchema.index({ userId: 1 });
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ isActive: 1 });
sessionSchema.index({ 'deviceInfo.deviceId': 1 });
sessionSchema.index({ 'deviceInfo.ip': 1 });

roleSchema.index({ name: 1 });
roleSchema.index({ isActive: 1 });

apiKeySchema.index({ key: 1 });
apiKeySchema.index({ userId: 1 });
apiKeySchema.index({ isActive: 1 });

securityEventSchema.index({ eventType: 1 });
securityEventSchema.index({ userId: 1 });
securityEventSchema.index({ timestamp: 1 });
securityEventSchema.index({ status: 1 });
securityEventSchema.index({ ipAddress: 1 });
securityEventSchema.index({ riskScore: 1 });

twoFactorSchema.index({ userId: 1 });
twoFactorSchema.index({ isEnabled: 1 });

encryptionKeySchema.index({ name: 1 });
encryptionKeySchema.index({ status: 1 });
encryptionKeySchema.index({ purpose: 1 });

ipBlacklistSchema.index({ ip: 1 });
ipBlacklistSchema.index({ isActive: 1 });

// Methods

// Generate a secure random token
authTokenSchema.statics.generateToken = function (length = 32) {
  return crypto.randomBytes(length).toString('hex');
};

// Create a new auth token
authTokenSchema.statics.createToken = async function (userId, type, expiresIn, deviceInfo = {}) {
  const token = this.generateToken();
  const expiresAt = new Date(Date.now() + expiresIn * 1000); // expiresIn is in seconds
  
  return this.create({
    userId,
    token,
    type,
    expiresAt,
    deviceInfo,
    lastUsedAt: new Date(),
  });
};

// Verify a token
authTokenSchema.statics.verifyToken = async function (token, type) {
  const tokenDoc = await this.findOne({
    token,
    type,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
  
  if (!tokenDoc) {
    return null;
  }
  
  // Update last used timestamp
  tokenDoc.lastUsedAt = new Date();
  await tokenDoc.save();
  
  return tokenDoc;
};

// Revoke a token
authTokenSchema.methods.revoke = async function (reason, revokedBy) {
  this.isRevoked = true;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  this.revokedBy = revokedBy;
  
  return this.save();
};

// Generate OTP
otpSchema.statics.generateOTP = function (length = 6) {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
};

// Create a new OTP
otpSchema.statics.createOTP = async function (type, expiresIn, contact, userId = null, deviceInfo = {}) {
  const otp = this.generateOTP();
  const expiresAt = new Date(Date.now() + expiresIn * 1000); // expiresIn is in seconds
  
  const otpData = {
    otp,
    type,
    expiresAt,
    deviceInfo,
  };
  
  if (userId) {
    otpData.userId = userId;
  }
  
  if (contact.phone) {
    otpData.phone = contact.phone;
  }
  
  if (contact.email) {
    otpData.email = contact.email;
  }
  
  return this.create(otpData);
};

// Verify OTP
otpSchema.statics.verifyOTP = async function (otp, contact, type) {
  const query = {
    otp,
    type,
    isVerified: false,
    isBlocked: false,
    expiresAt: { $gt: new Date() },
  };
  
  if (contact.phone) {
    query.phone = contact.phone;
  } else if (contact.email) {
    query.email = contact.email;
  } else if (contact.userId) {
    query.userId = contact.userId;
  }
  
  const otpDoc = await this.findOne(query);
  
  if (!otpDoc) {
    return { success: false, message: 'Invalid or expired OTP' };
  }
  
  // Check attempts
  if (otpDoc.attempts >= otpDoc.maxAttempts) {
    otpDoc.isBlocked = true;
    otpDoc.blockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Block for 30 minutes
    await otpDoc.save();
    return { success: false, message: 'Too many attempts. Try again later' };
  }
  
  // Increment attempts
  otpDoc.attempts += 1;
  
  if (otp !== otpDoc.otp) {
    await otpDoc.save();
    return { success: false, message: 'Invalid OTP' };
  }
  
  // OTP is valid
  otpDoc.isVerified = true;
  otpDoc.verifiedAt = new Date();
  await otpDoc.save();
  
  return { success: true, otpDoc };
};

// Create a new session
sessionSchema.statics.createSession = async function (userId, deviceInfo, authMethod, expiresIn) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expiresIn * 1000); // expiresIn is in seconds
  
  return this.create({
    userId,
    sessionId,
    deviceInfo,
    authMethod,
    expiresAt,
    startedAt: new Date(),
    lastActivityAt: new Date(),
  });
};

// End a session
sessionSchema.methods.endSession = async function (reason) {
  this.isActive = false;
  this.endedAt = new Date();
  this.endReason = reason;
  
  return this.save();
};

// Add activity to session
sessionSchema.methods.addActivity = async function (action, resource, ip, userAgent) {
  this.activities.push({
    timestamp: new Date(),
    action,
    resource,
    ip,
    userAgent,
  });
  
  this.lastActivityAt = new Date();
  
  return this.save();
};

// Check if a role has permission
roleSchema.methods.hasPermission = function (resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  
  if (!permission) {
    return false;
  }
  
  return permission.actions.includes(action) || permission.actions.includes('manage');
};

// Generate API key
apiKeySchema.statics.generateKey = function () {
  return crypto.randomBytes(32).toString('hex');
};

// Create a new API key
apiKeySchema.statics.createKey = async function (name, userId, type, permissions, expiresAt = null, rateLimit = null, ipRestrictions = [], referrerRestrictions = [], createdBy = null) {
  const key = this.generateKey();
  
  return this.create({
    name,
    key,
    userId,
    type,
    permissions,
    expiresAt,
    rateLimit,
    ipRestrictions,
    referrerRestrictions,
    createdBy,
  });
};

// Verify API key
apiKeySchema.statics.verifyKey = async function (key, ip = null, referrer = null) {
  const apiKey = await this.findOne({
    key,
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
    ],
  });
  
  if (!apiKey) {
    return { success: false, message: 'Invalid or expired API key' };
  }
  
  // Check IP restrictions
  if (ip && apiKey.ipRestrictions && apiKey.ipRestrictions.length > 0) {
    const ipAllowed = apiKey.ipRestrictions.some(ipRange => {
      // Simple exact match for now
      // In a real implementation, you would use CIDR matching
      return ipRange === ip;
    });
    
    if (!ipAllowed) {
      return { success: false, message: 'IP not allowed' };
    }
  }
  
  // Check referrer restrictions
  if (referrer && apiKey.referrerRestrictions && apiKey.referrerRestrictions.length > 0) {
    const referrerAllowed = apiKey.referrerRestrictions.some(allowedReferrer => {
      // Simple exact match for now
      // In a real implementation, you would use pattern matching
      return referrer.includes(allowedReferrer);
    });
    
    if (!referrerAllowed) {
      return { success: false, message: 'Referrer not allowed' };
    }
  }
  
  // Update usage statistics
  apiKey.lastUsedAt = new Date();
  apiKey.usageCount += 1;
  await apiKey.save();
  
  return { success: true, apiKey };
};

// Log a security event
securityEventSchema.statics.logEvent = async function (eventType, status, details, userId = null, sessionId = null, ipAddress = null, userAgent = null, deviceInfo = null, location = null, riskScore = null, tags = []) {
  return this.create({
    eventType,
    status,
    details,
    userId,
    sessionId,
    ipAddress,
    userAgent,
    deviceInfo,
    location,
    riskScore,
    tags,
    timestamp: new Date(),
  });
};

// Generate TOTP secret
twoFactorSchema.statics.generateTOTPSecret = function () {
  return crypto.randomBytes(20).toString('hex');
};

// Generate backup codes
twoFactorSchema.statics.generateBackupCodes = function (count = 10, length = 8) {
  const codes = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < length; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    codes.push({ code, isUsed: false });
  }
  
  return codes;
};

// Enable 2FA for a user
twoFactorSchema.statics.enable = async function (userId, method, contact = null) {
  let twoFactor = await this.findOne({ userId });
  
  if (!twoFactor) {
    twoFactor = new this({
      userId,
      isEnabled: true,
      enabledAt: new Date(),
      methods: [],
    });
  }
  
  // Find or create the method
  let methodObj = twoFactor.methods.find(m => m.type === method);
  
  if (!methodObj) {
    methodObj = {
      type: method,
      isEnabled: true,
    };
    twoFactor.methods.push(methodObj);
  } else {
    methodObj.isEnabled = true;
  }
  
  // Set method-specific properties
  if (method === 'app') {
    methodObj.secret = this.generateTOTPSecret();
  } else if (method === 'sms' && contact?.phone) {
    methodObj.phone = contact.phone;
  } else if (method === 'email' && contact?.email) {
    methodObj.email = contact.email;
  } else if (method === 'backup_codes') {
    methodObj.backupCodes = this.generateBackupCodes();
  }
  
  twoFactor.isEnabled = true;
  twoFactor.enabledAt = new Date();
  
  return twoFactor.save();
};

// Verify 2FA code
twoFactorSchema.methods.verifyCode = async function (method, code) {
  const methodObj = this.methods.find(m => m.type === method && m.isEnabled);
  
  if (!methodObj) {
    return { success: false, message: 'Method not enabled' };
  }
  
  let isValid = false;
  
  if (method === 'app') {
    // In a real implementation, you would use a TOTP library to verify the code
    // For simplicity, we're just checking if the code is '123456'
    isValid = code === '123456';
  } else if (method === 'backup_codes') {
    const backupCode = methodObj.backupCodes.find(bc => bc.code === code && !bc.isUsed);
    
    if (backupCode) {
      backupCode.isUsed = true;
      backupCode.usedAt = new Date();
      isValid = true;
    }
  }
  
  if (isValid) {
    methodObj.lastUsed = new Date();
    this.lastVerifiedAt = new Date();
    await this.save();
    
    return { success: true };
  }
  
  return { success: false, message: 'Invalid code' };
};

// Generate a new encryption key
encryptionKeySchema.statics.generateKey = async function (name, type, algorithm, keySize, purpose) {
  let keyMaterial, publicKey, privateKey;
  
  if (type === 'symmetric') {
    keyMaterial = crypto.randomBytes(keySize / 8).toString('hex');
    const iv = crypto.randomBytes(16).toString('hex');
    
    return this.create({
      name,
      description: `${algorithm} ${keySize}-bit key for ${purpose}`,
      type,
      algorithm,
      keyMaterial,
      iv,
      keySize,
      purpose,
      status: 'active',
      activatedAt: new Date(),
    });
  } else if (type === 'asymmetric') {
    // In a real implementation, you would use proper key generation
    // For simplicity, we're just generating random strings
    publicKey = crypto.randomBytes(keySize / 8).toString('hex');
    privateKey = crypto.randomBytes(keySize / 8).toString('hex');
    
    return this.create({
      name,
      description: `${algorithm} ${keySize}-bit key pair for ${purpose}`,
      type,
      algorithm,
      keyMaterial: 'N/A',
      publicKey,
      privateKey,
      keySize,
      purpose,
      status: 'active',
      activatedAt: new Date(),
    });
  } else if (type === 'hmac') {
    keyMaterial = crypto.randomBytes(keySize / 8).toString('hex');
    
    return this.create({
      name,
      description: `${algorithm} ${keySize}-bit HMAC key for ${purpose}`,
      type,
      algorithm,
      keyMaterial,
      keySize,
      purpose,
      status: 'active',
      activatedAt: new Date(),
    });
  }
};

// Rotate an encryption key
encryptionKeySchema.methods.rotate = async function () {
  // Create a new key with the same properties
  const newKey = await this.constructor.generateKey(
    `${this.name}_v${this.version + 1}`,
    this.type,
    this.algorithm,
    this.keySize,
    this.purpose
  );
  
  // Update the old key
  this.status = 'rotated';
  this.rotatedAt = new Date();
  this.rotatedToKeyId = newKey._id;
  await this.save();
  
  // Update the new key
  newKey.version = this.version + 1;
  newKey.rotatedFromKeyId = this._id;
  await newKey.save();
  
  return newKey;
};

// Add an IP to the blacklist
ipBlacklistSchema.statics.blockIP = async function (ip, reason, source, severity = 'medium', expiresAt = null, incidents = [], createdBy = null) {
  let type = 'single';
  
  if (ip.includes('/')) {
    type = 'subnet';
  } else if (ip.includes('-')) {
    type = 'range';
  }
  
  return this.create({
    ip,
    type,
    reason,
    source,
    severity,
    expiresAt,
    incidents,
    createdBy,
  });
};

// Check if an IP is blacklisted
ipBlacklistSchema.statics.isBlacklisted = async function (ip) {
  const blacklistedIP = await this.findOne({
    ip,
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
    ],
  });
  
  if (blacklistedIP) {
    return { isBlacklisted: true, reason: blacklistedIP.reason, severity: blacklistedIP.severity };
  }
  
  // In a real implementation, you would also check CIDR ranges and IP ranges
  // For simplicity, we're just checking exact matches
  
  return { isBlacklisted: false };
};

const AuthToken = mongoose.model('AuthToken', authTokenSchema);
const OTP = mongoose.model('OTP', otpSchema);
const Session = mongoose.model('Session', sessionSchema);
const Role = mongoose.model('Role', roleSchema);
const ApiKey = mongoose.model('ApiKey', apiKeySchema);
const SecurityEvent = mongoose.model('SecurityEvent', securityEventSchema);
const TwoFactor = mongoose.model('TwoFactor', twoFactorSchema);
const EncryptionKey = mongoose.model('EncryptionKey', encryptionKeySchema);
const IPBlacklist = mongoose.model('IPBlacklist', ipBlacklistSchema);

module.exports = {
  AuthToken,
  OTP,
  Session,
  Role,
  ApiKey,
  SecurityEvent,
  TwoFactor,
  EncryptionKey,
  IPBlacklist,
};