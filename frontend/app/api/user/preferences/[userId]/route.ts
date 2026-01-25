import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAllSessionIds } from '@/lib/session-utils';

// Helper to find valid user from any of the session cookies
async function getValidSessionUser(request: NextRequest, select?: Record<string, boolean>) {
  const sessionIds = getAllSessionIds(request);
  if (sessionIds.length === 0) return null;
  
  for (const sessionId of sessionIds) {
    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
      ...(select && { select }),
    });
    if (user) return user;
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await getValidSessionUser(request, { id: true, preferences: true });
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
    const user = await getValidSessionUser(request);
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
