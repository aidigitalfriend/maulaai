/**
 * SUPPORT TICKET MODEL
 * Handles customer support tickets and conversations
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const supportTicketSchema = new Schema(
  {
    // Ticket identification
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ticketNumber: {
      type: Number,
      unique: true,
    },

    // User reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: { type: String, required: true },
    userName: { type: String },

    // Ticket details
    subject: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    // Category & Priority
    category: {
      type: String,
      required: true,
      enum: [
        'billing',
        'technical',
        'account',
        'agents',
        'subscription',
        'feature-request',
        'bug-report',
        'general',
        'other',
      ],
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },

    // Status
    status: {
      type: String,
      enum: [
        'open',
        'in-progress',
        'waiting-customer',
        'waiting-internal',
        'resolved',
        'closed',
      ],
      default: 'open',
      index: true,
    },

    // Assignment
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedTeam: { type: String },

    // Messages/Conversation
    messages: [
      {
        sender: {
          type: String,
          enum: ['customer', 'support', 'system'],
          required: true,
        },
        senderId: { type: Schema.Types.ObjectId, ref: 'User' },
        senderName: { type: String },
        message: { type: String, required: true },
        attachments: [
          {
            name: String,
            url: String,
            type: String,
            size: Number,
          },
        ],
        isInternal: { type: Boolean, default: false }, // Internal notes
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Related data
    relatedAgent: { type: String }, // If ticket is about specific agent
    relatedSubscription: { type: String }, // If ticket is about subscription
    relatedTransaction: { type: String }, // If ticket is about payment

    // Resolution
    resolution: {
      summary: { type: String },
      resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      resolvedAt: { type: Date },
    },

    // Customer satisfaction
    satisfaction: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String },
      ratedAt: { type: Date },
    },

    // Tags for organization
    tags: [{ type: String }],

    // SLA tracking
    sla: {
      firstResponseDue: { type: Date },
      firstResponseAt: { type: Date },
      resolutionDue: { type: Date },
      breached: { type: Boolean, default: false },
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'supporttickets',
  }
);

// Auto-increment ticket number
supportTicketSchema.pre('save', async function (next) {
  if (this.isNew && !this.ticketNumber) {
    const lastTicket = await this.constructor.findOne(
      {},
      {},
      { sort: { ticketNumber: -1 } }
    );
    this.ticketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1001;
  }
  next();
});

// Indexes
supportTicketSchema.index({ userId: 1, status: 1 });
supportTicketSchema.index({ status: 1, priority: 1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ 'sla.firstResponseDue': 1, status: 1 });

export const SupportTicket =
  mongoose.models.SupportTicket ||
  mongoose.model('SupportTicket', supportTicketSchema);
