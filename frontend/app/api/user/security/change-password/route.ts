import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSessionId } from '@/lib/session-utils';

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Password strength validation
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return NextResponse.json({ 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      }, { status: 400 });
    }

    // Verify current password
    if (user.password) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
      }
    }

    // Check if new password is same as old
    if (user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return NextResponse.json({ message: 'New password must be different from current password' }, { status: 400 });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
