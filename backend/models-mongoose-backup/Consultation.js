/**
 * CONSULTATION MODEL
 * Handles expert consultation bookings and sessions
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const consultationSchema = new Schema(
  {
    // Consultation identification
    consultationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // User reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    userPhone: { type: String },

    // Consultation type
    consultationType: {
      type: String,
      required: true,
      enum: [
        'enterprise-demo',
        'custom-agent',
        'technical-integration',
        'ai-strategy',
        'implementation-support',
        'training-session',
        'general-consultation',
      ],
      index: true,
    },

    // Company details (for enterprise)
    company: {
      name: { type: String },
      size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      },
      industry: { type: String },
      website: { type: String },
    },

    // Project details
    project: {
      description: { type: String, required: true, maxlength: 2000 },
      goals: [{ type: String }],
      timeline: { type: String },
      budget: { type: String },
      currentTools: [{ type: String }],
    },

    // Scheduling
    preferredDates: [
      {
        date: { type: Date },
        timeSlot: { type: String },
      },
    ],
    scheduledAt: { type: Date },
    duration: { type: Number, default: 30 }, // minutes
    timezone: { type: String, default: 'UTC' },

    // Meeting details
    meeting: {
      type: {
        type: String,
        enum: ['video', 'phone', 'in-person'],
        default: 'video',
      },
      platform: { type: String }, // Zoom, Google Meet, etc.
      link: { type: String },
      password: { type: String },
      calendarEventId: { type: String },
    },

    // Assignment
    consultant: {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      email: { type: String },
    },

    // Status tracking
    status: {
      type: String,
      enum: [
        'pending', // Submitted, awaiting review
        'scheduled', // Meeting scheduled
        'rescheduled', // Meeting rescheduled
        'in-progress', // Consultation ongoing
        'completed', // Consultation completed
        'cancelled', // Cancelled by either party
        'no-show', // Customer didn't show
      ],
      default: 'pending',
      index: true,
    },

    // Session notes (post-consultation)
    notes: {
      internal: { type: String }, // Internal notes
      summary: { type: String }, // Meeting summary
      actionItems: [{ type: String }],
      recommendations: [{ type: String }],
      followUpRequired: { type: Boolean, default: false },
      followUpDate: { type: Date },
    },

    // Outcome
    outcome: {
      result: {
        type: String,
        enum: [
          'interested',
          'needs-time',
          'not-interested',
          'converted',
          'follow-up',
        ],
      },
      dealValue: { type: Number },
      probability: { type: Number },
      convertedToSubscription: { type: Boolean, default: false },
      subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    },

    // Feedback
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      wouldRecommend: { type: Boolean },
      submittedAt: { type: Date },
    },

    // Source tracking
    source: {
      page: { type: String }, // Which page they booked from
      campaign: { type: String },
      referrer: { type: String },
    },

    // Reminders
    reminders: [
      {
        type: { type: String, enum: ['email', 'sms'] },
        scheduledFor: { type: Date },
        sentAt: { type: Date },
        status: { type: String, enum: ['pending', 'sent', 'failed'] },
      },
    ],

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'consultations',
  }
);

// Indexes
consultationSchema.index({ userId: 1, status: 1 });
consultationSchema.index({ scheduledAt: 1, status: 1 });
consultationSchema.index({ 'consultant.userId': 1, scheduledAt: 1 });
consultationSchema.index({ consultationType: 1, status: 1 });

export const Consultation =
  mongoose.models.Consultation ||
  mongoose.model('Consultation', consultationSchema);
