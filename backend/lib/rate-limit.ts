/**
 * Rate Limiting Module
 * Prevents API abuse and protects against DoS attacks
 * 
 * Usage:
 * const { success, retryAfter } = await checkRateLimit(userId, 'api-endpoint')
 * if (!success) {
 *   return NextResponse.json({ error: 'Rate limit exceeded', retryAfter }, { status: 429 })
 * }
 */

import { NextResponse } from 'next/server'

/**
 * Rate limit configuration by endpoint
 * Format: endpoint -> { maxRequests, windowSeconds }
 */
export const RATE_LIMIT_CONFIG = {
  // Agent endpoints - strict limits to prevent abuse
  'agent-chat': {
    maxRequests: 30,
    windowSeconds: 3600, // 30 requests per hour
    description: 'Agent chat requests'
  },
  'agent-config': {
    maxRequests: 100,
    windowSeconds: 3600, // 100 requests per hour
    description: 'Agent configuration requests'
  },
  
  // Auth endpoints - moderate limits
  'auth-login': {
    maxRequests: 10,
    windowSeconds: 900, // 10 requests per 15 minutes
    description: 'Login attempts'
  },
  'auth-register': {
    maxRequests: 5,
    windowSeconds: 3600, // 5 requests per hour
    description: 'Registration attempts'
  },
  'auth-refresh': {
    maxRequests: 50,
    windowSeconds: 3600, // 50 requests per hour
    description: 'Token refresh'
  },
  
  // Payment endpoints - strict limits
  'payment-create': {
    maxRequests: 10,
    windowSeconds: 3600, // 10 requests per hour
    description: 'Payment creation'
  },
  'payment-webhook': {
    maxRequests: 100,
    windowSeconds: 3600, // 100 requests per hour (webhooks can burst)
    description: 'Payment webhooks'
  },
  
  // General API - relaxed limits
  'api-general': {
    maxRequests: 100,
    windowSeconds: 60, // 100 requests per minute
    description: 'General API calls'
  },
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

/**
 * In-memory rate limit store (for development)
 * For production, use Redis
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Clean up expired rate limit entries
 */
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((value, key) => {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  })
}, 60000) // Clean every minute

/**
 * Check rate limit for a user/endpoint combination
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param endpoint - Endpoint identifier from RATE_LIMIT_CONFIG
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string = 'api-general'
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIG[endpoint as keyof typeof RATE_LIMIT_CONFIG] || RATE_LIMIT_CONFIG['api-general']
  const key = `${identifier}:${endpoint}`
  const now = Date.now()
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    // Create new window
    entry = {
      count: 0,
      resetTime: now + config.windowSeconds * 1000
    }
    rateLimitStore.set(key, entry)
  }
  
  // Increment counter
  entry.count++
  
  // Check if limit exceeded
  const exceeded = entry.count > config.maxRequests
  const remaining = Math.max(0, config.maxRequests - entry.count)
  const resetTime = Math.ceil(entry.resetTime / 1000)
  const retryAfter = exceeded ? Math.ceil((entry.resetTime - now) / 1000) : undefined
  
  return {
    success: !exceeded,
    limit: config.maxRequests,
    remaining,
    reset: resetTime,
    retryAfter
  }
}

/**
 * Get rate limit status without incrementing counter
 * @param identifier - Unique identifier
 * @param endpoint - Endpoint identifier
 * @returns Rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  endpoint: string = 'api-general'
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIG[endpoint as keyof typeof RATE_LIMIT_CONFIG] || RATE_LIMIT_CONFIG['api-general']
  const key = `${identifier}:${endpoint}`
  const now = Date.now()
  
  const entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Math.ceil((now + config.windowSeconds * 1000) / 1000)
    }
  }
  
  const remaining = Math.max(0, config.maxRequests - entry.count)
  
  return {
    success: entry.count <= config.maxRequests,
    limit: config.maxRequests,
    remaining,
    reset: Math.ceil(entry.resetTime / 1000),
    retryAfter: entry.count > config.maxRequests 
      ? Math.ceil((entry.resetTime - now) / 1000)
      : undefined
  }
}

/**
 * Add rate limit headers to response
 * @param response - NextResponse to modify
 * @param result - Rate limit result
 * @returns Modified response
 */
export function addRateLimitHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.reset.toString())
  
  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString())
  }
  
  return response
}

/**
 * Create rate limit error response
 * @param result - Rate limit result
 * @returns NextResponse with 429 status
 */
export function rateLimitExceededResponse(result: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: 'Rate limit exceeded',
      retryAfter: result.retryAfter,
      resetAt: new Date(result.reset * 1000).toISOString()
    },
    { status: 429 }
  )
  
  return addRateLimitHeaders(response, result)
}

/**
 * Get identifier from request (IP address fallback to user ID)
 * @param req - Next.js request
 * @param userId - Optional user ID
 * @returns Identifier string
 */
export function getIdentifierFromRequest(req: any, userId?: string): string {
  if (userId) {
    return userId
  }
  
  // Get IP from various headers (behind proxy)
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip')
  
  return ip || 'unknown'
}

/**
 * NOTE: For production deployment, replace in-memory store with Redis
 * 
 * Example using Upstash Redis:
 * 
 * import { Ratelimit } from '@upstash/ratelimit'
 * import { Redis } from '@upstash/redis'
 * 
 * const redis = new Redis({
 *   url: process.env.UPSTASH_REDIS_REST_URL!,
 *   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
 * })
 * 
 * const ratelimit = new Ratelimit({
 *   redis,
 *   limiter: Ratelimit.slidingWindow(100, '1 h'),
 *   analytics: true,
 * })
 * 
 * export async function checkRateLimit(identifier: string, endpoint: string) {
 *   const { success } = await ratelimit.limit(identifier)
 *   return { success }
 * }
 */

export default checkRateLimit
