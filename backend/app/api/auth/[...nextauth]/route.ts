import NextAuth from 'next-auth'
import { authOptions } from '@/auth'

/**
 * Auth.js API Route Handler
 * Handles all authentication operations:
 * - POST /api/auth/signin (login page)
 * - POST /api/auth/signout (logout)
 * - POST /api/auth/callback (OAuth/email callbacks)
 * - GET /api/auth/session (get current session)
 * - GET /api/auth/providers (get available providers)
 * - GET /api/auth/error (error page)
 * - POST /api/auth/signin/email (send magic link)
 * - POST /api/auth/signin/credentials (password login)
 */

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
