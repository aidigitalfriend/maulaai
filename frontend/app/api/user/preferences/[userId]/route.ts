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
      select: { id: true, preferences: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    const defaultPreferences = {
      language: 'en',
      theme: 'auto',
      notifications: { email: true, push: true, sms: false },
      privacy: { profileVisibility: 'public', showEmail: false, showPhone: false },
    };

    const preferences = user.preferences ? 
      (typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences) 
      : defaultPreferences;

    return NextResponse.json({ 
      success: true, 
      data: { ...defaultPreferences, ...preferences } 
    });
  } catch (error) {
    console.error('Preferences fetch error:', error);
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
      data: { preferences: body },
    });

    return NextResponse.json({ success: true, message: 'Preferences updated' });
  } catch (error) {
    console.error('Preferences update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
