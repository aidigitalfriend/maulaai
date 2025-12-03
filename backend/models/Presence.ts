import { ObjectId } from 'mongodb'

export interface Presence {
  userId: Types.ObjectId | null
  sessionId: string
  lastSeen: Date
  userAgent?: string
}

export default Presence
