/**
 * UNIVERSAL ANALYTICS TRACKER - PRISMA VERSION
 * Tracks EVERYTHING: visitors, sessions, chats, tools, events
 * Stores ALL data in PostgreSQL via Prisma for complete analytics
 * 
 * @migrated 2025-01-XX - Converted from MongoDB to Prisma
 */

import prisma from './prisma.js'
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
    const existingVisitor = await prisma.visitor.findUnique({
      where: { visitorId: data.visitorId }
    })
    
    if (existingVisitor) {
      // Update existing visitor
      const updatedVisitor = await prisma.visitor.update({
        where: { visitorId: data.visitorId },
        data: {
          lastVisit: new Date(),
          visitCount: { increment: 1 },
          sessionId: data.sessionId,
          ...(data.userId && {
            userId: data.userId,
            isRegistered: true
          })
        }
      })
      return updatedVisitor
    } else {
      // Create new visitor
      const visitor = await prisma.visitor.create({
        data: {
          visitorId: data.visitorId,
          sessionId: data.sessionId,
          userId: data.userId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          referrer: data.referrer,
          landingPage: data.landingPage,
          device: data.device,
          browser: data.browser,
          os: data.os,
          country: data.country || 'Unknown',
          city: data.city || 'Unknown',
          firstVisit: new Date(),
          lastVisit: new Date(),
          visitCount: 1,
          isRegistered: !!data.userId,
          isActive: true
        }
      })
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
  device?: string
  browser?: string
  ipAddress?: string
}) {
  try {
    const session = await prisma.session.create({
      data: {
        sessionId: data.sessionId,
        visitorId: data.visitorId,
        userId: data.userId,
        startTime: new Date(),
        lastActivity: new Date(),
        isActive: true,
        pageViews: 0,
        events: 0,
        duration: 0
      }
    })
    return session
  } catch (error) {
    console.error('Error creating session:', error)
    return null
  }
}

export async function updateSession(sessionId: string, updates: any) {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionId }
    })
    
    if (session) {
      // Handle Prisma-style updates directly
      const updateData: any = {
        lastActivity: new Date(),
        duration: Math.floor((Date.now() - session.startTime.getTime()) / 1000)
      }
      
      // Handle increment operations
      if (updates.$inc) {
        if (updates.$inc.pageViews) {
          updateData.pageViews = { increment: updates.$inc.pageViews }
        }
        if (updates.$inc.events || updates.$inc.interactions) {
          updateData.events = { increment: updates.$inc.events || updates.$inc.interactions }
        }
      } else {
        // Direct updates
        Object.assign(updateData, updates)
      }
      
      const updatedSession = await prisma.session.update({
        where: { sessionId },
        data: updateData
      })
      return updatedSession
    }
  } catch (error) {
    console.error('Error updating session:', error)
  }
  return null
}

export async function endSession(sessionId: string, exitPage?: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionId }
    })
    
    if (session) {
      const updatedSession = await prisma.session.update({
        where: { sessionId },
        data: {
          lastActivity: new Date(),
          duration: Math.floor((Date.now() - session.startTime.getTime()) / 1000),
          isActive: false
        }
      })
      return updatedSession
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
    const pageView = await prisma.pageView.create({
      data: {
        visitorId: data.visitorId,
        sessionId: data.sessionId,
        userId: data.userId,
        url: data.path,
        title: data.title,
        referrer: data.referrer,
        timeSpent: 0,
        timestamp: new Date()
      }
    })
    
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
    const pageView = await prisma.pageView.update({
      where: { id: pageViewId },
      data: {
        timeSpent: data.timeSpent
      }
    })
    return pageView
  } catch (error) {
    console.error('Error updating page view:', error)
  }
  return null
}

// ============================================
// CHAT/DEMO TRACKING
// ============================================

export async function trackChatInteraction(data: {
  visitorId?: string
  sessionId?: string
  userId?: string
  agentId: string
  agentName?: string
  userMessage: string
  aiResponse: string
  responseTime: number
  model: string
  language?: string
  conversationId?: string
}) {
  try {
    const interaction = await prisma.chatAnalyticsInteraction.create({
      data: {
        conversationId: data.conversationId || uuidv4(),
        userId: data.userId,
        agentId: data.agentId,
        channel: 'web',
        language: data.language || 'en',
        messages: [
          { role: 'user', content: data.userMessage, timestamp: new Date() },
          { role: 'assistant', content: data.aiResponse, timestamp: new Date() }
        ],
        durationMs: data.responseTime,
        turnCount: 1,
        status: 'completed'
      }
    })
    
    // Update session chat count if session exists
    if (data.sessionId) {
      await updateSession(data.sessionId, { $inc: { events: 1 } })
    }
    
    return interaction
  } catch (error) {
    console.error('Error tracking chat:', error)
    return null
  }
}

export async function updateChatFeedback(interactionId: string, satisfied: boolean, feedback?: string) {
  try {
    const interaction = await prisma.chatAnalyticsInteraction.update({
      where: { id: interactionId },
      data: {
        tags: satisfied ? ['positive_feedback'] : ['negative_feedback'],
        ...(feedback && {
          actionItems: [feedback]
        })
      }
    })
    return interaction
  } catch (error) {
    console.error('Error updating chat feedback:', error)
  }
  return null
}

// ============================================
// TOOL USAGE TRACKING
// ============================================

export async function trackToolUsage(data: {
  visitorId?: string
  sessionId?: string
  userId?: string
  toolName: string
  toolCategory?: string
  input?: any
  output?: any
  success: boolean
  error?: string
  executionTime: number
}) {
  try {
    const toolUsage = await prisma.toolUsage.create({
      data: {
        toolName: data.toolName,
        userId: data.userId,
        command: data.toolCategory || 'unknown',
        arguments: data.input,
        inputPreview: typeof data.input === 'string' ? data.input.substring(0, 500) : JSON.stringify(data.input)?.substring(0, 500),
        outputPreview: typeof data.output === 'string' ? data.output.substring(0, 500) : JSON.stringify(data.output)?.substring(0, 500),
        latencyMs: data.executionTime,
        status: data.success ? 'completed' : 'failed',
        tags: data.error ? [data.error] : [],
        occurredAt: new Date()
      }
    })
    
    // Update session tools count if session exists
    if (data.sessionId) {
      await updateSession(data.sessionId, { $inc: { events: 1 } })
    }
    
    return toolUsage
  } catch (error) {
    console.error('Error tracking tool usage:', error)
    return null
  }
}

// ============================================
// AI LAB TRACKING (using AnalyticsEvent)
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
    const experiment = await prisma.analyticsEvent.create({
      data: {
        visitorId: data.visitorId,
        sessionId: data.sessionId,
        userId: data.userId,
        eventName: 'lab_experiment',
        eventData: {
          experimentName: data.experimentName,
          experimentType: data.experimentType,
          input: data.input,
          output: data.output,
          model: data.model,
          success: data.success,
          error: data.error,
          processingTime: data.processingTime,
          rating: data.rating
        },
        timestamp: new Date()
      }
    })
    
    // Update session lab count
    await updateSession(data.sessionId, { $inc: { events: 1 } })
    
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
  visitorId?: string
  sessionId?: string
  userId?: string
  eventType: 'signup' | 'login' | 'logout' | 'profile_update' | 'settings_change' | 'subscription' | 'payment' | 'download' | 'share' | 'feedback' | 'error' | 'custom'
  eventName: string
  eventData?: any
  success: boolean
  error?: string
}) {
  try {
    const event = await prisma.userEvent.create({
      data: {
        userId: data.userId,
        eventType: data.eventType,
        category: data.eventType,
        action: data.eventName,
        label: data.eventName,
        properties: data.eventData,
        success: data.success,
        source: 'web',
        occurredAt: new Date(),
        tags: data.error ? [data.error] : []
      }
    })
    
    // Update session interactions if session exists
    if (data.sessionId) {
      await updateSession(data.sessionId, { $inc: { events: 1 } })
    }
    
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
    const apiUsage = await prisma.apiUsage.create({
      data: {
        visitorId: data.visitorId,
        sessionId: data.sessionId,
        userId: data.userId,
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        timestamp: new Date()
      }
    })
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
    const visitor = await prisma.visitor.findUnique({
      where: { visitorId }
    })
    
    const sessions = await prisma.session.findMany({
      where: { visitorId },
      orderBy: { startTime: 'desc' },
      take: 10
    })
    
    const pageViews = await prisma.pageView.count({
      where: { visitorId }
    })
    
    const events = await prisma.analyticsEvent.count({
      where: { visitorId }
    })
    
    const userEvents = await prisma.userEvent.count({
      where: { 
        user: {
          visitors: { some: { visitorId } }
        }
      }
    })
    
    return {
      visitor,
      sessions: sessions.length,
      pageViews,
      events,
      userEvents,
      recentSessions: sessions.slice(0, 5)
    }
  } catch (error) {
    console.error('Error getting visitor stats:', error)
    return null
  }
}

export async function getSessionStats(sessionId: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionId }
    })
    
    const pageViews = await prisma.pageView.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' }
    })
    
    const events = await prisma.analyticsEvent.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' }
    })
    
    return {
      session,
      pageViews,
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
    
    const activeSessions = await prisma.session.count({
      where: {
        isActive: true,
        lastActivity: { gte: fiveMinutesAgo }
      }
    })
    
    const recentPageViews = await prisma.pageView.count({
      where: {
        timestamp: { gte: fiveMinutesAgo }
      }
    })
    
    const recentEvents = await prisma.analyticsEvent.count({
      where: {
        timestamp: { gte: fiveMinutesAgo }
      }
    })
    
    const recentApiCalls = await prisma.apiUsage.count({
      where: {
        timestamp: { gte: fiveMinutesAgo }
      }
    })
    
    return {
      activeSessions,
      recentPageViews,
      recentEvents,
      recentApiCalls,
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
