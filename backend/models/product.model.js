const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    gtin: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined values
      trim: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },
    strength: String,
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'powder', 'other'],
      required: true,
    },
    packSize: String, // e.g., "10 tablets", "100ml"
    packQuantity: Number,
    hsn: String, // Harmonized System Nomenclature code for taxation
    rxRequired: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: ['allopathy', 'ayurveda', 'homeopathy', 'unani', 'siddha', 'otc', 'surgical', 'wellness', 'other'],
      default: 'allopathy',
    },
    subCategory: String,
    therapeuticCategory: [String],
    composition: [{
      ingredient: String,
      strength: String,
      isActive: {
        type: Boolean,
        default: true,
      },
    }],
    mrp: {
      type: Number,
      required: true,
    },
    ptr: Number, // Price to retailer
    ptd: Number, // Price to distributor
    gst: {
      type: Number,
      default: 12, // Default GST rate for medicines
    },
    discount: {
      type: Number,
      default: 0,
    },
    images: [String], // URLs to product images
    description: String,
    indications: String,
    dosageInstructions: String,
    sideEffects: String,
    contraindications: String,
    storageInstructions: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued', 'banned'],
      default: 'active',
    },
    tags: [String],
    substitutes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    isPopular: {
      type: Boolean,
      default: false,
    },
    isGeneric: {
      type: Boolean,
      default: false,
    },
    isBrandLeader: {
      type: Boolean,
      default: false,
    },
    isImported: {
      type: Boolean,
      default: false,
    },
    countryOfOrigin: {
      type: String,
      default: 'India',
    },
    approvalAuthority: String, // e.g., "CDSCO", "FDA"
    approvalDate: Date,
    barcode: String,
    sku: String,
    metaData: {
      searchKeywords: [String],
      seoTitle: String,
      seoDescription: String,
      seoKeywords: [String],
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: Number,
      review: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      isVerifiedPurchase: Boolean,
    }],
    relatedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    frequentlyBoughtTogether: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
productSchema.index({ gtin: 1 });
productSchema.index({ brandName: 'text', genericName: 'text', manufacturer: 'text' });
productSchema.index({ rxRequired: 1 });
productSchema.index({ category: 1 });
productSchema.index({ therapeuticCategory: 1 });
productSchema.index({ status: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;