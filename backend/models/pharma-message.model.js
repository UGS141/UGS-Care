const mongoose = require('mongoose');

const pharmaMessageSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PharmaCompany',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['text', 'html', 'image', 'video', 'pdf', 'link'],
      default: 'text',
    },
    contentUrl: String, // URL to image, video, PDF, etc.
    thumbnailUrl: String,
    audienceSpec: {
      targetType: {
        type: String,
        enum: ['all', 'specialty', 'location', 'custom'],
        required: true,
      },
      specialties: [String],
      locations: [{
        city: String,
        state: String,
        country: {
          type: String,
          default: 'India',
        },
      }],
      experience: {
        min: Number,
        max: Number,
      },
      hospitals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      }],
      customSegment: String, // Description of custom segment
      excludeDoctorIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      }],
      includeDoctorIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      }],
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'rejected', 'scheduled', 'sent', 'cancelled'],
      default: 'draft',
    },
    approvalStatus: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      approvedAt: Date,
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rejectedAt: Date,
      rejectionReason: String,
      comments: String,
    },
    scheduledAt: Date,
    sentAt: Date,
    expiresAt: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    category: {
      type: String,
      enum: ['product_update', 'clinical_trial', 'research', 'educational', 'promotional', 'event', 'other'],
      required: true,
    },
    tags: [String],
    relatedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    relatedDiseases: [String],
    attachments: [{
      name: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    callToAction: {
      type: {
        type: String,
        enum: ['none', 'link', 'download', 'contact', 'register', 'other'],
        default: 'none',
      },
      label: String,
      url: String,
      trackingId: String,
    },
    analytics: {
      targetDoctorCount: Number,
      deliveredCount: {
        type: Number,
        default: 0,
      },
      openCount: {
        type: Number,
        default: 0,
      },
      clickCount: {
        type: Number,
        default: 0,
      },
      interactionTime: {
        average: {
          type: Number,
          default: 0,
        },
        total: {
          type: Number,
          default: 0,
        },
      },
      feedback: {
        positive: {
          type: Number,
          default: 0,
        },
        negative: {
          type: Number,
          default: 0,
        },
        neutral: {
          type: Number,
          default: 0,
        },
      },
    },
    deliveryTracking: [{
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
      deliveredAt: Date,
      openedAt: Date,
      clickedAt: Date,
      interactionDuration: Number, // in seconds
      feedback: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        submittedAt: Date,
      },
      status: {
        type: String,
        enum: ['pending', 'delivered', 'opened', 'clicked', 'interacted'],
        default: 'pending',
      },
    }],
    complianceInfo: {
      regulatoryDisclaimer: String,
      approvalCode: String,
      approvalDate: Date,
      expiryDate: Date,
      isCompliant: {
        type: Boolean,
        default: false,
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: Date,
    },
    budget: {
      allocated: Number,
      spent: Number,
      currency: {
        type: String,
        default: 'INR',
      },
    },
    campaign: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PharmaCampaign',
      },
      name: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PharmaMessage',
    },
    version: {
      type: Number,
      default: 1,
    },
    previousVersions: [{
      version: Number,
      content: String,
      contentUrl: String,
      updatedAt: Date,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      changeReason: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
pharmaMessageSchema.index({ companyId: 1 });
pharmaMessageSchema.index({ status: 1 });
pharmaMessageSchema.index({ category: 1 });
pharmaMessageSchema.index({ 'audienceSpec.targetType': 1 });
pharmaMessageSchema.index({ 'audienceSpec.specialties': 1 });
pharmaMessageSchema.index({ 'audienceSpec.locations.city': 1, 'audienceSpec.locations.state': 1 });
pharmaMessageSchema.index({ 'deliveryTracking.doctorId': 1 });
pharmaMessageSchema.index({ scheduledAt: 1 });

const PharmaMessage = mongoose.model('PharmaMessage', pharmaMessageSchema);

module.exports = PharmaMessage;