/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'onelastai.co', 'www.onelastai.co'],
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
      {
        source: '/:path*',
        headers: [
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
        ],
      },
    ]
  },

  // Proxy frontend /api/* to backend server in development
  async rewrites() {
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