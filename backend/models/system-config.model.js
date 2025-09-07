const mongoose = require('mongoose');

// Schema for system settings
const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    dataType: {
      type: String,
      enum: ['string', 'number', 'boolean', 'object', 'array', 'date'],
      required: true,
    },
    description: String,
    category: {
      type: String,
      required: true,
      enum: [
        'general',
        'security',
        'notification',
        'payment',
        'order',
        'appointment',
        'prescription',
        'pharmacy',
        'doctor',
        'patient',
        'hospital',
        'analytics',
        'integration',
        'performance',
        'compliance',
        'other',
      ],
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
    isEditable: {
      type: Boolean,
      default: true,
    },
    validationRules: {
      min: Number,
      max: Number,
      pattern: String,
      enum: [mongoose.Schema.Types.Mixed],
      required: Boolean,
    },
    defaultValue: mongoose.Schema.Types.Mixed,
    tags: [String],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Schema for feature flags
const featureFlagSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    isEnabled: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: [
        'core',
        'experimental',
        'beta',
        'premium',
        'performance',
        'security',
        'compliance',
        'integration',
        'other',
      ],
      default: 'other',
    },
    targetAudience: {
      type: {
        type: String,
        enum: ['all', 'percentage', 'specific_users', 'specific_roles', 'specific_criteria'],
        default: 'all',
      },
      percentage: {
        type: Number,
        min: 0,
        max: 100,
      },
      specificUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }],
      specificRoles: [{
        type: String,
        enum: ['patient', 'doctor', 'pharmacy', 'hospital', 'admin', 'pharma'],
      }],
      criteria: mongoose.Schema.Types.Mixed, // Complex criteria for targeting
    },
    platforms: [{
      type: String,
      enum: ['all', 'web', 'android', 'ios', 'admin'],
    }],
    environments: [{
      type: String,
      enum: ['development', 'staging', 'production'],
    }],
    startDate: Date,
    endDate: Date,
    killSwitch: {
      type: Boolean,
      default: true,
    }, // Emergency kill switch
    lastEnabledAt: Date,
    lastDisabledAt: Date,
    metrics: {
      impressions: {
        type: Number,
        default: 0,
      },
      conversions: {
        type: Number,
        default: 0,
      },
      errors: {
        type: Number,
        default: 0,
      },
    },
    dependencies: [{
      featureKey: String,
      condition: {
        type: String,
        enum: ['enabled', 'disabled'],
      },
    }],
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

// Schema for maintenance mode
const maintenanceModeSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    message: {
      type: Map,
      of: String, // Localized messages
      required: true,
    },
    affectedServices: [{
      type: String,
      enum: [
        'all',
        'auth',
        'doctor',
        'pharmacy',
        'patient',
        'hospital',
        'order',
        'appointment',
        'payment',
        'prescription',
        'analytics',
        'admin',
        'other',
      ],
    }],
    allowedRoles: [{
      type: String,
      enum: ['admin', 'support'],
    }],
    allowedIPs: [String],
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

// Schema for API rate limits
const rateLimitSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'ALL'],
      default: 'ALL',
    },
    limit: {
      type: Number,
      required: true,
    },
    windowMs: {
      type: Number,
      required: true,
    }, // Time window in milliseconds
    userRoleLimits: {
      patient: Number,
      doctor: Number,
      pharmacy: Number,
      hospital: Number,
      admin: Number,
      pharma: Number,
      anonymous: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: String,
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

// Schema for service health
const serviceHealthSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['operational', 'degraded', 'outage', 'maintenance'],
      default: 'operational',
    },
    lastChecked: {
      type: Date,
      default: Date.now,
    },
    uptime: {
      last24Hours: Number, // Percentage
      last7Days: Number, // Percentage
      last30Days: Number, // Percentage
    },
    responseTime: {
      current: Number, // in ms
      average24Hours: Number, // in ms
      average7Days: Number, // in ms
    },
    incidents: [{
      startTime: Date,
      endTime: Date,
      status: {
        type: String,
        enum: ['degraded', 'outage'],
      },
      reason: String,
      resolution: String,
    }],
    dependencies: [String], // Other services this service depends on
    endpoints: [{
      path: String,
      method: String,
      status: {
        type: String,
        enum: ['operational', 'degraded', 'outage', 'maintenance'],
      },
      responseTime: Number, // in ms
    }],
    metrics: {
      requestCount: Number,
      errorCount: Number,
      errorRate: Number, // Percentage
    },
    alerts: [{
      timestamp: Date,
      type: String,
      message: String,
      resolved: Boolean,
      resolvedAt: Date,
    }],
  },
  {
    timestamps: true,
  }
);

// Schema for system announcements
const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: Map,
      of: String, // Localized titles
      required: true,
    },
    content: {
      type: Map,
      of: String, // Localized content
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'critical', 'update', 'new_feature', 'promotion'],
      default: 'info',
    },
    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    targetAudience: {
      roles: [{
        type: String,
        enum: ['patient', 'doctor', 'pharmacy', 'hospital', 'admin', 'pharma', 'all'],
      }],
      platforms: [{
        type: String,
        enum: ['web', 'android', 'ios', 'admin', 'all'],
      }],
      locations: [String], // Country or region codes
    },
    displayOptions: {
      position: {
        type: String,
        enum: ['top', 'bottom', 'modal', 'sidebar', 'inline'],
        default: 'top',
      },
      dismissible: {
        type: Boolean,
        default: true,
      },
      showOnce: {
        type: Boolean,
        default: false,
      },
      style: {
        backgroundColor: String,
        textColor: String,
        borderColor: String,
        icon: String,
      },
    },
    actions: [{
      label: {
        type: Map,
        of: String, // Localized labels
      },
      url: String,
      type: {
        type: String,
        enum: ['link', 'button', 'dismiss'],
      },
    }],
    metrics: {
      impressions: {
        type: Number,
        default: 0,
      },
      dismissals: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
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

// Create indexes for faster queries
systemSettingSchema.index({ key: 1 });
systemSettingSchema.index({ category: 1 });
systemSettingSchema.index({ 'tags': 1 });

featureFlagSchema.index({ key: 1 });
featureFlagSchema.index({ isEnabled: 1 });
featureFlagSchema.index({ category: 1 });
featureFlagSchema.index({ 'targetAudience.type': 1 });
featureFlagSchema.index({ 'targetAudience.specificRoles': 1 });
featureFlagSchema.index({ 'platforms': 1 });
featureFlagSchema.index({ 'environments': 1 });

maintenanceModeSchema.index({ isActive: 1 });
maintenanceModeSchema.index({ startTime: 1, endTime: 1 });

rateLimitSchema.index({ endpoint: 1, method: 1 });
rateLimitSchema.index({ isActive: 1 });

serviceHealthSchema.index({ serviceName: 1 });
serviceHealthSchema.index({ status: 1 });
serviceHealthSchema.index({ lastChecked: 1 });

announcementSchema.index({ isActive: 1 });
announcementSchema.index({ startDate: 1, endDate: 1 });
announcementSchema.index({ 'targetAudience.roles': 1 });
announcementSchema.index({ 'targetAudience.platforms': 1 });
announcementSchema.index({ type: 1, priority: -1 });

// Methods

// Check if a feature flag is enabled for a specific user
featureFlagSchema.methods.isEnabledForUser = function (user) {
  if (!this.isEnabled) {
    return false;
  }

  // Check if feature is active based on dates
  const now = new Date();
  if (this.startDate && now < this.startDate) {
    return false;
  }
  if (this.endDate && now > this.endDate) {
    return false;
  }

  // Check target audience
  const targetType = this.targetAudience.type;

  if (targetType === 'all') {
    return true;
  }

  if (!user) {
    return false;
  }

  if (targetType === 'specific_users') {
    return this.targetAudience.specificUsers.some(userId => 
      userId.toString() === user._id.toString());
  }

  if (targetType === 'specific_roles' && user.role) {
    return this.targetAudience.specificRoles.includes(user.role);
  }

  if (targetType === 'percentage') {
    // Deterministic percentage rollout based on user ID
    const percentage = this.targetAudience.percentage || 0;
    if (percentage >= 100) return true;
    if (percentage <= 0) return false;

    // Use user ID to generate a consistent hash for percentage calculation
    const hash = require('crypto')
      .createHash('md5')
      .update(user._id.toString() + this.key)
      .digest('hex');
    
    // Convert first 4 chars of hash to a number between 0-100
    const userValue = parseInt(hash.substring(0, 4), 16) % 100;
    return userValue < percentage;
  }

  // For specific_criteria, we would need a more complex evaluation
  // that depends on the structure of the criteria

  return false;
};

// Static method to get all active announcements for a user
announcementSchema.statics.getActiveAnnouncements = async function (user, platform) {
  const now = new Date();
  
  const query = {
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  };

  // Filter by role if user is provided
  if (user && user.role) {
    query.$or = [
      { 'targetAudience.roles': 'all' },
      { 'targetAudience.roles': user.role },
    ];
  } else {
    query['targetAudience.roles'] = 'all';
  }

  // Filter by platform if provided
  if (platform) {
    query.$or = query.$or || [];
    query.$or.push(
      { 'targetAudience.platforms': 'all' },
      { 'targetAudience.platforms': platform },
    );
  } else {
    query['targetAudience.platforms'] = 'all';
  }

  return this.find(query).sort({ priority: -1 });
};

// Static method to get system settings by category
systemSettingSchema.statics.getByCategory = async function (category) {
  const settings = await this.find({ category });
  
  // Convert to key-value object
  const result = {};
  settings.forEach(setting => {
    result[setting.key] = setting.value;
  });
  
  return result;
};

// Static method to get a setting value by key
systemSettingSchema.statics.getValueByKey = async function (key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to update a setting value
systemSettingSchema.statics.updateValueByKey = async function (key, value, userId) {
  const setting = await this.findOne({ key });
  
  if (!setting) {
    throw new Error(`Setting with key '${key}' not found`);
  }
  
  if (!setting.isEditable) {
    throw new Error(`Setting with key '${key}' is not editable`);
  }
  
  setting.value = value;
  setting.lastModifiedBy = userId;
  
  return setting.save();
};

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);
const MaintenanceMode = mongoose.model('MaintenanceMode', maintenanceModeSchema);
const RateLimit = mongoose.model('RateLimit', rateLimitSchema);
const ServiceHealth = mongoose.model('ServiceHealth', serviceHealthSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = {
  SystemSetting,
  FeatureFlag,
  MaintenanceMode,
  RateLimit,
  ServiceHealth,
  Announcement,
};