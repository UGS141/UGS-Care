const mongoose = require('mongoose');

// Role and Permission Schema
const permissionSchema = new mongoose.Schema(
  {
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'export', 'import', 'all'],
      required: true,
    }],
    conditions: mongoose.Schema.Types.Mixed, // Optional conditions for fine-grained access control
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    permissions: [permissionSchema],
    isSystem: {
      type: Boolean,
      default: false, // True for built-in roles that cannot be modified
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Feature Flag Schema
const featureFlagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    isEnabled: {
      type: Boolean,
      default: false,
    },
    targetUsers: {
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
    specificRoles: [String],
    criteria: mongoose.Schema.Types.Mixed, // Custom criteria for enabling the feature
    startDate: Date,
    endDate: Date, // For temporary features
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

// Regulatory Compliance Schema
const regulatoryDocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['license', 'certification', 'audit_report', 'compliance_certificate', 'legal_document', 'policy', 'other'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    entityType: {
      type: String,
      enum: ['system', 'doctor', 'pharmacy', 'hospital', 'pharma_company'],
      required: true,
    },
    entityId: mongoose.Schema.Types.ObjectId, // Reference to the entity this document belongs to
    documentUrl: String, // URL to the document in storage
    fileHash: String, // Hash of the file for integrity verification
    issuedBy: String, // Authority that issued the document
    issuedDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired', 'revoked'],
      default: 'pending',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    verificationMethod: {
      type: String,
      enum: ['manual', 'api', 'blockchain', 'other'],
    },
    verificationDetails: mongoose.Schema.Types.Mixed,
    tags: [String],
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Content Moderation Schema
const contentModerationSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ['review', 'message', 'pharma_content', 'profile', 'image', 'other'],
      required: true,
    },
    contentId: mongoose.Schema.Types.ObjectId, // Reference to the content being moderated
    contentReference: String, // URL or path to the content
    contentSnapshot: mongoose.Schema.Types.Mixed, // Snapshot of the content at time of moderation
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportReason: {
      type: String,
      enum: ['inappropriate', 'offensive', 'misleading', 'spam', 'illegal', 'privacy_violation', 'other'],
    },
    reportDetails: String,
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'removed', 'escalated'],
      default: 'pending',
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    moderatedAt: Date,
    moderationNotes: String,
    actionTaken: {
      type: String,
      enum: ['none', 'edited', 'removed', 'user_warned', 'user_suspended', 'user_banned', 'other'],
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    appealStatus: {
      type: String,
      enum: ['none', 'appealed', 'appeal_approved', 'appeal_rejected'],
      default: 'none',
    },
    appealDetails: {
      appealedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      appealedAt: Date,
      appealReason: String,
      appealResolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      appealResolvedAt: Date,
      appealNotes: String,
    },
  },
  {
    timestamps: true,
  }
);

// Dispute Resolution Schema
const disputeSchema = new mongoose.Schema(
  {
    disputeNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['order', 'payment', 'refund', 'service_quality', 'product_quality', 'delivery', 'appointment', 'other'],
      required: true,
    },
    relatedEntityType: {
      type: String,
      enum: ['order', 'appointment', 'payment', 'subscription', 'membership', 'other'],
      required: true,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    relatedEntityNumber: String, // Order number, appointment number, etc.
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    initiatorRole: {
      type: String,
      enum: ['patient', 'doctor', 'pharmacy', 'hospital', 'admin'],
      required: true,
    },
    respondentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    respondentRole: {
      type: String,
      enum: ['patient', 'doctor', 'pharmacy', 'hospital', 'admin'],
    },
    status: {
      type: String,
      enum: ['open', 'under_review', 'waiting_for_response', 'resolved', 'closed', 'escalated'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    amount: {
      value: Number,
      currency: {
        type: String,
        default: 'INR',
      },
    },
    resolution: {
      type: {
        type: String,
        enum: ['refund', 'replacement', 'credit', 'apology', 'explanation', 'other'],
      },
      details: String,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      resolvedAt: Date,
      acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      acceptedAt: Date,
    },
    timeline: [
      {
        action: {
          type: String,
          enum: [
            'created',
            'updated',
            'assigned',
            'status_changed',
            'comment_added',
            'evidence_added',
            'resolution_proposed',
            'resolution_accepted',
            'resolution_rejected',
            'escalated',
            'closed',
          ],
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        details: mongoose.Schema.Types.Mixed,
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        userRole: String,
        text: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        attachments: [
          {
            name: String,
            url: String,
            type: String,
          },
        ],
        isInternal: {
          type: Boolean,
          default: false, // True for admin-only comments
        },
      },
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dueDate: Date,
    tags: [String],
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Refund and Chargeback Schema
const refundSchema = new mongoose.Schema(
  {
    refundNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['refund', 'chargeback', 'adjustment', 'credit'],
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userRole: {
      type: String,
      enum: ['patient', 'doctor', 'pharmacy', 'hospital'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    reason: {
      type: String,
      enum: [
        'customer_request',
        'product_not_received',
        'product_defective',
        'wrong_product',
        'service_not_provided',
        'duplicate_payment',
        'fraudulent_transaction',
        'technical_error',
        'other',
      ],
      required: true,
    },
    reasonDetails: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'processing', 'completed', 'rejected', 'failed'],
      default: 'pending',
    },
    refundMethod: {
      type: String,
      enum: ['original_payment_method', 'bank_transfer', 'wallet_credit', 'other'],
      default: 'original_payment_method',
    },
    refundDetails: {
      paymentGateway: String,
      transactionId: String,
      accountNumber: String, // Masked account number if applicable
      upiId: String,
      walletId: String,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    processedAt: Date,
    completedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: String,
    notes: String,
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute',
    },
    timeline: [
      {
        status: {
          type: String,
          enum: ['initiated', 'approved', 'processing', 'completed', 'rejected', 'failed'],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note: String,
      },
    ],
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Data Retention Policy Schema
const dataRetentionPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    dataType: {
      type: String,
      enum: [
        'user_data',
        'medical_records',
        'prescription_data',
        'order_data',
        'payment_data',
        'communication_data',
        'analytics_data',
        'logs',
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
        enum: ['days', 'months', 'years', 'indefinite'],
        required: true,
      },
    },
    legalBasis: {
      type: String,
      enum: ['consent', 'contract', 'legal_obligation', 'vital_interest', 'public_interest', 'legitimate_interest'],
      required: true,
    },
    legalReference: String, // Reference to specific law or regulation
    actionAfterRetention: {
      type: String,
      enum: ['delete', 'anonymize', 'archive', 'review'],
      required: true,
    },
    exemptions: [{
      condition: String,
      extendedPeriod: {
        value: Number,
        unit: {
          type: String,
          enum: ['days', 'months', 'years', 'indefinite'],
        },
      },
      reason: String,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    version: {
      type: Number,
      default: 1,
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
    reviewDate: Date, // When this policy should be reviewed
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Data Erasure Request Schema
const dataErasureRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userRole: {
      type: String,
      enum: ['patient', 'doctor', 'pharmacy', 'hospital'],
      required: true,
    },
    requestType: {
      type: String,
      enum: ['full_erasure', 'partial_erasure', 'data_export', 'access_request'],
      required: true,
    },
    dataCategories: [{
      type: String,
      enum: [
        'profile_data',
        'medical_records',
        'prescription_history',
        'order_history',
        'payment_data',
        'communication_history',
        'location_data',
        'device_data',
        'all_data',
      ],
    }],
    reason: {
      type: String,
      enum: ['privacy_concern', 'account_closure', 'data_inaccuracy', 'legal_right', 'other'],
    },
    reasonDetails: String,
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'partially_approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    identityVerified: {
      type: Boolean,
      default: false,
    },
    verificationMethod: {
      type: String,
      enum: ['email', 'phone', 'id_document', 'in_person', 'other'],
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    reviewNotes: String,
    legalExemptions: [{
      category: String,
      reason: String,
      legalBasis: String,
      retentionPeriod: {
        value: Number,
        unit: String,
      },
    }],
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dataProvidedUrl: String, // For data export requests
    dataProvidedFormat: {
      type: String,
      enum: ['json', 'csv', 'pdf', 'xml'],
    },
    confirmationSent: {
      type: Boolean,
      default: false,
    },
    confirmationSentAt: Date,
    confirmationMethod: {
      type: String,
      enum: ['email', 'sms', 'in_app', 'mail'],
    },
    timeline: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        note: String,
      },
    ],
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Generate unique numbers for disputes, refunds, and data erasure requests
disputeSchema.pre('save', async function (next) {
  if (this.isNew && !this.disputeNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const datePrefix = `DSP${year}${month}${day}`;
    
    // Find the latest dispute with the same date prefix
    const latestDispute = await this.constructor.findOne(
      { disputeNumber: new RegExp(`^${datePrefix}`) },
      { disputeNumber: 1 },
      { sort: { disputeNumber: -1 } }
    );
    
    let sequence = 1;
    if (latestDispute && latestDispute.disputeNumber) {
      const latestSequence = parseInt(latestDispute.disputeNumber.substr(9), 10);
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1;
      }
    }
    
    this.disputeNumber = `${datePrefix}${sequence.toString().padStart(4, '0')}`;
    
    // Add created status to timeline if it's a new dispute
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [{
        action: 'created',
        timestamp: new Date(),
        performedBy: this.initiatedBy,
        details: { status: 'open' },
      }];
    }
  }
  next();
});

refundSchema.pre('save', async function (next) {
  if (this.isNew && !this.refundNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const datePrefix = `REF${year}${month}${day}`;
    
    // Find the latest refund with the same date prefix
    const latestRefund = await this.constructor.findOne(
      { refundNumber: new RegExp(`^${datePrefix}`) },
      { refundNumber: 1 },
      { sort: { refundNumber: -1 } }
    );
    
    let sequence = 1;
    if (latestRefund && latestRefund.refundNumber) {
      const latestSequence = parseInt(latestRefund.refundNumber.substr(9), 10);
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1;
      }
    }
    
    this.refundNumber = `${datePrefix}${sequence.toString().padStart(4, '0')}`;
    
    // Add initiated status to timeline if it's a new refund
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [{
        status: 'initiated',
        timestamp: new Date(),
        performedBy: this.initiatedBy,
        note: 'Refund initiated',
      }];
    }
  }
  next();
});

dataErasureRequestSchema.pre('save', async function (next) {
  if (this.isNew && !this.requestNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const datePrefix = `ERQ${year}${month}${day}`;
    
    // Find the latest request with the same date prefix
    const latestRequest = await this.constructor.findOne(
      { requestNumber: new RegExp(`^${datePrefix}`) },
      { requestNumber: 1 },
      { sort: { requestNumber: -1 } }
    );
    
    let sequence = 1;
    if (latestRequest && latestRequest.requestNumber) {
      const latestSequence = parseInt(latestRequest.requestNumber.substr(9), 10);
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1;
      }
    }
    
    this.requestNumber = `${datePrefix}${sequence.toString().padStart(4, '0')}`;
    
    // Add pending status to timeline if it's a new request
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Data erasure request submitted',
      }];
    }
  }
  next();
});

// Indexes for faster queries
roleSchema.index({ name: 1 });
roleSchema.index({ isSystem: 1, isActive: 1 });

featureFlagSchema.index({ name: 1 });
featureFlagSchema.index({ isEnabled: 1 });
featureFlagSchema.index({ 'specificUsers': 1 });
featureFlagSchema.index({ 'specificRoles': 1 });

regulatoryDocumentSchema.index({ type: 1, entityType: 1, entityId: 1 });
regulatoryDocumentSchema.index({ status: 1 });
regulatoryDocumentSchema.index({ expiryDate: 1 });
regulatoryDocumentSchema.index({ verificationStatus: 1 });

contentModerationSchema.index({ contentType: 1, contentId: 1 });
contentModerationSchema.index({ status: 1 });
contentModerationSchema.index({ reportedAt: 1 });

disputeSchema.index({ disputeNumber: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ initiatedBy: 1 });
disputeSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });
disputeSchema.index({ assignedTo: 1 });

refundSchema.index({ refundNumber: 1 });
refundSchema.index({ paymentId: 1 });
refundSchema.index({ userId: 1 });
refundSchema.index({ status: 1 });
refundSchema.index({ 'timeline.timestamp': 1 });

dataRetentionPolicySchema.index({ dataType: 1 });
dataRetentionPolicySchema.index({ isActive: 1 });

dataErasureRequestSchema.index({ requestNumber: 1 });
dataErasureRequestSchema.index({ userId: 1 });
dataErasureRequestSchema.index({ status: 1 });
dataErasureRequestSchema.index({ submittedAt: 1 });

const Role = mongoose.model('Role', roleSchema);
const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);
const RegulatoryDocument = mongoose.model('RegulatoryDocument', regulatoryDocumentSchema);
const ContentModeration = mongoose.model('ContentModeration', contentModerationSchema);
const Dispute = mongoose.model('Dispute', disputeSchema);
const Refund = mongoose.model('Refund', refundSchema);
const DataRetentionPolicy = mongoose.model('DataRetentionPolicy', dataRetentionPolicySchema);
const DataErasureRequest = mongoose.model('DataErasureRequest', dataErasureRequestSchema);

module.exports = {
  Role,
  FeatureFlag,
  RegulatoryDocument,
  ContentModeration,
  Dispute,
  Refund,
  DataRetentionPolicy,
  DataErasureRequest,
};