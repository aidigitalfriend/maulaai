import mongoose, { Schema, Document, Types } from 'mongoose';

const CommunityLikeSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CommunityLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.models.CommunityLike ||
  mongoose.model('CommunityLike', CommunityLikeSchema);
