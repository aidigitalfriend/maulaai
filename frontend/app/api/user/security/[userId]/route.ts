import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        twoFactorEnabled: user.twoFactorEnabled,
        lastLogin: user.lastLoginAt,
        accountCreated: user.createdAt,
        passwordLastChanged: null,
        activeSessions: 1,
      },
    });
  } catch (error) {
    console.error('Security settings fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const body = await request.json();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: body.twoFactorEnabled ?? user.twoFactorEnabled,
      },
    });

    return NextResponse.json({ success: true, message: 'Security settings updated' });
  } catch (error) {
    console.error('Security settings update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
