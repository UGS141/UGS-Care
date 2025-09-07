const mongoose = require('mongoose');

const benefitSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'discount_percentage',
        'discount_fixed',
        'free_delivery',
        'priority_service',
        'free_consultation',
        'health_checkup',
        'cashback',
        'reward_points',
        'other'
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    value: {
      type: Number, // Percentage or fixed amount depending on type
      default: 0,
    },
    maxDiscountAmount: Number, // For percentage discounts
    minOrderValue: Number, // Minimum order value for benefit to apply
    applicableOn: {
      type: String,
      enum: ['all', 'medicines', 'lab_tests', 'consultations', 'specific_products', 'specific_services'],
      default: 'all',
    },
    specificItems: [{ // For specific products or services
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'benefitItemType',
    }],
    benefitItemType: {
      type: String,
      enum: ['Product', 'Service'],
    },
    usageLimitPerMonth: Number, // How many times this benefit can be used per month
    usageLimitTotal: Number, // Total usage limit for the entire membership duration
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    duration: {
      value: {
        type: Number,
        required: true,
        min: 1,
      },
      unit: {
        type: String,
        enum: ['days', 'months', 'years'],
        default: 'months',
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedPrice: Number,
    benefits: [benefitSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    maxMembersAllowed: {
      type: Number,
      default: 1,
    },
    termsAndConditions: String,
    eligibilityCriteria: String,
    tags: [String],
    icon: String,
    bannerImage: String,
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

const membershipSchema = new mongoose.Schema(
  {
    membershipNumber: {
      type: String,
      required: true,
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    planDetails: {
      name: String,
      code: String,
      duration: {
        value: Number,
        unit: String,
      },
      price: Number,
      benefits: [benefitSchema],
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'payment_pending', 'payment_failed'],
      default: 'active',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    renewalReminderSent: {
      type: Boolean,
      default: false,
    },
    renewalDate: Date,
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    paymentDetails: {
      amount: Number,
      discount: Number,
      tax: Number,
      total: Number,
      method: String,
      transactionId: String,
      status: String,
      date: Date,
    },
    promoCodeApplied: {
      code: String,
      discount: Number,
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
    },
    familyMembers: [{
      memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
      },
      name: String,
      relationship: String,
      dateAdded: {
        type: Date,
        default: Date.now,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    }],
    benefitUsage: [{
      benefitType: String,
      usedCount: {
        type: Number,
        default: 0,
      },
      limitPerMonth: Number,
      limitTotal: Number,
      lastUsedDate: Date,
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
      appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
      discountAmount: Number,
    }],
    cancellationReason: String,
    cancellationDate: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    renewalHistory: [{
      previousMembershipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Membership',
      },
      renewalDate: Date,
      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MembershipPlan',
      },
      planName: String,
      amount: Number,
    }],
    source: {
      type: String,
      enum: ['app', 'web', 'phone', 'in_store'],
      default: 'app',
    },
    notes: String,
    timeline: [{
      status: {
        type: String,
        enum: [
          'created',
          'active',
          'renewed',
          'payment_pending',
          'payment_failed',
          'payment_successful',
          'member_added',
          'member_removed',
          'cancelled',
          'expired',
        ],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    metadata: mongoose.Schema.Types.Mixed, // Additional data
  },
  {
    timestamps: true,
  }
);

// Generate membership number
membershipSchema.pre('save', async function (next) {
  if (this.isNew && !this.membershipNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const datePrefix = `MEM${year}${month}${day}`;
    
    // Find the latest membership with the same date prefix
    const latestMembership = await this.constructor.findOne(
      { membershipNumber: new RegExp(`^${datePrefix}`) },
      { membershipNumber: 1 },
      { sort: { membershipNumber: -1 } }
    );
    
    let sequence = 1;
    if (latestMembership && latestMembership.membershipNumber) {
      const latestSequence = parseInt(latestMembership.membershipNumber.substr(9), 10);
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1;
      }
    }
    
    this.membershipNumber = `${datePrefix}${sequence.toString().padStart(4, '0')}`;
    
    // Add created status to timeline if it's a new membership
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [{
        status: 'created',
        timestamp: new Date(),
        note: 'Membership created',
      }];
    }
  }
  next();
});

// Index for faster queries
membershipSchema.index({ membershipNumber: 1 });
membershipSchema.index({ patientId: 1 });
membershipSchema.index({ planId: 1 });
membershipSchema.index({ status: 1 });
membershipSchema.index({ endDate: 1 });
membershipSchema.index({ 'familyMembers.memberId': 1 });

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
const Membership = mongoose.model('Membership', membershipSchema);

module.exports = { MembershipPlan, Membership };