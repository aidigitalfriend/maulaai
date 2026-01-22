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

    const sessionUser = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });

    if (!sessionUser) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    // Count user's chat sessions as activity
    const chatCount = await prisma.chatSession.count({
      where: { userId: sessionUser.id },
    });

    const startingPoints = Math.min(chatCount * 10, 500);
    const startingLevel = Math.floor(startingPoints / 100) + 1;
    const pointsThisLevel = startingPoints % 100;
    const pointsToNextLevel = 100 - pointsThisLevel;

    const starterBadges: any[] = [];
    const rewardHistory: any[] = [];

    if (chatCount > 0) {
      starterBadges.push({
        id: 'first_chat',
        name: 'First Steps',
        description: 'Your first AI conversation',
        earnedAt: new Date(),
        points: 50,
      });
      rewardHistory.push({ title: 'First Steps Badge', points: 50, date: new Date(), type: 'badge' });
    }

    if (chatCount >= 5) {
      starterBadges.push({
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Completed 5 AI conversations',
        earnedAt: new Date(),
        points: 100,
      });
      rewardHistory.push({ title: 'Getting Started Badge', points: 100, date: new Date(), type: 'badge' });
    }

    if (chatCount >= 10) {
      starterBadges.push({
        id: 'ai_enthusiast',
        name: 'AI Enthusiast',
        description: 'Active AI user with 10+ conversations',
        earnedAt: new Date(),
        points: 200,
      });
      rewardHistory.push({ title: 'AI Enthusiast Badge', points: 200, date: new Date(), type: 'badge' });
    }

    const rewards = {
      userId: sessionUser.id,
      currentLevel: startingLevel,
      totalPoints: startingPoints,
      pointsThisLevel,
      pointsToNextLevel,
      badges: starterBadges,
      achievements: [],
      rewardHistory,
      streaks: {
        current: chatCount > 0 ? 1 : 0,
        longest: chatCount > 0 ? Math.min(chatCount, 7) : 0,
      },
      statistics: {
        totalBadgesEarned: starterBadges.length,
        totalAchievementsCompleted: 0,
        averagePointsPerDay: chatCount > 0 ? Math.ceil(startingPoints / 7) : 0,
        daysActive: Math.min(chatCount, 30),
      },
    };

    return NextResponse.json({ success: true, data: rewards });
  } catch (error) {
    console.error('Rewards fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
