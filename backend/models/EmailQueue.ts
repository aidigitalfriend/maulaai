import { ObjectId } from 'mongodb'

export interface EmailQueue {
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

export default EmailQueue
