import { ObjectId } from 'mongodb'

export interface CommunityComment {
  postId: Types.ObjectId
  authorId: Types.ObjectId | null
  authorName: string
  authorAvatar?: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export default CommunityComment
