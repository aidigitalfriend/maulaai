import { MongoClient, ObjectId } from 'mongodb'

let dashboardDbClient = null
let dashboardDb = null

async function getDashboardDb() {
  if (dashboardDb) {
    return dashboardDb
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined')
  }

  dashboardDbClient = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000
  })

  await dashboardDbClient.connect()
  dashboardDb = dashboardDbClient.db(process.env.MONGODB_DB || undefined)
  return dashboardDb
}

function sanitizeUser(userDoc) {
  if (!userDoc) return null
  const {
    _id,
    email,
    name,
    image,
    role,
    lastLoginAt,
    createdAt,
    updatedAt,
    emailVerified
  } = userDoc

  return {
    id: _id?.toString(),
    email,
    name,
    image,
    role,
    lastLoginAt,
    createdAt,
    updatedAt,
    emailVerified: !!emailVerified
  }
}

function buildSecuritySummary(user, preferences, profile) {
  const twoFactor = preferences?.security?.authentication?.twoFactor
  const sessionManagement = preferences?.security?.authentication?.sessionManagement
  const monitoring = preferences?.security?.monitoring

  return {
    emailVerified: !!user?.emailVerified,
    twoFactorEnabled: twoFactor?.enabled ?? false,
    twoFactorMethod: twoFactor?.method ?? 'app',
    backupCodes: twoFactor?.backupCodes ?? false,
    lastLoginAt: user?.lastLoginAt || profile?.status?.lastActive,
    lastLoginIp: profile?.analytics?.lastLoginIP,
    loginAlerts: monitoring?.loginAlerts ?? true,
    suspiciousActivityAlerts: monitoring?.suspiciousActivity ?? true,
    activeSessionsEstimate: profile?.stats?.totalLogins ?? 0,
    sessionTimeoutMinutes: sessionManagement?.sessionTimeout ?? 30,
    rememberDevice: sessionManagement?.rememberDevice ?? false
  }
}

function mapActivity(activity) {
  if (!activity) return null
  return {
    id: activity.activityId || activity._id?.toString(),
    type: activity.type,
    category: activity.category,
    target: activity.details?.target,
    page: activity.details?.page?.path,
    occurredAt: activity.timing?.occurredAt,
    engagementScore: activity.analytics?.engagementScore,
    valueScore: activity.analytics?.valueScore
  }
}

function mapUserEvent(eventDoc) {
  if (!eventDoc) return null
  return {
    id: eventDoc._id?.toString(),
    eventType: eventDoc.eventType,
    category: eventDoc.category,
    action: eventDoc.action,
    label: eventDoc.label,
    value: eventDoc.value,
    occurredAt: eventDoc.occurredAt,
    metadata: eventDoc.metadata
  }
}

export function setupUserDashboardRoutes(app) {
  app.get('/api/users/:userId/dashboard', async (req, res) => {
    try {
      if (!process.env.MONGODB_URI) {
        return res.status(500).json({ success: false, error: 'MONGODB_URI is not configured' })
      }

      const db = await getDashboardDb()
      const users = db.collection('users')
      const profiles = db.collection('userprofiles')
      const preferences = db.collection('userpreferences')
      const activities = db.collection('useractivities')
      const events = db.collection('userevents')

      const { email } = req.query
      const rawUserId = req.params.userId

      let userQuery
      if (email) {
        userQuery = { email: String(email).toLowerCase() }
      } else if (ObjectId.isValid(rawUserId)) {
        userQuery = { _id: new ObjectId(rawUserId) }
      } else {
        return res.status(400).json({ success: false, error: 'Provide a valid userId or email' })
      }

      const userDoc = await users.findOne(userQuery)
      if (!userDoc) {
        return res.status(404).json({ success: false, error: 'User not found' })
      }

      const userId = userDoc._id
      const [profileDoc, preferenceDoc, recentActivities, recentEvents] = await Promise.all([
        profiles.findOne({ userId }),
        preferences.findOne({ userId }),
        activities.find({ userId }).sort({ 'timing.occurredAt': -1 }).limit(10).toArray(),
        events.find({ userId }).sort({ occurredAt: -1 }).limit(5).toArray()
      ])

      const activityFeed = recentActivities.map(mapActivity).filter(Boolean)
      const userEvents = recentEvents.map(mapUserEvent).filter(Boolean)

      const dashboardStats = {
        totalLogins: profileDoc?.stats?.totalLogins ?? 0,
        totalAgentChats: profileDoc?.stats?.totalAgentChats ?? 0,
        totalExperiments: profileDoc?.stats?.totalExperiments ?? 0,
        totalCommunityPosts: profileDoc?.stats?.totalCommunityPosts ?? 0,
        streakDays: profileDoc?.stats?.streakDays ?? 0,
        longestStreak: profileDoc?.stats?.longestStreak ?? 0
      }

      const layout = preferenceDoc?.interface?.layout?.dashboard
      const avatarUrl = profileDoc?.avatar?.url || userDoc.image || null

      const response = {
        user: sanitizeUser(userDoc),
        profile: {
          displayName: profileDoc?.personalInfo?.displayName || userDoc.name || userDoc.email,
          title: profileDoc?.personalInfo?.title || profileDoc?.professional?.jobTitle,
          bio: profileDoc?.personalInfo?.bio,
          location: profileDoc?.personalInfo?.location,
          avatar: avatarUrl,
          coverImage: profileDoc?.coverImage?.url,
          status: profileDoc?.status,
          subscription: profileDoc?.subscription,
          stats: dashboardStats
        },
        preferences: {
          theme: preferenceDoc?.interface?.theme?.mode || 'auto',
          colorScheme: preferenceDoc?.interface?.theme?.colorScheme || 'blue',
          language: preferenceDoc?.general?.language?.primary || 'en',
          dateFormat: preferenceDoc?.general?.language?.dateFormat || 'MM/DD/YYYY',
          dashboardLayout: layout?.layout || 'grid',
          widgets: layout?.widgets || []
        },
        security: buildSecuritySummary(userDoc, preferenceDoc, profileDoc),
        dashboard: {
          avatar: avatarUrl,
          headline: profileDoc?.personalInfo?.title || 'Realtime AI Operator',
          highlights: {
            plan: profileDoc?.subscription?.plan || 'monthly-agent',
            lastActive: profileDoc?.status?.lastActive || userDoc.updatedAt,
            nextBillingDate: profileDoc?.subscription?.nextBillingDate
          },
          widgets: layout?.widgets || [],
          activityFeed,
          events: userEvents
        }
      }

      return res.json({ success: true, data: response })
    } catch (error) {
      console.error('[user-dashboard] Failed to build user dashboard', error)
      return res.status(500).json({ success: false, error: 'Failed to load user dashboard' })
    }
  })
}
