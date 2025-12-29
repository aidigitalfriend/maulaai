/**
 * AGENT PERSONALIZATION MODEL
 * Stores user's customizations for each AI agent
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const agentPersonalizationSchema = new Schema(
  {
    // User reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Agent reference
    agentId: {
      type: String,
      required: true,
      index: true,
    },
    agentSlug: { type: String, required: true },

    // Display preferences
    display: {
      nickname: { type: String }, // Custom name for the agent
      avatar: { type: String }, // Custom avatar URL
      theme: { type: String }, // Custom theme/color
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium',
      },
      compactMode: { type: Boolean, default: false },
    },

    // Behavior preferences
    behavior: {
      responseLength: {
        type: String,
        enum: ['concise', 'balanced', 'detailed'],
        default: 'balanced',
      },
      tone: {
        type: String,
        enum: ['professional', 'friendly', 'casual', 'formal'],
        default: 'professional',
      },
      autoSuggestions: { type: Boolean, default: true },
      streamResponses: { type: Boolean, default: true },
    },

    // Custom instructions
    customInstructions: {
      systemPrompt: { type: String, maxlength: 2000 }, // Additional context
      preferredFormat: { type: String }, // Markdown, plain text, etc.
      language: { type: String, default: 'en' },
      includeCodeExamples: { type: Boolean, default: true },
    },

    // Shortcuts and quick actions
    shortcuts: [
      {
        name: { type: String },
        command: { type: String },
        hotkey: { type: String },
      },
    ],

    // Saved prompts for this agent
    savedPrompts: [
      {
        name: { type: String },
        prompt: { type: String },
        category: { type: String },
        usageCount: { type: Number, default: 0 },
        lastUsed: { type: Date },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Conversation settings
    conversation: {
      defaultModel: { type: String },
      maxHistory: { type: Number, default: 50 },
      autoSaveHistory: { type: Boolean, default: true },
      showTimestamps: { type: Boolean, default: true },
    },

    // Integration settings (per agent)
    integrations: {
      enableFileUpload: { type: Boolean, default: true },
      enableVoiceInput: { type: Boolean, default: false },
      enableImageGeneration: { type: Boolean, default: true },
      enableCodeExecution: { type: Boolean, default: false },
    },

    // Usage stats for this agent
    stats: {
      totalConversations: { type: Number, default: 0 },
      totalMessages: { type: Number, default: 0 },
      totalTokensUsed: { type: Number, default: 0 },
      averageSessionLength: { type: Number, default: 0 },
      lastUsed: { type: Date },
    },

    // Pinned to dashboard
    isPinned: { type: Boolean, default: false },
    pinOrder: { type: Number },

    // Hidden from list
    isHidden: { type: Boolean, default: false },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'agentpersonalizations',
  }
);

// Compound unique index
agentPersonalizationSchema.index({ userId: 1, agentId: 1 }, { unique: true });
agentPersonalizationSchema.index({
  userId: 1,
  isPinned: -1,
  'stats.lastUsed': -1,
});

export const AgentPersonalization =
  mongoose.models.AgentPersonalization ||
  mongoose.model('AgentPersonalization', agentPersonalizationSchema);
