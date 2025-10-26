/**
 * Gamification Backend API Endpoints
 * Handles persistence and real-time tracking of user achievements, leaderboards, and metrics
 */

import express, { Router, Request, Response } from 'express'

const router = Router()

// In-memory storage (would be replaced with database in production)
// Structure: { userId: userGamificationData }
const gamificationDB: Record<string, any> = {}

/**
 * Authentication middleware (add your actual auth logic)
 */
const authMiddleware = (req: Request, res: Response, next: express.NextFunction) => {
  const userId = req.headers['x-user-id'] as string
  const authToken = req.headers['authorization']?.replace('Bearer ', '')

  if (!userId || !authToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  ;(req as any).userId = userId
  next()
}

// Apply auth to all routes
router.use(authMiddleware)

/**
 * Initialize/Get user gamification profile
 */
router.get('/profile/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    let profile = gamificationDB[userId]

    if (!profile) {
      // Initialize new profile
      profile = {
        userId,
        username: req.headers['x-username'] || `User_${userId}`,
        totalPoints: 0,
        achievements: [],
        unlockedBadges: [],
        leaderboardRank: 0,
        currentStreak: 0,
        masteryScores: {},
        rewards: {
          totalPoints: 0,
          availablePoints: 0,
          spentPoints: 0,
          inventory: [],
          transactions: []
        },
        metrics: {
          totalMessages: 0,
          perfectResponses: 0,
          highScores: 0,
          agentsUsed: [],
          usageByHour: {},
          usageByDay: {},
          completedChallenges: 0,
          currentStreak: 0
        },
        createdAt: new Date(),
        lastUpdated: new Date()
      }
      gamificationDB[userId] = profile
    }

    res.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

/**
 * Update user metrics (called after each interaction)
 */
router.post('/metrics/track', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { event, data } = req.body

    let profile = gamificationDB[userId]

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    // Update metrics based on event type
    switch (event) {
      case 'message-sent':
        profile.metrics.totalMessages += 1
        profile.totalPoints += 10
        profile.rewards.totalPoints += 10
        profile.rewards.availablePoints += 10

        // Track agent usage
        if (data.agentId && !profile.metrics.agentsUsed.includes(data.agentId)) {
          profile.metrics.agentsUsed.push(data.agentId)
        }

        // Track by hour
        const hour = new Date().getHours()
        profile.metrics.usageByHour[hour] = (profile.metrics.usageByHour[hour] || 0) + 1

        // Track by day
        const day = new Date().toISOString().split('T')[0]
        profile.metrics.usageByDay[day] = (profile.metrics.usageByDay[day] || 0) + 1
        break

      case 'perfect-response':
        profile.metrics.perfectResponses += 1
        profile.totalPoints += 50
        profile.rewards.totalPoints += 50
        profile.rewards.availablePoints += 50
        break

      case 'high-score':
        profile.metrics.highScores += 1
        profile.totalPoints += 25
        profile.rewards.totalPoints += 25
        profile.rewards.availablePoints += 25
        break

      case 'challenge-completed':
        profile.metrics.completedChallenges += 1
        profile.totalPoints += data.points || 100
        profile.rewards.totalPoints += data.points || 100
        profile.rewards.availablePoints += data.points || 100
        break

      case 'streak-updated':
        profile.metrics.currentStreak = data.streak
        profile.currentStreak = data.streak

        // Streak bonus: +10 points per day in streak
        profile.totalPoints += data.streak * 10
        profile.rewards.totalPoints += data.streak * 10
        break
    }

    profile.lastUpdated = new Date()

    // Check for new achievements
    const newAchievements = checkAchievements(profile, data)
    if (newAchievements.length > 0) {
      profile.achievements.push(...newAchievements)
      profile.unlockedBadges.push(...newAchievements.map((a: any) => a.id))

      // Add achievement bonus points
      const achievementPoints = newAchievements.reduce((sum: number, a: any) => sum + a.points, 0)
      profile.totalPoints += achievementPoints
      profile.rewards.totalPoints += achievementPoints
      profile.rewards.availablePoints += achievementPoints
    }

    gamificationDB[userId] = profile

    res.json({
      success: true,
      data: {
        totalPoints: profile.totalPoints,
        newAchievements,
        currentStreak: profile.currentStreak,
        rewards: profile.rewards
      }
    })
  } catch (error) {
    console.error('Error tracking metrics:', error)
    res.status(500).json({ error: 'Failed to track metrics' })
  }
})

/**
 * Get leaderboard
 */
router.get('/leaderboard/:category', (req: Request, res: Response) => {
  try {
    const { category } = req.params
    const { limit = 50, offset = 0 } = req.query

    // Build leaderboard from profiles
    const profiles = Object.values(gamificationDB)

    let sorted = [...profiles].sort((a, b) => {
      switch (category) {
        case 'total-points':
          return b.totalPoints - a.totalPoints
        case 'achievements':
          return b.achievements.length - a.achievements.length
        case 'streak':
          return b.currentStreak - a.currentStreak
        case 'messages':
          return b.metrics.totalMessages - a.metrics.totalMessages
        default:
          return b.totalPoints - a.totalPoints
      }
    })

    // Add rank
    sorted = sorted.map((profile, index) => ({
      ...profile,
      rank: index + 1,
      tier: getTier(profile.totalPoints)
    }))

    // Paginate
    const start = parseInt(offset as string) * parseInt(limit as string)
    const end = start + parseInt(limit as string)
    const page = sorted.slice(start, end)

    res.json({
      success: true,
      data: {
        category,
        total: sorted.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        entries: page
      }
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

/**
 * Get daily challenges
 */
router.get('/challenges/today', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const today = new Date().toISOString().split('T')[0]

    let profile = gamificationDB[userId]

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    // Generate challenges for today (would be persistent in real DB)
    const challenges = [
      {
        id: `challenge-1-${today}`,
        name: 'Chat Master',
        description: 'Send 5 messages today',
        difficulty: 'easy',
        points: 50,
        progress: profile.metrics.usageByDay[today] || 0,
        target: 5,
        completed: (profile.metrics.usageByDay[today] || 0) >= 5
      },
      {
        id: `challenge-2-${today}`,
        name: 'Agent Explorer',
        description: 'Use 3 different agents',
        difficulty: 'medium',
        points: 75,
        progress: profile.metrics.agentsUsed.length,
        target: 3,
        completed: profile.metrics.agentsUsed.length >= 3
      },
      {
        id: `challenge-3-${today}`,
        name: 'Quality Seeker',
        description: 'Get 2 perfect responses',
        difficulty: 'hard',
        points: 100,
        progress: profile.metrics.perfectResponses,
        target: 2,
        completed: profile.metrics.perfectResponses >= 2
      }
    ]

    res.json({
      success: true,
      data: { date: today, challenges }
    })
  } catch (error) {
    console.error('Error fetching challenges:', error)
    res.status(500).json({ error: 'Failed to fetch challenges' })
  }
})

/**
 * Complete challenge
 */
router.post('/challenges/complete', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { challengeId, points } = req.body

    let profile = gamificationDB[userId]

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    profile.totalPoints += points
    profile.rewards.totalPoints += points
    profile.rewards.availablePoints += points
    profile.metrics.completedChallenges += 1
    profile.lastUpdated = new Date()

    gamificationDB[userId] = profile

    res.json({
      success: true,
      data: {
        totalPoints: profile.totalPoints,
        completedCount: profile.metrics.completedChallenges,
        rewardsEarned: points
      }
    })
  } catch (error) {
    console.error('Error completing challenge:', error)
    res.status(500).json({ error: 'Failed to complete challenge' })
  }
})

/**
 * Get user achievements
 */
router.get('/achievements', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const profile = gamificationDB[userId]

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    res.json({
      success: true,
      data: {
        unlockedCount: profile.achievements.length,
        achievements: profile.achievements,
        totalPoints: profile.totalPoints
      }
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    res.status(500).json({ error: 'Failed to fetch achievements' })
  }
})

/**
 * Get rewards shop
 */
router.get('/shop/items', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const profile = gamificationDB[userId]

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    const shopItems = [
      { id: 'avatar-1', name: 'Gold Avatar', price: 100, category: 'avatar', owned: false },
      { id: 'avatar-2', name: 'Platinum Avatar', price: 200, category: 'avatar', owned: false },
      { id: 'badge-1', name: 'VIP Badge', price: 150, category: 'badge', owned: false },
      { id: 'theme-1', name: 'Dark Theme Pro', price: 80, category: 'theme', owned: false },
      { id: 'theme-2', name: 'Cosmic Theme', price: 120, category: 'theme', owned: false }
    ]

    res.json({
      success: true,
      data: {
        availablePoints: profile.rewards.availablePoints,
        inventory: profile.rewards.inventory,
        items: shopItems.map(item => ({
          ...item,
          owned: profile.rewards.inventory.includes(item.id)
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching shop items:', error)
    res.status(500).json({ error: 'Failed to fetch shop' })
  }
})

/**
 * Purchase item from shop
 */
router.post('/shop/purchase', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { itemId, price } = req.body

    let profile = gamificationDB[userId]

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    if (profile.rewards.availablePoints < price) {
      return res.status(400).json({ error: 'Insufficient points' })
    }

    // Process purchase
    profile.rewards.availablePoints -= price
    profile.rewards.spentPoints += price
    profile.rewards.inventory.push(itemId)
    profile.rewards.transactions.push({
      id: `txn-${Date.now()}`,
      type: 'purchase',
      itemId,
      amount: price,
      timestamp: new Date()
    })

    gamificationDB[userId] = profile

    res.json({
      success: true,
      data: {
        itemId,
        availablePoints: profile.rewards.availablePoints,
        inventory: profile.rewards.inventory
      }
    })
  } catch (error) {
    console.error('Error purchasing item:', error)
    res.status(500).json({ error: 'Failed to purchase item' })
  }
})

/**
 * Get user mastery levels
 */
router.get('/mastery', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const profile = gamificationDB[userId]

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    res.json({
      success: true,
      data: {
        masteryScores: profile.metrics.agentsUsed.reduce(
          (acc: Record<string, number>, agentId: string) => {
            const count = profile.metrics.agentsUsed.filter((a: string) => a === agentId).length
            acc[agentId] = Math.min(Math.floor(count / 10), 5)
            return acc
          },
          {}
        ),
        totalMastery: profile.metrics.agentsUsed.length * 10
      }
    })
  } catch (error) {
    console.error('Error fetching mastery:', error)
    res.status(500).json({ error: 'Failed to fetch mastery' })
  }
})

/**
 * Helper function to determine tier
 */
function getTier(points: number): string {
  if (points < 1000) return 'bronze'
  if (points < 5000) return 'silver'
  if (points < 15000) return 'gold'
  if (points < 50000) return 'platinum'
  return 'diamond'
}

/**
 * Helper function to check for new achievements
 */
function checkAchievements(profile: any, data: any): any[] {
  const newAchievements = []
  const alreadyUnlocked = profile.achievements.map((a: any) => a.id)

  // Check: First agent used
  if (profile.metrics.totalMessages === 1 && !alreadyUnlocked.includes('first-agent')) {
    newAchievements.push({
      id: 'first-agent',
      name: 'Agent Whisperer',
      description: 'Use your first AI agent',
      points: 10,
      rarity: 'common',
      unlockedAt: new Date()
    })
  }

  // Check: 100 messages
  if (
    profile.metrics.totalMessages >= 100 &&
    !alreadyUnlocked.includes('explore-100-messages')
  ) {
    newAchievements.push({
      id: 'explore-100-messages',
      name: 'Conversationalist',
      description: 'Send 100 messages',
      points: 25,
      rarity: 'uncommon',
      unlockedAt: new Date()
    })
  }

  // Check: All agents tried
  if (
    profile.metrics.agentsUsed.length === 18 &&
    !alreadyUnlocked.includes('all-agents-tried')
  ) {
    newAchievements.push({
      id: 'all-agents-tried',
      name: 'Agent Collector',
      description: 'Try all 18 AI agents',
      points: 50,
      rarity: 'rare',
      unlockedAt: new Date()
    })
  }

  // Check: 7-day streak
  if (profile.currentStreak >= 7 && !alreadyUnlocked.includes('week-warrior')) {
    newAchievements.push({
      id: 'week-warrior',
      name: 'Week Warrior',
      description: 'Maintain 7-day usage streak',
      points: 40,
      rarity: 'uncommon',
      unlockedAt: new Date()
    })
  }

  // Check: 10 perfect responses
  if (
    profile.metrics.perfectResponses >= 10 &&
    !alreadyUnlocked.includes('perfectionist')
  ) {
    newAchievements.push({
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Get 10 perfect responses',
      points: 75,
      rarity: 'rare',
      unlockedAt: new Date()
    })
  }

  return newAchievements
}

export default router
