import mongoose, { Schema, Document, Types } from 'mongoose'

const CommunityPostSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, required: true, trim: true },
    authorAvatar: { type: String, default: '👤' },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: String, enum: ['general', 'agents', 'ideas', 'help'], default: 'general', index: true },
    isPinned: { type: Boolean, default: false },
    likesCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

CommunityPostSchema.index({ createdAt: -1 })

export default mongoose.models.CommunityPost ||
  mongoose.model('CommunityPost', CommunityPostSchema)
