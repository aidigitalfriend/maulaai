import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { hash, compare } from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import nodemailer from 'nodemailer'

/**
 * Auth.js Configuration
 * Supports both passwordless (magic link) and traditional (email + password) authentication
 */

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'sendgrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY || '',
  },
})

// Alternative: Using Resend
// import { Resend } from 'resend'
// const resend = new Resend(process.env.RESEND_API_KEY)

export const authOptions: NextAuthOptions = {
  // Configure adapter for MongoDB
  adapter: MongoDBAdapter(dbConnect),

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
     * PASSWORDLESS LOGIN (Magic Link via Email)
     * User enters email → receives magic link → clicks link → logged in
     */
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@axeyaxe.com',
      sendVerificationRequest: async ({ identifier: email, url, provider, theme }) => {
        try {
          // Using SendGrid
          if (process.env.SENDGRID_API_KEY) {
            const { text, html } = await provider.generateVerificationRequest({ url, theme })
            await transporter.sendMail({
              to: email,
              from: process.env.EMAIL_FROM || 'noreply@axeyaxe.com',
              subject: '🔐 Your Magic Login Link',
              text,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Welcome to Axeyaxe! 🎉</h2>
                  <p>Click the button below to sign in securely (link expires in 24 hours):</p>
                  <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    🔓 Sign In Now
                  </a>
                  <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    Or copy this link:<br/>
                    ${url}
                  </p>
                  <p style="margin-top: 20px; color: #999; font-size: 12px;">
                    This link expires in 24 hours. If you didn't request this, please ignore this email.
                  </p>
                </div>
              `,
            })
          }
          // Fallback: Using Resend
          else if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
              from: process.env.EMAIL_FROM || 'noreply@axeyaxe.com',
              to: email,
              subject: '🔐 Your Magic Login Link',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Welcome to Axeyaxe! 🎉</h2>
                  <p>Click the button below to sign in securely (link expires in 24 hours):</p>
                  <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    🔓 Sign In Now
                  </a>
                  <p style="margin-top: 20px; font-size: 12px; color: #666;">
                    Or copy this link:<br/>
                    ${url}
                  </p>
                  <p style="margin-top: 20px; color: #999; font-size: 12px;">
                    This link expires in 24 hours. If you didn't request this, please ignore this email.
                  </p>
                </div>
              `,
            })
          }
        } catch (error) {
          console.error('Failed to send verification email:', error)
          throw new Error('Email sending failed')
        }
      },
    }),

    /**
     * TRADITIONAL LOGIN (Email + Password)
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
    async signIn({ user, account, profile, email, credentials }) {
      try {
        await dbConnect()

        // For email provider (passwordless magic link)
        if (account?.provider === 'email') {
          let dbUser = await User.findOne({ email: user.email })

          if (!dbUser) {
            // Create new passwordless user
            dbUser = new User({
              email: user.email,
              name: user.name || user.email.split('@')[0],
              authMethod: 'passwordless',
              emailVerified: new Date(),
            })
            await dbUser.save()
          } else {
            // Update lastLoginAt
            dbUser.lastLoginAt = new Date()
            await dbUser.save()
          }

          return true
        }

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
        token.id = user.id
        token.email = user.email
        token.authMethod = user.authMethod || 'password'
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.authMethod = (token.authMethod as 'password' | 'passwordless') || 'password'
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after login
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },

  // Email configuration
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-email', // Magic link verification page
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
    async error({ error }) {
      console.error(`❌ Auth error: ${error}`)
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
}

// Export the handler
export default NextAuth(authOptions)
