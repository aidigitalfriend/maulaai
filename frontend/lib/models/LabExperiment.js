/**
 * LAB EXPERIMENT MODEL
 * Tracks AI Lab experiments: Neural Art, Music Generator, Voice Cloning, etc.
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const labExperimentSchema = new Schema(
  {
    // Unique experiment ID
    experimentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Type of experiment
    experimentType: {
      type: String,
      required: true,
      enum: [
        'neural-art',
        'image-playground',
        'music-generator',
        'voice-cloning',
        'story-weaver',
        'dream-interpreter',
        'emotion-visualizer',
        'personality-mirror',
        'future-predictor',
        'battle-arena',
        'debate-arena',
        'other',
      ],
      index: true,
    },

    // User who ran the experiment
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    // Session tracking
    sessionId: {
      type: String,
      index: true,
    },
    visitorId: {
      type: String,
    },

    // Experiment input
    input: {
      prompt: { type: String },
      settings: { type: Schema.Types.Mixed },
      files: [
        {
          name: String,
          url: String,
          type: String,
          size: Number,
        },
      ],
    },

    // Experiment output
    output: {
      result: { type: Schema.Types.Mixed },
      fileUrl: { type: String },
      thumbnailUrl: { type: String },
      metadata: { type: Schema.Types.Mixed },
    },

    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    errorMessage: { type: String },

    // Performance metrics
    processingTime: { type: Number, default: 0 }, // in milliseconds
    tokensUsed: { type: Number, default: 0 },
    creditsUsed: { type: Number, default: 0 },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    completedAt: { type: Date },

    // User feedback
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      savedToGallery: { type: Boolean, default: false },
      shared: { type: Boolean, default: false },
    },

    // Tags for search
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    collection: 'labexperiments',
  }
);

// Indexes for common queries
labExperimentSchema.index({ userId: 1, experimentType: 1 });
labExperimentSchema.index({ createdAt: -1 });
labExperimentSchema.index({ status: 1 });

export const LabExperiment =
  mongoose.models.LabExperiment ||
  mongoose.model('LabExperiment', labExperimentSchema);
