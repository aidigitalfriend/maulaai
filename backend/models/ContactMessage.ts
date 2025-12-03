import { ObjectId } from 'mongodb'

export interface ContactMessage {
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

export default ContactMessage
