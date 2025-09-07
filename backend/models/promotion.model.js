const mongoose = require('mongoose');

// Schema for promotion targets (who the promotion is for)
const targetSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['all', 'segment', 'specific_users'],
      required: true,
    },
    segmentCriteria: {
      userType: [{
        type: String,
        enum: ['patient', 'doctor', 'pharmacy', 'hospital'],
      }],
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number], // [longitude, latitude]
        radius: Number, // in kilometers
      },
      ageRange: {
        min: Number,
        max: Number,
      },
      gender: [{
        type: String,
        enum: ['male', 'female', 'other'],
      }],
      membershipStatus: [{
        type: String,
        enum: ['active', 'expired', 'none'],
      }],
      membershipTier: [String],
      registrationDate: {
        before: Date,
        after: Date,
      },
      lastOrderDate: {
        before: Date,
        after: Date,
      },
      orderCount: {
        min: Number,
        max: Number,
      },
      totalSpend: {
        min: Number,
        max: Number,
      },
      productCategories: [String],
      conditions: [String],
      medications: [String],
      specialties: [String], // For doctors
      tags: [String],
    },
    specificUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  { _id: false }
);

// Schema for promotion rules (conditions for the promotion to apply)
const ruleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['cart_value', 'product_category', 'specific_products', 'first_order', 'repeat_order', 'membership', 'subscription', 'referral', 'birthday', 'anniversary', 'custom'],
      required: true,
    },
    cartValue: {
      minimum: Number,
      maximum: Number,
    },
    productCategories: [String],
    specificProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    orderCount: {
      min: Number,
      max: Number,
    },
    membershipTiers: [String],
    subscriptionTypes: [String],
    customLogic: String, // Description of custom logic or reference to a function
  },
  { _id: false }
);

// Schema for promotion benefits (what the promotion offers)
const benefitSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['percentage_discount', 'fixed_amount_discount', 'free_shipping', 'free_product', 'cashback', 'loyalty_points', 'membership_extension', 'priority_service', 'custom'],
      required: true,
    },
    percentageDiscount: {
      value: Number, // Percentage value
      maxDiscount: Number, // Maximum discount amount
    },
    fixedAmountDiscount: Number,
    freeShipping: {
      enabled: Boolean,
      maxOrderValue: Number,
    },
    freeProduct: {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
    },
    cashback: {
      amount: Number,
      type: {
        type: String,
        enum: ['wallet', 'account'],
      },
      expiryDays: Number,
    },
    loyaltyPoints: {
      points: Number,
      multiplier: Number,
    },
    membershipExtension: {
      days: Number,
      tier: String,
    },
    priorityService: {
      type: String,
      description: String,
    },
    customBenefit: String, // Description of custom benefit
  },
  { _id: false }
);

// Main promotion schema
const promotionSchema = new mongoose.Schema(
  {
    promotionId: {
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
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['discount', 'offer', 'campaign', 'seasonal', 'flash_sale', 'loyalty', 'referral', 'welcome', 'win_back', 'custom'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
      default: 'draft',
    },
    target: targetSchema,
    rules: [ruleSchema],
    benefits: [benefitSchema],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
      },
      interval: Number, // Every X days/weeks/months/years
      daysOfWeek: [{
        type: Number,
        min: 0,
        max: 6,
      }], // 0 = Sunday, 6 = Saturday
      daysOfMonth: [{
        type: Number,
        min: 1,
        max: 31,
      }],
      months: [{
        type: Number,
        min: 0,
        max: 11,
      }], // 0 = January, 11 = December
      endAfterOccurrences: Number,
      endDate: Date,
    },
    budget: {
      totalAmount: Number,
      remainingAmount: Number,
      perUserLimit: Number,
    },
    usageLimits: {
      totalUses: Number,
      usesPerUser: Number,
      usesPerDay: Number,
      remainingUses: Number,
    },
    priority: {
      type: Number,
      default: 0,
    }, // Higher number = higher priority for stacking/conflict resolution
    stackable: {
      type: Boolean,
      default: false,
    },
    stackableWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
    }],
    channels: [{
      type: String,
      enum: ['app', 'website', 'email', 'sms', 'push', 'whatsapp', 'in_store'],
    }],
    displayOptions: {
      showBanner: Boolean,
      bannerImage: String,
      bannerText: String,
      showInPromotionsList: Boolean,
      highlightInSearch: Boolean,
      badgeText: String,
      theme: {
        primaryColor: String,
        secondaryColor: String,
        textColor: String,
      },
    },
    termsAndConditions: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    rejectionReason: String,
    metadata: {
      source: String,
      campaign: String,
      tags: [String],
      additionalInfo: mongoose.Schema.Types.Mixed,
    },
    analytics: {
      impressions: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
      redemptions: {
        type: Number,
        default: 0,
      },
      conversionRate: {
        type: Number,
        default: 0,
      },
      totalDiscountAmount: {
        type: Number,
        default: 0,
      },
      averageOrderValue: {
        type: Number,
        default: 0,
      },
      revenueGenerated: {
        type: Number,
        default: 0,
      },
      roi: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Schema for tracking promotion usage by users
const promotionUsageSchema = new mongoose.Schema(
  {
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    usageCount: {
      type: Number,
      default: 1,
    },
    usageHistory: [{
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
      usedAt: {
        type: Date,
        default: Date.now,
      },
      discountAmount: Number,
      orderValue: Number,
    }],
    firstUsedAt: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate promotion ID before saving
promotionSchema.pre('save', async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const prefix = 'PROMO';
    const timestamp = Math.floor(Date.now() / 1000).toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.promotionId = `${prefix}${timestamp}${random}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Create indexes for faster queries
promotionSchema.index({ promotionId: 1 });
promotionSchema.index({ status: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ 'target.type': 1 });
promotionSchema.index({ 'target.segmentCriteria.userType': 1 });
promotionSchema.index({ 'target.location.coordinates': '2dsphere' });
promotionSchema.index({ type: 1, status: 1 });
promotionSchema.index({ createdAt: -1 });

promotionUsageSchema.index({ promotionId: 1, userId: 1 }, { unique: true });
promotionUsageSchema.index({ userId: 1 });
promotionUsageSchema.index({ 'usageHistory.orderId': 1 });

// Methods
promotionSchema.methods.isActive = function () {
  const now = new Date();
  return (
    this.status === 'active' &&
    this.startDate <= now &&
    this.endDate >= now &&
    (!this.usageLimits.totalUses || this.usageLimits.remainingUses > 0) &&
    (!this.budget.totalAmount || this.budget.remainingAmount > 0)
  );
};

promotionSchema.methods.canBeUsedByUser = async function (userId) {
  if (!this.isActive()) {
    return false;
  }

  // Check if the promotion has per-user limits
  if (this.usageLimits.usesPerUser) {
    const usage = await PromotionUsage.findOne({ promotionId: this._id, userId });
    if (usage && usage.usageCount >= this.usageLimits.usesPerUser) {
      return false;
    }
  }

  // Check if the user is in the target audience
  if (this.target.type === 'specific_users') {
    return this.target.specificUsers.some(id => id.toString() === userId.toString());
  }

  // For segment-based targeting, we would need to check the user against the segment criteria
  // This would typically be a more complex function that queries the user's data

  return true;
};

promotionSchema.methods.calculateDiscount = function (orderDetails) {
  // This would be a complex function that applies the promotion rules to calculate the discount
  // It would check the order against the promotion rules and apply the benefits accordingly
  // For simplicity, we're just returning a placeholder implementation
  
  let discount = 0;
  
  // Example implementation for percentage discount
  this.benefits.forEach(benefit => {
    if (benefit.type === 'percentage_discount' && benefit.percentageDiscount) {
      const calculatedDiscount = (orderDetails.subtotal * benefit.percentageDiscount.value) / 100;
      discount += benefit.percentageDiscount.maxDiscount 
        ? Math.min(calculatedDiscount, benefit.percentageDiscount.maxDiscount)
        : calculatedDiscount;
    } else if (benefit.type === 'fixed_amount_discount' && benefit.fixedAmountDiscount) {
      discount += benefit.fixedAmountDiscount;
    }
    // Other benefit types would be handled similarly
  });
  
  return discount;
};

const Promotion = mongoose.model('Promotion', promotionSchema);
const PromotionUsage = mongoose.model('PromotionUsage', promotionUsageSchema);

module.exports = {
  Promotion,
  PromotionUsage,
};