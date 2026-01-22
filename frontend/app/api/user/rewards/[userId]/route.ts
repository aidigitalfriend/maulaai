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
      where: {
        sessionId,
        sessionExpiry: { gt: new Date() },
      },
    });

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const sessionUserId = sessionUser.id;

    if (params.userId && params.userId !== sessionUserId) {
      console.warn('Rewards access mismatch. Using session user.', {
        sessionUserId,
        requestedUserId: params.userId,
      });
    }

    const targetUserId = sessionUserId;

    let rewardsData = (await prisma.rewardsCenter.findUnique({
      where: { userId: targetUserId },
    })) as Record<string, any> | null;

    if (!rewardsData) {
      const userActivity = await prisma.chatInteraction.count({
        where: { userId: sessionUser.id },
      });

      const startingPoints = Math.min(userActivity * 10, 500);
      const startingLevel = Math.floor(startingPoints / 100) + 1;
      const pointsThisLevel = startingPoints % 100;
      const pointsToNextLevel = 100 - pointsThisLevel;

      const starterBadges: any[] = [];
      const rewardHistory: any[] = [];

      if (userActivity > 0) {
        starterBadges.push({
          id: 'first_chat',
          name: 'First Steps',
          description: 'Your first AI conversation',
          earnedAt: new Date(),
          points: 50,
        });
        rewardHistory.push({
          title: 'First Steps Badge',
          points: 50,
          date: new Date(),
          type: 'badge',
        });
      }

      if (userActivity >= 5) {
        starterBadges.push({
          id: 'getting_started',
          name: 'Getting Started',
          description: 'Completed 5 AI conversations',
          earnedAt: new Date(),
          points: 100,
        });
        rewardHistory.push({
          title: 'Getting Started Badge',
          points: 100,
          date: new Date(),
          type: 'badge',
        });
      }

      if (userActivity >= 10) {
        starterBadges.push({
          id: 'ai_enthusiast',
          name: 'AI Enthusiast',
          description: 'Active AI user with 10+ conversations',
          earnedAt: new Date(),
          points: 200,
        });
        rewardHistory.push({
          title: 'AI Enthusiast Badge',
          points: 200,
          date: new Date(),
          type: 'badge',
        });
      }

      const defaultRewards = {
        userId: targetUserId,
        currentLevel: startingLevel,
        totalPoints: startingPoints,
        pointsThisLevel,
        pointsToNextLevel,
        badges: starterBadges,
        achievements: [],
        rewardHistory,
        streaks: {
          current: userActivity > 0 ? 1 : 0,
          longest: userActivity > 0 ? Math.min(userActivity, 7) : 0,
        },
        statistics: {
          totalBadgesEarned: starterBadges.length,
          totalAchievementsCompleted: 0,
          averagePointsPerDay:
            userActivity > 0 ? Math.ceil(startingPoints / 7) : 0,
          daysActive: Math.min(userActivity, 30),
        },
      };

      rewardsData = await prisma.rewardsCenter.create({
        data: defaultRewards as any,
      });
    }

    const { id, ...rewards } = (rewardsData || {}) as Record<string, any>;
    return NextResponse.json({ success: true, data: rewards });
  } catch (error) {
    console.error('Rewards fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
