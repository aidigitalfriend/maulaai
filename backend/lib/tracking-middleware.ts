/**
 * UNIVERSAL TRACKING MIDDLEWARE
 * Automatically tracks ALL requests, visitors, sessions, and interactions
 * Stores everything in MongoDB Atlas
 */

import { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import {
  generateVisitorId,
  generateSessionId,
  trackVisitor,
  createSession,
  trackPageView,
  trackApiUsage,
  updateSession,
  detectDevice,
  detectBrowser,
  detectOS
} from './analytics-tracker'

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      visitorId?: string
      sessionId?: string
      trackingData?: {
        visitorId: string
        sessionId: string
        userId?: string
        ipAddress: string
        userAgent: string
        device: 'mobile' | 'tablet' | 'desktop'
        browser: string
        os: string
      }
    }
  }
}

/**
 * Initialize visitor and session tracking
 * This should be one of the first middlewares
 */
export function initializeTracking(req: Request, res: Response, next: NextFunction) {
  try {
    // Get or create visitor ID
    let visitorId = req.cookies?.visitorId
    if (!visitorId) {
      visitorId = generateVisitorId()
      res.cookie('visitorId', visitorId, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }

    // Get or create session ID
    let sessionId = req.cookies?.sessionId
    if (!sessionId) {
      sessionId = generateSessionId()
      res.cookie('sessionId', sessionId, {
        maxAge: 30 * 60 * 1000, // 30 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }

    // Get user ID if authenticated
    const userId = req.user?.id || req.session?.userId

    // Get client info
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown'
    const userAgent = req.headers['user-agent'] || 'unknown'
    const device = detectDevice(userAgent)
    const browser = detectBrowser(userAgent)
    const os = detectOS(userAgent)

    // Attach to request for use in other middlewares
    req.visitorId = visitorId
    req.sessionId = sessionId
    req.trackingData = {
      visitorId,
      sessionId,
      userId,
      ipAddress,
      userAgent,
      device,
      browser,
      os
    }

    next()
  } catch (error) {
    console.error('Error in initializeTracking:', error)
    next() // Don't break the app if tracking fails
  }
}

/**
 * Track visitor and session (async, non-blocking)
 */
export function trackVisitorMiddleware(req: Request, res: Response, next: NextFunction) {
  next() // Don't wait for tracking

  // Track async (non-blocking)
  if (req.trackingData) {
    const { visitorId, sessionId, userId, ipAddress, userAgent, device, browser, os } = req.trackingData
    
    // Get referrer and landing page
    const referrer = req.headers.referer || req.headers.referrer as string
    const landingPage = req.path

    // Track visitor
    trackVisitor({
      visitorId,
      sessionId,
      userId,
      ipAddress,
      userAgent,
      referrer,
      landingPage,
      device,
      browser,
      os
    }).catch(err => console.error('Error tracking visitor:', err))

    // Create/update session
    createSession({
      sessionId,
      visitorId,
      userId,
      device,
      browser,
      ipAddress
    }).catch(err => console.error('Error creating session:', err))
  }
}

/**
 * Track page views automatically
 */
export function trackPageViewMiddleware(req: Request, res: Response, next: NextFunction) {
  next() // Don't wait for tracking

  // Only track HTML page requests (not API calls or assets)
  if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    if (req.trackingData) {
      const { visitorId, sessionId, userId } = req.trackingData
      const referrer = req.headers.referer || req.headers.referrer as string
      
      trackPageView({
        visitorId,
        sessionId,
        userId,
        path: req.path,
        title: req.query.title as string,
        referrer
      }).catch(err => console.error('Error tracking page view:', err))
    }
  }
}

/**
 * Track ALL API requests automatically
 */
export function trackApiMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()

  // Capture original end function
  const originalEnd = res.end

  // Override res.end to capture response
  res.end = function(chunk?: any, encoding?: any, callback?: any): any {
    const responseTime = Date.now() - startTime

    // Track async (non-blocking)
    if (req.trackingData) {
      const { visitorId, sessionId, userId, ipAddress, userAgent } = req.trackingData
      
      trackApiUsage({
        visitorId,
        sessionId,
        userId,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
        requestBody: req.body,
        error: res.statusCode >= 400 ? 'Error' : undefined,
        userAgent,
        ipAddress
      }).catch(err => console.error('Error tracking API usage:', err))
    }

    // Call original end
    return originalEnd.call(this, chunk, encoding, callback)
  }

  next()
}

/**
 * Update session activity on every request
 */
export function updateSessionActivity(req: Request, res: Response, next: NextFunction) {
  next() // Don't wait

  if (req.sessionId) {
    updateSession(req.sessionId, {
      lastActivity: new Date()
    }).catch(err => console.error('Error updating session:', err))
  }
}

/**
 * Combined middleware - use this for complete tracking
 */
export function universalTrackingMiddleware(req: Request, res: Response, next: NextFunction) {
  initializeTracking(req, res, () => {
    trackVisitorMiddleware(req, res, () => {
      trackPageViewMiddleware(req, res, () => {
        trackApiMiddleware(req, res, () => {
          updateSessionActivity(req, res, next)
        })
      })
    })
  })
}

/**
 * WebSocket tracking helper
 */
export function getWebSocketTrackingData(socket: any) {
  const cookies = parseCookies(socket.handshake.headers.cookie || '')
  const visitorId = cookies.visitorId || generateVisitorId()
  const sessionId = cookies.sessionId || generateSessionId()
  const userAgent = socket.handshake.headers['user-agent'] || 'unknown'
  const ipAddress = socket.handshake.address || 'unknown'
  
  return {
    visitorId,
    sessionId,
    userAgent,
    ipAddress,
    device: detectDevice(userAgent),
    browser: detectBrowser(userAgent),
    os: detectOS(userAgent)
  }
}

/**
 * Parse cookies from cookie header
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name && value) {
        cookies[name] = decodeURIComponent(value)
      }
    })
  }
  return cookies
}

/**
 * Export helper for manual tracking in routes
 */
export function getTrackingData(req: Request) {
  return req.trackingData || null
}
