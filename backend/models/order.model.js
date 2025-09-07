const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
    },
    eRxItemId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    name: String, // Product name at time of order
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    mrp: Number,
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: Number, // price * quantity - discount
    batchNumber: String,
    expiryDate: Date,
    substituted: {
      type: Boolean,
      default: false,
    },
    substitutionReason: String,
    originalProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    isRefundable: {
      type: Boolean,
      default: true,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected', 'processed'],
      default: 'none',
    },
    refundAmount: Number,
    refundReason: String,
    refundRequestDate: Date,
    refundProcessedDate: Date,
  },
  { _id: true }
);

const orderAddressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: String,
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    landmark: String,
    addressType: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number], // [longitude, latitude]
    },
  },
  { _id: false }
);

const orderTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'created',
        'payment_pending',
        'payment_failed',
        'payment_successful',
        'pharmacy_assigned',
        'pharmacy_accepted',
        'pharmacy_rejected',
        'processing',
        'packed',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
        'refunded',
      ],
      required: true,
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
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: [Number], // [longitude, latitude]
      address: String,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    eRxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ERx',
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    timeline: [orderTimelineSchema],
    shippingAddress: orderAddressSchema,
    billingAddress: orderAddressSchema,
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'upi', 'netbanking', 'wallet', 'emi'],
    },
    transactionId: String,
    invoiceNumber: String,
    invoiceUrl: String,
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
    deliveryType: {
      type: String,
      enum: ['standard', 'express', 'scheduled', 'pickup'],
      default: 'standard',
    },
    deliverySlot: {
      date: Date,
      timeSlot: String, // e.g., "9:00 AM - 12:00 PM"
    },
    deliveryInstructions: String,
    deliveryPartner: {
      name: String,
      trackingId: String,
      trackingUrl: String,
      contactNumber: String,
    },
    deliveryOtp: String,
    deliveryVerified: {
      type: Boolean,
      default: false,
    },
    deliveryVerifiedAt: Date,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    cancellationReason: String,
    cancellationNote: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: Date,
    returnReason: String,
    returnNote: String,
    returnInitiatedAt: Date,
    returnCompletedAt: Date,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['none', 'initiated', 'processing', 'completed', 'failed'],
      default: 'none',
    },
    refundTransactionId: String,
    refundProcessedAt: Date,
    rating: {
      value: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: String,
      createdAt: Date,
    },
    source: {
      type: String,
      enum: ['app', 'web', 'phone', 'in_store'],
      default: 'app',
    },
    notes: String,
    isSubscriptionOrder: {
      type: Boolean,
      default: false,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    isGift: {
      type: Boolean,
      default: false,
    },
    giftMessage: String,
    giftSender: String,
  },
  {
    timestamps: true,
  }
);

// Generate order number
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    // Find the latest order with the same date prefix
    const latestOrder = await this.constructor.findOne(
      { orderNumber: new RegExp(`^${datePrefix}`) },
      { orderNumber: 1 },
      { sort: { orderNumber: -1 } }
    );
    
    let sequence = 1;
    if (latestOrder && latestOrder.orderNumber) {
      const latestSequence = parseInt(latestOrder.orderNumber.substr(6), 10);
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1;
      }
    }
    
    this.orderNumber = `${datePrefix}${sequence.toString().padStart(4, '0')}`;
    
    // Add created status to timeline if it's a new order
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [{
        status: 'created',
        timestamp: new Date(),
        note: 'Order created',
      }];
    }
  }
  next();
});

// Index for faster queries
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ patientId: 1 });
orderSchema.index({ pharmacyId: 1 });
orderSchema.index({ eRxId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ 'items.productId': 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;