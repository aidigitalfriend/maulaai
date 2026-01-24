import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';
import bcrypt from 'bcryptjs';

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

    // Get password from request for verification
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    // If user has a password, require it to disable 2FA
    if (user.password && password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ message: 'Incorrect password' }, { status: 400 });
      }
    }

    // Disable 2FA and clear related data
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: '2FA disabled successfully' 
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
