const mongoose = require('mongoose');
const { generateUniqueNumber } = require('../utils/number-generator');

// Schema for regulatory documents
const regulatoryDocumentSchema = new mongoose.Schema(
  {
    documentNumber: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    documentType: {
      type: String,
      enum: [
        'license',
        'certification',
        'permit',
        'registration',
        'audit_report',
        'compliance_report',
        'policy_document',
        'legal_agreement',
        'consent_form',
        'privacy_notice',
        'terms_of_service',
        'other',
      ],
      required: true,
    },
    entityType: {
      type: String,
      enum: [
        'platform',
        'pharmacy',
        'doctor',
        'hospital',
        'laboratory',
        'manufacturer',
        'distributor',
        'other',
      ],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    issuer: {
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: [
          'government',
          'regulatory_body',
          'certification_authority',
          'internal',
          'other',
        ],
        required: true,
      },
      contactInformation: String,
    },
    issuedAt: {
      type: Date,
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'revoked', 'suspended', 'pending_renewal', 'draft'],
      default: 'active',
    },
    documentUrl: String,
    documentHash: String,
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending', 'failed'],
      default: 'pending',
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verificationMethod: String,
    verificationDetails: mongoose.Schema.Types.Mixed,
    renewalReminders: [
      {
        scheduledAt: Date,
        sentAt: Date,
        recipientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['scheduled', 'sent', 'failed'],
          default: 'scheduled',
        },
      },
    ],
    renewalStatus: {
      type: String,
      enum: ['not_required', 'upcoming', 'in_progress', 'completed', 'overdue'],
      default: 'not_required',
    },
    renewalDueDate: Date,
    renewalAssignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    previousVersions: [
      {
        documentNumber: String,
        documentUrl: String,
        documentHash: String,
        validFrom: Date,
        validUntil: Date,
        status: String,
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    tags: [String],
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

// Schema for compliance audits
const complianceAuditSchema = new mongoose.Schema(
  {
    auditNumber: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    auditType: {
      type: String,
      enum: [
        'internal',
        'external',
        'regulatory',
        'security',
        'privacy',
        'quality',
        'operational',
        'financial',
        'other',
      ],
      required: true,
    },
    scope: {
      type: String,
      enum: [
        'platform_wide',
        'pharmacy_operations',
        'doctor_services',
        'patient_data',
        'payment_processing',
        'prescription_handling',
        'medication_dispensing',
        'delivery_logistics',
        'other',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'planned',
        'in_progress',
        'completed',
        'cancelled',
        'deferred',
      ],
      default: 'planned',
    },
    scheduledStartDate: {
      type: Date,
      required: true,
    },
    scheduledEndDate: {
      type: Date,
      required: true,
    },
    actualStartDate: Date,
    actualEndDate: Date,
    auditor: {
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: [
          'internal_team',
          'external_consultant',
          'regulatory_body',
          'certification_authority',
          'other',
        ],
        required: true,
      },
      contactInformation: String,
    },
    auditTeam: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: String,
        responsibilities: String,
      },
    ],
    findings: [
      {
        category: {
          type: String,
          enum: [
            'non_compliance',
            'observation',
            'recommendation',
            'best_practice',
            'other',
          ],
        },
        severity: {
          type: String,
          enum: ['critical', 'high', 'medium', 'low', 'informational'],
        },
        description: String,
        evidence: String,
        affectedAreas: [String],
        remediation: {
          plan: String,
          assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          dueDate: Date,
          status: {
            type: String,
            enum: [
              'open',
              'in_progress',
              'implemented',
              'verified',
              'deferred',
              'not_applicable',
            ],
            default: 'open',
          },
          completedAt: Date,
          verifiedAt: Date,
          verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          comments: String,
        },
      },
    ],
    summary: {
      criticalFindings: {
        type: Number,
        default: 0,
      },
      highFindings: {
        type: Number,
        default: 0,
      },
      mediumFindings: {
        type: Number,
        default: 0,
      },
      lowFindings: {
        type: Number,
        default: 0,
      },
      informationalFindings: {
        type: Number,
        default: 0,
      },
      overallRisk: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'minimal'],
      },
      conclusion: String,
    },
    reportUrl: String,
    reportHash: String,
    nextAuditDate: Date,
    relatedAudits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ComplianceAudit',
      },
    ],
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

// Schema for consent records
const consentRecordSchema = new mongoose.Schema(
  {
    consentId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    consentType: {
      type: String,
      enum: [
        'privacy_policy',
        'terms_of_service',
        'marketing_communications',
        'data_sharing',
        'cookies',
        'location_tracking',
        'health_data_processing',
        'third_party_access',
        'research_participation',
        'other',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['granted', 'denied', 'withdrawn', 'expired'],
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
    grantedAt: Date,
    deniedAt: Date,
    withdrawnAt: Date,
    expiresAt: Date,
    ipAddress: String,
    userAgent: String,
    deviceInfo: mongoose.Schema.Types.Mixed,
    location: {
      country: String,
      region: String,
      city: String,
    },
    verificationMethod: {
      type: String,
      enum: ['checkbox', 'email', 'sms', 'biometric', 'other'],
    },
    verificationDetails: mongoose.Schema.Types.Mixed,
    documentUrl: String,
    documentHash: String,
    additionalInformation: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Schema for data retention policies
const dataRetentionPolicySchema = new mongoose.Schema(
  {
    policyId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    dataCategory: {
      type: String,
      enum: [
        'personal_information',
        'health_records',
        'prescription_data',
        'payment_information',
        'communication_logs',
        'audit_logs',
        'analytics_data',
        'system_logs',
        'other',
      ],
      required: true,
    },
    retentionPeriod: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ['days', 'months', 'years'],
        required: true,
      },
    },
    legalBasis: {
      type: String,
      enum: [
        'legal_obligation',
        'contractual_necessity',
        'legitimate_interest',
        'consent',
        'vital_interest',
        'public_interest',
        'other',
      ],
      required: true,
    },
    legalReference: String,
    exceptionCriteria: String,
    archiveRules: String,
    deletionMethod: {
      type: String,
      enum: ['soft_delete', 'anonymization', 'pseudonymization', 'hard_delete', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft', 'archived'],
      default: 'active',
    },
    effectiveFrom: {
      type: Date,
      required: true,
    },
    effectiveUntil: Date,
    reviewFrequency: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'months', 'years'],
      },
    },
    lastReviewedAt: Date,
    lastReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    nextReviewDue: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
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

// Schema for data erasure requests
const dataErasureRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestType: {
      type: String,
      enum: [
        'complete_erasure',
        'partial_erasure',
        'anonymization',
        'account_closure',
        'other',
      ],
      required: true,
    },
    dataCategories: [
      {
        type: String,
        enum: [
          'personal_information',
          'health_records',
          'prescription_data',
          'payment_information',
          'communication_logs',
          'usage_data',
          'other',
        ],
      },
    ],
    reason: {
      type: String,
      enum: [
        'privacy_concerns',
        'service_dissatisfaction',
        'security_concerns',
        'moving_to_competitor',
        'legal_right_exercise',
        'other',
      ],
    },
    additionalInformation: String,
    status: {
      type: String,
      enum: [
        'submitted',
        'under_review',
        'approved',
        'partially_approved',
        'rejected',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'submitted',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDetails: {
      approvedCategories: [String],
      rejectedCategories: [String],
      retentionRequirements: String,
      legalHolds: Boolean,
      comments: String,
    },
    processingStartedAt: Date,
    processingCompletedAt: Date,
    verificationMethod: {
      type: String,
      enum: ['email', 'sms', 'identity_document', 'other'],
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
    },
    verifiedAt: Date,
    verificationDetails: mongoose.Schema.Types.Mixed,
    confirmationSentAt: Date,
    confirmationMethod: String,
    executionLogs: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        action: String,
        system: String,
        dataCategory: String,
        status: {
          type: String,
          enum: ['success', 'partial', 'failed'],
        },
        details: mongoose.Schema.Types.Mixed,
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Schema for incident reports
const incidentReportSchema = new mongoose.Schema(
  {
    incidentNumber: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    incidentType: {
      type: String,
      enum: [
        'data_breach',
        'security_incident',
        'privacy_violation',
        'service_disruption',
        'system_failure',
        'compliance_violation',
        'physical_security',
        'other',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'detected',
        'investigating',
        'contained',
        'remediated',
        'resolved',
        'closed',
      ],
      default: 'detected',
    },
    detectedAt: {
      type: Date,
      required: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    affectedSystems: [String],
    affectedDataCategories: [String],
    affectedUserCount: Number,
    containmentActions: [String],
    containedAt: Date,
    rootCause: String,
    rootCauseIdentifiedAt: Date,
    remediationPlan: String,
    remediationStartedAt: Date,
    remediationCompletedAt: Date,
    preventiveMeasures: [String],
    notificationRequirements: {
      regulatoryAuthorities: {
        required: Boolean,
        authorities: [String],
        deadline: Date,
        notifiedAt: Date,
        notificationDetails: String,
      },
      affectedIndividuals: {
        required: Boolean,
        deadline: Date,
        notifiedAt: Date,
        notificationMethod: String,
        notificationDetails: String,
      },
    },
    evidenceCollected: [String],
    investigationNotes: String,
    investigationTeam: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: String,
        responsibilities: String,
      },
    ],
    timeline: [
      {
        timestamp: Date,
        action: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        details: String,
      },
    ],
    lessonsLearned: String,
    postMortemDate: Date,
    postMortemAttendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    postMortemNotes: String,
    relatedIncidents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IncidentReport',
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate unique numbers
regulatoryDocumentSchema.pre('save', async function (next) {
  if (!this.documentNumber) {
    try {
      this.documentNumber = await generateUniqueNumber('DOC', 8);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

complianceAuditSchema.pre('save', async function (next) {
  if (!this.auditNumber) {
    try {
      this.auditNumber = await generateUniqueNumber('AUD', 8);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

consentRecordSchema.pre('save', async function (next) {
  if (!this.consentId) {
    try {
      this.consentId = await generateUniqueNumber('CON', 8);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

dataRetentionPolicySchema.pre('save', async function (next) {
  if (!this.policyId) {
    try {
      this.policyId = await generateUniqueNumber('POL', 8);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

dataErasureRequestSchema.pre('save', async function (next) {
  if (!this.requestNumber) {
    try {
      this.requestNumber = await generateUniqueNumber('ERA', 8);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

incidentReportSchema.pre('save', async function (next) {
  if (!this.incidentNumber) {
    try {
      this.incidentNumber = await generateUniqueNumber('INC', 8);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Methods

// Check if document is expiring soon
regulatoryDocumentSchema.methods.isExpiringSoon = function (daysThreshold = 30) {
  if (!this.validUntil) return false;
  
  const now = new Date();
  const daysUntilExpiry = Math.ceil((this.validUntil - now) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0;
};

// Schedule renewal reminders
regulatoryDocumentSchema.methods.scheduleRenewalReminders = function (reminderDays = [90, 60, 30, 15, 7, 3, 1]) {
  if (!this.validUntil) return this;
  
  this.renewalReminders = [];
  const now = new Date();
  
  reminderDays.forEach(days => {
    const reminderDate = new Date(this.validUntil);
    reminderDate.setDate(reminderDate.getDate() - days);
    
    if (reminderDate > now) {
      this.renewalReminders.push({
        scheduledAt: reminderDate,
        status: 'scheduled',
      });
    }
  });
  
  return this;
};

// Update audit findings summary
complianceAuditSchema.methods.updateFindingsSummary = function () {
  if (!this.findings || !this.findings.length) return this;
  
  this.summary.criticalFindings = this.findings.filter(f => f.severity === 'critical').length;
  this.summary.highFindings = this.findings.filter(f => f.severity === 'high').length;
  this.summary.mediumFindings = this.findings.filter(f => f.severity === 'medium').length;
  this.summary.lowFindings = this.findings.filter(f => f.severity === 'low').length;
  this.summary.informationalFindings = this.findings.filter(f => f.severity === 'informational').length;
  
  // Determine overall risk
  if (this.summary.criticalFindings > 0) {
    this.summary.overallRisk = 'critical';
  } else if (this.summary.highFindings > 0) {
    this.summary.overallRisk = 'high';
  } else if (this.summary.mediumFindings > 0) {
    this.summary.overallRisk = 'medium';
  } else if (this.summary.lowFindings > 0) {
    this.summary.overallRisk = 'low';
  } else {
    this.summary.overallRisk = 'minimal';
  }
  
  return this;
};

// Add finding to audit
complianceAuditSchema.methods.addFinding = function (finding) {
  if (!this.findings) this.findings = [];
  
  this.findings.push(finding);
  this.updateFindingsSummary();
  
  return this;
};

// Update finding status
complianceAuditSchema.methods.updateFindingStatus = function (findingIndex, status, userId, comments = '') {
  if (!this.findings || !this.findings[findingIndex]) return this;
  
  const finding = this.findings[findingIndex];
  finding.remediation.status = status;
  finding.remediation.comments = comments;
  
  if (status === 'implemented') {
    finding.remediation.completedAt = new Date();
  } else if (status === 'verified') {
    finding.remediation.verifiedAt = new Date();
    finding.remediation.verifiedBy = userId;
  }
  
  return this;
};

// Add timeline event to incident
incidentReportSchema.methods.addTimelineEvent = function (action, userId, details = '') {
  if (!this.timeline) this.timeline = [];
  
  this.timeline.push({
    timestamp: new Date(),
    action,
    performedBy: userId,
    details,
  });
  
  return this;
};

// Update incident status
incidentReportSchema.methods.updateStatus = function (newStatus, userId, details = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Set status-specific timestamps
  if (newStatus === 'contained' && !this.containedAt) {
    this.containedAt = new Date();
  } else if (newStatus === 'remediated' && !this.remediationCompletedAt) {
    this.remediationCompletedAt = new Date();
  }
  
  // Add to timeline
  this.addTimelineEvent(`Status changed from ${oldStatus} to ${newStatus}`, userId, details);
  
  return this;
};

// Create indexes for faster queries
regulatoryDocumentSchema.index({ documentNumber: 1 });
regulatoryDocumentSchema.index({ documentType: 1 });
regulatoryDocumentSchema.index({ entityType: 1, entityId: 1 });
regulatoryDocumentSchema.index({ status: 1 });
regulatoryDocumentSchema.index({ validUntil: 1 });
regulatoryDocumentSchema.index({ 'issuer.name': 1 });

complianceAuditSchema.index({ auditNumber: 1 });
complianceAuditSchema.index({ auditType: 1 });
complianceAuditSchema.index({ scope: 1 });
complianceAuditSchema.index({ status: 1 });
complianceAuditSchema.index({ scheduledStartDate: 1 });
complianceAuditSchema.index({ 'summary.overallRisk': 1 });

consentRecordSchema.index({ consentId: 1 });
consentRecordSchema.index({ userId: 1 });
consentRecordSchema.index({ consentType: 1 });
consentRecordSchema.index({ status: 1 });
consentRecordSchema.index({ version: 1 });

dataRetentionPolicySchema.index({ policyId: 1 });
dataRetentionPolicySchema.index({ dataCategory: 1 });
dataRetentionPolicySchema.index({ status: 1 });
dataRetentionPolicySchema.index({ effectiveFrom: 1 });
dataRetentionPolicySchema.index({ nextReviewDue: 1 });

dataErasureRequestSchema.index({ requestNumber: 1 });
dataErasureRequestSchema.index({ userId: 1 });
dataErasureRequestSchema.index({ requestType: 1 });
dataErasureRequestSchema.index({ status: 1 });
dataErasureRequestSchema.index({ submittedAt: 1 });

incidentReportSchema.index({ incidentNumber: 1 });
incidentReportSchema.index({ incidentType: 1 });
incidentReportSchema.index({ severity: 1 });
incidentReportSchema.index({ status: 1 });
incidentReportSchema.index({ detectedAt: 1 });

const RegulatoryDocument = mongoose.model('RegulatoryDocument', regulatoryDocumentSchema);
const ComplianceAudit = mongoose.model('ComplianceAudit', complianceAuditSchema);
const ConsentRecord = mongoose.model('ConsentRecord', consentRecordSchema);
const DataRetentionPolicy = mongoose.model('DataRetentionPolicy', dataRetentionPolicySchema);
const DataErasureRequest = mongoose.model('DataErasureRequest', dataErasureRequestSchema);
const IncidentReport = mongoose.model('IncidentReport', incidentReportSchema);

module.exports = {
  RegulatoryDocument,
  ComplianceAudit,
  ConsentRecord,
  DataRetentionPolicy,
  DataErasureRequest,
  IncidentReport,
};