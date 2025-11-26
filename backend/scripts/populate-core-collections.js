import mongoose from 'mongoose'
import dotenv from 'dotenv'

import Agent from '../models/Agent.ts'
import ApiUsage from '../models/ApiUsage.ts'
import Billing from '../models/Billing.ts'
import ChatInteraction from '../models/ChatInteraction.ts'
import CommunityEvent from '../models/CommunityEvent.ts'
import CommunityGroup from '../models/CommunityGroup.ts'
import CommunityMembership from '../models/CommunityMembership.ts'
import PageView from '../models/PageView.ts'
import Plan from '../models/Plan.ts'
import Subscription from '../models/Subscription.ts'
import ToolUsage from '../models/ToolUsage.ts'
import User from '../models/User.ts'
import UserActivity from '../models/UserActivity.ts'
import UserEvent from '../models/UserEvent.ts'
import UserPreferences from '../models/UserPreferences.ts'
import UserProfile from '../models/UserProfile.ts'
import Visitor from '../models/Visitor.ts'

dotenv.config()

const LOG_PREFIX = '[populate-core-collections]'

async function ensureConnection() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  })
}

async function ensureUser() {
  const email = 'founder@onelastai.com'
  let user = await User.findOne({ email })
  if (!user) {
    user = await User.create({
      email,
      name: 'Onelast AI Admin',
      password: 'ChangeMe123!'
    })
  }
  return user
}

async function ensureAgent(userId) {
  let agent = await Agent.findOne({ agentId: 'agent-general-ai-advisor' })
  if (!agent) {
    agent = await Agent.create({
      agentId: 'agent-general-ai-advisor',
      name: 'General AI Advisor',
      description: 'Unified agent for strategic and operational assistance',
      category: 'assistant',
      prompt: 'You are a strategic AI advisor helping teams prioritize work, monitor metrics, and summarize progress with clarity.',
      aiModel: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1200,
      isActive: true,
      isPublic: true,
      isPremium: false,
      pricing: {
        daily: 100,
        weekly: 500,
        monthly: 1900
      },
      features: ['Realtime insights', 'Agent orchestration', 'Daily recaps'],
      tags: ['advisor', 'operations', 'automation'],
      capabilities: ['summaries', 'alerts', 'reporting'],
      limitations: ['Does not modify infrastructure'],
      examples: [{
        input: 'Summarize today\'s alerts and flag blockers',
        output: 'All APIs healthy. Payment latency +12% vs baseline. Suggested follow-up with infra.'
      }],
      config: {
        personality: 'calm',
        tone: 'professional'
      },
      stats: {
        totalInteractions: 12,
        totalUsers: 3,
        averageRating: 4.9,
        totalRatings: 7
      },
      creator: userId.toString(),
      version: '1.0.0'
    })
  }
  return agent
}

async function ensurePlans(createdBy) {
  const plans = [
    { key: 'daily-agent', name: 'Daily Agent Access', amount: 100, interval: 'day', description: '$1 per day per agent' },
    { key: 'weekly-agent', name: 'Weekly Agent Access', amount: 500, interval: 'week', description: '$5 per week per agent' },
    { key: 'monthly-agent', name: 'Monthly Agent Access', amount: 1900, interval: 'month', description: '$19 per month per agent' }
  ]

  const created = []

  for (const plan of plans) {
    let record = await Plan.findOne({ slug: plan.key })
    if (!record) {
      record = await Plan.create({
        name: plan.name,
        slug: plan.key,
        description: plan.description,
        shortDescription: plan.description,
        type: 'basic',
        category: 'individual',
        createdBy: createdBy.toString(),
        pricing: {
          amount: plan.amount,
          currency: 'USD',
          interval: plan.interval,
          intervalCount: 1
        },
        limits: {
          aiModels: { total: 1, concurrent: 1, monthlyQueries: 1000, customModels: false },
          users: { total: 1, teamMembers: 0, administrators: 1 },
          storage: { totalGB: 1, fileUploadMB: 25, backupRetentionDays: 7 },
          api: { requestsPerMonth: 5000, requestsPerMinute: 30, webhooks: 0, integrations: 1 },
          community: { groups: 0, events: 0, moderators: 0, customBranding: false },
          analytics: { historyDays: 30, customReports: false, exportData: true, realTimeData: true },
          support: { level: 'email', responseTimeHours: 24, phone: false, onboarding: false }
        },
        features: {
          dashboard: true,
          analytics: true,
          reporting: true,
          aiLab: true,
          voiceCloning: false,
          imageGeneration: true,
          textAnalysis: true,
          chatbots: true,
          teamWorkspaces: false,
          sharedProjects: false,
          commenting: false,
          realTimeEdit: false,
          apiAccess: true,
          webhooks: false,
          sso: false,
          ldap: false,
          twoFactorAuth: true
        },
        isActive: true,
        isPublic: true,
        displayOrder: 1
      })
    }
    created.push(record)
  }

  return created
}

async function ensureSubscription({ userId, agentId, planId }) {
  let subscription = await Subscription.findOne({ user: userId, agent: agentId })
  if (!subscription) {
    subscription = await Subscription.create({
      user: userId,
      plan: planId,
      agentId: agentId.toString(),
      agentName: 'General AI Advisor',
      subscriptionId: 'sub_seed_core',
      stripeSubscriptionId: 'sub_seed_core',
      stripeCustomerId: `cust_${userId.toString()}`,
      status: 'active',
      billing: {
        interval: 'month',
        intervalCount: 1,
        amount: 1900,
        currency: 'USD',
        startDate: new Date(),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
  }
  return subscription
}

async function seedIfEmpty(model, query, payload) {
  const existing = await model.findOne(query)
  if (existing) {
    return { skipped: true, document: existing }
  }
  const document = await model.create(payload)
  return { skipped: false, document }
}

async function seedCollections({ user, agent, plan, subscription }) {
  if (!plan) {
    throw new Error('Plan document is required to seed billing and community collections')
  }

  if (!subscription) {
    throw new Error('Subscription document is required to seed billing and community collections')
  }

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const planAmount = plan?.pricing?.amount ?? 1900
  const planCurrency = plan?.pricing?.currency ?? 'USD'
  const usagePercentage = Math.round((620 / 1000) * 100)
  const billingCohortMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  const billingCohortQuarter = `Q${Math.ceil((now.getUTCMonth() + 1) / 3)}`

  const seeds = [
    {
      name: 'apiusages',
      model: ApiUsage,
      query: { 'request.traceId': 'seed-trace-core' },
      payload: {
        userId: user._id,
        agentId: agent._id,
        subscriptionId: subscription?._id,
        endpoint: '/api/agents/respond',
        method: 'POST',
        tokens: { prompt: 120, completion: 240, total: 360 },
        latencyMs: 1420,
        costUsd: 0.0021,
        success: true,
        statusCode: 200,
        request: {
          traceId: 'seed-trace-core',
          model: 'gpt-4o-mini',
          temperature: 0.2,
          bodySummary: 'Daily standup synthesis prompt'
        },
        response: {
          provider: 'openai',
          finishReason: 'stop',
          outputSummary: 'Summary with blockers'
        },
        metadata: {
          ipAddress: '52.10.10.10',
          region: 'us-west-2',
          client: 'automation',
          tags: ['seed', 'metrics']
        },
        occurredAt: now
      }
    },
    {
      name: 'chatinteractions',
      model: ChatInteraction,
      query: { conversationId: 'seed-conversation-core' },
      payload: {
        conversationId: 'seed-conversation-core',
        userId: user._id,
        agentId: agent._id,
        channel: 'web',
        language: 'en',
        messages: [
          { role: 'user', content: 'Summarize today\'s production alerts', createdAt: now },
          { role: 'assistant', content: 'All services healthy. One retry spike observed.', createdAt: now }
        ],
        metrics: { totalTokens: 220, durationMs: 3200, turnCount: 2 },
        status: 'closed',
        metadata: { tags: ['observability'], priority: 'medium' },
        startedAt: now,
        closedAt: now
      }
    },
    {
      name: 'pageviews',
      model: PageView,
      query: { path: '/dashboard/realtime', occurredAt: { $gte: new Date(now.getTime() - 3600 * 1000) } },
      payload: {
        userId: user._id,
        path: '/dashboard/realtime',
        title: 'Realtime Overview',
        referrer: 'direct',
        device: { type: 'desktop', os: 'macOS', browser: 'Arc' },
        geo: { country: 'US', region: 'California', city: 'San Francisco' },
        performance: {
          loadTimeMs: 820,
          domInteractiveMs: 540,
          firstContentfulPaintMs: 420
        },
        engagement: {
          timeOnPageMs: 185000,
          scrollDepth: 95,
          interactions: 24,
          bounced: false
        },
        experiments: [{ key: 'pricing-banner', variant: 'B' }],
        occurredAt: now
      }
    },
    {
      name: 'toolusages',
      model: ToolUsage,
      query: { toolName: 'knowledge_search', occurredAt: { $gte: new Date(now.getTime() - 3600 * 1000) } },
      payload: {
        toolName: 'knowledge_search',
        version: '2025.11.01',
        userId: user._id,
        agentId: agent._id,
        command: 'searchDocs',
        arguments: { query: 'pricing change log' },
        inputPreview: 'Find recent pricing changes',
        outputPreview: 'Located 3 new pricing notes',
        tokens: { input: 85, output: 60 },
        latencyMs: 640,
        status: 'completed',
        metadata: { integration: 'internal-docs', environment: 'production' },
        occurredAt: now
      }
    },
    {
      name: 'userevents',
      model: UserEvent,
      query: { eventType: 'dashboard_viewed', occurredAt: { $gte: new Date(now.getTime() - 3600 * 1000) } },
      payload: {
        userId: user._id,
        sessionId: undefined,
        visitorId: undefined,
        eventType: 'dashboard_viewed',
        category: 'engagement',
        action: 'view',
        label: 'realtime-dashboard',
        value: 1,
        properties: { widgets: 8, filters: ['region:global'] },
        metrics: { durationMs: 185000, success: true },
        source: 'web',
        occurredAt: now,
        metadata: {
          tags: ['seed', 'observability'],
          featureFlag: 'realtime_dashboard_v2'
        }
      }
    },
    {
      name: 'visitors',
      model: Visitor,
      query: { visitorId: 'seed-visitor-core' },
      payload: {
        visitorId: 'seed-visitor-core',
        firstSeenAt: new Date(now.getTime() - 7 * 24 * 3600 * 1000),
        lastSeenAt: now,
        sessionCount: 5,
        pageViews: 28,
        converted: true,
        location: {
          country: 'US',
          region: 'New York',
          city: 'Brooklyn',
          timezone: 'America/New_York'
        },
        device: {
          type: 'desktop',
          os: 'macOS',
          browser: 'Chrome'
        },
        trafficSource: {
          source: 'linkedin',
          medium: 'social',
          campaign: 'launch-week'
        },
        consent: {
          marketing: true,
          analytics: true,
          personalization: true,
          updatedAt: now
        },
        attributes: {
          tags: ['customer', 'beta'],
          interests: ['ai_assistants', 'automation'],
          score: 82
        }
      }
    },
    {
      name: 'userprofiles',
      model: UserProfile,
      query: { userId: user._id },
      payload: {
        userId: user._id,
        personalInfo: {
          firstName: 'Onelast',
          lastName: 'Admin',
          displayName: 'AI Ops Admin',
          title: 'Head of AI Operations',
          bio: 'Owns rollout readiness, realtime dashboards, and security settings.',
          pronouns: 'they/them',
          location: {
            city: 'San Francisco',
            state: 'CA',
            country: 'USA',
            timezone: 'America/Los_Angeles'
          },
          languages: ['en'],
          website: 'https://onelast.ai'
        },
        avatar: {
          url: 'https://onelast.ai/static/avatars/admin.png',
          filename: 'admin.png',
          size: 12048,
          uploadedAt: now
        },
        coverImage: {
          url: 'https://onelast.ai/static/cover/realtime.jpg',
          filename: 'realtime.jpg',
          size: 48290,
          uploadedAt: now
        },
        professional: {
          company: 'Onelast AI',
          jobTitle: 'Head of AI Ops',
          industry: 'Artificial Intelligence',
          experience: '5-10',
          skills: ['ai_ops', 'observability', 'security'],
          interests: ['dashboards', 'automation', 'community'],
          education: [{
            institution: 'Realtime Institute',
            degree: 'MS',
            field: 'AI Systems',
            startYear: 2015,
            endYear: 2017
          }]
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          emailFrequency: 'daily'
        },
        privacy: {
          profileVisibility: 'members',
          showEmail: false,
          showLocation: true,
          showActivity: true,
          allowDirectMessages: true,
          allowMentions: true,
          searchable: true
        },
        status: {
          isActive: true,
          isVerified: true,
          isPremium: true,
          isBeta: true,
          lastActive: now,
          joinedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
        },
        stats: {
          totalLogins: 182,
          totalExperiments: 64,
          totalAgentChats: 341,
          totalCommunityPosts: 23,
          favoriteAgents: ['general-ai-advisor'],
          streakDays: 11,
          longestStreak: 21,
          lastStreakDate: now
        },
        achievements: [{
          id: 'realtime-ready',
          name: 'Realtime Ready',
          description: 'Completed realtime dashboard setup.',
          iconUrl: 'https://onelast.ai/static/icons/realtime.svg',
          category: 'innovation',
          unlockedAt: now
        }],
        subscription: {
          plan: 'monthly-agent',
          status: 'active',
          startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          autoRenew: true,
          paymentMethod: 'visa-4242',
          nextBillingDate: periodEnd
        },
        analytics: {
          lastLoginIP: '34.121.40.210',
          lastLoginUserAgent: 'Arc/1.74.0',
          loginHistory: [{
            ip: '34.121.40.210',
            userAgent: 'Arc/1.74.0',
            location: 'San Francisco, US',
            timestamp: now
          }],
          deviceInfo: {
            primaryDevice: 'MacBook Pro',
            browserPreference: 'Arc',
            mobileApp: false
          }
        }
      }
    },
    {
      name: 'userpreferences',
      model: UserPreferences,
      query: { userId: user._id },
      payload: {
        userId: user._id,
        general: {
          language: { primary: 'en', region: 'US' },
          timezone: { name: 'America/Los_Angeles', offset: -480, autoDetect: true },
          currency: { primary: 'USD' }
        },
        interface: {
          theme: {
            mode: 'dark',
            colorScheme: 'blue',
            highContrast: false,
            reducedMotion: false
          },
          layout: {
            sidebar: { position: 'left', collapsed: false, pinned: true },
            density: 'comfortable',
            dashboard: {
              layout: 'grid',
              autoRefresh: true,
              refreshInterval: 120,
              widgets: [
                {
                  widgetId: 'profile-card',
                  position: { x: 0, y: 0, width: 4, height: 2 },
                  visible: true,
                  settings: { showAvatar: true, showStats: true }
                },
                {
                  widgetId: 'security-center',
                  position: { x: 4, y: 0, width: 4, height: 2 },
                  visible: true,
                  settings: { show2FA: true, showSessions: true }
                },
                {
                  widgetId: 'activity-feed',
                  position: { x: 0, y: 2, width: 8, height: 3 },
                  visible: true,
                  settings: { limit: 6 }
                }
              ]
            }
          }
        },
        privacy: {
          dataCollection: { analytics: true, cookies: true, tracking: false },
          profileVisibility: { profile: 'members', email: 'private', activity: 'friends', location: 'private' },
          searchability: { findByEmail: false, suggestions: true }
        },
        communications: {
          email: {
            enabled: true,
            notifications: {
              account: true,
              security: true,
              product: true,
              marketing: false,
              newsletter: true,
              tips: true
            },
            frequency: 'daily'
          },
          push: {
            enabled: true,
            notifications: { messages: true, updates: true, reminders: true, social: true }
          }
        },
        ai: {
          features: { recommendations: true, autoComplete: true, smartSearch: true },
          personalization: { level: 'enhanced', dataUsage: { browsing: true, purchases: true } },
          models: { textGeneration: 'gpt-4', imageGeneration: 'dall-e-3', creativity: 0.5, safety: 0.9 }
        },
        security: {
          authentication: {
            twoFactor: { enabled: true, method: 'app', backupCodes: true },
            sessionManagement: { rememberDevice: true, sessionTimeout: 45, concurrentSessions: 5 }
          },
          monitoring: {
            loginAlerts: true,
            suspiciousActivity: true,
            alertMethods: [{ type: 'email', enabled: true }, { type: 'push', enabled: true }]
          }
        },
        metadata: {
          version: 2,
          lastUpdated: now,
          backup: { lastBackup: now, cloudSync: true }
        }
      }
    },
    {
      name: 'useractivities-login',
      model: UserActivity,
      query: { activityId: 'act_seed_login' },
      payload: {
        activityId: 'act_seed_login',
        userId: user._id,
        type: 'login',
        category: 'system',
        details: {
          target: '/login',
          targetType: 'page',
          page: {
            url: 'https://dashboard.onelast.ai/login',
            path: '/login',
            title: 'Login',
            referrer: 'direct'
          }
        },
        technical: {
          userAgent: 'Arc/1.74.0',
          browser: 'Arc',
          os: 'macOS 15',
          device: 'Desktop',
          ipAddress: '34.121.40.210',
          location: {
            country: 'US',
            city: 'San Francisco',
            timezone: 'America/Los_Angeles'
          }
        },
        timing: {
          occurredAt: now,
          duration: 1200,
          timeOnPage: 800,
          sessionTime: 1200
        },
        context: {
          userState: {
            authenticated: true,
            subscriptionStatus: 'active',
            accountAge: 45,
            lifetimeValue: 1900,
            language: 'en',
            theme: 'dark'
          },
          appState: {
            version: '1.14.0',
            feature: 'auth',
            mode: 'dark'
          }
        },
        analytics: {
          engagementScore: 20,
          valueScore: 5,
          intent: { predicted: 'browse', confidence: 0.8 },
          conversion: { isConversion: false }
        },
        privacy: {
          containsPII: false,
          processingConsent: true
        }
      }
    },
    {
      name: 'useractivities-dashboard',
      model: UserActivity,
      query: { activityId: 'act_seed_dashboard_view' },
      payload: {
        activityId: 'act_seed_dashboard_view',
        userId: user._id,
        type: 'page_view',
        category: 'engagement',
        details: {
          target: '/dashboard',
          targetType: 'page',
          action: 'view',
          page: {
            url: 'https://dashboard.onelast.ai/app',
            path: '/dashboard',
            title: 'User Dashboard',
            tags: ['user-dashboard', 'security'],
            loadTime: 880
          },
          content: {
            id: 'user-dashboard',
            type: 'dashboard',
            title: 'Realtime AI Ops Dashboard',
            engagementScore: 72,
            timeSpent: 240000,
            scrollDepth: 80
          }
        },
        technical: {
          userAgent: 'Arc/1.74.0',
          browser: 'Arc',
          os: 'macOS 15',
          device: 'Desktop',
          ipAddress: '34.121.40.210',
          location: {
            country: 'US',
            city: 'San Francisco',
            timezone: 'America/Los_Angeles'
          }
        },
        timing: {
          occurredAt: new Date(now.getTime() - 5 * 60 * 1000),
          duration: 300000,
          timeOnPage: 300000,
          sessionTime: 305000
        },
        context: {
          userState: {
            authenticated: true,
            subscriptionStatus: 'active',
            accountAge: 45,
            language: 'en',
            theme: 'dark'
          },
          appState: {
            version: '1.14.0',
            feature: 'dashboard',
            mode: 'dark',
            featureFlags: [{ flag: 'new_user_dashboard', enabled: true }]
          }
        },
        analytics: {
          engagementScore: 78,
          valueScore: 18,
          intent: { predicted: 'research', confidence: 0.76 },
          conversion: { isConversion: false }
        },
        privacy: {
          containsPII: false,
          processingConsent: true
        }
      }
    },
    {
      name: 'billings',
      model: Billing,
      query: { billingId: 'bill_seed_core' },
      payload: {
        billingId: 'bill_seed_core',
        user: user._id,
        subscription: subscription._id,
        plan: plan._id,
        billingPeriod: {
          start: now,
          end: periodEnd,
          duration: 'monthly',
          periodNumber: 1,
          isPartial: false
        },
        status: 'completed',
        financial: {
          baseAmount: planAmount,
          usageCharges: 0,
          addOnCharges: 0,
          overageCharges: 0,
          setupFees: 0,
          subtotal: planAmount,
          discounts: {
            couponDiscount: 0,
            promotionalDiscount: 0,
            loyaltyDiscount: 0,
            volumeDiscount: 0,
            total: 0
          },
          tax: {
            rate: 0,
            amount: 0,
            type: 'exempt',
            jurisdiction: {
              country: 'US',
              state: 'CA',
              city: 'San Francisco'
            },
            exemption: {
              isExempt: true,
              reason: 'seed_data',
              certificate: 'seed'
            }
          },
          totalAmount: planAmount,
          amountDue: planAmount,
          amountPaid: planAmount,
          balance: 0,
          currency: planCurrency
        },
        usage: {
          metrics: [{
            name: 'api_calls',
            displayName: 'Agent API Calls',
            unit: 'calls',
            quantity: 620,
            includedQuantity: 1000,
            overageQuantity: 0,
            unitPrice: 0,
            overagePrice: 0,
            totalCharge: 0,
            dailyUsage: [
              { date: now, quantity: 180 },
              { date: yesterday, quantity: 220 }
            ],
            peakUsage: { quantity: 220, date: yesterday }
          }],
          totalUnits: 620,
          totalOverage: 0,
          usagePercentage
        },
        lineItems: [{
          type: 'subscription',
          description: 'Monthly AI Agent Access',
          quantity: 1,
          unitPrice: planAmount,
          amount: planAmount,
          planId: plan._id,
          periodStart: now,
          periodEnd: periodEnd
        }],
        payment: {
          attempts: [{
            attemptNumber: 1,
            status: 'success',
            attemptedAmount: planAmount,
            processedAmount: planAmount,
            attemptedAt: now,
            completedAt: now,
            processorResponse: {
              transactionId: 'txn_seed_core',
              status: 'success'
            }
          }],
          currentAttempt: 1,
          maxAttempts: 3,
          dueDate: now,
          paidAt: now
        },
        credits: [],
        events: [
          {
            type: 'created',
            description: 'Seed billing period generated',
            triggeredBy: 'system',
            data: { seed: true }
          },
          {
            type: 'payment_succeeded',
            description: 'Seed payment marked successful',
            triggeredBy: 'system',
            data: { amount: planAmount }
          }
        ],
        invoice: {
          generated: true,
          generatedAt: now,
          delivered: true,
          deliveredAt: now,
          deliveryMethod: 'email',
          autoGenerate: true
        },
        analytics: {
          mrr: planAmount,
          arr: planAmount * 12,
          isFirstBill: true,
          cohort: {
            month: billingCohortMonth,
            year: now.getUTCFullYear(),
            quarter: billingCohortQuarter
          },
          attribution: {
            source: 'seed',
            medium: 'script',
            campaign: 'core-metrics'
          }
        },
        integrations: {
          analytics: {
            segment: {
              eventId: 'billing-seed-segment',
              tracked: true
            }
          }
        },
        metadata: {
          tags: ['seed', 'billing'],
          notes: 'Auto-generated to unblock dashboards'
        },
        internalNotes: 'Populated via populate-core-collections script.'
      }
    }
  ]

  const results = []
  for (const seed of seeds) {
    const result = await seedIfEmpty(seed.model, seed.query, seed.payload)
    results.push({ name: seed.name, skipped: result.skipped })
  }

  const communityResults = await seedCommunityData({ user })
  results.push(...communityResults)

  return results
}

async function seedCommunityData({ user }) {
  if (!user) {
    throw new Error('User document is required to seed community collections')
  }

  const now = new Date()
  const eventStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000)
  const results = []

  const communityGroupSeed = await seedIfEmpty(
    CommunityGroup,
    { slug: 'ai-ops-collective' },
    {
      name: 'AI Operations Collective',
      slug: 'ai-ops-collective',
      description: 'Realtime command center for tracking agent health, community wins, and rollout notes.',
      longDescription: 'Seed community used to unblock dashboards that expect active groups, events, and memberships.',
      creator: user._id,
      admins: [{
        userId: user._id,
        role: 'owner',
        permissions: ['manage_group', 'manage_members', 'view_analytics'],
        assignedBy: user._id,
        assignedAt: now
      }],
      category: 'general',
      tags: ['ai', 'operations', 'community'],
      membership: {
        totalMembers: 1,
        activeMembers: 1,
        maxMembers: 5000,
        autoApprove: true,
        requireApplication: false,
        inviteOnly: false,
        memberCanInvite: true,
        maxInvitesPerMember: 10,
        isPremium: false,
        subscriptionRequired: false,
        verified: true,
        verifiedAt: now,
        verificationBadge: 'founders'
      },
      rules: {
        whoCanPost: 'members',
        whoCanComment: 'members',
        contentRules: [{
          title: 'Share actionable updates',
          description: 'Keep threads focused on incidents, learnings, and daily recaps.',
          severity: 'info'
        }],
        moderation: {
          autoModeration: true,
          requireApproval: false,
          spamFilter: true,
          profanityFilter: true,
          blockedWords: [],
          allowedDomains: [],
          maxLinksPerPost: 3
        },
        rateLimits: {
          postsPerHour: 10,
          commentsPerHour: 50,
          reactionsPerHour: 100
        }
      },
      features: {
        discussions: true,
        events: true,
        fileSharing: true,
        polls: true,
        livestreams: true,
        videoConferencing: false,
        collaborativeTools: false,
        projectManagement: false,
        aiAssistant: true,
        smartRecommendations: true,
        contentAnalysis: false,
        badges: true,
        leaderboards: true,
        achievements: true,
        points: true
      },
      activity: {
        postsToday: 1,
        postsThisWeek: 3,
        postsThisMonth: 9,
        commentsToday: 2,
        commentsThisWeek: 6,
        commentsThisMonth: 15,
        newMembersToday: 1,
        newMembersThisWeek: 2,
        newMembersThisMonth: 4,
        totalPosts: 9,
        totalComments: 15,
        totalReactions: 32,
        totalViews: 420,
        averageRating: 4.8,
        satisfactionScore: 92,
        lastPostAt: now,
        lastCommentAt: now,
        lastActivityAt: now
      },
      visibility: {
        searchable: true,
        showInDirectory: true,
        allowDiscovery: true,
        seoTitle: 'AI Operations Collective',
        seoDescription: 'Realtime AI agent operations community',
        seoKeywords: ['ai', 'ops', 'community'],
        socialPreview: {
          title: 'AI Ops Collective',
          description: 'Join daily syncs, health reviews, and launch planning.'
        }
      },
      analytics: {
        engagementRate: 62,
        retentionRate: 88,
        churnRate: 4,
        trendingTopics: [{ topic: 'agent-routing', mentions: 7, growth: 0.32 }]
      }
    }
  )
  results.push({ name: 'communitygroups', skipped: communityGroupSeed.skipped })
  const communityGroup = communityGroupSeed.document

  const communityEventSeed = await seedIfEmpty(
    CommunityEvent,
    { slug: 'ai-ops-weekly-briefing' },
    {
      title: 'AI Ops Weekly Briefing',
      slug: 'ai-ops-weekly-briefing',
      description: 'Live review of incidents, releases, and KPIs.',
      longDescription: 'Seed webinar that mirrors the data Atlas expects for community engagement charts.',
      organizer: user._id,
      communityGroup: communityGroup._id,
      type: 'webinar',
      category: 'ai-ml',
      tags: ['ai', 'ops', 'webinar'],
      schedule: {
        startDate: eventStart,
        endDate: eventEnd,
        timezone: 'UTC',
        duration: 60,
        recurring: {
          enabled: true,
          frequency: 'weekly',
          interval: 1,
          daysOfWeek: [2]
        },
        registrationOpen: now,
        registrationClose: eventStart,
        earlyBirdDeadline: now
      },
      location: {
        type: 'online',
        online: {
          platform: 'zoom',
          url: 'https://onelast.ai/events/ai-ops-weekly',
          meetingId: '000-CORE-SEED',
          password: 'seed'
        }
      },
      registration: {
        required: true,
        maxAttendees: 250,
        currentAttendees: 1,
        waitlistEnabled: true,
        waitlistCount: 0
      },
      liveSession: {
        streamUrl: 'https://stream.onelast.ai/ai-ops-weekly',
        chatHistory: [{
          userId: user._id,
          message: 'Seed event created to drive dashboards.',
          timestamp: now,
          type: 'announcement'
        }]
      },
      attendees: [{
        userId: user._id,
        status: 'confirmed',
        checkInTime: eventStart,
        engagement: { chatMessages: 1, questionsAsked: 0, pollsParticipated: 1, timeAttended: 55 }
      }],
      analytics: {
        totalRegistrations: 1,
        totalAttendees: 1,
        attendanceRate: 100,
        averageRating: 5,
        totalChatMessages: 1,
        totalQuestions: 0,
        totalPolls: 1,
        trafficSources: [{ source: 'internal', registrations: 1, conversions: 1 }]
      }
    }
  )
  results.push({ name: 'communityevents', skipped: communityEventSeed.skipped })

  const membershipSeed = await seedIfEmpty(
    CommunityMembership,
    { user: user._id, communityGroup: communityGroup._id },
    {
      user: user._id,
      communityGroup: communityGroup._id,
      status: 'active',
      role: 'owner',
      permissions: [{ permission: 'manage_group', granted: true }],
      joinedAt: now,
      profile: {
        displayName: 'Founding Operator',
        bio: 'Owns the realtime AI ops program',
        notifications: {
          newPosts: true,
          newComments: true,
          mentions: true,
          events: true,
          announcements: true,
          email: true,
          push: true,
          inApp: true
        }
      },
      activity: {
        totalPosts: 3,
        totalComments: 5,
        totalReactions: 12,
        postsThisWeek: 2,
        commentsThisWeek: 3,
        lastActiveAt: now,
        eventsAttended: 1
      },
      reputation: {
        points: 120,
        badges: [{
          badgeId: 'seed-founder',
          name: 'founder',
          description: 'Launched the AI Ops Collective',
          rarity: 'legendary',
          earnedAt: now
        }]
      }
    }
  )
  results.push({ name: 'communitymemberships', skipped: membershipSeed.skipped })

  return results
}

async function main() {
  try {
    console.log(`${LOG_PREFIX} Connecting to database...`)
    await ensureConnection()
    console.log(`${LOG_PREFIX} Connected`)

    const user = await ensureUser()
    const agent = await ensureAgent(user._id)
    const [,, monthlyPlan] = await ensurePlans(user._id)
    const subscription = await ensureSubscription({
      userId: user._id,
      agentId: agent._id,
      planId: monthlyPlan?._id
    })

    const seedResults = await seedCollections({ user, agent, plan: monthlyPlan, subscription })

    console.table(seedResults.map(item => ({
      collection: item.name,
      inserted: item.skipped ? 'existing' : 'created'
    })))

    console.log(`${LOG_PREFIX} Seeding complete`)
  } catch (error) {
    console.error(`${LOG_PREFIX} Failed`, error)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

main()
