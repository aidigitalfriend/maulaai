import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Check 2FA status
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
      select: { twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { enabled: user.twoFactorEnabled } 
    });
  } catch (error) {
    console.error('2FA status error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST - Enable 2FA (generate secret)
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    // Generate a simple secret (in production, use speakeasy or similar)
    const secret = Array.from({ length: 32 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
    ).join('');

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({
      success: true,
      data: {
        secret,
        qrCode: `otpauth://totp/MaulaAI:${user.email}?secret=${secret}&issuer=MaulaAI`,
      },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
