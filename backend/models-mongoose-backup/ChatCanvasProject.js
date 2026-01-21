import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const chatCanvasProjectSchema = new Schema(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    conversationId: { type: String, index: true },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    template: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
    settings: {
      theme: { type: String, default: 'light' },
      responsive: { type: Boolean, default: true },
      animations: { type: Boolean, default: true },
    },
    stats: {
      filesGenerated: { type: Number, default: 0 },
      totalSize: { type: Number, default: 0 },
      lastModified: { type: Date },
    },
  },
  {
    timestamps: true,
    collection: 'chat_canvas_projects',
  }
);

// Indexes for performance
chatCanvasProjectSchema.index({ userId: 1, updatedAt: -1 });
chatCanvasProjectSchema.index({ conversationId: 1 });
chatCanvasProjectSchema.index({ template: 1 });
chatCanvasProjectSchema.index({ status: 1 });

export default mongoose.model('ChatCanvasProject', chatCanvasProjectSchema);
