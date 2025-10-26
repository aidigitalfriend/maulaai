/**
 * Security Error Handler
 * Centralized error handling that prevents information leakage
 * 
 * DO NOT leak sensitive information in error messages
 * Only show safe error messages to clients
 */

import { NextResponse } from 'next/server'

export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
  timestamp: string
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',        // Info/debug
  MEDIUM = 'medium',  // Warning/expected error
  HIGH = 'high',      // Error/unexpected
  CRITICAL = 'critical' // Fatal error
}

/**
 * Error types with safe messages
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  UNAUTHORIZED: { status: 401, message: 'Authentication required', code: 'UNAUTHORIZED' },
  INVALID_TOKEN: { status: 401, message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
  FORBIDDEN: { status: 403, message: 'Access denied', code: 'FORBIDDEN' },
  
  // Validation errors
  BAD_REQUEST: { status: 400, message: 'Invalid request', code: 'BAD_REQUEST' },
  MISSING_REQUIRED_FIELD: { status: 400, message: 'Missing required field', code: 'MISSING_FIELD' },
  INVALID_DATA_FORMAT: { status: 400, message: 'Invalid data format', code: 'INVALID_FORMAT' },
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Too many requests', code: 'RATE_LIMIT' },
  
  // Resource errors
  NOT_FOUND: { status: 404, message: 'Resource not found', code: 'NOT_FOUND' },
  CONFLICT: { status: 409, message: 'Resource conflict', code: 'CONFLICT' },
  
  // Server errors (generic - never leak details)
  INTERNAL_ERROR: { status: 500, message: 'An error occurred', code: 'INTERNAL_ERROR' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service temporarily unavailable', code: 'SERVICE_UNAVAILABLE' },
}

/**
 * Create safe error response (no sensitive info leaked)
 */
export function createErrorResponse(
  errorType: keyof typeof ERROR_MESSAGES,
  details?: string
): NextResponse<ErrorResponse> {
  const errorConfig = ERROR_MESSAGES[errorType]
  
  return NextResponse.json(
    {
      success: false,
      error: errorConfig.message,
      code: errorConfig.code,
      timestamp: new Date().toISOString()
    },
    { status: errorConfig.status }
  )
}

/**
 * Log error safely (without sensitive data)
 */
export function logSecurityError(
  severity: ErrorSeverity,
  message: string,
  context?: {
    userId?: string
    endpoint?: string
    method?: string
    ip?: string
    details?: any
  }
) {
  const timestamp = new Date().toISOString()
  
  // Remove sensitive fields
  const safeContext = {
    userId: context?.userId,
    endpoint: context?.endpoint,
    method: context?.method,
    ip: context?.ip?.split('.').slice(0, 3).join('.') + '.*' // Anonymize IP
  }

  const logMessage = {
    timestamp,
    severity,
    message,
    context: safeContext
  }

  // Log to console (in production, use centralized logging)
  if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
    console.error(`[${severity.toUpperCase()}]`, logMessage)
  } else {
    console.warn(`[${severity.toUpperCase()}]`, logMessage)
  }

  // TODO: Send to Sentry/DataDog for production
  // TODO: Send to Slack for critical errors
}

/**
 * Validate request body without leaking schema
 */
export function validateRequestBody(body: any, requiredFields: string[]): { valid: boolean; message?: string } {
  if (!body) {
    return { valid: false, message: 'Request body is required' }
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      return { valid: false, message: `Missing required field: ${field}` }
    }
  }

  return { valid: true }
}

/**
 * Sanitize error details for logging
 * Remove sensitive info before logging
 */
export function sanitizeError(error: any): any {
  if (!error) return null

  return {
    message: error.message || 'Unknown error',
    code: error.code,
    // DO NOT include: stack trace, internal paths, file names
  }
}

export default createErrorResponse
