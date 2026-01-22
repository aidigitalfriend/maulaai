import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const chatCanvasFileSchema = new Schema(
  {
    fileId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    path: { type: String, required: true },
    type: {
      type: String,
      enum: ['html', 'css', 'js', 'tsx', 'json', 'image', 'other'],
      required: true,
    },
    content: { type: String },
    size: { type: Number, required: true },
    checksum: { type: String },
    metadata: {
      language: { type: String },
      framework: { type: String },
      dependencies: [{ type: String }],
    },
  },
  {
    timestamps: true,
    collection: 'chat_canvas_files',
  }
);

// Indexes for performance
chatCanvasFileSchema.index({ projectId: 1, path: 1 });
chatCanvasFileSchema.index({ userId: 1, updatedAt: -1 });
chatCanvasFileSchema.index({ type: 1 });

export default mongoose.model('ChatCanvasFile', chatCanvasFileSchema);
