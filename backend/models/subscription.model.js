const mongoose = require('mongoose');

const subscriptionItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: String, // Product name at time of subscription
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: Number, // price * quantity - discount
    dosage: String,
    frequency: String,
    instructions: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    pausedAt: Date,
    pausedUntil: Date,
    pauseReason: String,
  },
  { _id: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    type: {
      type: String,
      enum: ['medication', 'service', 'membership'],
      default: 'medication',
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    items: [subscriptionItemSchema],
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'expired', 'payment_failed'],
      default: 'active',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'custom'],
      required: true,
    },
    customFrequencyDays: Number, // For custom frequency
    startDate: {
      type: Date,
      required: true,
    },
    endDate: Date, // Optional end date
    nextDeliveryDate: Date,
    lastDeliveryDate: Date,
    deliveryDay: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'any'],
      default: 'any',
    },
    preferredTimeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'any'],
      default: 'any',
    },
    autoRenewal: {
      type: Boolean,
      default: true,
    },
    renewalReminderSent: {
      type: Boolean,
      default: false,
    },
    renewalReminderDate: Date,
    totalCycles: Number, // Total number of cycles for the subscription
    completedCycles: {
      type: Number,
      default: 0,
    },
    remainingCycles: Number,
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    shippingAddress: {
      name: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'India',
      },
      landmark: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: [Number], // [longitude, latitude]
      },
    },
    billingAddress: {
      name: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'India',
      },
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cod'],
      required: true,
    },
    paymentDetails: {
      cardId: String,
      upiId: String,
      bankAccountId: String,
      walletId: String,
      authorizationId: String, // For recurring payments
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    promoCode: {
      code: String,
      discount: Number,
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
    },
    membershipDiscount: {
      type: Number,
      default: 0,
    },
    orders: [{
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
      orderNumber: String,
      orderDate: Date,
      status: String,
      amount: Number,
      cycleNumber: Number,
    }],
    payments: [{
      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
      amount: Number,
      status: String,
      date: Date,
      transactionId: String,
      cycleNumber: Number,
    }],
    pauseHistory: [{
      pausedAt: Date,
      pausedUntil: Date,
      reason: String,
      pausedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      resumedAt: Date,
      resumedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    cancellationReason: String,
    cancellationDate: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
    reminderSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      reminderDaysBefore: {
        type: Number,
        default: 2,
      },
      channels: [{
        type: String,
        enum: ['sms', 'email', 'push', 'whatsapp'],
      }],
    },
    source: {
      type: String,
      enum: ['app', 'web', 'phone', 'in_store'],
      default: 'app',
    },
    eRxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ERx',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    timeline: [{
      status: {
        type: String,
        enum: [
          'created',
          'active',
          'paused',
          'resumed',
          'renewed',
          'payment_failed',
          'payment_successful',
          'order_created',
          'order_delivered',
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

// Generate subscription number
subscriptionSchema.pre('save', async function (next) {
  if (this.isNew && !this.subscriptionNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const datePrefix = `SUB${year}${month}${day}`;
    
    // Find the latest subscription with the same date prefix
    const latestSubscription = await this.constructor.findOne(
      { subscriptionNumber: new RegExp(`^${datePrefix}`) },
      { subscriptionNumber: 1 },
      { sort: { subscriptionNumber: -1 } }
    );
    
    let sequence = 1;
    if (latestSubscription && latestSubscription.subscriptionNumber) {
      const latestSequence = parseInt(latestSubscription.subscriptionNumber.substr(9), 10);
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1;
      }
    }
    
    this.subscriptionNumber = `${datePrefix}${sequence.toString().padStart(4, '0')}`;
    
    // Add created status to timeline if it's a new subscription
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [{
        status: 'created',
        timestamp: new Date(),
        note: 'Subscription created',
      }];
    }
  }
  next();
});

// Calculate remaining cycles
subscriptionSchema.pre('save', function (next) {
  if (this.totalCycles) {
    this.remainingCycles = this.totalCycles - this.completedCycles;
  }
  next();
});

// Index for faster queries
subscriptionSchema.index({ subscriptionNumber: 1 });
subscriptionSchema.index({ patientId: 1 });
subscriptionSchema.index({ pharmacyId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ nextDeliveryDate: 1 });
subscriptionSchema.index({ 'items.productId': 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;