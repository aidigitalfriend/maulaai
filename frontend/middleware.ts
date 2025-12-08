import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { checkEnvironmentVariables } from '@/lib/environment-checker';

// Edge middleware to prevent HTML caching and allow long static asset caching
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // For static assets, allow long caching (they have content hashes)
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image')
  ) {
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return res;
  }

  // Special handling for RSC (React Server Components) requests
  const isRSCRequest = searchParams.has('_rsc');

  if (isRSCRequest) {
    // Quick environment check for RSC requests
    try {
      const envStatus = checkEnvironmentVariables();
      if (!envStatus.isValid) {
        console.error('❌ RSC request failed - environment not ready:', pathname);
        // Return a proper RSC error response
        return new Response('Service temporarily unavailable', {
          status: 503,
          headers: {
            'Content-Type': 'text/plain',
            'X-RSC-Error': 'Environment not ready'
          }
        });
      }
    } catch (error) {
      console.error('❌ RSC request failed - environment check error:', error);
      return new Response('Service temporarily unavailable', {
        status: 503,
        headers: {
          'Content-Type': 'text/plain',
          'X-RSC-Error': 'Environment check failed'
        }
      });
    }

    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.headers.set('X-RSC-Request', 'true');
    res.headers.set('Content-Type', 'text/x-component');
    return res;
  }

  // For HTML pages, prevent caching to avoid stale chunk references
  const res = NextResponse.next();
  res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');

  return res;
}

export const config = {
  // Apply to all routes except API and static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
