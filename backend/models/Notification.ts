import { ObjectId } from 'mongodb'

export interface Notification {
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

export default Notification
