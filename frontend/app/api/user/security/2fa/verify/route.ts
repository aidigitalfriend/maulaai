import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';
import { authenticator } from 'otplib';

// Generate backup codes
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = Array.from({ length: 8 }, () => 
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');
    codes.push(code);
  }
  return codes;
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
      select: {
        id: true,
        twoFactorSecret: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ message: 'Verification code required' }, { status: 400 });
    }

    // Validate code format
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      return NextResponse.json({ message: 'Invalid code format. Please enter a 6-digit code.' }, { status: 400 });
    }

    // Check if user has a secret stored
    if (!user.twoFactorSecret) {
      return NextResponse.json({ message: 'Please set up 2FA first' }, { status: 400 });
    }

    // Verify the TOTP code using otplib
    const isValid = authenticator.verify({ 
      token: code, 
      secret: user.twoFactorSecret 
    });

    if (!isValid) {
      return NextResponse.json({ message: 'Invalid verification code. Please try again.' }, { status: 400 });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);

    // Enable 2FA and store backup codes
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorEnabled: true,
        backupCodes: backupCodes,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: '2FA enabled successfully',
      data: {
        backupCodes,
      }
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
