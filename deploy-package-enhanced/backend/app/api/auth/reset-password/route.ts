import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { hash } from 'bcryptjs'
import { createHash } from 'crypto'

/**
 * POST /api/auth/reset-password
 * Reset a user's password with a valid reset token
 * 
 * Body:
 * {
 *   token: string
 *   newPassword: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Hash the token
    const hashedToken = createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash and set new password
    const hashedPassword = await hash(newPassword, 10)
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { message: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
