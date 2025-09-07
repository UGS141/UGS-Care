const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    licenseVerified: {
      type: Boolean,
      default: false,
    },
    licenseExpiryDate: Date,
    licenseDocument: String, // URL to stored document
    gstin: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'India',
      },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    serviceRadiusKm: {
      type: Number,
      default: 5,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'closed'],
      default: 'pending',
    },
    operatingHours: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
      open: Boolean,
      openTime: String, // Format: HH:MM
      closeTime: String, // Format: HH:MM
      break: {
        hasBreak: Boolean,
        startTime: String, // Format: HH:MM
        endTime: String, // Format: HH:MM
      },
    }],
    services: [{
      type: String,
      enum: ['prescription', 'otc', 'delivery', 'homeDelivery', 'nightService', 'consultation'],
    }],
    deliveryOptions: {
      selfDelivery: Boolean,
      thirdPartyDelivery: Boolean,
      expressDelivery: Boolean,
      deliveryCharges: Number,
      freeDeliveryAbove: Number,
    },
    paymentOptions: {
      cash: {
        type: Boolean,
        default: true,
      },
      upi: Boolean,
      cards: Boolean,
      netBanking: Boolean,
      wallet: Boolean,
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    kycDocuments: [{
      type: {
        type: String,
        enum: ['identity', 'address', 'business', 'other'],
      },
      documentUrl: String,
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      verifiedAt: Date,
    }],
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
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String,
      upiId: String,
    },
    commissionRate: {
      type: Number,
      default: 0,
    },
    settlementCycle: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly',
    },
    pharmacistDetails: [{
      name: String,
      registrationNumber: String,
      registrationDocument: String, // URL to stored document
      isHead: Boolean,
    }],
    drugLicense: {
      retailDrugLicense: String,
      wholesaleDrugLicense: String,
      narcoticsLicense: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for geospatial queries
pharmacySchema.index({ location: '2dsphere' });

// Index for faster queries
pharmacySchema.index({ ownerId: 1 });
pharmacySchema.index({ licenseNumber: 1 });
pharmacySchema.index({ gstin: 1 });
pharmacySchema.index({ status: 1 });
pharmacySchema.index({ 'address.city': 1, 'address.state': 1 });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

module.exports = Pharmacy;