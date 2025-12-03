import { ObjectId } from 'mongodb'

export interface CommunityLike {
  postId: Types.ObjectId
  userId: Types.ObjectId
  createdAt: Date
}

export default CommunityLike
