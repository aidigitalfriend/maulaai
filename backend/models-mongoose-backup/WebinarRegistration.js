/**
 * WEBINAR REGISTRATION MODEL
 * Handles webinar and event registrations
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const webinarRegistrationSchema = new Schema(
  {
    // Registration identification
    registrationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // User reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    email: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String },

    // Webinar/Event details
    webinarId: {
      type: String,
      required: true,
      index: true,
    },
    webinarTitle: { type: String, required: true },
    webinarType: {
      type: String,
      enum: [
        'live-webinar',
        'workshop',
        'demo',
        'qa-session',
        'training',
        'announcement',
      ],
      default: 'live-webinar',
    },

    // Schedule
    scheduledDate: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    duration: { type: Number }, // minutes

    // Registration details
    registrationSource: {
      page: { type: String },
      campaign: { type: String },
      referrer: { type: String },
    },

    // Professional info (optional)
    professional: {
      company: { type: String },
      jobTitle: { type: String },
      industry: { type: String },
      companySize: { type: String },
    },

    // Interests (for personalization)
    interests: [{ type: String }],
    questions: { type: String }, // Pre-submitted questions

    // Attendance tracking
    attendance: {
      attended: { type: Boolean, default: false },
      joinedAt: { type: Date },
      leftAt: { type: Date },
      durationAttended: { type: Number }, // minutes
      attentionScore: { type: Number }, // 0-100
    },

    // Engagement during webinar
    engagement: {
      questionsAsked: { type: Number, default: 0 },
      pollsAnswered: { type: Number, default: 0 },
      chatMessages: { type: Number, default: 0 },
      downloadedResources: [{ type: String }],
    },

    // Post-webinar
    recording: {
      sentAt: { type: Date },
      viewed: { type: Boolean, default: false },
      viewedAt: { type: Date },
    },

    // Feedback
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      wouldRecommend: { type: Boolean },
      interestedInFollowUp: { type: Boolean },
      submittedAt: { type: Date },
    },

    // Follow-up
    followUp: {
      contacted: { type: Boolean, default: false },
      contactedAt: { type: Date },
      outcome: { type: String },
      convertedToCustomer: { type: Boolean, default: false },
    },

    // Communication preferences
    preferences: {
      receiveReminders: { type: Boolean, default: true },
      receiveRecording: { type: Boolean, default: true },
      receiveFollowUp: { type: Boolean, default: true },
    },

    // Reminders sent
    reminders: [
      {
        type: { type: String, enum: ['email', 'sms'] },
        timing: { type: String }, // '24h', '1h', '15min'
        sentAt: { type: Date },
        opened: { type: Boolean, default: false },
      },
    ],

    // Status
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'no-show', 'cancelled'],
      default: 'registered',
      index: true,
    },

    // Timestamps
    registeredAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'webinarregistrations',
  }
);

// Indexes
webinarRegistrationSchema.index({ webinarId: 1, status: 1 });
webinarRegistrationSchema.index({ email: 1, webinarId: 1 }, { unique: true });
webinarRegistrationSchema.index({ scheduledDate: 1 });
webinarRegistrationSchema.index({ 'attendance.attended': 1, webinarId: 1 });

export const WebinarRegistration =
  mongoose.models.WebinarRegistration ||
  mongoose.model('WebinarRegistration', webinarRegistrationSchema);
