const mongoose = require('mongoose');

// Schema for general requests in the system
const requestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: [
        'refund',
        'cancellation',
        'return',
        'exchange',
        'complaint',
        'information',
        'support',
        'verification',
        'approval',
        'prescription_renewal',
        'medical_record',
        'insurance_claim',
        'data_access',
        'data_deletion',
        'other',
      ],
      required: true,
    },
    subType: String,
    status: {
      type: String,
      enum: [
        'pending',
        'in_review',
        'approved',
        'rejected',
        'in_progress',
        'completed',
        'cancelled',
        'escalated',
        'on_hold',
      ],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterType: {
      type: String,
      enum: ['patient', 'doctor', 'pharmacy', 'hospital', 'admin', 'system'],
      required: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assigneeType: {
      type: String,
      enum: ['admin', 'support', 'doctor', 'pharmacy', 'system'],
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedEntities: [
      {
        entityType: {
          type: String,
          enum: [
            'order',
            'appointment',
            'payment',
            'prescription',
            'product',
            'user',
            'pharmacy',
            'doctor',
            'hospital',
            'invoice',
            'subscription',
            'membership',
            'other',
          ],
          required: true,
        },
        entityId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
    ],
    attachments: [
      {
        fileName: String,
        fileType: String,
        fileSize: Number,
        fileUrl: String,
        uploadedAt: Date,
        uploadedBy: mongoose.Schema.Types.ObjectId,
      },
    ],
    timeline: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        comment: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        performedByType: {
          type: String,
          enum: ['patient', 'doctor', 'pharmacy', 'hospital', 'admin', 'system'],
        },
      },
    ],
    notes: [
      {
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        isInternal: {
          type: Boolean,
          default: false,
        },
      },
    ],
    resolution: {
      resolvedAt: Date,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      resolutionType: {
        type: String,
        enum: [
          'approved',
          'rejected',
          'partial_approval',
          'cancelled',
          'refunded',
          'replaced',
          'information_provided',
          'no_action_required',
          'other',
        ],
      },
      resolutionDetails: String,
      satisfactionRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
    },
    sla: {
      responseDeadline: Date,
      resolutionDeadline: Date,
      isResponseBreached: {
        type: Boolean,
        default: false,
      },
      isResolutionBreached: {
        type: Boolean,
        default: false,
      },
      breachReason: String,
    },
    tags: [String],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalationReason: String,
    escalatedAt: Date,
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    escalationLevel: {
      type: Number,
      default: 0,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    dueDate: Date,
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: Date,
    category: String,
    subcategory: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'email', 'phone', 'in_person', 'system', 'api'],
      default: 'web',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Schema for refund requests
const refundRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
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
      required: true,
    },
    refundType: {
      type: String,
      enum: ['full', 'partial'],
      required: true,
    },
    refundMethod: {
      type: String,
      enum: ['original_payment', 'wallet', 'bank_transfer', 'other'],
      default: 'original_payment',
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'rejected',
        'processing',
        'completed',
        'failed',
      ],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    processedAt: Date,
    completedAt: Date,
    failureReason: String,
    transactionId: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Schema for data access requests (GDPR/privacy related)
const dataAccessRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestType: {
      type: String,
      enum: ['access', 'deletion', 'correction', 'portability', 'restriction'],
      required: true,
    },
    dataCategories: [{
      type: String,
      enum: [
        'personal_information',
        'medical_records',
        'prescription_history',
        'order_history',
        'payment_information',
        'appointment_history',
        'communication_history',
        'login_history',
        'all',
      ],
    }],
    requestDetails: String,
    verificationMethod: {
      type: String,
      enum: ['email', 'phone', 'id_verification', 'other'],
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveryMethod: {
      type: String,
      enum: ['email', 'download', 'api', 'mail', 'other'],
    },
    deliveryDetails: {
      email: String,
      address: String,
      apiEndpoint: String,
      other: String,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'verification_pending',
        'processing',
        'completed',
        'rejected',
        'cancelled',
      ],
      default: 'pending',
    },
    completedAt: Date,
    dataPackageUrl: String,
    dataPackageExpiresAt: Date,
    rejectionReason: String,
    legalBasis: {
      type: String,
      enum: [
        'consent',
        'contract',
        'legal_obligation',
        'vital_interests',
        'public_interest',
        'legitimate_interests',
      ],
    },
    retentionExceptions: [{
      dataCategory: String,
      reason: String,
      retentionPeriod: String,
    }],
    processingNotes: [{
      note: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Schema for prescription renewal requests
const prescriptionRenewalRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    originalPrescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'eRx',
      required: true,
    },
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      notes: String,
      isRenewed: {
        type: Boolean,
        default: false,
      },
    }],
    reason: String,
    urgency: {
      type: String,
      enum: ['normal', 'urgent'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: [
        'pending',
        'under_review',
        'approved',
        'partially_approved',
        'rejected',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    newPrescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'eRx',
    },
    reviewNotes: String,
    rejectionReason: String,
    requiresAppointment: {
      type: Boolean,
      default: false,
    },
    suggestedAppointmentDate: Date,
    createdAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    lastRenewalDate: Date,
    renewalCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Schema for medical record requests
const medicalRecordRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedByType: {
      type: String,
      enum: ['patient', 'doctor', 'hospital', 'insurance', 'authorized_representative', 'other'],
      required: true,
    },
    recordTypes: [{
      type: String,
      enum: [
        'prescription',
        'lab_report',
        'imaging',
        'discharge_summary',
        'consultation_notes',
        'vaccination',
        'allergy',
        'medical_history',
        'treatment_plan',
        'other',
      ],
    }],
    dateRange: {
      from: Date,
      to: Date,
    },
    purpose: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'verification_pending',
        'approved',
        'partially_approved',
        'rejected',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending',
    },
    verificationMethod: {
      type: String,
      enum: ['id_verification', 'consent_form', 'authorization_letter', 'other'],
    },
    verificationDetails: String,
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveryMethod: {
      type: String,
      enum: ['email', 'download', 'print', 'api', 'mail', 'fax', 'other'],
    },
    deliveryDetails: {
      email: String,
      address: String,
      faxNumber: String,
      other: String,
    },
    recordsProvided: [{
      recordType: String,
      recordId: mongoose.Schema.Types.ObjectId,
      providedAt: Date,
      fileUrl: String,
    }],
    completedAt: Date,
    rejectionReason: String,
    notes: String,
    isUrgent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate request number
requestSchema.pre('save', async function (next) {
  if (!this.requestNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get the count of requests created today
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    });
    
    // Generate request number: REQ-YY-MM-DD-XXXX
    this.requestNumber = `REQ-${year}${month}${day}-${(count + 1).toString().padStart(4, '0')}`;
  }
  
  // Add status change to timeline if it's a new request or status has changed
  if (this.isNew || this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      comment: this.isNew ? 'Request created' : `Status changed to ${this.status}`,
      performedBy: this.isNew ? this.requesterId : this._modifiedBy,
      performedByType: this.isNew ? this.requesterType : 'system',
    });
  }
  
  next();
});

// Create indexes for faster queries
requestSchema.index({ requestNumber: 1 });
requestSchema.index({ type: 1 });
requestSchema.index({ status: 1 });
requestSchema.index({ priority: 1 });
requestSchema.index({ requesterId: 1 });
requestSchema.index({ assigneeId: 1 });
requestSchema.index({ 'relatedEntities.entityType': 1, 'relatedEntities.entityId': 1 });
requestSchema.index({ createdAt: 1 });
requestSchema.index({ 'sla.responseDeadline': 1 });
requestSchema.index({ 'sla.resolutionDeadline': 1 });
requestSchema.index({ isEscalated: 1 });
requestSchema.index({ isUrgent: 1 });
requestSchema.index({ dueDate: 1 });
requestSchema.index({ tags: 1 });

refundRequestSchema.index({ requestId: 1 });
refundRequestSchema.index({ paymentId: 1 });
refundRequestSchema.index({ orderId: 1 });
refundRequestSchema.index({ status: 1 });

dataAccessRequestSchema.index({ requestId: 1 });
dataAccessRequestSchema.index({ userId: 1 });
dataAccessRequestSchema.index({ requestType: 1 });
dataAccessRequestSchema.index({ status: 1 });
dataAccessRequestSchema.index({ verificationStatus: 1 });

prescriptionRenewalRequestSchema.index({ requestId: 1 });
prescriptionRenewalRequestSchema.index({ patientId: 1 });
prescriptionRenewalRequestSchema.index({ doctorId: 1 });
prescriptionRenewalRequestSchema.index({ originalPrescriptionId: 1 });
prescriptionRenewalRequestSchema.index({ status: 1 });

medicalRecordRequestSchema.index({ requestId: 1 });
medicalRecordRequestSchema.index({ patientId: 1 });
medicalRecordRequestSchema.index({ requestedBy: 1 });
medicalRecordRequestSchema.index({ status: 1 });
medicalRecordRequestSchema.index({ verificationStatus: 1 });

// Methods

// Calculate SLA deadlines based on request type and priority
requestSchema.methods.calculateSLA = function () {
  const now = new Date();
  let responseHours = 24; // Default: 24 hours for response
  let resolutionHours = 72; // Default: 72 hours for resolution
  
  // Adjust based on priority
  switch (this.priority) {
    case 'low':
      responseHours = 48;
      resolutionHours = 120; // 5 days
      break;
    case 'medium':
      responseHours = 24;
      resolutionHours = 72; // 3 days
      break;
    case 'high':
      responseHours = 8;
      resolutionHours = 48; // 2 days
      break;
    case 'urgent':
      responseHours = 4;
      resolutionHours = 24; // 1 day
      break;
  }
  
  // Adjust based on request type
  switch (this.type) {
    case 'refund':
      resolutionHours = 48; // 2 days for refunds
      break;
    case 'medical_record':
      resolutionHours = 120; // 5 days for medical records
      break;
    case 'data_access':
    case 'data_deletion':
      resolutionHours = 168; // 7 days for GDPR requests
      break;
    case 'prescription_renewal':
      if (this.priority === 'urgent') {
        responseHours = 2;
        resolutionHours = 8;
      } else {
        responseHours = 8;
        resolutionHours = 24;
      }
      break;
  }
  
  // Set SLA deadlines
  this.sla = {
    responseDeadline: new Date(now.getTime() + responseHours * 60 * 60 * 1000),
    resolutionDeadline: new Date(now.getTime() + resolutionHours * 60 * 60 * 1000),
    isResponseBreached: false,
    isResolutionBreached: false,
  };
  
  return this.save();
};

// Add a note to the request
requestSchema.methods.addNote = async function (content, userId, isInternal = false) {
  this.notes.push({
    content,
    createdAt: new Date(),
    createdBy: userId,
    isInternal,
  });
  
  return this.save();
};

// Update request status
requestSchema.methods.updateStatus = async function (status, comment, userId, userType) {
  this.status = status;
  
  // Add to timeline
  this.timeline.push({
    status,
    timestamp: new Date(),
    comment: comment || `Status changed to ${status}`,
    performedBy: userId,
    performedByType: userType,
  });
  
  // If status is completed or rejected, set resolution details
  if (status === 'completed' || status === 'rejected') {
    if (!this.resolution) {
      this.resolution = {};
    }
    
    this.resolution.resolvedAt = new Date();
    this.resolution.resolvedBy = userId;
    this.resolution.resolutionType = status === 'completed' ? 'approved' : 'rejected';
  }
  
  return this.save();
};

// Escalate a request
requestSchema.methods.escalate = async function (reason, userId, userType) {
  this.isEscalated = true;
  this.escalationReason = reason;
  this.escalatedAt = new Date();
  this.escalatedBy = userId;
  this.escalationLevel += 1;
  
  // Add to timeline
  this.timeline.push({
    status: this.status,
    timestamp: new Date(),
    comment: `Request escalated: ${reason}`,
    performedBy: userId,
    performedByType: userType,
  });
  
  return this.save();
};

// Assign a request
requestSchema.methods.assign = async function (assigneeId, assigneeType, assignedBy, assignedByType) {
  this.assigneeId = assigneeId;
  this.assigneeType = assigneeType;
  
  // Add to timeline
  this.timeline.push({
    status: this.status,
    timestamp: new Date(),
    comment: `Request assigned to ${assigneeType}`,
    performedBy: assignedBy,
    performedByType: assignedByType,
  });
  
  return this.save();
};

// Check if SLA is breached
requestSchema.methods.checkSLABreach = async function () {
  const now = new Date();
  
  if (this.sla.responseDeadline && now > this.sla.responseDeadline && !this.sla.isResponseBreached) {
    this.sla.isResponseBreached = true;
    
    // Add to timeline
    this.timeline.push({
      status: this.status,
      timestamp: now,
      comment: 'Response SLA breached',
      performedByType: 'system',
    });
  }
  
  if (this.sla.resolutionDeadline && now > this.sla.resolutionDeadline && !this.sla.isResolutionBreached) {
    this.sla.isResolutionBreached = true;
    
    // Add to timeline
    this.timeline.push({
      status: this.status,
      timestamp: now,
      comment: 'Resolution SLA breached',
      performedByType: 'system',
    });
  }
  
  return this.save();
};

// Process a refund request
refundRequestSchema.methods.process = async function (status, processedBy, notes) {
  if (status === 'approved') {
    this.status = 'processing';
    this.approvedBy = processedBy;
    this.approvedAt = new Date();
    this.notes = notes || this.notes;
    this.processedAt = new Date();
  } else if (status === 'rejected') {
    this.status = 'rejected';
    this.failureReason = notes;
  } else if (status === 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
    this.transactionId = notes; // Use notes field to pass transaction ID
  } else if (status === 'failed') {
    this.status = 'failed';
    this.failureReason = notes;
  }
  
  return this.save();
};

// Process a data access request
dataAccessRequestSchema.methods.process = async function (status, processedBy, details) {
  if (status === 'verification_pending') {
    this.status = 'verification_pending';
  } else if (status === 'verified') {
    this.verificationStatus = 'verified';
    this.verifiedAt = new Date();
    this.verifiedBy = processedBy;
    this.status = 'processing';
  } else if (status === 'processing') {
    this.status = 'processing';
  } else if (status === 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
    
    if (details?.dataPackageUrl) {
      this.dataPackageUrl = details.dataPackageUrl;
    }
    
    if (details?.dataPackageExpiresAt) {
      this.dataPackageExpiresAt = details.dataPackageExpiresAt;
    }
  } else if (status === 'rejected') {
    this.status = 'rejected';
    this.rejectionReason = details?.rejectionReason;
  }
  
  // Add processing note
  if (details?.note) {
    this.processingNotes.push({
      note: details.note,
      createdAt: new Date(),
      createdBy: processedBy,
    });
  }
  
  return this.save();
};

// Process a prescription renewal request
prescriptionRenewalRequestSchema.methods.process = async function (status, doctorId, details) {
  this.status = status;
  
  if (status === 'under_review') {
    this.doctorId = doctorId;
  } else if (status === 'approved' || status === 'partially_approved') {
    if (details?.newPrescriptionId) {
      this.newPrescriptionId = details.newPrescriptionId;
    }
    
    if (details?.reviewNotes) {
      this.reviewNotes = details.reviewNotes;
    }
    
    // Update medication renewal status
    if (details?.medications) {
      details.medications.forEach(med => {
        const medication = this.medications.find(m => m.name === med.name);
        if (medication) {
          medication.isRenewed = med.isRenewed;
        }
      });
    }
    
    this.lastRenewalDate = new Date();
    this.renewalCount += 1;
  } else if (status === 'rejected') {
    this.rejectionReason = details?.rejectionReason;
    
    if (details?.requiresAppointment) {
      this.requiresAppointment = true;
      
      if (details.suggestedAppointmentDate) {
        this.suggestedAppointmentDate = details.suggestedAppointmentDate;
      }
    }
  } else if (status === 'completed' && details?.createdAppointmentId) {
    this.createdAppointmentId = details.createdAppointmentId;
  }
  
  return this.save();
};

// Process a medical record request
medicalRecordRequestSchema.methods.process = async function (status, processedBy, details) {
  this.status = status;
  
  if (status === 'verification_pending') {
    this.verificationStatus = 'pending';
  } else if (status === 'verified') {
    this.verificationStatus = 'verified';
    this.verifiedAt = new Date();
    this.verifiedBy = processedBy;
    this.status = 'approved';
  } else if (status === 'approved' || status === 'partially_approved') {
    // No additional processing needed
  } else if (status === 'completed') {
    this.completedAt = new Date();
    
    // Add provided records
    if (details?.recordsProvided) {
      details.recordsProvided.forEach(record => {
        this.recordsProvided.push({
          recordType: record.recordType,
          recordId: record.recordId,
          providedAt: new Date(),
          fileUrl: record.fileUrl,
        });
      });
    }
  } else if (status === 'rejected') {
    this.rejectionReason = details?.rejectionReason;
  }
  
  if (details?.notes) {
    this.notes = details.notes;
  }
  
  return this.save();
};

const Request = mongoose.model('Request', requestSchema);
const RefundRequest = mongoose.model('RefundRequest', refundRequestSchema);
const DataAccessRequest = mongoose.model('DataAccessRequest', dataAccessRequestSchema);
const PrescriptionRenewalRequest = mongoose.model('PrescriptionRenewalRequest', prescriptionRenewalRequestSchema);
const MedicalRecordRequest = mongoose.model('MedicalRecordRequest', medicalRecordRequestSchema);

module.exports = {
  Request,
  RefundRequest,
  DataAccessRequest,
  PrescriptionRenewalRequest,
  MedicalRecordRequest,
};