const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    manufacturingDate: Date,
    mrp: {
      type: Number,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    damagedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    returnedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      rack: String,
      shelf: String,
      bin: String,
    },
    supplier: {
      name: String,
      invoiceNumber: String,
      invoiceDate: Date,
      contactPerson: String,
      contactNumber: String,
    },
    purchaseDate: Date,
    status: {
      type: String,
      enum: ['active', 'low_stock', 'out_of_stock', 'expired', 'near_expiry', 'recalled'],
      default: 'active',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    lastStockCheckDate: Date,
    reorderLevel: {
      type: Number,
      default: 10,
    },
    reorderQuantity: {
      type: Number,
      default: 50,
    },
    isReorderEnabled: {
      type: Boolean,
      default: true,
    },
    stockAlerts: {
      lowStockAlert: {
        type: Boolean,
        default: true,
      },
      expiryAlert: {
        type: Boolean,
        default: true,
      },
      expiryAlertDays: {
        type: Number,
        default: 90, // Alert 90 days before expiry
      },
    },
    notes: String,
    transactionHistory: [{
      type: {
        type: String,
        enum: ['purchase', 'sale', 'return', 'adjustment', 'transfer', 'damage', 'expiry'],
      },
      quantity: Number,
      date: {
        type: Date,
        default: Date.now,
      },
      referenceId: mongoose.Schema.Types.ObjectId, // Order ID, Return ID, etc.
      referenceType: String, // 'Order', 'Return', etc.
      notes: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Compound index for pharmacy and product
inventorySchema.index({ pharmacyId: 1, productId: 1, batchNumber: 1 }, { unique: true });

// Index for faster queries
inventorySchema.index({ pharmacyId: 1 });
inventorySchema.index({ productId: 1 });
inventorySchema.index({ expiryDate: 1 });
inventorySchema.index({ status: 1 });

// Virtual for days until expiry
inventorySchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const today = new Date();
  const expiryDate = new Date(this.expiryDate);
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Pre-save middleware to update status based on quantity and expiry
inventorySchema.pre('save', function (next) {
  // Check if expired
  const today = new Date();
  const expiryDate = new Date(this.expiryDate);
  
  if (expiryDate <= today) {
    this.status = 'expired';
    next();
    return;
  }
  
  // Check if near expiry
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= this.stockAlerts.expiryAlertDays) {
    this.status = 'near_expiry';
    next();
    return;
  }
  
  // Check stock levels
  if (this.availableQuantity <= 0) {
    this.status = 'out_of_stock';
  } else if (this.availableQuantity <= this.reorderLevel) {
    this.status = 'low_stock';
  } else {
    this.status = 'active';
  }
  
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;