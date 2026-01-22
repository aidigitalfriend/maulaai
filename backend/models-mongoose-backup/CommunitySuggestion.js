/**
 * COMMUNITY SUGGESTION MODEL
 * Handles feature requests, feedback, and suggestions from community
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const communitySuggestionSchema = new Schema(
  {
    // Suggestion identification
    suggestionId: {
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
    userEmail: { type: String },
    userName: { type: String },
    isAnonymous: { type: Boolean, default: false },

    // Suggestion details
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    // Category
    category: {
      type: String,
      required: true,
      enum: [
        'new-agent',
        'new-tool',
        'new-feature',
        'improvement',
        'bug-fix',
        'ui-ux',
        'integration',
        'documentation',
        'pricing',
        'other',
      ],
      index: true,
    },

    // Related item (if suggesting improvement to existing)
    relatedTo: {
      type: { type: String, enum: ['agent', 'tool', 'page', 'feature'] },
      id: { type: String },
      name: { type: String },
    },

    // Priority/Impact
    userPriority: {
      type: String,
      enum: ['nice-to-have', 'would-be-helpful', 'important', 'critical'],
      default: 'would-be-helpful',
    },

    // Status
    status: {
      type: String,
      enum: [
        'submitted',
        'under-review',
        'planned',
        'in-progress',
        'completed',
        'declined',
        'duplicate',
      ],
      default: 'submitted',
      index: true,
    },

    // Internal tracking
    internal: {
      priority: { type: Number }, // 1-5
      effort: { type: String }, // 'small', 'medium', 'large'
      assignedTo: { type: String },
      roadmapQuarter: { type: String },
      notes: { type: String },
    },

    // Community engagement
    votes: {
      up: { type: Number, default: 0 },
      down: { type: Number, default: 0 },
      voters: [
        {
          userId: { type: Schema.Types.ObjectId, ref: 'User' },
          vote: { type: Number, enum: [-1, 1] },
          votedAt: { type: Date, default: Date.now },
        },
      ],
    },

    // Comments
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String },
        text: { type: String },
        isOfficial: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Updates from team
    updates: [
      {
        status: { type: String },
        message: { type: String },
        updatedBy: { type: String },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // Tags
    tags: [{ type: String }],

    // Related suggestions (duplicates, similar)
    relatedSuggestions: [
      { type: Schema.Types.ObjectId, ref: 'CommunitySuggestion' },
    ],

    // Implementation reference
    implementation: {
      releaseVersion: { type: String },
      releaseDate: { type: Date },
      releaseNotes: { type: String },
      completedAt: { type: Date },
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'communitysuggestions',
  }
);

// Indexes
communitySuggestionSchema.index({ status: 1, 'votes.up': -1 });
communitySuggestionSchema.index({ category: 1, status: 1 });
communitySuggestionSchema.index({ createdAt: -1 });

export const CommunitySuggestion =
  mongoose.models.CommunitySuggestion ||
  mongoose.model('CommunitySuggestion', communitySuggestionSchema);
