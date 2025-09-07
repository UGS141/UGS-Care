const mongoose = require('mongoose');
const { generateUniqueNumber } = require('../utils/number-generator');

// Schema for request management
const requestManagementSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      unique: true,
      required: true,
    },
    requestType: {
      type: String,
      enum: [
        'data_access',
        'data_deletion',
        'prescription_renewal',
        'medical_record',
        'refund',
        'return',
        'complaint',
        'feedback',
        'support',
        'feature_request',
        'bug_report',
        'other',
      ],
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
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: [
        'open',
        'in_progress',
        'pending_user_input',
        'pending_third_party',
        'resolved',
        'closed',
        'cancelled',
        'escalated',
      ],
      default: 'open',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedEntities: [
      {
        entityType: {
          type: String,
          enum: [
            'order',
            'prescription',
            'appointment',
            'payment',
            'subscription',
            'membership',
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
    attachments: [
      {
        fileName: String,
        fileType: String,
        fileSize: Number,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: [
      {
        content: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        isInternal: {
          type: Boolean,
          default: false,
        },
      },
    ],
    timeline: [
      {
        action: {
          type: String,
          enum: [
            'created',
            'updated',
            'status_changed',
            'assigned',
            'note_added',
            'attachment_added',
            'escalated',
            'resolved',
            'closed',
            'reopened',
            'other',
          ],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        details: mongoose.Schema.Types.Mixed,
      },
    ],
    dueDate: Date,
    resolvedAt: Date,
    closedAt: Date,
    sla: {
      responseTime: {
        target: Number, // in hours
        actual: Number, // in hours
        breached: {
          type: Boolean,
          default: false,
        },
      },
      resolutionTime: {
        target: Number, // in hours
        actual: Number, // in hours
        breached: {
          type: Boolean,
          default: false,
        },
      },
    },
    tags: [String],
    category: String,
    subcategory: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'email', 'phone', 'chat', 'in_person', 'other'],
      default: 'web',
    },
    satisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      submittedAt: Date,
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

// Schema for specific request types

// Data Access Request
const dataAccessRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RequestManagement',
      required: true,
    },
    dataTypes: [
      {
        type: String,
        enum: [
          'personal_information',
          'medical_records',
          'prescription_history',
          'order_history',
          'payment_information',
          'usage_data',
          'all_data',
          'other',
        ],
      },
    ],
    dateRange: {
      from: Date,
      to: Date,
    },
    format: {
      type: String,
      enum: ['pdf', 'csv', 'json', 'xml', 'other'],
      default: 'pdf',
    },
    deliveryMethod: {
      type: String,
      enum: ['email', 'download', 'physical_mail', 'other'],
      default: 'email',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationMethod: String,
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveredAt: Date,
    deliveryDetails: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Prescription Renewal Request
const prescriptionRenewalRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RequestManagement',
      required: true,
    },
    originalPrescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'eRx',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    medications: [
      {
        medicationId: mongoose.Schema.Types.ObjectId,
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
        quantity: Number,
        notes: String,
        approved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    patientNotes: String,
    doctorNotes: String,
    reviewStatus: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'partially_approved', 'rejected'],
      default: 'pending',
    },
    reviewedAt: Date,
    newPrescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'eRx',
    },
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

// Medical Record Request
const medicalRecordRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RequestManagement',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    recordTypes: [
      {
        type: String,
        enum: [
          'lab_results',
          'imaging',
          'consultation_notes',
          'discharge_summary',
          'prescription_history',
          'vaccination_records',
          'allergy_information',
          'other',
        ],
      },
    ],
    dateRange: {
      from: Date,
      to: Date,
    },
    purpose: {
      type: String,
      enum: [
        'personal_use',
        'second_opinion',
        'insurance',
        'legal',
        'continuing_care',
        'other',
      ],
      required: true,
    },
    recipientDetails: {
      name: String,
      relationship: String,
      contactInformation: String,
      organization: String,
    },
    format: {
      type: String,
      enum: ['pdf', 'physical_copy', 'other'],
      default: 'pdf',
    },
    deliveryMethod: {
      type: String,
      enum: ['email', 'download', 'physical_mail', 'fax', 'other'],
      default: 'email',
    },
    authorizationDocument: String,
    authorizationVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveredAt: Date,
    deliveryDetails: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Refund Request
const refundRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RequestManagement',
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
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
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
        'product_not_received',
        'product_damaged',
        'wrong_product',
        'service_not_provided',
        'service_unsatisfactory',
        'duplicate_payment',
        'technical_error',
        'other',
      ],
      required: true,
    },
    additionalDetails: String,
    refundMethod: {
      type: String,
      enum: ['original_payment_method', 'store_credit', 'bank_transfer', 'other'],
      default: 'original_payment_method',
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String,
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'partially_approved', 'rejected'],
      default: 'pending',
    },
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAmount: Number,
    rejectionReason: String,
    refundTransactionId: String,
    refundedAt: Date,
    refundStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate request number
requestManagementSchema.pre('save', async function (next) {
  if (!this.requestNumber) {
    try {
      this.requestNumber = await generateUniqueNumber('REQ', 8);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Methods

// Calculate SLA metrics
requestManagementSchema.methods.calculateSLA = function () {
  const createdAt = this.createdAt;
  
  // Calculate response time in hours
  const firstResponse = this.timeline.find(event => 
    event.action === 'status_changed' && 
    event.details && 
    event.details.from === 'open' && 
    event.details.to !== 'open'
  );
  
  if (firstResponse) {
    const responseTimeHours = (firstResponse.timestamp - createdAt) / (1000 * 60 * 60);
    this.sla.responseTime.actual = responseTimeHours;
    this.sla.responseTime.breached = responseTimeHours > this.sla.responseTime.target;
  }
  
  // Calculate resolution time if resolved
  if (this.resolvedAt) {
    const resolutionTimeHours = (this.resolvedAt - createdAt) / (1000 * 60 * 60);
    this.sla.resolutionTime.actual = resolutionTimeHours;
    this.sla.resolutionTime.breached = resolutionTimeHours > this.sla.resolutionTime.target;
  }
  
  return this.save();
};

// Add a note to the request
requestManagementSchema.methods.addNote = function (content, userId, isInternal = false) {
  const note = {
    content,
    addedBy: userId,
    addedAt: new Date(),
    isInternal,
  };
  
  this.notes.push(note);
  
  this.timeline.push({
    action: 'note_added',
    timestamp: new Date(),
    performedBy: userId,
    details: { noteId: this.notes[this.notes.length - 1]._id },
  });
  
  return this.save();
};

// Update request status
requestManagementSchema.methods.updateStatus = function (newStatus, userId, reason = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  if (newStatus === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  
  if (newStatus === 'closed' && !this.closedAt) {
    this.closedAt = new Date();
  }
  
  this.timeline.push({
    action: 'status_changed',
    timestamp: new Date(),
    performedBy: userId,
    details: { from: oldStatus, to: newStatus, reason },
  });
  
  return this.save();
};

// Escalate request
requestManagementSchema.methods.escalate = function (userId, reason, assignToUserId = null) {
  const oldPriority = this.priority;
  
  // Increase priority if not already urgent
  if (this.priority !== 'urgent') {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = priorities.indexOf(this.priority);
    if (currentIndex < priorities.length - 1) {
      this.priority = priorities[currentIndex + 1];
    }
  }
  
  // Reassign if specified
  if (assignToUserId) {
    this.assignedTo = assignToUserId;
  }
  
  this.timeline.push({
    action: 'escalated',
    timestamp: new Date(),
    performedBy: userId,
    details: { 
      reason, 
      priorityChange: { from: oldPriority, to: this.priority },
      assignmentChange: assignToUserId ? { to: assignToUserId } : null,
    },
  });
  
  return this.save();
};

// Create indexes for faster queries
requestManagementSchema.index({ requestNumber: 1 });
requestManagementSchema.index({ requestType: 1 });
requestManagementSchema.index({ status: 1 });
requestManagementSchema.index({ priority: 1 });
requestManagementSchema.index({ requestedBy: 1 });
requestManagementSchema.index({ assignedTo: 1 });
requestManagementSchema.index({ createdAt: 1 });
requestManagementSchema.index({ dueDate: 1 });
requestManagementSchema.index({ 'sla.responseTime.breached': 1 });
requestManagementSchema.index({ 'sla.resolutionTime.breached': 1 });

dataAccessRequestSchema.index({ requestId: 1 });
dataAccessRequestSchema.index({ verificationStatus: 1 });

prescriptionRenewalRequestSchema.index({ requestId: 1 });
prescriptionRenewalRequestSchema.index({ patientId: 1 });
prescriptionRenewalRequestSchema.index({ doctorId: 1 });
prescriptionRenewalRequestSchema.index({ reviewStatus: 1 });

medicalRecordRequestSchema.index({ requestId: 1 });
medicalRecordRequestSchema.index({ patientId: 1 });
medicalRecordRequestSchema.index({ authorizationVerified: 1 });

refundRequestSchema.index({ requestId: 1 });
refundRequestSchema.index({ paymentId: 1 });
refundRequestSchema.index({ reviewStatus: 1 });
refundRequestSchema.index({ refundStatus: 1 });

const RequestManagement = mongoose.model('RequestManagement', requestManagementSchema);
const DataAccessRequest = mongoose.model('DataAccessRequest', dataAccessRequestSchema);
const PrescriptionRenewalRequest = mongoose.model('PrescriptionRenewalRequest', prescriptionRenewalRequestSchema);
const MedicalRecordRequest = mongoose.model('MedicalRecordRequest', medicalRecordRequestSchema);
const RefundRequest = mongoose.model('RefundRequest', refundRequestSchema);

module.exports = {
  RequestManagement,
  DataAccessRequest,
  PrescriptionRenewalRequest,
  MedicalRecordRequest,
  RefundRequest,
};