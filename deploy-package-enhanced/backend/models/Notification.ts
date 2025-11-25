import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  userId: string
  type: 'email' | 'push' | 'in-app' | 'sms'
  category: 'system' | 'marketing' | 'transactional' | 'security' | 'community'
  title: string
  message: string
  data?: any
  read: boolean
  readAt?: Date
  sent: boolean
  sentAt?: Date
  scheduled?: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  channels: string[]
  template?: string
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['email', 'push', 'in-app', 'sms'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['system', 'marketing', 'transactional', 'security', 'community'],
      default: 'system',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      index: true,
    },
    sent: {
      type: Boolean,
      default: false,
      index: true,
    },
    sentAt: {
      type: Date,
      index: true,
    },
    scheduled: {
      type: Date,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    channels: [{
      type: String,
      enum: ['email', 'push', 'sms', 'in-app'],
    }],
    template: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 })
NotificationSchema.index({ sent: 1, scheduled: 1 })
NotificationSchema.index({ type: 1, category: 1 })
NotificationSchema.index({ priority: 1, sent: 1 })

// Methods
NotificationSchema.methods.markAsRead = function () {
  this.read = true
  this.readAt = new Date()
  return this.save()
}

NotificationSchema.methods.markAsSent = function () {
  this.sent = true
  this.sentAt = new Date()
  return this.save()
}

NotificationSchema.methods.toJSON = function () {
  const notification = this.toObject()
  delete notification.__v
  return notification
}

export default mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema)