import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IPresence extends Document {
  userId: Types.ObjectId | null
  sessionId: string
  lastSeen: Date
  userAgent?: string
}

const PresenceSchema = new Schema<IPresence>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  sessionId: { type: String, required: true, index: true },
  lastSeen: { type: Date, default: () => new Date(), index: true },
  userAgent: { type: String, default: '' },
})

PresenceSchema.index({ sessionId: 1 }, { unique: true })

export default mongoose.models.Presence ||
  mongoose.model<IPresence>('Presence', PresenceSchema)
