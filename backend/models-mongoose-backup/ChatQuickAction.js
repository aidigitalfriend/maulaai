import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const chatQuickActionSchema = new Schema(
  {
    actionId: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true, maxlength: 50 },
    prompt: { type: String, required: true, maxlength: 500 },
    category: {
      type: String,
      enum: ['Learning', 'Creative', 'Technical', 'Utility', 'General'],
      required: true,
    },
    icon: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    collection: 'chat_quick_actions',
  }
);

// Indexes for performance
chatQuickActionSchema.index({ category: 1, isActive: 1 });
chatQuickActionSchema.index({ usageCount: -1 });
chatQuickActionSchema.index({ isDefault: 1 });

export default mongoose.model('ChatQuickAction', chatQuickActionSchema);
