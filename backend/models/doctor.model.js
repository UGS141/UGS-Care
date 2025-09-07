const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
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
    licenseVerificationDate: Date,
    licenseExpiryDate: Date,
    licenseDocument: String, // URL to stored document
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    subSpecialty: String,
    qualifications: [{
      degree: String,
      institution: String,
      year: Number,
      document: String, // URL to stored document
    }],
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    clinics: [{
      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      },
      primary: {
        type: Boolean,
        default: false,
      },
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
    experience: {
      type: Number, // in years
      default: 0,
    },
    about: String,
    languages: [String],
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    kycDocuments: [{
      type: {
        type: String,
        enum: ['identity', 'address', 'professional', 'other'],
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
    digitalSignature: {
      publicKey: String,
      certificateUrl: String,
      issuedAt: Date,
      expiresAt: Date,
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
    acceptingNewPatients: {
      type: Boolean,
      default: true,
    },
    registrationNumber: String, // Medical council registration number
    registrationYear: Number,
    registrationState: String,
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
doctorSchema.virtual('fullName').get(function () {
  return `Dr. ${this.name}`;
});

// Index for faster queries
doctorSchema.index({ userId: 1 });
doctorSchema.index({ licenseNumber: 1 });
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ 'clinics.hospitalId': 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;