const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String,
        enum: ['patient', 'doctor', 'pharmacy', 'hospital', 'admin', 'pharma'],
        required: true,
      },
    },
    type: {
      type: String,
      enum: [
        'order_status',
        'appointment_reminder',
        'prescription_received',
        'payment_confirmation',
        'refund_status',
        'medication_reminder',
        'subscription_renewal',
        'membership_expiry',
        'doctor_message',
        'pharmacy_message',
        'system_alert',
        'promotion',
        'verification',
        'account_update',
        'health_reminder',
        'lab_result',
        'document_shared',
        'dispute_update',
        'other',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending',
    },
    channels: [{
      type: String,
      enum: ['push', 'email', 'sms', 'in_app', 'whatsapp'],
      required: true,
    }],
    channelStatus: {
      push: {
        status: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
          default: 'pending',
        },
        sentAt: Date,
        deliveredAt: Date,
        readAt: Date,
        failedAt: Date,
        failureReason: String,
        deviceToken: String,
        deviceType: String,
      },
      email: {
        status: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
          default: 'pending',
        },
        sentAt: Date,
        deliveredAt: Date,
        readAt: Date,
        failedAt: Date,
        failureReason: String,
        emailAddress: String,
        emailSubject: String,
        emailTemplate: String,
        messageId: String,
      },
      sms: {
        status: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
          default: 'pending',
        },
        sentAt: Date,
        deliveredAt: Date,
        failedAt: Date,
        failureReason: String,
        phoneNumber: String,
        messageId: String,
      },
      whatsapp: {
        status: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
          default: 'pending',
        },
        sentAt: Date,
        deliveredAt: Date,
        readAt: Date,
        failedAt: Date,
        failureReason: String,
        phoneNumber: String,
        templateName: String,
        messageId: String,
      },
      in_app: {
        status: {
          type: String,
          enum: ['pending', 'delivered', 'read', 'deleted'],
          default: 'pending',
        },
        deliveredAt: Date,
        readAt: Date,
        deletedAt: Date,
      },
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Additional data for the notification
      default: {},
    },
    actions: [{
      name: String,
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['link', 'button', 'deeplink'],
      },
    }],
    reference: {
      type: {
        type: String,
        enum: [
          'order',
          'appointment',
          'prescription',
          'payment',
          'refund',
          'subscription',
          'membership',
          'message',
          'dispute',
          'other',
        ],
      },
      id: mongoose.Schema.Types.ObjectId,
      number: String, // Order number, appointment number, etc.
    },
    metadata: {
      campaign: String, // For marketing/promotional notifications
      source: String,
      tags: [String],
      additionalInfo: mongoose.Schema.Types.Mixed,
    },
    scheduledFor: Date, // For scheduled notifications
    expiresAt: Date, // When the notification should expire
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    isSent: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: Date,
    retryCount: {
      type: Number,
      default: 0,
    },
    lastRetryAt: Date,
    nextRetryAt: Date,
  },
  {
    timestamps: true,
  }
);

// Notification template schema
const notificationTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: [
        'order_status',
        'appointment_reminder',
        'prescription_received',
        'payment_confirmation',
        'refund_status',
        'medication_reminder',
        'subscription_renewal',
        'membership_expiry',
        'doctor_message',
        'pharmacy_message',
        'system_alert',
        'promotion',
        'verification',
        'account_update',
        'health_reminder',
        'lab_result',
        'document_shared',
        'dispute_update',
        'other',
      ],
      required: true,
    },
    channels: [{
      type: String,
      enum: ['push', 'email', 'sms', 'in_app', 'whatsapp'],
      required: true,
    }],
    templates: {
      push: {
        title: String,
        body: String,
        data: mongoose.Schema.Types.Mixed,
        actions: [{
          name: String,
          title: String,
          type: String,
        }],
      },
      email: {
        subject: String,
        body: String, // Can be HTML
        template: String, // Reference to an email template
        attachments: [{
          name: String,
          type: String,
        }],
      },
      sms: {
        body: String,
      },
      whatsapp: {
        templateName: String,
        body: String,
        headerParams: [String],
        bodyParams: [String],
        footerParams: [String],
      },
      in_app: {
        title: String,
        body: String,
        icon: String,
        actions: [{
          name: String,
          title: String,
          type: String,
        }],
      },
    },
    variables: [{
      name: String,
      description: String,
      defaultValue: String,
      required: Boolean,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Notification preference schema
const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    preferences: [{
      type: {
        type: String,
        enum: [
          'order_status',
          'appointment_reminder',
          'prescription_received',
          'payment_confirmation',
          'refund_status',
          'medication_reminder',
          'subscription_renewal',
          'membership_expiry',
          'doctor_message',
          'pharmacy_message',
          'system_alert',
          'promotion',
          'verification',
          'account_update',
          'health_reminder',
          'lab_result',
          'document_shared',
          'dispute_update',
          'other',
        ],
        required: true,
      },
      channels: {
        push: {
          enabled: {
            type: Boolean,
            default: true,
          },
          quiet_hours: {
            enabled: {
              type: Boolean,
              default: false,
            },
            start: String, // HH:MM format
            end: String, // HH:MM format
          },
        },
        email: {
          enabled: {
            type: Boolean,
            default: true,
          },
        },
        sms: {
          enabled: {
            type: Boolean,
            default: true,
          },
        },
        whatsapp: {
          enabled: {
            type: Boolean,
            default: true,
          },
        },
        in_app: {
          enabled: {
            type: Boolean,
            default: true,
          },
        },
      },
    }],
    globalPreferences: {
      quiet_hours: {
        enabled: {
          type: Boolean,
          default: false,
        },
        start: String, // HH:MM format
        end: String, // HH:MM format
        timezone: String,
      },
      marketing_communications: {
        enabled: {
          type: Boolean,
          default: true,
        },
      },
      digest: {
        enabled: {
          type: Boolean,
          default: false,
        },
        frequency: {
          type: String,
          enum: ['daily', 'weekly', 'monthly'],
          default: 'daily',
        },
        time: String, // HH:MM format
      },
    },
    deviceTokens: [{
      token: String,
      deviceType: {
        type: String,
        enum: ['ios', 'android', 'web'],
      },
      deviceId: String,
      isActive: {
        type: Boolean,
        default: true,
      },
      lastUsed: Date,
    }],
  },
  {
    timestamps: true,
  }
);

// Create TTL index for notifications to auto-delete after expiry
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Indexes for faster queries
notificationSchema.index({ 'recipient.userId': 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ isArchived: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ 'reference.type': 1, 'reference.id': 1 });

// Compound indexes for common query patterns
notificationSchema.index({ 'recipient.userId': 1, isRead: 1, isArchived: 1 });
notificationSchema.index({ 'recipient.userId': 1, type: 1, createdAt: -1 });
notificationSchema.index({ status: 1, nextRetryAt: 1 }); // For retry processing

notificationTemplateSchema.index({ name: 1 });
notificationTemplateSchema.index({ type: 1 });
notificationTemplateSchema.index({ isActive: 1 });

notificationPreferenceSchema.index({ userId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
const NotificationTemplate = mongoose.model('NotificationTemplate', notificationTemplateSchema);
const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);

module.exports = {
  Notification,
  NotificationTemplate,
  NotificationPreference,
};