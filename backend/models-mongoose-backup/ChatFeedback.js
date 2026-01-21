import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const chatFeedbackSchema = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    messageId: { type: String, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', index: true },
    feedbackType: {
      type: String,
      enum: ['message', 'conversation', 'agent'],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: { type: String, maxlength: 1000 },
    category: {
      type: String,
      enum: [
        'accuracy',
        'helpfulness',
        'speed',
        'tone',
        'creativity',
        'technical',
      ],
    },
    tags: [{ type: String }],
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: 'chat_feedback',
  }
);

// Indexes for performance
chatFeedbackSchema.index({ conversationId: 1, createdAt: -1 });
chatFeedbackSchema.index({ userId: 1, createdAt: -1 });
chatFeedbackSchema.index({ agentId: 1, rating: -1 });
chatFeedbackSchema.index({ feedbackType: 1, createdAt: -1 });

export default mongoose.model('ChatFeedback', chatFeedbackSchema);
