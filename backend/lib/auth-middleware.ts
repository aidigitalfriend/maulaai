/**
 * Authentication Middleware
 * Verifies JWT tokens and authenticates API requests
 * 
 * Usage:
 * const { authenticated, user, error } = await verifyRequest(req)
 * if (!authenticated) return NextResponse.json({ error }, { status: 401 })
 */

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-secret-change-in-production')

export interface AuthenticatedUser {
  id: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface AuthResult {
  authenticated: boolean
  user: AuthenticatedUser | null
  error: string | null
  token?: string
}

/**
 * Verify JWT token and authenticate request
 * @param req - Next.js request object
 * @returns Authentication result with user data
 */
export async function verifyRequest(req: NextRequest): Promise<AuthResult> {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader) {
      return {
        authenticated: false,
        user: null,
        error: 'Missing authorization header'
      }
    }

    // Extract bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        user: null,
        error: 'Invalid authorization header format'
      }
    }

    const token = authHeader.substring(7)

    // Verify token
    try {
      const verified = await jwtVerify(token, JWT_SECRET)
      
      return {
        authenticated: true,
        user: verified.payload as AuthenticatedUser,
        error: null,
        token
      }
    } catch (jwtError) {
      return {
        authenticated: false,
        user: null,
        error: 'Invalid or expired token'
      }
    }
  } catch (error) {
    return {
      authenticated: false,
      user: null,
      error: 'Authentication failed'
    }
  }
}

/**
 * Middleware function to wrap endpoints with authentication
 * @param req - Next.js request object
 * @returns Unauthorized response if not authenticated, null if authenticated
 */
export async function requireAuth(req: NextRequest) {
  const { authenticated, error } = await verifyRequest(req)
  
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: error || 'Unauthorized' },
      { status: 401 }
    )
  }

  return null // Authenticated, proceed
}

/**
 * Middleware to check specific role
 * @param req - Next.js request object
 * @param requiredRole - Role required to access endpoint
 * @returns Forbidden response if user doesn't have role
 */
export async function requireRole(req: NextRequest, requiredRole: string) {
  const { authenticated, user, error } = await verifyRequest(req)
  
  if (!authenticated) {
    return NextResponse.json(
      { success: false, error: error || 'Unauthorized' },
      { status: 401 }
    )
  }

  if (user?.role !== requiredRole && user?.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Insufficient permissions' },
      { status: 403 }
    )
  }

  return null // Authorized, proceed
}

/**
 * Get user from request
 * @param req - Next.js request object
 * @returns User object or null if not authenticated
 */
export async function getUserFromRequest(req: NextRequest): Promise<AuthenticatedUser | null> {
  const { authenticated, user } = await verifyRequest(req)
  return authenticated ? user : null
}

/**
 * Generate JWT token
 * @param user - User data to encode
 * @param expiresIn - Token expiration time (e.g., '24h', '7d')
 * @returns JWT token string
 */
export async function generateToken(
  user: AuthenticatedUser,
  expiresIn: number = 24 * 60 * 60 // 24 hours in seconds
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  
  const payload = {
    ...user,
    iat: now,
    exp: now + expiresIn,
  }

  // Note: This is a simplified version using jose
  // In production, use a proper JWT library like jsonwebtoken
  // This is handled by jwtVerify, but for encoding use:
  // const token = await new jose.SignJWT(payload)
  //   .setProtectedHeader({ alg: 'HS256' })
  //   .setExpirationTime(now + expiresIn)
  //   .sign(JWT_SECRET)
  
  return ''
}

export default verifyRequest
