import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAllSessionIds } from '@/lib/session-utils';

// Helper to find valid user from any of the session cookies
async function getValidSessionUser(request: NextRequest) {
  const sessionIds = getAllSessionIds(request);
  if (sessionIds.length === 0) return null;
  
  // Try each session ID until we find a valid one
  for (const sessionId of sessionIds) {
    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });
    if (user) return user;
  }
  return null;
}

// Badge definitions - based on user activity
const BADGE_DEFINITIONS = [
  {
    id: 'first_chat',
    name: 'First Steps',
    description: 'Started your first AI conversation',
    requirement: { chatCount: 1 },
    points: 50,
    rarity: 'common',
    category: 'milestone',
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Completed 5 AI conversations',
    requirement: { chatCount: 5 },
    points: 100,
    rarity: 'common',
    category: 'milestone',
  },
  {
    id: 'ai_enthusiast',
    name: 'AI Enthusiast',
    description: 'Active AI user with 10+ conversations',
    requirement: { chatCount: 10 },
    points: 200,
    rarity: 'rare',
    category: 'milestone',
  },
  {
    id: 'conversation_pro',
    name: 'Conversation Pro',
    description: 'Reached 25 AI conversations',
    requirement: { chatCount: 25 },
    points: 350,
    rarity: 'rare',
    category: 'milestone',
  },
  {
    id: 'ai_master',
    name: 'AI Master',
    description: 'Completed 50 conversations',
    requirement: { chatCount: 50 },
    points: 500,
    rarity: 'epic',
    category: 'achievement',
  },
  {
    id: 'dedicated_user',
    name: 'Dedicated User',
    description: 'Reached 100 conversations',
    requirement: { chatCount: 100 },
    points: 1000,
    rarity: 'legendary',
    category: 'achievement',
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Joined during the platform launch period',
    requirement: { special: 'early_adopter' },
    points: 250,
    rarity: 'epic',
    category: 'special',
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Tried multiple different AI agents',
    requirement: { uniqueAgents: 3 },
    points: 150,
    rarity: 'common',
    category: 'exploration',
  },
];

// Level thresholds - points needed to reach each level
const LEVEL_THRESHOLDS = [
  0,      // Level 1: 0 points
  100,    // Level 2: 100 points
  250,    // Level 3: 250 points
  500,    // Level 4: 500 points
  850,    // Level 5: 850 points
  1300,   // Level 6: 1300 points
  1900,   // Level 7: 1900 points
  2700,   // Level 8: 2700 points
  3700,   // Level 9: 3700 points
  5000,   // Level 10: 5000 points
  7000,   // Level 11+: 7000+ points
];

function calculateLevel(totalPoints: number): { level: number; pointsThisLevel: number; pointsToNextLevel: number } {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[level - 1] + 2000;
  
  const pointsThisLevel = totalPoints - currentThreshold;
  const pointsToNextLevel = nextThreshold - totalPoints;
  
  return { level, pointsThisLevel, pointsToNextLevel };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionUser = await getValidSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    // Get user's activity stats
    const [chatCount, uniqueAgentsResult, messageCount] = await Promise.all([
      // Total chat sessions
      prisma.chatSession.count({
        where: { userId: sessionUser.id },
      }),
      // Unique agents used
      prisma.chatSession.findMany({
        where: { userId: sessionUser.id, agentId: { not: null } },
        select: { agentId: true },
        distinct: ['agentId'],
      }),
      // Total messages sent
      prisma.chatMessage.count({
        where: { 
          session: { userId: sessionUser.id },
          role: 'user',
        },
      }),
    ]);

    const uniqueAgentsCount = uniqueAgentsResult.length;
    
    // Check if user is an early adopter (joined before a certain date)
    const isEarlyAdopter = sessionUser.createdAt < new Date('2026-03-01');

    // Calculate earned badges
    const earnedBadges: any[] = [];
    const rewardHistory: any[] = [];
    let totalPoints = 0;

    for (const badge of BADGE_DEFINITIONS) {
      let earned = false;

      if (badge.requirement.chatCount && chatCount >= badge.requirement.chatCount) {
        earned = true;
      }
      if (badge.requirement.uniqueAgents && uniqueAgentsCount >= badge.requirement.uniqueAgents) {
        earned = true;
      }
      if (badge.requirement.special === 'early_adopter' && isEarlyAdopter) {
        earned = true;
      }

      if (earned) {
        earnedBadges.push({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          rarity: badge.rarity,
          category: badge.category,
          points: badge.points,
          earnedAt: sessionUser.createdAt, // Approximate
        });
        
        totalPoints += badge.points;
        
        rewardHistory.push({
          title: `${badge.name} Badge`,
          points: badge.points,
          date: sessionUser.createdAt,
          type: 'badge',
          rarity: badge.rarity,
        });
      }
    }

    // Add activity-based points
    const activityPoints = Math.min(chatCount * 5, 500); // 5 points per chat, max 500
    totalPoints += activityPoints;
    
    if (activityPoints > 0) {
      rewardHistory.push({
        title: 'Chat Activity Bonus',
        points: activityPoints,
        date: new Date(),
        type: 'activity',
      });
    }

    // Calculate level from total points
    const { level, pointsThisLevel, pointsToNextLevel } = calculateLevel(totalPoints);

    // Calculate streak (simplified - based on recent activity)
    const recentActivity = await prisma.chatSession.findFirst({
      where: { userId: sessionUser.id },
      orderBy: { updatedAt: 'desc' },
    });

    const now = new Date();
    const lastActivity = recentActivity?.updatedAt || sessionUser.createdAt;
    const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    const currentStreak = daysSinceActivity <= 1 ? Math.min(chatCount, 30) : 0;

    // Sort reward history by most recent
    rewardHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const rewards = {
      userId: sessionUser.id,
      
      // Level & Points
      currentLevel: level,
      totalPoints,
      availablePoints: totalPoints, // In a real system, this would track spent points separately
      pointsThisLevel,
      pointsToNextLevel,
      
      // Badges
      badges: earnedBadges,
      totalBadgesAvailable: BADGE_DEFINITIONS.length,
      
      // Achievements (future use)
      achievements: [],
      
      // History
      rewardHistory: rewardHistory.slice(0, 10), // Last 10 activities
      
      // Streaks
      streaks: {
        current: currentStreak,
        longest: Math.min(chatCount, 30),
        multiplier: currentStreak >= 7 ? 1.5 : currentStreak >= 3 ? 1.25 : 1.0,
      },
      
      // Statistics
      statistics: {
        totalBadgesEarned: earnedBadges.length,
        totalAchievementsCompleted: 0,
        totalChats: chatCount,
        totalMessages: messageCount,
        uniqueAgentsUsed: uniqueAgentsCount,
        averagePointsPerDay: chatCount > 0 ? Math.ceil(totalPoints / Math.max(1, Math.floor((now.getTime() - sessionUser.createdAt.getTime()) / (1000 * 60 * 60 * 24)))) : 0,
        daysActive: Math.min(chatCount, 30),
        memberSince: sessionUser.createdAt,
      },
      
      // Available rewards (for future reward catalog)
      availableRewards: [
        {
          id: 'discount_10',
          name: '10% Off Subscription',
          description: 'Get 10% off your next subscription',
          cost: 500,
          type: 'discount',
          available: totalPoints >= 500,
        },
        {
          id: 'premium_week',
          name: 'Free Premium Week',
          description: 'Enjoy premium features for a week',
          cost: 1000,
          type: 'feature',
          available: totalPoints >= 1000,
        },
        {
          id: 'exclusive_agent',
          name: 'Exclusive Agent Access',
          description: 'Early access to new AI agents',
          cost: 2000,
          type: 'exclusive',
          available: totalPoints >= 2000,
        },
      ],
    };

    return NextResponse.json({ success: true, data: rewards });
  } catch (error) {
    console.error('Rewards fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
