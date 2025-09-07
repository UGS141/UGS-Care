const mongoose = require('mongoose');

// Dashboard configuration schema
const dashboardConfigSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'doctor', 'pharmacy', 'hospital', 'patient', 'pharma'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    layout: {
      type: mongoose.Schema.Types.Mixed, // JSON configuration for dashboard layout
      required: true,
    },
    widgets: [
      {
        widgetId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['chart', 'metric', 'table', 'map', 'alert', 'custom'],
          required: true,
        },
        title: String,
        dataSource: String, // Reference to the data source or query
        config: mongoose.Schema.Types.Mixed, // Widget-specific configuration
        position: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
        refreshInterval: Number, // In seconds
        isVisible: {
          type: Boolean,
          default: true,
        },
      },
    ],
    filters: [
      {
        name: String,
        field: String,
        type: {
          type: String,
          enum: ['date', 'select', 'multiselect', 'range', 'text'],
        },
        defaultValue: mongoose.Schema.Types.Mixed,
        options: [mongoose.Schema.Types.Mixed], // For select/multiselect
      },
    ],
    dateRange: {
      start: Date,
      end: Date,
      preset: String, // 'today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'custom'
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Saved report schema
const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['csv', 'pdf', 'excel', 'json'],
      required: true,
    },
    query: mongoose.Schema.Types.Mixed, // The query parameters used to generate the report
    filters: mongoose.Schema.Types.Mixed,
    columns: [String], // Columns to include in the report
    sortBy: String,
    sortOrder: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'asc',
    },
    schedule: {
      isScheduled: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly'],
      },
      dayOfWeek: Number, // 0-6, 0 is Sunday
      dayOfMonth: Number, // 1-31
      time: String, // HH:MM format
      timezone: String,
      recipients: [
        {
          email: String,
          name: String,
        },
      ],
      subject: String,
      message: String,
      lastSent: Date,
      nextScheduled: Date,
    },
    fileUrl: String, // URL to the generated report file
    status: {
      type: String,
      enum: ['draft', 'generated', 'scheduled', 'error'],
      default: 'draft',
    },
    generatedAt: Date,
    expiresAt: Date, // When the generated report file expires
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// KPI Alert schema
const kpiAlertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metric: {
      type: String,
      required: true, // The metric to monitor (e.g., 'order_fill_rate', 'inventory_level')
    },
    condition: {
      type: String,
      enum: ['above', 'below', 'equal', 'not_equal', 'change_by'],
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
    thresholdUnit: String, // %, days, count, etc.
    comparisonPeriod: {
      type: String,
      enum: ['previous_day', 'previous_week', 'previous_month', 'custom'],
    },
    customPeriod: Number, // In days, if comparisonPeriod is 'custom'
    scope: {
      // Scope of the alert (e.g., specific pharmacy, product, etc.)
      type: {
        type: String,
        enum: ['global', 'pharmacy', 'product', 'doctor', 'patient', 'hospital'],
      },
      entityId: mongoose.Schema.Types.ObjectId,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notifications: {
      channels: [{
        type: String,
        enum: ['email', 'sms', 'push', 'in_app'],
      }],
      recipients: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          email: String,
          phone: String,
        },
      ],
      throttle: {
        // Prevent notification spam
        maxPerDay: {
          type: Number,
          default: 3,
        },
        minInterval: {
          type: Number,
          default: 60, // Minutes
        },
      },
    },
    lastTriggered: Date,
    triggerCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'triggered', 'resolved', 'acknowledged'],
      default: 'pending',
    },
    acknowledgedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: Date,
      note: String,
    },
    resolvedAt: Date,
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Pharma Insights schema (for anonymized aggregates)
const pharmaInsightSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    pharmaCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming pharma companies are users with 'pharma' role
      required: true,
    },
    dataType: {
      type: String,
      enum: ['prescription_trends', 'geographic_distribution', 'demographic_analysis', 'treatment_patterns', 'custom'],
      required: true,
    },
    filters: {
      timeRange: {
        start: Date,
        end: Date,
      },
      products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }],
      genericNames: [String],
      therapeuticCategories: [String],
      geographies: [{
        type: String, // City, state, or region
        level: {
          type: String,
          enum: ['city', 'district', 'state', 'country'],
        },
      }],
      specialties: [String], // Doctor specialties
      ageGroups: [{
        min: Number,
        max: Number,
      }],
      genders: [String],
      custom: mongoose.Schema.Types.Mixed,
    },
    privacySettings: {
      minimumSampleSize: {
        type: Number,
        default: 10, // Minimum number of data points to show results
      },
      differentialPrivacyEnabled: {
        type: Boolean,
        default: true,
      },
      epsilonValue: {
        type: Number,
        default: 0.1, // Privacy budget parameter
      },
      aggregationLevel: {
        type: String,
        enum: ['individual', 'city', 'district', 'state', 'country'],
        default: 'district',
      },
      dataRetentionPeriod: {
        type: Number,
        default: 90, // Days
      },
    },
    accessControl: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      approvedAt: Date,
      expiresAt: Date,
      accessReason: String,
      dataUsageAgreement: {
        accepted: {
          type: Boolean,
          default: false,
        },
        acceptedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        acceptedAt: Date,
        version: String,
      },
    },
    results: {
      lastUpdated: Date,
      dataPoints: Number, // Number of data points in the result
      summary: mongoose.Schema.Types.Mixed, // Summary statistics
      visualizationData: mongoose.Schema.Types.Mixed, // Data for charts/visualizations
      insightUrl: String, // URL to the full insight dashboard/report
    },
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'processing', 'completed', 'rejected', 'expired'],
      default: 'pending_approval',
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Audit log for analytics access
const analyticsAuditSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['view', 'export', 'share', 'create', 'update', 'delete', 'schedule'],
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['dashboard', 'report', 'insight', 'alert', 'raw_data'],
      required: true,
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    resourceName: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed, // Additional details about the action
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
dashboardConfigSchema.index({ userId: 1, role: 1 });
dashboardConfigSchema.index({ isDefault: 1 });

reportSchema.index({ createdBy: 1 });
reportSchema.index({ 'schedule.isScheduled': 1, 'schedule.nextScheduled': 1 });
reportSchema.index({ status: 1 });

kpiAlertSchema.index({ metric: 1, isActive: 1 });
kpiAlertSchema.index({ 'scope.type': 1, 'scope.entityId': 1 });
kpiAlertSchema.index({ status: 1 });

pharmaInsightSchema.index({ pharmaCompanyId: 1 });
pharmaInsightSchema.index({ dataType: 1 });
pharmaInsightSchema.index({ status: 1 });
pharmaInsightSchema.index({ 'accessControl.expiresAt': 1 });

analyticsAuditSchema.index({ userId: 1 });
analyticsAuditSchema.index({ resourceType: 1, resourceId: 1 });
analyticsAuditSchema.index({ timestamp: 1 });

const DashboardConfig = mongoose.model('DashboardConfig', dashboardConfigSchema);
const Report = mongoose.model('Report', reportSchema);
const KpiAlert = mongoose.model('KpiAlert', kpiAlertSchema);
const PharmaInsight = mongoose.model('PharmaInsight', pharmaInsightSchema);
const AnalyticsAudit = mongoose.model('AnalyticsAudit', analyticsAuditSchema);

module.exports = {
  DashboardConfig,
  Report,
  KpiAlert,
  PharmaInsight,
  AnalyticsAudit,
};