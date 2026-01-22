import { ObjectId } from 'mongodb'

export interface Visitor {
  visitorId: string // Unique visitor ID (cookie-based)
  sessionId: string // Current session ID
  userId?: string // If logged in
  firstVisit: Date
  lastVisit: Date
  visitCount: number
  ipAddress: string
  userAgent: string
  country?: string
  city?: string
  device: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
  referrer?: string
  landingPage: string
  isRegistered: boolean
  isActive: boolean
}

export default Visitor
