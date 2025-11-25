import mongoose, { Schema, Document } from 'mongoose'

export interface IContactMessage extends Document {
  name: string
  email: string
  subject: string
  message: string
  category: 'general' | 'support' | 'sales' | 'partnership' | 'feedback' | 'other'
  status: 'new' | 'read' | 'replied' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  tags: string[]
  response?: string
  respondedAt?: Date
  respondedBy?: string
  ipAddress: string
  userAgent: string
  source: 'website' | 'app' | 'api'
  createdAt: Date
  updatedAt: Date
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ['general', 'support', 'sales', 'partnership', 'feedback', 'other'],
      default: 'general',
      index: true,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied', 'closed'],
      default: 'new',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    assignedTo: {
      type: String,
      trim: true,
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    response: {
      type: String,
      trim: true,
      maxlength: 10000,
    },
    respondedAt: {
      type: Date,
      index: true,
    },
    respondedBy: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['website', 'app', 'api'],
      default: 'website',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
ContactMessageSchema.index({ status: 1, createdAt: -1 })
ContactMessageSchema.index({ category: 1, createdAt: -1 })
ContactMessageSchema.index({ email: 1, createdAt: -1 })
ContactMessageSchema.index({ priority: 1, status: 1 })

// Methods
ContactMessageSchema.methods.markAsRead = function () {
  if (this.status === 'new') {
    this.status = 'read'
  }
  return this.save()
}

ContactMessageSchema.methods.reply = function (response: string, respondedBy: string) {
  this.response = response
  this.respondedAt = new Date()
  this.respondedBy = respondedBy
  this.status = 'replied'
  return this.save()
}

ContactMessageSchema.methods.close = function () {
  this.status = 'closed'
  return this.save()
}

ContactMessageSchema.methods.toJSON = function () {
  const message = this.toObject()
  delete message.__v
  return message
}

export default mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema)