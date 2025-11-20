/**
 * UNIVERSAL TRACKING MIDDLEWARE
 * Automatically tracks visitors, sessions, page views, and API calls
 */

import { v4 as uuidv4 } from 'uuid'
import { trackVisitor, createSession, trackPageView, trackApiUsage, updateSessionActivity } from './analytics-tracker.js'

// ============================================
// HELPER: Generate Visitor ID
// ============================================
export function generateVisitorId() {
  return `visitor_${uuidv4()}`
}

// ============================================
// HELPER: Generate Session ID
// ============================================
export function generateSessionId() {
  return `session_${uuidv4()}`
}

// ============================================
// MIDDLEWARE: Initialize Tracking
// ============================================
export function initializeTracking(req, res, next) {
  // Get or create visitor ID from cookie
  let visitorId = req.cookies?.onelastai_visitor
  if (!visitorId) {
    visitorId = generateVisitorId()
    res.cookie('onelastai_visitor', visitorId, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: true,
      sameSite: 'lax'
    })
  }

  // Get or create session ID from cookie
  let sessionId = req.cookies?.onelastai_session
  if (!sessionId) {
    sessionId = generateSessionId()
    res.cookie('onelastai_session', sessionId, {
      maxAge: 30 * 60 * 1000, // 30 minutes
      httpOnly: true,
      sameSite: 'lax'
    })
  }

  // Store tracking data in request object
  req.trackingData = {
    visitorId,
    sessionId,
    userId: req.user?.id || req.userId || null,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent')
  }

  next()
}

// ============================================
// MIDDLEWARE: Track Visitor
// ============================================
export async function trackVisitorMiddleware(req, res, next) {
  if (!req.trackingData) {
    return next()
  }

  const { visitorId, userId, ipAddress, userAgent } = req.trackingData

  // Track visitor asynchronously (non-blocking)
  trackVisitor({
    visitorId,
    userId,
    ipAddress,
    userAgent,
    country: req.get('cf-ipcountry') || 'Unknown',
    city: req.get('cf-ipcity') || 'Unknown'
  }).catch(err => console.error('Visitor tracking error:', err))

  // Create or update session
  createSession({
    sessionId: req.trackingData.sessionId,
    visitorId,
    userId
  }).catch(err => console.error('Session creation error:', err))

  next()
}

// ============================================
// MIDDLEWARE: Track Page View
// ============================================
export async function trackPageViewMiddleware(req, res, next) {
  if (!req.trackingData) {
    return next()
  }

  // Only track GET requests that are likely page views
  if (req.method === 'GET' && !req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/i)) {
    const { visitorId, sessionId, userId } = req.trackingData

    trackPageView({
      visitorId,
      sessionId,
      userId,
      url: req.protocol + '://' + req.get('host') + req.originalUrl,
      title: req.get('referer') || 'Unknown',
      referrer: req.get('referer') || null
    }).catch(err => console.error('Page view tracking error:', err))
  }

  next()
}

// ============================================
// MIDDLEWARE: Track API Usage
// ============================================
export async function trackApiMiddleware(req, res, next) {
  if (!req.trackingData) {
    return next()
  }

  const startTime = Date.now()

  // Capture response
  const originalSend = res.send
  res.send = function (data) {
    const responseTime = Date.now() - startTime
    const { visitorId, sessionId, ipAddress, userAgent } = req.trackingData

    // Track API usage asynchronously
    trackApiUsage({
      visitorId,
      sessionId,
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      userAgent,
      ipAddress
    }).catch(err => console.error('API tracking error:', err))

    return originalSend.call(this, data)
  }

  next()
}

// ============================================
// MIDDLEWARE: Update Session Activity
// ============================================
export async function updateSessionMiddleware(req, res, next) {
  if (!req.trackingData) {
    return next()
  }

  const { sessionId } = req.trackingData

  // Update session activity asynchronously
  updateSessionActivity(sessionId).catch(err => console.error('Session update error:', err))

  // Refresh session cookie
  res.cookie('onelastai_session', sessionId, {
    maxAge: 30 * 60 * 1000, // 30 minutes
    httpOnly: true,
    sameSite: 'lax'
  })

  next()
}

// ============================================
// COMBINED MIDDLEWARE: Universal Tracking
// ============================================
export function universalTrackingMiddleware(req, res, next) {
  initializeTracking(req, res, (err) => {
    if (err) return next(err)
    
    trackVisitorMiddleware(req, res, (err) => {
      if (err) return next(err)
      
      trackPageViewMiddleware(req, res, (err) => {
        if (err) return next(err)
        
        trackApiMiddleware(req, res, (err) => {
          if (err) return next(err)
          
          updateSessionMiddleware(req, res, next)
        })
      })
    })
  })
}

// ============================================
// UTILITY: Get Tracking Data from Request
// ============================================
export function getTrackingData(req) {
  return req.trackingData || null
}
