/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  // Server-rendered deployment; disable static export during production builds to support route handlers
  output: undefined,
  
  // Allow webpack to transpile and resolve backend modules in monorepo structure
  transpilePackages: ['ai-app-monorepo'],
  
  // Enable importing from parent directory (monorepo structure)
  experimental: {
    externalDir: true,
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add backend directory to module resolution for server-side imports
      const backendPath = path.resolve(__dirname, '../backend')
      config.resolve.alias = {
        ...config.resolve.alias,
        '@backend': backendPath,
      }
      
      // Externalize mongoose and other native modules for serverless
      config.externals = config.externals || []
      config.externals.push({
        'mongoose': 'commonjs mongoose',
        'mongodb': 'commonjs mongodb',
      })
    }
    return config
  },
  
  images: {
    // Modern configuration: prefer remotePatterns over deprecated domains list
    remotePatterns: [
      { protocol: 'https', hostname: 'onelastai.co' },
      { protocol: 'https', hostname: 'www.onelastai.co' }
    ],
    // Keep localhost for dev convenience
    domains: ['localhost'],
    unoptimized: false,
    // Fix CSP for Next.js images - allow inline scripts for Stripe, Cloudflare and other integrations
    contentSecurityPolicy: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://static.cloudflareinsights.com; frame-src 'self' https://js.stripe.com;",
  },
  
  // Expose Google Maps API key to the client; prefer NEXT_PUBLIC_ but fall back to non-prefixed if provided
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '',
  },
  
  // Skip type checking and linting during build (for faster production deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // ✅ SECURITY: Disable source maps in production
  productionBrowserSourceMaps: process.env.NODE_ENV === 'production' ? false : true,
  
  // ✅ SECURITY: Enable minification
  swcMinify: true,
  
  // ✅ SECURITY: Add security headers
  async headers() {
    return [
      // Cache policy for Next.js static assets (hashed, immutable)
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // CRITICAL: Prevent caching of HTML to avoid stale chunk references after deploys
      // All HTML pages should revalidate to get correct buildId chunk URLs
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Enable XSS protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser features
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          // Content Security Policy - allow Stripe, Cloudflare Insights and inline scripts
          { 
            key: 'Content-Security-Policy-Report-Only', 
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network https://static.cloudflareinsights.com; connect-src 'self' https://api.stripe.com https://m.stripe.network https://cloudflareinsights.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';" 
          },
        ],
      },
    ]
  },

  // Proxy /api/* to backend only during local development.
  // In production, Next.js App Router serves its own API routes (e.g. /api/community, /api/tools, /api/status),
  // and Nginx will forward other backend APIs to the Node server.
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return []
    }
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig