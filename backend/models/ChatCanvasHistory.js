import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const chatCanvasHistorySchema = new Schema(
  {
    historyId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    prompt: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      required: true,
    },
    result: {
      filesGenerated: { type: Number },
      totalSize: { type: Number },
      duration: { type: Number },
    },
    error: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: 'chat_canvas_history',
  }
);

// Indexes for performance
chatCanvasHistorySchema.index({ projectId: 1, createdAt: -1 });
chatCanvasHistorySchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model('ChatCanvasHistory', chatCanvasHistorySchema);
