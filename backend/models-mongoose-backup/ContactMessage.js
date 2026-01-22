/**
 * CONTACT MESSAGE MODEL
 * Handles contact form submissions from users
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const contactMessageSchema = new Schema(
  {
    // Contact details
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },

    // Optional agent reference
    agentName: {
      type: String,
      maxlength: 100,
      trim: true,
    },

    // Status & Priority
    status: {
      type: String,
      enum: ['pending', 'read', 'replied', 'closed'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
      index: true,
    },
    category: {
      type: String,
      enum: [
        'general',
        'technical',
        'billing',
        'feature_request',
        'bug_report',
      ],
      default: 'general',
    },

    // Metadata
    metadata: {
      userAgent: String,
      ipAddress: String,
      referrer: String,
    },

    // Assignment & Response
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    response: {
      content: {
        type: String,
        maxlength: 2000,
      },
      respondedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
contactMessageSchema.index({ email: 1 }); // User contact history
contactMessageSchema.index({ status: 1, createdAt: -1 }); // Status filtering
contactMessageSchema.index({ priority: 1, status: 1 }); // Priority queue
contactMessageSchema.index({ category: 1 }); // Category analytics
contactMessageSchema.index({ assignedTo: 1, status: 1 }); // Assignment tracking
contactMessageSchema.index({ agentName: 1 }); // Agent-specific inquiries
contactMessageSchema.index({ createdAt: -1 }); // Recent contacts

// Pre-save validation
contactMessageSchema.pre('save', function (next) {
  // Email validation
  if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
    return next(new Error('Invalid email format'));
  }

  // Message length validation
  if (this.message && this.message.length < 10) {
    return next(new Error('Message must be at least 10 characters long'));
  }

  next();
});

// Auto-generate ticket number if not provided
contactMessageSchema.pre('save', async function (next) {
  if (this.isNew && !this.ticketId) {
    try {
      const count = await mongoose.model('ContactMessage').countDocuments();
      this.ticketId = `CONTACT-${Date.now()}-${(count + 1)
        .toString()
        .padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static methods
contactMessageSchema.statics = {
  // Get pending messages
  getPending: function () {
    return this.find({ status: 'pending' }).sort({
      priority: -1,
      createdAt: -1,
    });
  },

  // Get messages by category
  getByCategory: function (category) {
    return this.find({ category }).sort({ createdAt: -1 });
  },

  // Get user's contact history
  getUserHistory: function (email) {
    return this.find({ email }).sort({ createdAt: -1 });
  },
};

// Instance methods
contactMessageSchema.methods = {
  // Mark as read
  markAsRead: function () {
    this.status = 'read';
    return this.save();
  },

  // Assign to user
  assignTo: function (userId) {
    this.assignedTo = userId;
    return this.save();
  },

  // Add response
  addResponse: function (content, respondedBy) {
    this.response = {
      content,
      respondedBy,
      respondedAt: new Date(),
    };
    this.status = 'replied';
    return this.save();
  },

  // Close ticket
  close: function () {
    this.status = 'closed';
    return this.save();
  },
};

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export { ContactMessage };
