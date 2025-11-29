import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ICommunityComment  {
  postId: Schema.Types.ObjectId
  authorId: Schema.Types.ObjectId | null
  authorName: String
  authorAvatar?: String
  content: String
  createdAt: Date
  updatedAt: Date
}

const CommunityCommentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, required: true, trim: true },
    authorAvatar: { type: String, default: '👤' },
    content: { type: String, required: true, trim: true, maxlength: 3000 },
  },
  { timestamps: true }
)

CommunityCommentSchema.index({ createdAt: -1 })

export default mongoose.models.CommunityComment ||
  mongoose.model('CommunityComment', CommunityCommentSchema)
