import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// GET - Check 2FA status
export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
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

    // Generate a proper TOTP secret using otplib
    const secret = authenticator.generateSecret();
    
    // Create the OTP auth URL
    const otpauthUrl = authenticator.keyuri(user.email, 'One Last AI', secret);
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Store the secret (not enabled yet - will be enabled after verification)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({
      success: true,
      data: {
        secret,
        qrCode: qrCodeDataUrl,
        otpauthUrl,
      },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
