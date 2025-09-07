const mongoose = require('mongoose');
const crypto = require('crypto');

// Schema for third-party integrations
const integrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: [
        'payment_gateway',
        'sms',
        'email',
        'notification',
        'identity_verification',
        'license_verification',
        'pos',
        'erp',
        'insurance',
        'telemedicine',
        'analytics',
        'logistics',
        'storage',
        'other',
      ],
      required: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'testing', 'error', 'pending'],
      default: 'inactive',
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    credentials: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    webhookUrl: String,
    webhookSecret: String,
    apiEndpoint: String,
    apiVersion: String,
    lastSyncAt: Date,
    healthStatus: {
      type: String,
      enum: ['healthy', 'degraded', 'down', 'unknown'],
      default: 'unknown',
    },
    healthCheckAt: Date,
    errorCount: {
      type: Number,
      default: 0,
    },
    lastErrorAt: Date,
    lastErrorMessage: String,
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

// Schema for integration events (webhooks, callbacks)
const integrationEventSchema = new mongoose.Schema(
  {
    integrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Integration',
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    eventId: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['received', 'processing', 'processed', 'failed', 'ignored'],
      default: 'received',
    },
    processedAt: Date,
    error: String,
    retryCount: {
      type: Number,
      default: 0,
    },
    nextRetryAt: Date,
    relatedEntities: [
      {
        entityType: {
          type: String,
          enum: [
            'order',
            'payment',
            'appointment',
            'prescription',
            'user',
            'pharmacy',
            'doctor',
            'hospital',
            'other',
          ],
        },
        entityId: mongoose.Schema.Types.ObjectId,
      },
    ],
    ipAddress: String,
    signature: String,
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Schema for API requests to third-party integrations
const integrationRequestSchema = new mongoose.Schema(
  {
    integrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Integration',
      required: true,
    },
    requestId: {
      type: String,
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      required: true,
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    requestBody: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    responseStatus: Number,
    responseBody: mongoose.Schema.Types.Mixed,
    responseTime: Number, // in milliseconds
    error: String,
    retryCount: {
      type: Number,
      default: 0,
    },
    nextRetryAt: Date,
  },
  {
    timestamps: true,
  }
);

// Schema for integration sync jobs
const integrationSyncSchema = new mongoose.Schema(
  {
    integrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Integration',
      required: true,
    },
    syncType: {
      type: String,
      enum: [
        'full',
        'incremental',
        'specific_entity',
        'specific_date_range',
        'other',
      ],
      required: true,
    },
    entityType: {
      type: String,
      enum: [
        'products',
        'inventory',
        'orders',
        'customers',
        'payments',
        'appointments',
        'prescriptions',
        'other',
      ],
    },
    dateRange: {
      from: Date,
      to: Date,
    },
    status: {
      type: String,
      enum: [
        'scheduled',
        'in_progress',
        'completed',
        'failed',
        'cancelled',
      ],
      default: 'scheduled',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    startedAt: Date,
    completedAt: Date,
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    totalRecords: Number,
    processedRecords: {
      type: Number,
      default: 0,
    },
    successRecords: {
      type: Number,
      default: 0,
    },
    failedRecords: {
      type: Number,
      default: 0,
    },
    error: String,
    logs: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        level: {
          type: String,
          enum: ['info', 'warning', 'error', 'debug'],
        },
        message: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
integrationSchema.index({ name: 1 });
integrationSchema.index({ type: 1 });
integrationSchema.index({ provider: 1 });
integrationSchema.index({ status: 1 });
integrationSchema.index({ healthStatus: 1 });

integrationEventSchema.index({ integrationId: 1 });
integrationEventSchema.index({ eventType: 1 });
integrationEventSchema.index({ status: 1 });
integrationEventSchema.index({ timestamp: 1 });

integrationRequestSchema.index({ integrationId: 1 });
integrationRequestSchema.index({ requestId: 1 });
integrationRequestSchema.index({ timestamp: 1 });

integrationSyncSchema.index({ integrationId: 1 });
integrationSyncSchema.index({ syncType: 1 });
integrationSyncSchema.index({ status: 1 });
integrationSyncSchema.index({ scheduledAt: 1 });

// Methods

// Generate webhook secret
integrationSchema.methods.generateWebhookSecret = function () {
  const secret = crypto.randomBytes(32).toString('hex');
  this.webhookSecret = secret;
  return secret;
};

// Verify webhook signature
integrationSchema.methods.verifyWebhookSignature = function (payload, signature, timestamp) {
  if (!this.webhookSecret) {
    return false;
  }
  
  // Implementation depends on the provider's signature verification method
  // This is a simplified example
  const hmac = crypto.createHmac('sha256', this.webhookSecret);
  const data = timestamp + '.' + JSON.stringify(payload);
  const expectedSignature = hmac.update(data).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
};

// Update health status
integrationSchema.methods.updateHealthStatus = async function (status, errorMessage = null) {
  this.healthStatus = status;
  this.healthCheckAt = new Date();
  
  if (status === 'down' || status === 'degraded') {
    this.errorCount += 1;
    this.lastErrorAt = new Date();
    this.lastErrorMessage = errorMessage;
  } else if (status === 'healthy') {
    this.errorCount = 0;
    this.lastErrorMessage = null;
  }
  
  return this.save();
};

// Process integration event
integrationEventSchema.methods.process = async function (status, error = null) {
  this.status = status;
  this.processedAt = new Date();
  
  if (status === 'failed') {
    this.error = error;
    this.retryCount += 1;
    
    // Calculate next retry time with exponential backoff
    const backoffMinutes = Math.min(Math.pow(2, this.retryCount), 60); // Max 60 minutes
    this.nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
  }
  
  return this.save();
};

// Log integration request
integrationRequestSchema.statics.logRequest = async function (integrationId, requestData) {
  const requestId = crypto.randomBytes(16).toString('hex');
  
  return this.create({
    integrationId,
    requestId,
    endpoint: requestData.endpoint,
    method: requestData.method,
    headers: requestData.headers,
    requestBody: requestData.requestBody,
    timestamp: new Date(),
  });
};

// Log integration request response
integrationRequestSchema.methods.logResponse = async function (responseData) {
  this.responseStatus = responseData.status;
  this.responseBody = responseData.body;
  this.responseTime = responseData.responseTime;
  
  if (responseData.error) {
    this.error = responseData.error;
  }
  
  return this.save();
};

// Start integration sync
integrationSyncSchema.methods.start = async function () {
  this.status = 'in_progress';
  this.startedAt = new Date();
  this.logs.push({
    timestamp: new Date(),
    level: 'info',
    message: 'Sync started',
  });
  
  return this.save();
};

// Update sync progress
integrationSyncSchema.methods.updateProgress = async function (processed, success, failed, total = null) {
  this.processedRecords = processed;
  this.successRecords = success;
  this.failedRecords = failed;
  
  if (total !== null) {
    this.totalRecords = total;
  }
  
  if (this.totalRecords) {
    this.progress = Math.round((this.processedRecords / this.totalRecords) * 100);
  }
  
  return this.save();
};

// Add log entry to sync
integrationSyncSchema.methods.addLog = async function (level, message) {
  this.logs.push({
    timestamp: new Date(),
    level,
    message,
  });
  
  return this.save();
};

// Complete sync
integrationSyncSchema.methods.complete = async function (status = 'completed', error = null) {
  this.status = status;
  this.completedAt = new Date();
  
  if (status === 'failed' && error) {
    this.error = error;
    this.logs.push({
      timestamp: new Date(),
      level: 'error',
      message: `Sync failed: ${error}`,
    });
  } else if (status === 'completed') {
    this.logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Sync completed successfully',
    });
  }
  
  return this.save();
};

const Integration = mongoose.model('Integration', integrationSchema);
const IntegrationEvent = mongoose.model('IntegrationEvent', integrationEventSchema);
const IntegrationRequest = mongoose.model('IntegrationRequest', integrationRequestSchema);
const IntegrationSync = mongoose.model('IntegrationSync', integrationSyncSchema);

module.exports = {
  Integration,
  IntegrationEvent,
  IntegrationRequest,
  IntegrationSync,
};