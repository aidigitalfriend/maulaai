/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'axeyaxe.com', 'www.axeyaxe.com'],
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
}

module.exports = nextConfig