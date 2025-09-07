const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free_delivery', 'bogo', 'cashback', 'reward_points'],
      required: true,
    },
    value: {
      type: Number, // Percentage or fixed amount depending on type
      required: true,
      min: 0,
    },
    maxDiscountAmount: Number, // For percentage discounts
    minOrderValue: {
      type: Number,
      default: 0,
    },
    applicableOn: {
      type: String,
      enum: ['all', 'medicines', 'lab_tests', 'consultations', 'memberships', 'specific_products', 'specific_services'],
      default: 'all',
    },
    specificItems: [{ // For specific products or services
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'promoItemType',
    }],
    promoItemType: {
      type: String,
      enum: ['Product', 'Service', 'MembershipPlan'],
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
    usageLimit: {
      perUser: {
        type: Number, // How many times a user can use this code
        default: 1,
      },
      total: Number, // Total number of times this code can be used
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    userGroups: [{ // Target specific user groups
      type: String,
      enum: ['all', 'new_users', 'existing_users', 'premium_members', 'inactive_users', 'specific_users'],
    }],
    specificUsers: [{ // For specific users
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    userRoles: [{ // Target specific user roles
      type: String,
      enum: ['patient', 'doctor', 'pharmacy', 'hospital'],
    }],
    locationRestriction: {
      cities: [String],
      states: [String],
      countries: [String],
    },
    deviceRestriction: {
      platforms: [{
        type: String,
        enum: ['android', 'ios', 'web', 'all'],
      }],
    },
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },
    combinable: { // Can be combined with other promotions
      type: Boolean,
      default: false,
    },
    priority: { // For determining which promo to apply when multiple are valid
      type: Number,
      default: 0,
    },
    termsAndConditions: String,
    campaignId: String, // For tracking marketing campaigns
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: mongoose.Schema.Types.Mixed, // Additional data
  },
  {
    timestamps: true,
  }
);

// Usage history for tracking which users have used the promo code
const promoCodeUsageSchema = new mongoose.Schema(
  {
    promoCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCode',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userType: {
      type: String,
      enum: ['patient', 'doctor', 'pharmacy', 'hospital'],
      required: true,
    },
    entityId: { // Order, Appointment, Membership, etc.
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['Order', 'Appointment', 'Membership', 'Subscription'],
      required: true,
    },
    entityNumber: String, // Order number, appointment number, etc.
    discountAmount: {
      type: Number,
      required: true,
    },
    originalAmount: {
      type: Number,
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['applied', 'cancelled', 'refunded'],
      default: 'applied',
    },
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: String,
    platform: {
      type: String,
      enum: ['android', 'ios', 'web'],
    },
    deviceInfo: {
      deviceId: String,
      model: String,
      os: String,
      appVersion: String,
    },
    ipAddress: String,
    location: {
      city: String,
      state: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for checking if promo code is expired
promoCodeSchema.virtual('isExpired').get(function () {
  return this.endDate < new Date();
});

// Virtual for checking if promo code has reached usage limit
promoCodeSchema.virtual('isLimitReached').get(function () {
  if (!this.usageLimit || !this.usageLimit.total) return false;
  return this.usageCount >= this.usageLimit.total;
});

// Virtual for checking if promo code is valid (active, not expired, limit not reached)
promoCodeSchema.virtual('isValid').get(function () {
  return this.isActive && !this.isExpired && !this.isLimitReached;
});

// Method to validate if a user can use this promo code
promoCodeSchema.methods.canBeUsedBy = async function (userId, userRole, orderAmount, platform) {
  // Check if promo code is valid
  if (!this.isValid) return { valid: false, reason: 'Promo code is invalid or expired' };
  
  // Check minimum order value
  if (orderAmount < this.minOrderValue) {
    return { valid: false, reason: `Minimum order value of ₹${this.minOrderValue} required` };
  }
  
  // Check user role restrictions
  if (this.userRoles && this.userRoles.length > 0 && !this.userRoles.includes(userRole)) {
    return { valid: false, reason: 'Promo code not applicable for your user type' };
  }
  
  // Check device restrictions
  if (this.deviceRestriction && this.deviceRestriction.platforms.length > 0 
      && !this.deviceRestriction.platforms.includes('all') 
      && !this.deviceRestriction.platforms.includes(platform)) {
    return { valid: false, reason: `Promo code only valid on ${this.deviceRestriction.platforms.join(', ')}` };
  }
  
  // Check user-specific restrictions
  if (this.specificUsers && this.specificUsers.length > 0 && !this.specificUsers.includes(userId)) {
    return { valid: false, reason: 'Promo code not applicable for your account' };
  }
  
  // Check if user has already used this code up to the limit
  if (this.usageLimit && this.usageLimit.perUser > 0) {
    const PromoCodeUsage = mongoose.model('PromoCodeUsage');
    const userUsageCount = await PromoCodeUsage.countDocuments({
      promoCodeId: this._id,
      userId: userId,
      status: 'applied'
    });
    
    if (userUsageCount >= this.usageLimit.perUser) {
      return { valid: false, reason: 'You have already used this promo code' };
    }
  }
  
  // Check first order only restriction
  if (this.firstOrderOnly) {
    const Order = mongoose.model('Order');
    const userOrderCount = await Order.countDocuments({
      'patient.userId': userId,
      status: { $in: ['delivered', 'completed'] }
    });
    
    if (userOrderCount > 0) {
      return { valid: false, reason: 'Promo code valid for first order only' };
    }
  }
  
  return { valid: true };
};

// Method to calculate discount amount
promoCodeSchema.methods.calculateDiscount = function (orderAmount) {
  let discountAmount = 0;
  
  switch (this.type) {
    case 'percentage':
      discountAmount = (orderAmount * this.value) / 100;
      if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
        discountAmount = this.maxDiscountAmount;
      }
      break;
    case 'fixed':
      discountAmount = this.value;
      if (discountAmount > orderAmount) {
        discountAmount = orderAmount;
      }
      break;
    case 'free_delivery':
      // This would be handled separately in the order processing logic
      discountAmount = 0;
      break;
    // Other types would have custom logic
  }
  
  return discountAmount;
};

// Indexes for faster queries
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ isActive: 1 });
promoCodeSchema.index({ startDate: 1, endDate: 1 });
promoCodeSchema.index({ 'userRoles': 1 });
promoCodeSchema.index({ 'specificUsers': 1 });

promoCodeUsageSchema.index({ promoCodeId: 1, userId: 1 });
promoCodeUsageSchema.index({ entityId: 1, entityType: 1 });
promoCodeUsageSchema.index({ appliedAt: 1 });

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
const PromoCodeUsage = mongoose.model('PromoCodeUsage', promoCodeUsageSchema);

module.exports = { PromoCode, PromoCodeUsage };