/**
 * USER FAVORITES MODEL
 * Stores user's favorite agents, tools, content
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const userFavoritesSchema = new Schema(
  {
    // User reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Favorite type
    type: {
      type: String,
      required: true,
      enum: [
        'agent',
        'tool',
        'blog-post',
        'lab-experiment',
        'prompt',
        'conversation',
        'template',
      ],
      index: true,
    },

    // Item reference
    itemId: {
      type: String,
      required: true,
      index: true,
    },
    itemSlug: { type: String },
    itemTitle: { type: String },

    // Additional metadata
    metadata: {
      description: { type: String },
      thumbnail: { type: String },
      category: { type: String },
      tags: [{ type: String }],
    },

    // Organization
    folder: { type: String }, // User-created folder
    sortOrder: { type: Number },
    color: { type: String }, // Color label

    // Notes
    notes: { type: String, maxlength: 500 },

    // Usage tracking
    usageCount: { type: Number, default: 0 },
    lastUsed: { type: Date },

    // Reminder (optional)
    reminder: {
      enabled: { type: Boolean, default: false },
      date: { type: Date },
      message: { type: String },
    },

    // Share settings
    isPublic: { type: Boolean, default: false },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Timestamps
    favoritedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'userfavorites',
  }
);

// Compound unique index - user can't favorite same item twice
userFavoritesSchema.index({ userId: 1, type: 1, itemId: 1 }, { unique: true });

// Query indexes
userFavoritesSchema.index({ userId: 1, type: 1, favoritedAt: -1 });
userFavoritesSchema.index({ userId: 1, folder: 1 });

export const UserFavorites =
  mongoose.models.UserFavorites ||
  mongoose.model('UserFavorites', userFavoritesSchema);
