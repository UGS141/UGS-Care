const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['order', 'appointment', 'subscription', 'membership', 'other'],
      required: true,
    },
    entityNumber: String, // Order number, appointment number, etc.
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['initiated', 'pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded', 'cancelled'],
      default: 'initiated',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'emi', 'cod', 'insurance', 'other'],
      required: true,
    },
    paymentMethodDetails: {
      // Card details (masked)
      cardType: String, // visa, mastercard, etc.
      cardNetwork: String,
      cardLastFour: String,
      cardExpiryMonth: String,
      cardExpiryYear: String,
      cardHolderName: String,
      
      // UPI details
      upiId: String,
      upiProvider: String, // gpay, phonepe, etc.
      
      // Netbanking details
      bankName: String,
      bankAccountNumber: String, // masked
      
      // Wallet details
      walletProvider: String,
      walletPhoneNumber: String, // masked
      
      // EMI details
      emiProvider: String,
      emiPlan: String,
      emiTenure: Number,
      emiInterestRate: Number,
      
      // Insurance details
      insuranceProvider: String,
      insurancePolicyNumber: String,
      insuranceApprovalCode: String,
    },
    transactionId: String, // Gateway transaction ID
    orderId: String, // Gateway order ID
    receiptNumber: String,
    invoiceNumber: String,
    invoiceUrl: String,
    description: String,
    notes: String,
    gatewayName: {
      type: String,
      enum: ['razorpay', 'paytm', 'stripe', 'paypal', 'cashfree', 'phonepe', 'internal', 'other'],
      required: true,
    },
    gatewayFee: Number,
    gatewayTax: Number,
    gatewayResponse: mongoose.Schema.Types.Mixed, // Store the raw response from payment gateway
    capturedAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    refundReason: String,
    refundTransactionId: String,
    refundStatus: {
      type: String,
      enum: ['none', 'initiated', 'processing', 'completed', 'failed'],
      default: 'none',
    },
    refundNotes: String,
    failureReason: String,
    failureCode: String,
    errorMessage: String,
    retryCount: {
      type: Number,
      default: 0,
    },
    lastRetryAt: Date,
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDetails: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      },
      startDate: Date,
      endDate: Date,
      nextBillingDate: Date,
      totalBillingCycles: Number,
      currentBillingCycle: Number,
      authorizationId: String,
      subscriptionId: String,
    },
    metadata: mongoose.Schema.Types.Mixed, // Additional data
    ipAddress: String,
    userAgent: String,
    deviceInfo: {
      type: String,
      enum: ['web', 'android', 'ios', 'other'],
    },
    billingAddress: {
      name: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
      email: String,
    },
    shippingAddress: {
      name: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
      email: String,
    },
    timeline: [{
      status: {
        type: String,
        enum: [
          'initiated',
          'pending',
          'authorized',
          'captured',
          'failed',
          'refunded',
          'partially_refunded',
          'cancelled',
          'refund_initiated',
          'refund_processing',
          'refund_completed',
          'refund_failed',
        ],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      note: String,
      amount: Number,
      transactionId: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    taxDetails: {
      taxableAmount: Number,
      cgst: Number,
      sgst: Number,
      igst: Number,
      totalTax: Number,
      hsnCode: String,
      taxInvoiceNumber: String,
    },
    promoCode: {
      code: String,
      discountAmount: Number,
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
    },
    membershipDiscount: Number,
    isTestPayment: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate payment ID
paymentSchema.pre('save', function (next) {
  if (this.isNew && !this.paymentId) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    this.paymentId = `PAY${year}${month}${day}${hours}${minutes}${seconds}${random}`;
    
    // Add initiated status to timeline if it's a new payment
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [{
        status: 'initiated',
        timestamp: new Date(),
        note: 'Payment initiated',
        amount: this.amount,
      }];
    }
  }
  next();
});

// Index for faster queries
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ entityId: 1, entityType: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: 1 });
paymentSchema.index({ 'recurringDetails.nextBillingDate': 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;