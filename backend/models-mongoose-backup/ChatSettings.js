import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const chatSettingsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto', 'neural'],
      default: 'auto',
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    notifications: {
      messageReceived: { type: Boolean, default: true },
      agentResponses: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: false },
    },
    autoSave: { type: Boolean, default: true },
    defaultAgent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    quickActions: {
      enabled: { type: Boolean, default: true },
      favorites: [{ type: String }],
    },
    privacy: {
      saveHistory: { type: Boolean, default: true },
      allowAnalytics: { type: Boolean, default: true },
      shareConversations: { type: Boolean, default: false },
    },
    accessibility: {
      highContrast: { type: Boolean, default: false },
      reducedMotion: { type: Boolean, default: false },
      screenReader: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    collection: 'chat_settings',
  }
);

// Indexes for performance
chatSettingsSchema.index({ userId: 1 }, { unique: true });
chatSettingsSchema.index({ defaultAgent: 1 });

export default mongoose.model('ChatSettings', chatSettingsSchema);
