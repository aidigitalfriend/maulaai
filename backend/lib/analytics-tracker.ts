/**
 * UNIVERSAL ANALYTICS TRACKER
 * Tracks EVERYTHING: visitors, sessions, chats, tools, events
 * Stores ALL data in PostgreSQL via Prisma for complete analytics
 */

import { 
  Visitor, 
  PageView, 
  ChatInteraction, 
  ToolUsage, 
  LabExperiment, 
  UserEvent, 
  Session, 
  ApiUsage 
} from '../models/Analytics'
import { v4 as uuidv4 } from 'uuid'

// ============================================
// VISITOR TRACKING
// ============================================

export async function trackVisitor(data: {
  visitorId: string
  sessionId: string
  userId?: string
  ipAddress: string
  userAgent: string
  referrer?: string
  landingPage: string
  device: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
  country?: string
  city?: string
}) {
  try {
    const existingVisitor = await Visitor.findOne({ visitorId: data.visitorId })
    
    if (existingVisitor) {
      // Update existing visitor
      existingVisitor.lastVisit = new Date()
      existingVisitor.visitCount += 1
      existingVisitor.sessionId = data.sessionId
      if (data.userId) {
        existingVisitor.userId = data.userId
        existingVisitor.isRegistered = true
      }
      await existingVisitor.save()
      return existingVisitor
    } else {
      // Create new visitor
      const visitor = new Visitor({
        ...data,
        firstVisit: new Date(),
        lastVisit: new Date(),
        visitCount: 1,
        isRegistered: !!data.userId,
        isActive: true
      })
      await visitor.save()
      return visitor
    }
  } catch (error) {
    console.error('Error tracking visitor:', error)
    return null
  }
}

// ============================================
// SESSION TRACKING
// ============================================

export async function createSession(data: {
  sessionId: string
  visitorId: string
  userId?: string
  device: string
  browser: string
  ipAddress: string
}) {
  try {
    const session = new Session({
      ...data,
      startTime: new Date(),
      isActive: true,
      pageViews: 0,
      interactions: 0,
      chatMessages: 0,
      toolsUsed: 0,
      labExperiments: 0
    })
    await session.save()
    return session
  } catch (error) {
    console.error('Error creating session:', error)
    return null
  }
}

export async function updateSession(sessionId: string, updates: any) {
  try {
    const session = await Session.findOne({ sessionId })
    if (session) {
      Object.assign(session, updates)
      session.duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000)
      await session.save()
      return session
    }
  } catch (error) {
    console.error('Error updating session:', error)
  }
  return null
}

export async function endSession(sessionId: string, exitPage?: string) {
  try {
    const session = await Session.findOne({ sessionId })
    if (session) {
      session.endTime = new Date()
      session.duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000)
      session.isActive = false
      if (exitPage) session.exitPage = exitPage
      await session.save()
      return session
    }
  } catch (error) {
    console.error('Error ending session:', error)
  }
  return null
}

// ============================================
// PAGE VIEW TRACKING
// ============================================

export async function trackPageView(data: {
  visitorId: string
  sessionId: string
  userId?: string
  path: string
  title?: string
  referrer?: string
}) {
  try {
    const pageView = new PageView({
      ...data,
      timestamp: new Date(),
      interactions: 0
    })
    await pageView.save()
    
    // Update session page view count
    await updateSession(data.sessionId, { $inc: { pageViews: 1 } })
    
    return pageView
  } catch (error) {
    console.error('Error tracking page view:', error)
    return null
  }
}

export async function updatePageViewMetrics(pageViewId: string, data: {
  timeSpent?: number
  scrollDepth?: number
  interactions?: number
}) {
  try {
    const pageView = await PageView.findById(pageViewId)
    if (pageView) {
      Object.assign(pageView, data)
      await pageView.save()
      return pageView
    }
  } catch (error) {
    console.error('Error updating page view:', error)
  }
  return null
}

// ============================================
// CHAT/DEMO TRACKING
// ============================================

export async function trackChatInteraction(data: {
  visitorId: string
  sessionId: string
  userId?: string
  agentId: string
  agentName: string
  userMessage: string
  aiResponse: string
  responseTime: number
  model: string
  language?: string
}) {
  try {
    const interaction = new ChatInteraction({
      ...data,
      timestamp: new Date()
    })
    await interaction.save()
    
    // Update session chat count
    await updateSession(data.sessionId, { $inc: { chatMessages: 1, interactions: 1 } })
    
    return interaction
  } catch (error) {
    console.error('Error tracking chat:', error)
    return null
  }
}

export async function updateChatFeedback(interactionId: string, satisfied: boolean, feedback?: string) {
  try {
    const interaction = await ChatInteraction.findById(interactionId)
    if (interaction) {
      interaction.satisfied = satisfied
      if (feedback) interaction.feedback = feedback
      await interaction.save()
      return interaction
    }
  } catch (error) {
    console.error('Error updating chat feedback:', error)
  }
  return null
}

// ============================================
// TOOL USAGE TRACKING
// ============================================

export async function trackToolUsage(data: {
  visitorId: string
  sessionId: string
  userId?: string
  toolName: string
  toolCategory: string
  input: any
  output?: any
  success: boolean
  error?: string
  executionTime: number
}) {
  try {
    const toolUsage = new ToolUsage({
      ...data,
      timestamp: new Date()
    })
    await toolUsage.save()
    
    // Update session tools count
    await updateSession(data.sessionId, { $inc: { toolsUsed: 1, interactions: 1 } })
    
    return toolUsage
  } catch (error) {
    console.error('Error tracking tool usage:', error)
    return null
  }
}

// ============================================
// AI LAB TRACKING
// ============================================

export async function trackLabExperiment(data: {
  visitorId: string
  sessionId: string
  userId?: string
  experimentName: string
  experimentType: string
  input: any
  output?: any
  model?: string
  success: boolean
  error?: string
  processingTime: number
  rating?: number
}) {
  try {
    const experiment = new LabExperiment({
      ...data,
      timestamp: new Date()
    })
    await experiment.save()
    
    // Update session lab count
    await updateSession(data.sessionId, { $inc: { labExperiments: 1, interactions: 1 } })
    
    return experiment
  } catch (error) {
    console.error('Error tracking lab experiment:', error)
    return null
  }
}

// ============================================
// USER EVENT TRACKING
// ============================================

export async function trackUserEvent(data: {
  visitorId: string
  sessionId: string
  userId?: string
  eventType: 'signup' | 'login' | 'logout' | 'profile_update' | 'settings_change' | 'subscription' | 'payment' | 'download' | 'share' | 'feedback' | 'error' | 'custom'
  eventName: string
  eventData?: any
  success: boolean
  error?: string
}) {
  try {
    const event = new UserEvent({
      ...data,
      timestamp: new Date()
    })
    await event.save()
    
    // Update session interactions
    await updateSession(data.sessionId, { $inc: { interactions: 1 } })
    
    return event
  } catch (error) {
    console.error('Error tracking user event:', error)
    return null
  }
}

// ============================================
// API USAGE TRACKING
// ============================================

export async function trackApiUsage(data: {
  visitorId: string
  sessionId: string
  userId?: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  requestBody?: any
  responseBody?: any
  error?: string
  userAgent: string
  ipAddress: string
}) {
  try {
    const apiUsage = new ApiUsage({
      ...data,
      timestamp: new Date()
    })
    await apiUsage.save()
    return apiUsage
  } catch (error) {
    console.error('Error tracking API usage:', error)
    return null
  }
}

// ============================================
// ANALYTICS QUERIES
// ============================================

export async function getVisitorStats(visitorId: string) {
  try {
    const visitor = await Visitor.findOne({ visitorId })
    const sessions = await Session.find({ visitorId }).sort({ startTime: -1 })
    const pageViews = await PageView.countDocuments({ visitorId })
    const chats = await ChatInteraction.countDocuments({ visitorId })
    const tools = await ToolUsage.countDocuments({ visitorId })
    const labs = await LabExperiment.countDocuments({ visitorId })
    const events = await UserEvent.countDocuments({ visitorId })
    
    return {
      visitor,
      sessions: sessions.length,
      pageViews,
      chats,
      tools,
      labs,
      events,
      recentSessions: sessions.slice(0, 5)
    }
  } catch (error) {
    console.error('Error getting visitor stats:', error)
    return null
  }
}

export async function getSessionStats(sessionId: string) {
  try {
    const session = await Session.findOne({ sessionId })
    const pageViews = await PageView.find({ sessionId }).sort({ timestamp: 1 })
    const chats = await ChatInteraction.find({ sessionId }).sort({ timestamp: 1 })
    const tools = await ToolUsage.find({ sessionId }).sort({ timestamp: 1 })
    const labs = await LabExperiment.find({ sessionId }).sort({ timestamp: 1 })
    const events = await UserEvent.find({ sessionId }).sort({ timestamp: 1 })
    
    return {
      session,
      pageViews,
      chats,
      tools,
      labs,
      events
    }
  } catch (error) {
    console.error('Error getting session stats:', error)
    return null
  }
}

export async function getRealtimeStats() {
  try {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    
    const activeSessions = await Session.countDocuments({ 
      isActive: true,
      lastActivity: { $gte: fiveMinutesAgo }
    })
    
    const recentPageViews = await PageView.countDocuments({ 
      timestamp: { $gte: fiveMinutesAgo }
    })
    
    const recentChats = await ChatInteraction.countDocuments({ 
      timestamp: { $gte: fiveMinutesAgo }
    })
    
    const recentTools = await ToolUsage.countDocuments({ 
      timestamp: { $gte: fiveMinutesAgo }
    })
    
    const recentLabs = await LabExperiment.countDocuments({ 
      timestamp: { $gte: fiveMinutesAgo }
    })
    
    return {
      activeSessions,
      recentPageViews,
      recentChats,
      recentTools,
      recentLabs,
      timestamp: now
    }
  } catch (error) {
    console.error('Error getting realtime stats:', error)
    return null
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function generateVisitorId(): string {
  return uuidv4()
}

export function generateSessionId(): string {
  return uuidv4()
}

export function detectDevice(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    return 'mobile'
  }
  return 'desktop'
}

export function detectBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  return 'Unknown'
}

export function detectOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Mac')) return 'macOS'
  if (userAgent.includes('Linux')) return 'Linux'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iOS')) return 'iOS'
  return 'Unknown'
}
