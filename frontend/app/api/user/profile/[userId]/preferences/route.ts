import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
      select: { preferences: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    const defaultPreferences = {
      language: 'en',
      theme: 'auto',
      notifications: { email: true, push: true, sms: false },
    };

    const preferences = user.preferences ? 
      (typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences) 
      : defaultPreferences;

    return NextResponse.json({ success: true, data: preferences });
  } catch (error) {
    console.error('Profile preferences fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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

    const body = await request.json();

    await prisma.user.update({
      where: { id: user.id },
      data: { preferences: body },
    });

    return NextResponse.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    console.error('Profile preferences update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
