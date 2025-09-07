const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: String,
      name: String,
      email: String,
      phone: String,
      ipAddress: String,
      userAgent: String,
      deviceInfo: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    action: {
      type: String,
      enum: [
        'create',
        'read',
        'update',
        'delete',
        'login',
        'logout',
        'register',
        'verify',
        'approve',
        'reject',
        'cancel',
        'complete',
        'payment',
        'refund',
        'upload',
        'download',
        'share',
        'assign',
        'revoke',
        'export',
        'import',
        'other',
      ],
      required: true,
    },
    entityType: {
      type: String,
      enum: [
        'user',
        'doctor',
        'patient',
        'pharmacy',
        'hospital',
        'erx',
        'order',
        'appointment',
        'payment',
        'subscription',
        'membership',
        'product',
        'inventory',
        'promo_code',
        'pharma_message',
        'report',
        'dashboard',
        'dispute',
        'refund',
        'regulatory_document',
        'content_moderation',
        'data_erasure_request',
        'system',
        'other',
      ],
      required: true,
    },
    entityId: mongoose.Schema.Types.ObjectId,
    entityName: String, // Human-readable identifier (e.g., order number, username)
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning', 'info'],
      default: 'success',
    },
    description: String, // Human-readable description of the action
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    changes: {
      before: mongoose.Schema.Types.Mixed, // State before the action
      after: mongoose.Schema.Types.Mixed, // State after the action
      diff: mongoose.Schema.Types.Mixed, // Computed difference
    },
    metadata: {
      source: {
        type: String,
        enum: ['api', 'web', 'mobile', 'system', 'admin', 'other'],
        default: 'api',
      },
      requestId: String, // For tracing requests across the system
      sessionId: String,
      transactionId: String,
      location: {
        latitude: Number,
        longitude: Number,
        city: String,
        state: String,
        country: String,
      },
      additionalInfo: mongoose.Schema.Types.Mixed,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    isSystemGenerated: {
      type: Boolean,
      default: false,
    },
    relatedLogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuditLog',
      },
    ],
    tags: [String],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create a TTL index for automatic deletion after retention period
// This is configurable based on data retention policies
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // Default 2 years

// Indexes for faster queries
auditLogSchema.index({ 'actor.userId': 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ timestamp: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ 'metadata.requestId': 1 });
auditLogSchema.index({ 'metadata.sessionId': 1 });
auditLogSchema.index({ tags: 1 });

// Compound indexes for common query patterns
auditLogSchema.index({ 'actor.userId': 1, timestamp: 1 });
auditLogSchema.index({ entityType: 1, action: 1, timestamp: 1 });
auditLogSchema.index({ 'actor.userId': 1, entityType: 1, action: 1 });

// Consent log schema for tracking user consent
const consentLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    consentType: {
      type: String,
      enum: [
        'terms_of_service',
        'privacy_policy',
        'marketing_communications',
        'data_sharing',
        'location_tracking',
        'cookies',
        'health_data_processing',
        'third_party_access',
        'other',
      ],
      required: true,
    },
    action: {
      type: String,
      enum: ['given', 'withdrawn', 'updated'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    version: {
      type: String, // Version of the policy/terms that was agreed to
      required: true,
    },
    documentUrl: String, // URL to the specific version of the document
    ipAddress: String,
    userAgent: String,
    deviceInfo: mongoose.Schema.Types.Mixed,
    location: {
      latitude: Number,
      longitude: Number,
      city: String,
      state: String,
      country: String,
    },
    verificationMethod: {
      type: String,
      enum: ['checkbox', 'email', 'sms', 'biometric', 'other'],
    },
    additionalDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expiryDate: Date, // When this consent expires (if applicable)
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for consent logs
consentLogSchema.index({ userId: 1 });
consentLogSchema.index({ consentType: 1 });
consentLogSchema.index({ timestamp: 1 });
consentLogSchema.index({ isValid: 1 });
consentLogSchema.index({ userId: 1, consentType: 1, isValid: 1 });
consentLogSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 }); // TTL index for expired consents

// Security event log schema for tracking security-related events
const securityEventLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'login_success',
        'login_failure',
        'password_change',
        'password_reset',
        'account_lockout',
        'account_unlock',
        'permission_change',
        'role_change',
        'api_key_generated',
        'api_key_revoked',
        'suspicious_activity',
        'brute_force_attempt',
        'session_expired',
        'session_terminated',
        'two_factor_enabled',
        'two_factor_disabled',
        'two_factor_success',
        'two_factor_failure',
        'data_export',
        'data_access',
        'other',
      ],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userType: String,
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning', 'info'],
      default: 'info',
    },
    ipAddress: String,
    userAgent: String,
    deviceInfo: {
      deviceId: String,
      deviceType: String,
      os: String,
      osVersion: String,
      browser: String,
      browserVersion: String,
      appVersion: String,
    },
    location: {
      latitude: Number,
      longitude: Number,
      city: String,
      state: String,
      country: String,
    },
    description: String,
    details: mongoose.Schema.Types.Mixed,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    actionTaken: String, // Description of any automated action taken
    relatedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SecurityEventLog',
      },
    ],
    sessionId: String,
    requestId: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for security event logs
securityEventLogSchema.index({ eventType: 1 });
securityEventLogSchema.index({ userId: 1 });
securityEventLogSchema.index({ timestamp: 1 });
securityEventLogSchema.index({ status: 1 });
securityEventLogSchema.index({ severity: 1 });
securityEventLogSchema.index({ ipAddress: 1 });
securityEventLogSchema.index({ sessionId: 1 });

// Compound indexes for common security queries
securityEventLogSchema.index({ userId: 1, eventType: 1, timestamp: 1 });
securityEventLogSchema.index({ ipAddress: 1, eventType: 1, timestamp: 1 });
securityEventLogSchema.index({ eventType: 1, status: 1, timestamp: 1 });

// Create TTL index for security logs (different retention period than general audit logs)
securityEventLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 94608000 }); // Default 3 years

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
const ConsentLog = mongoose.model('ConsentLog', consentLogSchema);
const SecurityEventLog = mongoose.model('SecurityEventLog', securityEventLogSchema);

module.exports = {
  AuditLog,
  ConsentLog,
  SecurityEventLog,
};