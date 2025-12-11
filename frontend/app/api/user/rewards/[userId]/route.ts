import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    const sessionUser = await users.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    if (sessionUser._id.toString() !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const rewardsCenters = db.collection('rewardscenters');
    const chatInteractions = db.collection('chat_interactions');

    let rewardsData = await rewardsCenters.findOne({ userId: params.userId });

    if (!rewardsData) {
      const userActivity = await chatInteractions.countDocuments({
        userId: sessionUser._id,
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
        userId: params.userId,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await rewardsCenters.insertOne(defaultRewards);
      rewardsData = defaultRewards;
    }

    const { _id, ...rewards } = rewardsData;
    return NextResponse.json({ success: true, data: rewards });
  } catch (error) {
    console.error('Rewards fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
