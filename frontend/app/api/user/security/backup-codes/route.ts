import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';
import bcrypt from 'bcryptjs';

// Generate backup codes
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Array.from({ length: 8 }, () => 
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('');
    codes.push(code);
  }
  return codes;
}

// GET - Get backup codes
export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
      select: {
        backupCodes: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    if (!user.twoFactorEnabled) {
      return NextResponse.json({ message: '2FA must be enabled to view backup codes' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        backupCodes: user.backupCodes || [],
        count: (user.backupCodes || []).length,
      },
    });
  } catch (error) {
    console.error('Get backup codes error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST - Regenerate backup codes
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

    if (!user.twoFactorEnabled) {
      return NextResponse.json({ message: '2FA must be enabled to regenerate backup codes' }, { status: 400 });
    }

    // Optionally verify password
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (user.password && password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ message: 'Incorrect password' }, { status: 400 });
      }
    }

    // Generate new backup codes
    const newBackupCodes = generateBackupCodes(10);

    await prisma.user.update({
      where: { id: user.id },
      data: { backupCodes: newBackupCodes },
    });

    return NextResponse.json({
      success: true,
      message: 'Backup codes regenerated successfully',
      data: {
        backupCodes: newBackupCodes,
      },
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
