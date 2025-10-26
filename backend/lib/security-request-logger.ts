/**
 * Security Request Logger
 * Logs all API requests safely without exposing sensitive information
 */

import { NextRequest } from 'next/server'

export interface RequestLog {
  timestamp: string
  method: string
  path: string
  status?: number
  duration?: number
  userId?: string
  ip: string
  userAgent?: string
  referer?: string
  isSecure: boolean
  rateLimit?: {
    limit: number
    remaining: number
    exceeded: boolean
  }
}

/**
 * Extract client IP from request (handles proxies)
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = forwarded ? forwarded.split(',')[0].trim() : realIP

  return ip || 'unknown'
}

/**
 * Extract safe request metadata
 */
export function extractRequestMetadata(request: NextRequest) {
  const method = request.method
  const url = new URL(request.url)
  const path = url.pathname
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const referer = request.headers.get('referer')
  const ip = getClientIP(request)
  const isSecure = url.protocol === 'https:' || url.hostname === 'localhost'

  return {
    method,
    path,
    userAgent,
    referer,
    ip,
    isSecure
  }
}

/**
 * Log API request (safe version)
 * DO NOT log: request bodies with sensitive data, API keys, passwords
 */
export function logRequest(
  request: NextRequest,
  options?: {
    userId?: string
    status?: number
    duration?: number
    rateLimit?: {
      limit: number
      remaining: number
      exceeded: boolean
    }
  }
) {
  const metadata = extractRequestMetadata(request)

  const log: RequestLog = {
    timestamp: new Date().toISOString(),
    method: metadata.method,
    path: metadata.path,
    status: options?.status,
    duration: options?.duration,
    userId: options?.userId,
    ip: metadata.ip,
    userAgent: metadata.userAgent,
    referer: metadata.referer,
    isSecure: metadata.isSecure,
    rateLimit: options?.rateLimit
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Request]', log)
  }

  // TODO: Send to centralized logging (DataDog, etc)
  // TODO: Send alerts for suspicious patterns
}

/**
 * Detect suspicious activity
 */
export function detectSuspiciousActivity(request: NextRequest, options?: {
  userId?: string
  rateLimit?: { exceeded: boolean }
}) {
  const metadata = extractRequestMetadata(request)

  // Check for suspicious patterns
  const suspiciousPatterns = [
    // SQL injection attempts
    /('|"|;|--|\/\*|\*\/).*?(union|select|insert|update|delete|drop)/i,
    
    // Path traversal
    /\.\.\//,
    
    // Script injection
    /<script|javascript:|onerror=|onclick=/i,
  ]

  const path = metadata.path
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(path))

  if (isSuspicious) {
    console.warn('[SUSPICIOUS ACTIVITY]', {
      timestamp: new Date().toISOString(),
      ip: metadata.ip,
      path,
      userAgent: metadata.userAgent,
      userId: options?.userId
    })

    // TODO: Alert security team
    // TODO: Increment IP reputation score
  }

  // Check for rate limit abuse
  if (options?.rateLimit?.exceeded) {
    console.warn('[RATE LIMIT EXCEEDED]', {
      timestamp: new Date().toISOString(),
      ip: metadata.ip,
      path,
      userId: options?.userId
    })

    // TODO: Increase rate limits for this IP
    // TODO: Send to security monitoring
  }
}

/**
 * Create request context for logging
 */
export function createRequestContext(request: NextRequest, userId?: string) {
  const metadata = extractRequestMetadata(request)
  const startTime = Date.now()

  return {
    metadata,
    startTime,
    userId,
    log: (status: number, rateLimit?: any) => {
      const duration = Date.now() - startTime
      
      logRequest(request, {
        userId,
        status,
        duration,
        rateLimit
      })

      detectSuspiciousActivity(request, {
        userId,
        rateLimit
      })
    }
  }
}

export default logRequest
