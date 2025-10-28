/** @type {import('next').NextConfig} */

// ✅ SECURITY: Allowed frontend origins
const allowedOrigins = [
  'https://onelastai.co',
  'https://www.onelastai.co',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
  process.env.FRONTEND_URL || null,
].filter(Boolean)

const nextConfig = {
  // ✅ SECURITY: Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // ✅ SECURITY: Enable minification
  swcMinify: true,
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          // ✅ SECURITY: Restrict CORS to allowed origins only
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' 
              ? '*' 
              : 'https://onelastai.co'
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          // ✅ SECURITY: Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // ✅ SECURITY: Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // ✅ SECURITY: Enable XSS protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // ✅ SECURITY: Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig