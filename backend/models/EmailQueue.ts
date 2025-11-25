import mongoose, { Schema, Document } from 'mongoose'

export interface IEmailQueue extends Document {
  to: string
  from: string
  subject: string
  htmlBody: string
  textBody?: string
  template?: string
  templateData?: any
  category: 'transactional' | 'marketing' | 'system' | 'notification'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'bounced' | 'cancelled'
  attempts: number
  maxAttempts: number
  scheduledAt?: Date
  sentAt?: Date
  failedAt?: Date
  error?: string
  messageId?: string
  provider: 'sendgrid' | 'nodemailer' | 'ses' | 'mailgun'
  providerResponse?: any
  userId?: string
  relatedId?: string
  relatedType?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const EmailQueueSchema = new Schema<IEmailQueue>(
  {
    to: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    from: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    htmlBody: {
      type: String,
      required: true,
    },
    textBody: {
      type: String,
    },
    template: {
      type: String,
      trim: true,
    },
    templateData: {
      type: Schema.Types.Mixed,
    },
    category: {
      type: String,
      enum: ['transactional', 'marketing', 'system', 'notification'],
      default: 'transactional',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sending', 'sent', 'failed', 'bounced', 'cancelled'],
      default: 'pending',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    scheduledAt: {
      type: Date,
      index: true,
    },
    sentAt: {
      type: Date,
      index: true,
    },
    failedAt: {
      type: Date,
      index: true,
    },
    error: {
      type: String,
    },
    messageId: {
      type: String,
      index: true,
    },
    provider: {
      type: String,
      enum: ['sendgrid', 'nodemailer', 'ses', 'mailgun'],
      default: 'nodemailer',
      index: true,
    },
    providerResponse: {
      type: Schema.Types.Mixed,
    },
    userId: {
      type: String,
      index: true,
    },
    relatedId: {
      type: String,
      index: true,
    },
    relatedType: {
      type: String,
      enum: ['job-application', 'contact-message', 'subscription', 'user-signup', 'password-reset'],
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
EmailQueueSchema.index({ status: 1, scheduledAt: 1 })
EmailQueueSchema.index({ status: 1, priority: 1, createdAt: 1 })
EmailQueueSchema.index({ to: 1, createdAt: -1 })
EmailQueueSchema.index({ category: 1, status: 1 })
EmailQueueSchema.index({ userId: 1, createdAt: -1 })

// Methods
EmailQueueSchema.methods.markAsSending = function () {
  this.status = 'sending'
  this.attempts += 1
  return this.save()
}

EmailQueueSchema.methods.markAsSent = function (messageId: string, providerResponse?: any) {
  this.status = 'sent'
  this.sentAt = new Date()
  this.messageId = messageId
  if (providerResponse) this.providerResponse = providerResponse
  return this.save()
}

EmailQueueSchema.methods.markAsFailed = function (error: string) {
  this.status = 'failed'
  this.failedAt = new Date()
  this.error = error
  return this.save()
}

EmailQueueSchema.methods.canRetry = function (): boolean {
  return this.attempts < this.maxAttempts && this.status === 'failed'
}

EmailQueueSchema.methods.toJSON = function () {
  const email = this.toObject()
  delete email.__v
  return email
}

export default mongoose.models.EmailQueue ||
  mongoose.model<IEmailQueue>('EmailQueue', EmailQueueSchema)