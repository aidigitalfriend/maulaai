import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { hash, compare } from 'bcryptjs'
import dbConnect, { getClientPromise } from '@/lib/mongodb'
import User from '@/models/User'

/**
 * Auth.js Configuration
 * Simple email + password authentication only
 */

const DISABLE_DB_ADAPTER = (process.env.NEXTAUTH_DISABLE_DB_ADAPTER || '').toLowerCase() === 'true'

export const authOptions: NextAuthOptions = {
  // Configure adapter for MongoDB (uses native driver)
  // Allow disabling to avoid startup hangs in environments without DB access
  adapter: process.env.MONGODB_URI && !DISABLE_DB_ADAPTER ? MongoDBAdapter(getClientPromise()) : undefined,

  // Session strategy
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update every hour
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // Providers
  providers: [
    /**
     * EMAIL + PASSWORD LOGIN
     * User enters email + password → credentials verified → logged in
     */
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        try {
          await dbConnect()

          const user = await User.findOne({ email: credentials.email })

          if (!user) {
            throw new Error('No user found with this email')
          }

          if (!user.password) {
            throw new Error('This account uses passwordless login. Use magic link instead.')
          }

          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          // Password correct, return user
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            authMethod: 'password',
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Authentication failed'
          throw new Error(message)
        }
      },
    }),
  ],

  // Callbacks
  callbacks: {
    async signIn({ user, account }) {
      try {
        await dbConnect()

        // For credentials provider (password login)
        if (account?.provider === 'credentials') {
          let dbUser = await User.findOne({ email: user.email })

          if (dbUser) {
            dbUser.lastLoginAt = new Date()
            await dbUser.save()
          }

          return true
        }

        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as any).id || token.id
        token.email = (user as any).email || token.email
        const methodFromUser = (user as any)?.authMethod
        const method = methodFromUser || 'password'
        ;(token as any).authMethod = method
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = (token as any).id as string
        ;(session.user as any).email = (token as any).email as string
        ;(session.user as any).authMethod = 'password'
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Normalize and safely handle relative and absolute URLs
      try {
        if (url.startsWith('/')) return `${baseUrl}${url}`
        const parsed = new URL(url, baseUrl)
        if (parsed.origin === baseUrl) return parsed.toString()
      } catch (e) {
        // Fall through to default redirect if URL parsing fails
      }
      return `${baseUrl}/dashboard`
    },
  },

  // Pages configuration
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    newUser: '/auth/signup',
  },

  // Events
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`✅ User signed in: ${user.email} (${isNewUser ? 'new' : 'existing'})`)
    },
    async signOut({ token }) {
      console.log(`✅ User signed out`)
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
}

// Export the handler
export default NextAuth(authOptions)
