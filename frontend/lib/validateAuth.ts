import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

function getTokenFromRequest(request: NextRequest): string | null {
  // Get token from HttpOnly cookie (secure)
  const token = request.cookies.get('auth_token')?.value
  return token || null
}

export function verifyRequest(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) {
    return { ok: false, error: 'No token provided' }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { ok: true, decoded }
  } catch (err: any) {
    return { ok: false, error: 'Invalid token' }
  }
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ success: false, error: message }, { status: 401 })
}
