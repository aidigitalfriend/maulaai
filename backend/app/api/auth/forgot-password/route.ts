import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { sendPasswordResetEmail } from '@/services/email'

/**
 * POST /api/auth/forgot-password
 * Request a password reset link
 * 
 * Body:
 * {
 *   email: string
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const user = await User.findOne({ email: email.toLowerCase() })

    // Don't reveal if email exists (security best practice)
    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'If that email exists, a reset link will be sent' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = user.generateResetToken()
    await user.save()

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password/set-new?token=${resetToken}`
    const userName = user.name || user.email.split('@')[0]

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, userName, resetUrl)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Clear reset token if email fails
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()
      
      return NextResponse.json(
        { message: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'If that email exists, a reset link will be sent' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { message: 'Failed to process request' },
      { status: 500 }
    )
  }
}
