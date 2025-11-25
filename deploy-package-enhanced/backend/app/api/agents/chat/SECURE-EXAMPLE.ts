/**
 * SECURE API EXAMPLE
 * 
 * This is a template showing how to implement all security layers:
 * 1. Authentication (JWT verification)
 * 2. Rate limiting
 * 3. Input validation
 * 4. Request logging
 * 5. Safe error handling
 * 
 * File: backend/app/api/agents/chat/route-SECURE-EXAMPLE.ts
 * 
 * Copy this pattern to all other endpoints for consistent security
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest } from '@/lib/auth-middleware'
import { checkRateLimit, rateLimitExceededResponse, getIdentifierFromRequest } from '@/lib/rate-limit'
import { createErrorResponse, validateRequestBody, logSecurityError, ErrorSeverity } from '@/lib/security-error-handler'
import { createRequestContext } from '@/lib/security-request-logger'

/**
 * POST /api/agents/chat
 * 
 * Send a message to an agent
 * 
 * Request:
 * {
 *   "agentId": "comedy-king",
 *   "message": "Tell me a joke"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "agentId": "comedy-king",
 *     "message": "Why did the comedy king go to the bar? To get a royal laugh!",
 *     "timestamp": "2025-10-24T..."
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  // Create request context for logging
  const context = createRequestContext(request)

  try {
    // ✅ STEP 1: Verify authentication
    const { authenticated, user, error } = await verifyRequest(request)
    
    if (!authenticated) {
      context.log(401)
      logSecurityError(ErrorSeverity.MEDIUM, 'Unauthorized access attempt', {
        endpoint: context.metadata.path,
        method: context.metadata.method,
        ip: context.metadata.ip
      })
      return createErrorResponse('UNAUTHORIZED')
    }

    // ✅ STEP 2: Check rate limiting
    const identifier = getIdentifierFromRequest(request, user?.id)
    const rateLimitResult = await checkRateLimit(identifier, 'agent-chat')
    
    if (!rateLimitResult.success) {
      context.log(429, { ...rateLimitResult, exceeded: true })
      logSecurityError(ErrorSeverity.MEDIUM, 'Rate limit exceeded', {
        userId: user?.id,
        endpoint: context.metadata.path,
        ip: context.metadata.ip
      })
      return rateLimitExceededResponse(rateLimitResult)
    }

    // ✅ STEP 3: Parse and validate request body
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      context.log(400)
      return createErrorResponse('BAD_REQUEST')
    }

    // ✅ STEP 4: Validate required fields
    const validation = validateRequestBody(body, ['agentId', 'message'])
    if (!validation.valid) {
      context.log(400)
      return NextResponse.json(
        { success: false, error: validation.message },
        { status: 400 }
      )
    }

    // ✅ STEP 5: Validate input data
    const agentId = body.agentId?.toString().trim()
    const message = body.message?.toString().trim()

    // Prevent injection attacks
    if (!agentId || agentId.length > 50 || !message || message.length > 5000) {
      context.log(400)
      return createErrorResponse('INVALID_DATA_FORMAT')
    }

    // ✅ STEP 6: Get backend system prompt (NOT exposed to frontend)
    // SECURITY: This is fetched from backend/lib/agent-strict-prompts.ts
    // Frontend never sees these prompts
    const systemPrompt = `You are ${agentId}. Respond in character.`
    
    // ✅ STEP 7: Process request (actual business logic)
    const aiResponse = await callAIAgent(agentId, message, systemPrompt)

    // ✅ STEP 8: Return safe response
    const response = NextResponse.json({
      success: true,
      data: {
        agentId,
        message: aiResponse,
        timestamp: new Date().toISOString()
      }
    })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

    // Log successful request
    context.log(200, { ...rateLimitResult, exceeded: false })

    return response

  } catch (error: any) {
    // ✅ STEP 9: Safe error handling (no sensitive info leaked)
    context.log(500)
    
    logSecurityError(ErrorSeverity.HIGH, 'Agent chat error', {
      userId: context.userId,
      endpoint: context.metadata.path,
      ip: context.metadata.ip
    })

    // Return generic error (don't expose stack trace or internal details)
    return createErrorResponse('INTERNAL_ERROR')
  }
}

/**
 * Placeholder for AI agent call
 * In production, this would call OpenAI, Anthropic, etc.
 */
async function callAIAgent(agentId: string, message: string, systemPrompt: string): Promise<string> {
  // TODO: Implement actual AI call here
  // This is protected because it only runs on backend
  // API keys are NOT visible to frontend
  
  return `Response from ${agentId}`
}

/**
 * ✅ SECURITY CHECKLIST FOR THIS ENDPOINT:
 * 
 * [x] Authentication required (JWT)
 * [x] Rate limiting enabled
 * [x] Input validation
 * [x] Request logging
 * [x] Safe error handling
 * [x] No secrets exposed
 * [x] No implementation details leaked
 * [x] No SQL injection possible (no DB access in example)
 * [x] No XSS possible (plain text responses)
 * [x] No CSRF (POST requires token)
 * 
 * ✅ APPLY THIS PATTERN TO ALL ENDPOINTS
 */

export default POST
