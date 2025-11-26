import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check cookies
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
    const [k, ...v] = c.split('=')
    return [k.trim(), decodeURIComponent((v||[]).join('='))]
  }))

  if (cookies.token) return cookies.token

  return null
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
