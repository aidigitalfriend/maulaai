import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const chatSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', index: true },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    tags: [{ type: String }],
    settings: {
      temperature: { type: Number, min: 0, max: 2, default: 0.7 },
      maxTokens: { type: Number, min: 1, max: 4000, default: 2000 },
      mode: {
        type: String,
        enum: ['professional', 'balanced', 'creative', 'fast', 'coding'],
        default: 'balanced',
      },
      provider: {
        type: String,
        enum: [
          'openai',
          'anthropic',
          'gemini',
          'cohere',
          'mistral',
          'xai',
          'huggingface',
          'groq',
        ],
        default: 'mistral',
      },
      model: { type: String },
    },
    stats: {
      messageCount: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      durationMs: { type: Number, default: 0 },
      lastMessageAt: { type: Date },
    },
    archivedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'chat_sessions',
  }
);

// Indexes for performance
chatSessionSchema.index({ userId: 1, updatedAt: -1 });
chatSessionSchema.index({ agentId: 1, createdAt: -1 });
chatSessionSchema.index({ isActive: 1, updatedAt: -1 });
chatSessionSchema.index({ tags: 1 });
chatSessionSchema.index({ 'settings.provider': 1 });

export default mongoose.model('ChatSession', chatSessionSchema);
