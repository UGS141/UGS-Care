const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    appointmentNumber: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      enum: ['in-person', 'telemedicine', 'home-visit'],
      required: true,
    },
    slotDate: {
      type: Date,
      required: true,
    },
    slotTime: {
      type: String, // Format: HH:MM
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 15,
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
      default: 'scheduled',
    },
    reason: {
      type: String,
      required: true,
    },
    notes: String,
    symptoms: [String],
    vitals: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      respiratoryRate: Number,
      oxygenSaturation: Number,
      weight: Number,
      height: Number,
      bmi: Number,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    amount: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cash', 'insurance'],
    },
    transactionId: String,
    invoiceNumber: String,
    invoiceUrl: String,
    followUp: {
      recommended: {
        type: Boolean,
        default: false,
      },
      date: Date,
      notes: String,
    },
    eRxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ERx',
    },
    medicalRecords: [{
      type: {
        type: String,
        enum: ['lab_report', 'imaging', 'prescription', 'other'],
      },
      title: String,
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      notes: String,
    }],
    diagnosis: [{
      code: String, // ICD-10 or other coding system
      description: String,
      type: {
        type: String,
        enum: ['primary', 'secondary'],
        default: 'primary',
      },
    }],
    labTests: [{
      name: String,
      instructions: String,
      isUrgent: Boolean,
      status: {
        type: String,
        enum: ['ordered', 'completed', 'cancelled'],
        default: 'ordered',
      },
      resultUrl: String,
      resultDate: Date,
    }],
    checkinTime: Date,
    startTime: Date,
    endTime: Date,
    waitTime: Number, // in minutes
    consultationDuration: Number, // in minutes
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: Date,
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    rescheduledTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    rescheduledReason: String,
    rating: {
      value: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: String,
      createdAt: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: Date,
    source: {
      type: String,
      enum: ['app', 'web', 'phone', 'walk-in'],
      default: 'app',
    },
    isFirstVisit: {
      type: Boolean,
      default: false,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    telemedicine: {
      roomId: String,
      meetingLink: String,
      provider: String, // e.g., 'zoom', 'google-meet', 'custom'
      recordingUrl: String,
      duration: Number, // in minutes
      startedAt: Date,
      endedAt: Date,
    },
    homeVisit: {
      address: {
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        postalCode: String,
        country: {
          type: String,
          default: 'India',
        },
        location: {
          type: {
            type: String,
            enum: ['Point'],
          },
          coordinates: [Number], // [longitude, latitude]
        },
      },
      contactPhone: String,
      arrivalTime: Date,
      departureTime: Date,
      travelFee: Number,
    },
    timeline: [{
      status: {
        type: String,
        enum: [
          'created',
          'payment_pending',
          'payment_failed',
          'payment_successful',
          'confirmed',
          'reminder_sent',
          'checked_in',
          'in_progress',
          'completed',
          'cancelled',
          'no_show',
          'rescheduled',
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
    insuranceClaim: {
      policyNumber: String,
      provider: String,
      authorizationCode: String,
      claimStatus: {
        type: String,
        enum: ['not_submitted', 'submitted', 'in_process', 'approved', 'partially_approved', 'rejected'],
        default: 'not_submitted',
      },
      claimAmount: Number,
      approvedAmount: Number,
      rejectionReason: String,
      submittedAt: Date,
      processedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate appointment number
appointmentSchema.pre('save', async function (next) {
  if (this.isNew && !this.appointmentNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const datePrefix = `APT${year}${month}${day}`;
    
    // Find the latest appointment with the same date prefix
    const latestAppointment = await this.constructor.findOne(
      { appointmentNumber: new RegExp(`^${datePrefix}`) },
      { appointmentNumber: 1 },
      { sort: { appointmentNumber: -1 } }
    );
    
    let sequence = 1;
    if (latestAppointment && latestAppointment.appointmentNumber) {
      const latestSequence = parseInt(latestAppointment.appointmentNumber.substr(9), 10);
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1;
      }
    }
    
    this.appointmentNumber = `${datePrefix}${sequence.toString().padStart(4, '0')}`;
    
    // Add created status to timeline if it's a new appointment
    if (!this.timeline || this.timeline.length === 0) {
      this.timeline = [{
        status: 'created',
        timestamp: new Date(),
        note: 'Appointment created',
      }];
    }
  }
  next();
});

// Index for faster queries
appointmentSchema.index({ appointmentNumber: 1 });
appointmentSchema.index({ doctorId: 1, slotDate: 1 });
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ hospitalId: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ slotDate: 1 });
appointmentSchema.index({ type: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;