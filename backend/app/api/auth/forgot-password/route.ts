import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import nodemailer from 'nodemailer'

/**
 * POST /api/auth/forgot-password
 * Request a password reset link
 * 
 * Body:
 * {
 *   email: string
 * }
 */

const transporter = nodemailer.createTransport({
  service: 'sendgrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY || '',
  },
})

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

    // Send email
    try {
      await transporter.sendMail({
        to: user.email,
        from: process.env.EMAIL_FROM || 'noreply@onelastai.co',
        subject: '🔐 Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to set a new password (link expires in 1 hour):</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              🔓 Reset Password
            </a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Or copy this link:<br/>
              ${resetUrl}
            </p>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
              This link expires in 1 hour. If you didn't request this, please ignore this email.
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Clear reset token if email fails
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save()
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
