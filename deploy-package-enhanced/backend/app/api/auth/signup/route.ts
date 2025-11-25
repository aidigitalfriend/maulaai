import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { hash } from 'bcryptjs'
import { sendWelcomeEmail } from '@/services/email'

/**
 * POST /api/auth/signup
 * Register a new user with email and password
 * 
 * Body:
 * {
 *   email: string
 *   name: string
 *   password: string
 *   authMethod: 'password' | 'passwordless'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name, password, authMethod } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create new user
    const hashedPassword = await hash(password, 10)
    const newUser = new User({
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      password: hashedPassword,
      authMethod: authMethod || 'password',
      emailVerified: new Date(), // Auto-verify for now
    })

    await newUser.save()

    // Send welcome email (async, don't block response)
    const userName = name || email.split('@')[0]
    sendWelcomeEmail(email.toLowerCase(), userName).catch(error => {
      console.error('Failed to send welcome email:', error)
      // Don't fail signup if email fails
    })

    // Return user (without password)
    const userResponse = newUser.toJSON()
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userResponse,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Failed to create account' },
      { status: 500 }
    )
  }
}
