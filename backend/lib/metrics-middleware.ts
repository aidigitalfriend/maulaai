/**
 * Metrics Tracking Middleware
 * Automatically tracks all API requests and user sessions
 */

import { Request, Response, NextFunction } from 'express'
import { metricsTracker } from './metrics-tracker.js'
import { v4 as uuidv4 } from 'uuid'

/**
 * Generate or retrieve session ID from cookies/headers
 */
function getSessionId(req: Request): string {
  // Try to get from cookie first
  let sessionId = req.cookies?.sessionId

  // If no cookie, try header
  if (!sessionId) {
    sessionId = req.headers['x-session-id'] as string
  }

  // If still no session ID, generate new one
  if (!sessionId) {
    sessionId = uuidv4()
  }

  return sessionId
}

/**
 * Extract agent name from request
 */
function getAgentFromRequest(req: Request): string | undefined {
  // Check query params
  if (req.query.agent) {
    return req.query.agent as string
  }

  // Check body
  if (req.body?.agent) {
    return req.body.agent
  }

  // Check for chat endpoint
  if (req.path.includes('/chat') && req.body?.agentId) {
    return req.body.agentId
  }

  return undefined
}

/**
 * Session tracking middleware
 * Tracks user sessions and activity
 */
export function sessionTrackingMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = getSessionId(req)

  // Attach session ID to request for later use
  ;(req as any).sessionId = sessionId

  // Set session cookie if not present
  if (!req.cookies?.sessionId) {
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: 'lax',
    })
  }

  // Track session
  metricsTracker
    .trackSession(sessionId, {
      sessionId,
      userId: (req as any).user?.id,
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    })
    .catch((error) => {
      console.error('Error in session tracking:', error)
    })

  next()
}

/**
 * API metrics tracking middleware
 * Tracks all API requests with response times and status codes
 */
export function apiMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()
  const sessionId = (req as any).sessionId || getSessionId(req)

  // Capture the original res.json and res.send
  const originalJson = res.json.bind(res)
  const originalSend = res.send.bind(res)

  // Override res.json
  res.json = function (body: any) {
    trackMetrics(body)
    return originalJson(body)
  }

  // Override res.send
  res.send = function (body: any) {
    trackMetrics(body)
    return originalSend(body)
  }

  // Track metrics when response finishes
  function trackMetrics(body?: any) {
    const responseTime = Date.now() - startTime
    const statusCode = res.statusCode
    const isError = statusCode >= 400

    // Track API request
    metricsTracker
      .trackApiRequest(
        req.path,
        req.method,
        statusCode,
        responseTime,
        isError && body?.error ? body.error : undefined
      )
      .catch((error) => {
        console.error('Error tracking API metrics:', error)
      })

    // If this is a chat/agent request, track agent usage
    const agentName = getAgentFromRequest(req)
    if (agentName && req.path.includes('/chat')) {
      metricsTracker
        .trackAgentRequest(agentName, sessionId, responseTime, !isError)
        .catch((error) => {
          console.error('Error tracking agent metrics:', error)
        })
    }
  }

  next()
}

/**
 * Cleanup job - run periodically to clean up old sessions
 */
export function startMetricsCleanupJob() {
  // Run cleanup every 5 minutes
  setInterval(
    () => {
      metricsTracker.cleanupSessions().catch((error) => {
        console.error('Error in cleanup job:', error)
      })
    },
    5 * 60 * 1000
  )

  // Run daily metrics update every hour
  setInterval(
    () => {
      metricsTracker.updateDailyMetrics().catch((error) => {
        console.error('Error updating daily metrics:', error)
      })
    },
    60 * 60 * 1000
  )

  console.log('✅ Metrics cleanup jobs started')
}

/**
 * Initialize metrics tracking
 */
export async function initializeMetrics() {
  try {
    await metricsTracker.initializeIndexes()
    startMetricsCleanupJob()
    console.log('✅ Metrics tracking initialized')
  } catch (error) {
    console.error('Error initializing metrics:', error)
  }
}
