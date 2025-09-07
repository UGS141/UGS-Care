const mongoose = require('mongoose');

// Schema for structured logs
const logSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    level: {
      type: String,
      enum: ['debug', 'info', 'warn', 'error', 'fatal'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      required: true,
    },
    context: {
      requestId: String,
      sessionId: String,
      userId: mongoose.Schema.Types.ObjectId,
      userRole: String,
      ip: String,
      userAgent: String,
      path: String,
      method: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    tags: [String],
    host: String,
    pid: Number,
    version: String,
  },
  {
    timestamps: false, // We use the timestamp field directly
  }
);

// Schema for APM traces
const traceSchema = new mongoose.Schema(
  {
    traceId: {
      type: String,
      required: true,
      index: true,
    },
    parentSpanId: String,
    spanId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    kind: {
      type: String,
      enum: ['internal', 'server', 'client', 'producer', 'consumer'],
      default: 'internal',
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in milliseconds
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      required: true,
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      code: {
        type: String,
        enum: ['ok', 'error', 'unset'],
        default: 'unset',
      },
      message: String,
    },
    events: [{
      name: String,
      timestamp: Date,
      attributes: mongoose.Schema.Types.Mixed,
    }],
    links: [{
      traceId: String,
      spanId: String,
      attributes: mongoose.Schema.Types.Mixed,
    }],
    resource: {
      service: String,
      version: String,
      environment: String,
      host: String,
      attributes: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Schema for metrics
const metricSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['counter', 'gauge', 'histogram', 'summary'],
      required: true,
    },
    unit: String, // e.g., 'ms', 'bytes', 'requests'
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    labels: {
      type: Map,
      of: String,
      default: {},
    },
    service: {
      type: String,
      required: true,
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      required: true,
    },
    host: String,
    interval: String, // e.g., '1m', '5m', '1h'
    // For histogram and summary types
    quantiles: {
      p50: Number,
      p90: Number,
      p95: Number,
      p99: Number,
    },
    buckets: [{
      le: Number, // less than or equal to
      count: Number,
    }],
    sum: Number, // For histogram sum
    count: Number, // For histogram count
  },
  {
    timestamps: true,
  }
);

// Schema for SLOs (Service Level Objectives)
const sloSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    service: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['availability', 'latency', 'error_rate', 'throughput', 'custom'],
      required: true,
    },
    target: {
      type: Number,
      required: true,
    }, // e.g., 99.9 for 99.9% availability
    window: {
      type: String,
      enum: ['1h', '6h', '1d', '7d', '30d', 'custom'],
      required: true,
    },
    customWindow: Number, // in seconds, if window is 'custom'
    metric: {
      name: String,
      query: String, // Query to calculate the SLI
      successCriteria: mongoose.Schema.Types.Mixed, // Criteria for success
    },
    status: {
      type: String,
      enum: ['healthy', 'warning', 'critical', 'unknown'],
      default: 'unknown',
    },
    currentValue: Number,
    lastUpdated: Date,
    burnRate: Number, // Rate at which error budget is being consumed
    errorBudget: {
      total: Number,
      remaining: Number,
      consumed: Number,
      consumptionRate: Number, // per day
    },
    alertPolicies: [{
      name: String,
      condition: String,
      threshold: Number,
      duration: Number, // in seconds
      severity: {
        type: String,
        enum: ['info', 'warning', 'critical'],
      },
      notificationChannels: [String],
      isActive: Boolean,
    }],
    tags: [String],
    owner: String,
    documentation: String,
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

// Schema for alerts
const alertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    service: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['firing', 'resolved', 'acknowledged', 'silenced'],
      required: true,
    },
    source: {
      type: String,
      enum: ['metric', 'log', 'trace', 'slo', 'external', 'manual'],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    acknowledgedBy: {
      userId: mongoose.Schema.Types.ObjectId,
      timestamp: Date,
      comment: String,
    },
    resolvedBy: {
      userId: mongoose.Schema.Types.ObjectId,
      timestamp: Date,
      comment: String,
      resolution: String,
    },
    silencedBy: {
      userId: mongoose.Schema.Types.ObjectId,
      timestamp: Date,
      until: Date,
      reason: String,
    },
    labels: {
      type: Map,
      of: String,
      default: {},
    },
    annotations: {
      type: Map,
      of: String,
      default: {},
    },
    value: Number,
    threshold: Number,
    condition: String,
    metric: String,
    query: String,
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      required: true,
    },
    notificationsSent: [{
      channel: String,
      timestamp: Date,
      status: {
        type: String,
        enum: ['sent', 'delivered', 'failed'],
      },
      recipient: String,
      errorMessage: String,
    }],
    relatedAlerts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
    }],
    runbook: String, // URL or instructions for handling this alert
    tags: [String],
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Schema for incident management
const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ['investigating', 'identified', 'monitoring', 'resolved'],
      default: 'investigating',
    },
    severity: {
      type: String,
      enum: ['sev1', 'sev2', 'sev3', 'sev4', 'sev5'],
      required: true,
    },
    impact: {
      type: String,
      enum: ['none', 'minor', 'major', 'critical'],
      required: true,
    },
    affectedServices: [String],
    affectedComponents: [String],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    detectedBy: {
      type: String,
      enum: ['alert', 'user_report', 'monitoring', 'manual'],
      required: true,
    },
    detectedByUser: mongoose.Schema.Types.ObjectId,
    commander: {
      userId: mongoose.Schema.Types.ObjectId,
      name: String,
      assignedAt: Date,
    },
    responders: [{
      userId: mongoose.Schema.Types.ObjectId,
      name: String,
      role: String,
      assignedAt: Date,
    }],
    timeline: [{
      timestamp: Date,
      status: String,
      message: String,
      updatedBy: mongoose.Schema.Types.ObjectId,
      visibility: {
        type: String,
        enum: ['internal', 'public'],
        default: 'internal',
      },
    }],
    rootCause: String,
    resolution: String,
    actionItems: [{
      description: String,
      type: {
        type: String,
        enum: ['immediate', 'short_term', 'long_term'],
      },
      assignee: mongoose.Schema.Types.ObjectId,
      status: {
        type: String,
        enum: ['open', 'in_progress', 'completed'],
        default: 'open',
      },
      dueDate: Date,
      completedAt: Date,
      completedBy: mongoose.Schema.Types.ObjectId,
    }],
    postmortem: {
      summary: String,
      impact: String,
      rootCause: String,
      trigger: String,
      resolution: String,
      detectionMethod: String,
      timeToDetect: Number, // in minutes
      timeToResolve: Number, // in minutes
      lessonsLearned: [String],
      preventionSteps: [String],
      mitigationSteps: [String],
      attachments: [String], // URLs to attachments
      contributors: [mongoose.Schema.Types.ObjectId],
      reviewedBy: mongoose.Schema.Types.ObjectId,
      reviewedAt: Date,
      status: {
        type: String,
        enum: ['draft', 'review', 'approved', 'published'],
        default: 'draft',
      },
    },
    relatedAlerts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert',
    }],
    relatedIncidents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
    }],
    tags: [String],
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Create TTL index for logs to auto-delete after a certain period
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 days

// Create indexes for faster queries
logSchema.index({ level: 1 });
logSchema.index({ service: 1 });
logSchema.index({ 'context.requestId': 1 });
logSchema.index({ 'context.userId': 1 });
logSchema.index({ 'context.path': 1 });
logSchema.index({ tags: 1 });

traceSchema.index({ traceId: 1 });
traceSchema.index({ spanId: 1 });
traceSchema.index({ parentSpanId: 1 });
traceSchema.index({ service: 1 });
traceSchema.index({ startTime: 1 });
traceSchema.index({ duration: 1 });
traceSchema.index({ 'status.code': 1 });

metricSchema.index({ name: 1 });
metricSchema.index({ service: 1 });
metricSchema.index({ timestamp: 1 });
metricSchema.index({ type: 1 });

sloSchema.index({ name: 1 });
sloSchema.index({ service: 1 });
sloSchema.index({ type: 1 });
sloSchema.index({ status: 1 });
sloSchema.index({ tags: 1 });

alertSchema.index({ name: 1 });
alertSchema.index({ service: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ startTime: 1 });
alertSchema.index({ source: 1 });
alertSchema.index({ tags: 1 });

incidentSchema.index({ incidentId: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ startTime: 1 });
incidentSchema.index({ affectedServices: 1 });
incidentSchema.index({ tags: 1 });

// Auto-generate incident ID before saving
incidentSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const prefix = 'INC';
    const timestamp = Math.floor(Date.now() / 1000).toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.incidentId = `${prefix}${timestamp}${random}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Methods

// Static method to create a log entry
logSchema.statics.createLog = async function (level, message, service, context = {}, metadata = {}, tags = []) {
  return this.create({
    timestamp: new Date(),
    level,
    message,
    service,
    environment: process.env.NODE_ENV || 'development',
    context,
    metadata,
    tags,
    host: require('os').hostname(),
    pid: process.pid,
    version: process.env.APP_VERSION || '1.0.0',
  });
};

// Static method to create a trace span
traceSchema.statics.createSpan = async function (traceId, spanId, name, startTime, endTime, service, attributes = {}) {
  return this.create({
    traceId,
    spanId,
    name,
    startTime,
    endTime,
    duration: endTime - startTime,
    service,
    environment: process.env.NODE_ENV || 'development',
    attributes,
    status: { code: 'ok' },
    resource: {
      service,
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      host: require('os').hostname(),
    },
  });
};

// Static method to record a metric
metricSchema.statics.recordMetric = async function (name, value, type, service, labels = {}, unit = '') {
  return this.create({
    name,
    value,
    type,
    unit,
    timestamp: new Date(),
    labels: new Map(Object.entries(labels)),
    service,
    environment: process.env.NODE_ENV || 'development',
    host: require('os').hostname(),
  });
};

// Static method to update SLO status
sloSchema.statics.updateStatus = async function (name, currentValue) {
  const slo = await this.findOne({ name });
  
  if (!slo) {
    throw new Error(`SLO with name '${name}' not found`);
  }
  
  slo.currentValue = currentValue;
  slo.lastUpdated = new Date();
  
  // Update status based on current value and target
  if (slo.type === 'availability' || slo.type === 'latency') {
    if (currentValue >= slo.target) {
      slo.status = 'healthy';
    } else if (currentValue >= slo.target * 0.95) { // Within 5% of target
      slo.status = 'warning';
    } else {
      slo.status = 'critical';
    }
  } else if (slo.type === 'error_rate') {
    if (currentValue <= slo.target) {
      slo.status = 'healthy';
    } else if (currentValue <= slo.target * 1.05) { // Within 5% of target
      slo.status = 'warning';
    } else {
      slo.status = 'critical';
    }
  }
  
  // Update error budget
  if (slo.type === 'availability') {
    const totalBudget = (100 - slo.target) * 0.01; // Convert to decimal
    const consumed = Math.max(0, (slo.target - currentValue) * 0.01); // Convert to decimal
    
    slo.errorBudget = {
      total: totalBudget,
      consumed,
      remaining: Math.max(0, totalBudget - consumed),
      consumptionRate: slo.errorBudget?.consumptionRate || 0, // Needs historical data to calculate
    };
  }
  
  return slo.save();
};

// Static method to create an alert
alertSchema.statics.createAlert = async function (name, service, severity, source, value, threshold, condition, metric, environment) {
  return this.create({
    name,
    service,
    severity,
    status: 'firing',
    source,
    startTime: new Date(),
    value,
    threshold,
    condition,
    metric,
    environment: environment || process.env.NODE_ENV || 'development',
  });
};

// Method to acknowledge an alert
alertSchema.methods.acknowledge = async function (userId, comment) {
  this.status = 'acknowledged';
  this.acknowledgedBy = {
    userId,
    timestamp: new Date(),
    comment,
  };
  
  return this.save();
};

// Method to resolve an alert
alertSchema.methods.resolve = async function (userId, comment, resolution) {
  this.status = 'resolved';
  this.endTime = new Date();
  this.resolvedBy = {
    userId,
    timestamp: new Date(),
    comment,
    resolution,
  };
  
  return this.save();
};

// Static method to create an incident
incidentSchema.statics.createIncident = async function (title, description, severity, impact, affectedServices, detectedBy, detectedByUser) {
  return this.create({
    title,
    description,
    severity,
    impact,
    affectedServices,
    startTime: new Date(),
    detectedBy,
    detectedByUser,
    timeline: [{
      timestamp: new Date(),
      status: 'investigating',
      message: 'Incident created',
      updatedBy: detectedByUser,
    }],
  });
};

// Method to update incident status
incidentSchema.methods.updateStatus = async function (status, message, updatedBy, visibility = 'internal') {
  this.status = status;
  
  if (status === 'resolved') {
    this.endTime = new Date();
  }
  
  this.timeline.push({
    timestamp: new Date(),
    status,
    message,
    updatedBy,
    visibility,
  });
  
  return this.save();
};

const Log = mongoose.model('Log', logSchema);
const Trace = mongoose.model('Trace', traceSchema);
const Metric = mongoose.model('Metric', metricSchema);
const SLO = mongoose.model('SLO', sloSchema);
const Alert = mongoose.model('Alert', alertSchema);
const Incident = mongoose.model('Incident', incidentSchema);

module.exports = {
  Log,
  Trace,
  Metric,
  SLO,
  Alert,
  Incident,
};