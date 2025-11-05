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

  // For all other requests (HTML pages), force no-cache to prevent stale chunk references
  const res = NextResponse.next()
  
  // Override any Next.js caching with aggressive no-cache headers
  res.headers.delete('Cache-Control')
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
  res.headers.set('Pragma', 'no-cache')
  res.headers.set('Expires', '0')
  res.headers.set('Surrogate-Control', 'no-store')
  
  return res
}

export const config = {
  // Apply to ALL routes to ensure headers are set
  matcher: ['/(.*)'


]
}
