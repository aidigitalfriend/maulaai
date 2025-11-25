import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Edge middleware to prevent HTML caching and allow long static asset caching
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // For static assets, allow long caching (they have content hashes)
  if (pathname.startsWith('/_next/static') || pathname.startsWith('/_next/image')) {
    const res = NextResponse.next()
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return res
  }

  // For HTML pages, prevent caching to avoid stale chunk references
  const res = NextResponse.next()
  res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.headers.set('Pragma', 'no-cache')
  res.headers.set('Expires', '0')
  
  return res
}

export const config = {
  // Apply to all routes except API and static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
