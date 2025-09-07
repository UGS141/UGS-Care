const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
      default: 'unknown',
    },
    height: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm',
      },
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lb'],
        default: 'kg',
      },
    },
    allergies: [{
      type: {
        type: String,
        enum: ['food', 'medication', 'environmental', 'other'],
      },
      name: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
      },
      reaction: String,
    }],
    chronicConditions: [{
      condition: String,
      diagnosedAt: Date,
      medications: [String],
      notes: String,
    }],
    emergencyContacts: [{
      name: String,
      relationship: String,
      phone: String,
      isEmergencyContact: {
        type: Boolean,
        default: true,
      },
    }],
    familyMembers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      relationship: String,
      isDependent: Boolean,
      accessLevel: {
        type: String,
        enum: ['none', 'limited', 'full'],
        default: 'none',
      },
    }],
    insuranceDetails: [{
      provider: String,
      policyNumber: String,
      validFrom: Date,
      validUntil: Date,
      coverageType: String,
      primaryHolder: Boolean,
      documentUrl: String, // URL to stored document
    }],
    preferredPharmacies: [{
      pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
      },
      isPrimary: Boolean,
    }],
    preferredHospitals: [{
      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      },
      isPrimary: Boolean,
    }],
    preferredDoctors: [{
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
      specialty: String,
      isPrimary: Boolean,
    }],
    medicationSchedule: [{
      medicationName: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date,
      instructions: String,
      reminderEnabled: Boolean,
      reminderTime: [String], // Format: HH:MM
      status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active',
      },
    }],
    healthMetrics: [{
      type: {
        type: String,
        enum: ['blood_pressure', 'blood_sugar', 'heart_rate', 'temperature', 'oxygen_saturation', 'other'],
      },
      value: mongoose.Schema.Types.Mixed,
      unit: String,
      measuredAt: {
        type: Date,
        default: Date.now,
      },
      notes: String,
    }],
    subscriptions: [{
      type: {
        type: String,
        enum: ['medication', 'service', 'membership'],
      },
      name: String,
      startDate: Date,
      endDate: Date,
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
      },
      status: {
        type: String,
        enum: ['active', 'paused', 'cancelled', 'expired'],
        default: 'active',
      },
      autoRenewal: Boolean,
      lastRenewalDate: Date,
      nextRenewalDate: Date,
      paymentMethod: String,
    }],
    membershipDetails: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'premium', 'family'],
        default: 'free',
      },
      startDate: Date,
      endDate: Date,
      autoRenewal: {
        type: Boolean,
        default: false,
      },
      benefits: [String],
      discountRate: Number,
      paymentHistory: [{
        amount: Number,
        currency: {
          type: String,
          default: 'INR',
        },
        paymentDate: Date,
        paymentMethod: String,
        status: {
          type: String,
          enum: ['pending', 'completed', 'failed', 'refunded'],
        },
        transactionId: String,
      }],
    },
    promoCodesUsed: [{
      code: String,
      appliedAt: Date,
      discount: Number,
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    }],
    consentSettings: {
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      smsNotifications: {
        type: Boolean,
        default: true,
      },
      dataSharing: {
        type: Boolean,
        default: false,
      },
      anonymizedAnalytics: {
        type: Boolean,
        default: true,
      },
      researchParticipation: {
        type: Boolean,
        default: false,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for age calculation
patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Index for faster queries
patientSchema.index({ userId: 1 });
patientSchema.index({ 'preferredPharmacies.pharmacyId': 1 });
patientSchema.index({ 'preferredDoctors.doctorId': 1 });
patientSchema.index({ 'membershipDetails.plan': 1 });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;