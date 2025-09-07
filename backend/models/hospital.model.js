const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'nursing_home', 'diagnostic_center', 'pharmacy', 'other'],
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    registrationNumber: String,
    gstin: String,
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
    contactPhone: {
      type: String,
      required: true,
    },
    alternatePhone: String,
    emergencyPhone: String,
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    website: String,
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
      name: String,
      description: String,
      isAvailable: Boolean,
      price: Number,
    }],
    specialties: [String],
    facilities: [{
      type: String,
      enum: [
        'emergency',
        'icu',
        'nicu',
        'operation_theater',
        'laboratory',
        'radiology',
        'pharmacy',
        'ambulance',
        'blood_bank',
        'physiotherapy',
        'dialysis',
        'maternity',
        'dental',
        'ophthalmology',
        'cardiology',
        'neurology',
        'orthopedics',
        'pediatrics',
        'gynecology',
        'dermatology',
        'ent',
        'psychiatry',
        'oncology',
        'urology',
        'gastroenterology',
        'endocrinology',
        'pulmonology',
        'nephrology',
        'other',
      ],
    }],
    bedCount: {
      total: Number,
      available: Number,
      icu: Number,
      general: Number,
      private: Number,
      emergency: Number,
    },
    doctors: [{
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
      department: String,
      designation: String,
      isPrimary: Boolean,
      isVisiting: Boolean,
      consultationFee: Number,
      availableDays: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      }],
      timeSlots: [{
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        startTime: String, // Format: HH:MM
        endTime: String, // Format: HH:MM
        slotDuration: Number, // in minutes
        maxPatients: Number,
      }],
    }],
    departments: [{
      name: String,
      head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
      description: String,
      contactNumber: String,
      email: String,
      floor: String,
      roomNumbers: [String],
    }],
    insuranceProviders: [{
      name: String,
      coverageType: String,
      contactNumber: String,
      email: String,
      website: String,
    }],
    accreditations: [{
      name: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      certificateUrl: String,
    }],
    images: [{
      url: String,
      type: {
        type: String,
        enum: ['exterior', 'interior', 'facility', 'staff', 'other'],
      },
      caption: String,
    }],
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
      isVerified: Boolean,
    }],
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
    establishedYear: Number,
    description: String,
    about: String,
    highlights: [String],
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String,
    },
    telemedicineEnabled: {
      type: Boolean,
      default: false,
    },
    homeVisitEnabled: {
      type: Boolean,
      default: false,
    },
    emergencyAvailable: {
      type: Boolean,
      default: false,
    },
    ambulancePhone: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    metaData: {
      searchKeywords: [String],
      seoTitle: String,
      seoDescription: String,
      seoKeywords: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for geospatial queries
hospitalSchema.index({ location: '2dsphere' });

// Index for faster queries
hospitalSchema.index({ ownerId: 1 });
hospitalSchema.index({ licenseNumber: 1 });
hospitalSchema.index({ status: 1 });
hospitalSchema.index({ 'address.city': 1, 'address.state': 1 });
hospitalSchema.index({ type: 1 });
hospitalSchema.index({ specialties: 1 });
hospitalSchema.index({ facilities: 1 });
hospitalSchema.index({ 'doctors.doctorId': 1 });

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;