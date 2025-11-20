// Support Tools - Core functions for the Live Support AI agent
import { v4 as uuidv4 } from 'uuid'

// Types for support system
export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  locale: string
  plan: 'free' | 'pro' | 'enterprise'
  subscriptionStatus: 'active' | 'inactive' | 'cancelled' | 'past_due'
  joinDate: Date
  lastLogin: Date
}

export interface SubscriptionDetails {
  userId: string
  agentId?: string
  plan: string
  status: string
  billingCycle: 'monthly' | 'yearly'
  nextBilling?: Date
  features: string[]
  limits: {
    monthlyRequests: number
    usedRequests: number
    storageGB: number
    usedStorageGB: number
  }
}

export interface KnowledgeBaseResult {
  id: string
  title: string
  content: string
  category: string
  relevanceScore: number
  url?: string
}

export interface IssueClassification {
  category: 'Auth' | 'Billing' | 'Subscriptions' | 'Integrations' | 'Voice' | 'Agents' | 'Data' | 'Bug' | 'Feature Request' | 'Abuse/Report' | 'Legal'
  subcategory: string
  severity: 'P1' | 'P2' | 'P3'
  confidence: number
  suggestedSLA: string
  assigneeQueue: string
  signals: string[]
}

export interface TicketPayload {
  userId: string
  conversationId: string
  summary: string
  category: string
  severity: 'P1' | 'P2' | 'P3'
  description: string
  attachments?: string[]
  userAgent?: string
  ipAddress?: string
  environment?: Record<string, any>
}

export interface Ticket {
  id: string
  userId: string
  summary: string
  category: string
  severity: 'P1' | 'P2' | 'P3'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assignedQueue: string
  createdAt: Date
  updatedAt: Date
  slaTarget: Date
  emailThreadId?: string
}

// Mock data for development
const mockUsers: Record<string, UserProfile> = {
  'user1': {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    locale: 'en-US',
    plan: 'pro',
    subscriptionStatus: 'active',
    joinDate: new Date('2024-01-15'),
    lastLogin: new Date()
  }
}

const mockSubscriptions: Record<string, SubscriptionDetails> = {
  'user1': {
    userId: 'user1',
    plan: 'pro',
    status: 'active',
    billingCycle: 'monthly',
    nextBilling: new Date('2024-11-10'),
    features: ['all_agents', 'priority_support', 'advanced_analytics'],
    limits: {
      monthlyRequests: 10000,
      usedRequests: 2500,
      storageGB: 100,
      usedStorageGB: 25
    }
  }
}

const mockKnowledgeBase: KnowledgeBaseResult[] = [
  {
    id: 'kb1',
    title: 'How to reset your password',
    content: 'To reset your password: 1. Go to login page 2. Click "Forgot Password" 3. Enter your email 4. Check your email for reset link',
    category: 'Auth',
    relevanceScore: 0.95,
    url: '/auth/reset-password'
  },
  {
    id: 'kb2',
    title: 'Subscription billing cycles',
    content: 'Billing cycles: Monthly plans bill on the same date each month. Annual plans offer 20% discount and bill yearly.',
    category: 'Billing',
    relevanceScore: 0.90,
    url: '/pricing'
  },
  {
    id: 'kb3',
    title: 'Setting up API integrations',
    content: 'To integrate with external APIs: 1. Go to Settings > Integrations 2. Add your API keys 3. Test the connection 4. Enable the integration',
    category: 'Integrations',
    relevanceScore: 0.88
  }
]

// Core support tools implementation
export class SupportTools {
  
  /**
   * Get user profile information
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // In production, this would query your user database
      const profile = mockUsers[userId]
      
      if (!profile) {
        console.log(`User profile not found: ${userId}`)
        return null
      }

      return profile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw new Error('Failed to fetch user profile')
    }
  }

  /**
   * Get subscription status for user and specific agent
   */
  static async getSubscriptionStatus(userId: string, agentId?: string): Promise<SubscriptionDetails | null> {
    try {
      // In production, query subscription database
      const subscription = mockSubscriptions[userId]
      
      if (!subscription) {
        return null
      }

      // Add agent-specific details if provided
      if (agentId) {
        subscription.agentId = agentId
      }

      return subscription
    } catch (error) {
      console.error('Error fetching subscription status:', error)
      throw new Error('Failed to fetch subscription status')
    }
  }

  /**
   * Search knowledge base for relevant articles
   */
  static async searchKB(query: string, limit: number = 5): Promise<KnowledgeBaseResult[]> {
    try {
      // In production, this would use vector search or Elasticsearch
      const searchTerms = query.toLowerCase().split(' ')
      
      const results = mockKnowledgeBase
        .map(article => {
          // Simple relevance scoring based on keyword matches
          let score = 0
          const content = (article.title + ' ' + article.content).toLowerCase()
          
          searchTerms.forEach(term => {
            if (content.includes(term)) {
              score += 1
            }
          })
          
          return {
            ...article,
            relevanceScore: score / searchTerms.length
          }
        })
        .filter(article => article.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit)

      return results
    } catch (error) {
      console.error('Error searching knowledge base:', error)
      throw new Error('Failed to search knowledge base')
    }
  }

  /**
   * Classify issue based on transcript and metadata
   */
  static async classifyIssue(transcript: string, metadata: Record<string, any> = {}): Promise<IssueClassification> {
    try {
      const text = transcript.toLowerCase()
      let category: IssueClassification['category'] = 'Agents'
      let subcategory = 'general'
      let severity: 'P1' | 'P2' | 'P3' = 'P3'
      let confidence = 0.5
      let assigneeQueue = 'general'
      const signals: string[] = []

      // Classification logic based on keywords
      if (text.includes('login') || text.includes('password') || text.includes('auth')) {
        category = 'Auth'
        subcategory = 'authentication'
        assigneeQueue = 'auth-team'
        signals.push('auth_keywords')
        confidence = 0.8
      } else if (text.includes('bill') || text.includes('payment') || text.includes('charge')) {
        category = 'Billing'
        subcategory = 'payment'
        assigneeQueue = 'finance-team'
        signals.push('billing_keywords')
        confidence = 0.85
      } else if (text.includes('subscription') || text.includes('plan') || text.includes('upgrade')) {
        category = 'Subscriptions'
        subcategory = 'plan_management'
        assigneeQueue = 'subscription-team'
        signals.push('subscription_keywords')
        confidence = 0.8
      } else if (text.includes('api') || text.includes('integration') || text.includes('connect')) {
        category = 'Integrations'
        subcategory = 'api_setup'
        assigneeQueue = 'platform-team'
        signals.push('integration_keywords')
        confidence = 0.75
      } else if (text.includes('bug') || text.includes('error') || text.includes('broken')) {
        category = 'Bug'
        subcategory = 'technical_issue'
        assigneeQueue = 'engineering-team'
        signals.push('bug_keywords')
        confidence = 0.7
      }

      // Severity classification
      if (text.includes('urgent') || text.includes('down') || text.includes('broken') || text.includes('cannot login')) {
        severity = 'P1'
        signals.push('urgency_indicators')
      } else if (text.includes('important') || text.includes('major') || text.includes('not working')) {
        severity = 'P2'
        signals.push('moderate_severity')
      }

      // User plan affects severity
      if (metadata.userPlan === 'enterprise') {
        if (severity === 'P3') severity = 'P2'
        signals.push('enterprise_user')
      }

      const suggestedSLA = severity === 'P1' ? '4 hours' : severity === 'P2' ? '24 hours' : '48 hours'

      return {
        category,
        subcategory,
        severity,
        confidence,
        suggestedSLA,
        assigneeQueue,
        signals
      }
    } catch (error) {
      console.error('Error classifying issue:', error)
      throw new Error('Failed to classify issue')
    }
  }

  /**
   * Create support ticket
   */
  static async createTicket(payload: TicketPayload): Promise<Ticket> {
    try {
      const ticketId = `TICKET-${uuidv4().slice(0, 8).toUpperCase()}`
      const now = new Date()
      
      // Calculate SLA target based on severity
      const slaHours = payload.severity === 'P1' ? 4 : payload.severity === 'P2' ? 24 : 48
      const slaTarget = new Date(now.getTime() + slaHours * 60 * 60 * 1000)

      const ticket: Ticket = {
        id: ticketId,
        userId: payload.userId,
        summary: payload.summary,
        category: payload.category,
        severity: payload.severity,
        status: 'open',
        assignedQueue: 'general-support',
        createdAt: now,
        updatedAt: now,
        slaTarget
      }

      // In production, save to database and send email
      console.log('Created ticket:', ticket)
      
      // Send email notification (mock)
      await this.sendTicketNotification(ticket, payload)

      return ticket
    } catch (error) {
      console.error('Error creating ticket:', error)
      throw new Error('Failed to create ticket')
    }
  }

  /**
   * Send ticket notification email
   */
  private static async sendTicketNotification(ticket: Ticket, payload: TicketPayload): Promise<void> {
    try {
      // In production, integrate with your email system
      console.log(`Email sent for ticket ${ticket.id} to user ${ticket.userId}`)
      
      // Mock email content
      const emailContent = {
        to: payload.userId, // In production, get email from user profile
        subject: `Support Ticket Created: ${ticket.id}`,
        html: `
          <h2>Support Ticket Created</h2>
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Summary:</strong> ${ticket.summary}</p>
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>Severity:</strong> ${ticket.severity}</p>
          <p><strong>Expected Response:</strong> ${ticket.severity === 'P1' ? '4 hours' : ticket.severity === 'P2' ? '24 hours' : '48 hours'}</p>
          <p>We'll contact you at your registered email address. Reply to this email to add more details to your ticket.</p>
        `
      }
      
      console.log('Email content:', emailContent)
    } catch (error) {
      console.error('Error sending ticket notification:', error)
    }
  }

  /**
   * Log analytics event
   */
  static async logAnalytics(event: {
    type: string
    userId?: string
    sessionId?: string
    category?: string
    metadata?: Record<string, any>
  }): Promise<void> {
    try {
      const logEntry = {
        ...event,
        timestamp: new Date().toISOString(),
        id: uuidv4()
      }

      // In production, send to analytics service (e.g., Mixpanel, Amplitude)
      console.log('Analytics event:', logEntry)
    } catch (error) {
      console.error('Error logging analytics:', error)
    }
  }
}