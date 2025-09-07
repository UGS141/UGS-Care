const mongoose = require('mongoose');
const crypto = require('crypto');

const eRxItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    genericName: String, // Used when prescribing generic instead of brand
    brandName: String,
    strength: String,
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'powder', 'other'],
    },
    dosage: String, // e.g., "1 tablet"
    frequency: String, // e.g., "twice daily"
    duration: String, // e.g., "7 days"
    route: {
      type: String,
      enum: ['oral', 'topical', 'intravenous', 'intramuscular', 'inhalation', 'rectal', 'vaginal', 'nasal', 'ophthalmic', 'otic', 'other'],
      default: 'oral',
    },
    timing: String, // e.g., "after meals"
    quantity: Number,
    refills: {
      type: Number,
      default: 0,
    },
    substitutionsAllowed: {
      type: Boolean,
      default: true,
    },
    instructions: String,
    isDiscontinued: {
      type: Boolean,
      default: false,
    },
    discontinuationReason: String,
  },
  { _id: true }
);

const eRxSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    diagnosis: [{
      code: String, // ICD-10 or other coding system
      description: String,
      type: {
        type: String,
        enum: ['primary', 'secondary'],
        default: 'primary',
      },
    }],
    items: [eRxItemSchema],
    notes: String, // Doctor's notes
    pdfUrl: String, // URL to the generated PDF
    qrCode: String, // QR code data or URL
    status: {
      type: String,
      enum: ['draft', 'signed', 'dispensed', 'expired', 'cancelled'],
      default: 'draft',
    },
    signedAt: Date,
    expiresAt: Date, // When the prescription expires
    version: {
      type: Number,
      default: 1,
    },
    hash: String, // Digital signature hash
    digitalSignature: {
      algorithm: {
        type: String,
        default: 'SHA256',
      },
      value: String,
      certificateId: String,
    },
    issuedLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number], // [longitude, latitude]
      address: String,
    },
    consultationType: {
      type: String,
      enum: ['in-person', 'telemedicine', 'home-visit'],
      default: 'in-person',
    },
    followUpDate: Date,
    followUpInstructions: String,
    labTests: [{
      name: String,
      instructions: String,
      isUrgent: Boolean,
    }],
    vitalSigns: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number,
      weight: Number,
      height: Number,
      bmi: Number,
    },
    allergies: [String],
    dispensingHistory: [{
      pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
      },
      dispensedAt: Date,
      dispensedBy: String,
      items: [{
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        quantityDispensed: Number,
        batchNumber: String,
        expiryDate: Date,
        substitutedWith: {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
          },
          reason: String,
        },
      }],
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    }],
    revisions: [{
      version: Number,
      changedAt: Date,
      changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: String,
      previousHash: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Generate hash for the prescription
eRxSchema.methods.generateHash = async function () {
  // Create a string representation of the prescription data
  const dataToHash = JSON.stringify({
    doctorId: this.doctorId,
    patientId: this.patientId,
    diagnosis: this.diagnosis,
    items: this.items,
    notes: this.notes,
    signedAt: this.signedAt,
    version: this.version,
  });

  // Generate hash
  this.hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  return this.hash;
};

// Verify the prescription hash
eRxSchema.methods.verifyHash = async function (providedHash) {
  const currentHash = await this.generateHash();
  return currentHash === providedHash;
};

// Index for faster queries
eRxSchema.index({ doctorId: 1, patientId: 1 });
eRxSchema.index({ patientId: 1 });
eRxSchema.index({ status: 1 });
eRxSchema.index({ signedAt: 1 });
eRxSchema.index({ expiresAt: 1 });
eRxSchema.index({ hash: 1 });

const ERx = mongoose.model('ERx', eRxSchema);

module.exports = ERx;