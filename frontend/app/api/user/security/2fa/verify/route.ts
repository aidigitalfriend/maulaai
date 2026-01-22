import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ message: 'Verification code required' }, { status: 400 });
    }

    // In a real implementation, verify the TOTP code against the secret
    // For now, accept any 6-digit code for demonstration
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return NextResponse.json({ message: 'Invalid code format' }, { status: 400 });
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ 
      success: true, 
      message: '2FA enabled successfully' 
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
