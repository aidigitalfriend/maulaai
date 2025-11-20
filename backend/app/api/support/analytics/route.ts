import { NextRequest, NextResponse } from 'next/server'
import { SupportTools } from '../../../../lib/support-tools'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, userId, sessionId, category, metadata } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }

    // Log the analytics event
    await SupportTools.logAnalytics({
      type,
      userId,
      sessionId,
      category,
      metadata
    })

    return NextResponse.json({
      success: true,
      message: 'Analytics event logged successfully'
    })

  } catch (error) {
    console.error('Error logging analytics:', error)
    return NextResponse.json(
      { error: 'Failed to log analytics event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    const metric = searchParams.get('metric') || 'overview'

    // Generate comprehensive analytics report
    const analytics = await generateAnalyticsReport(timeframe, metric)

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

/**
 * Generate comprehensive analytics report
 */
async function generateAnalyticsReport(timeframe: string, metric: string) {
  // In production, query your analytics database
  // For now, return comprehensive mock data

  const baseMetrics = {
    overview: {
      totalConversations: 1247,
      totalMessages: 8934,
      uniqueUsers: 892,
      averageSessionDuration: 8.3, // minutes
      peakHours: ['10:00-11:00', '14:00-15:00', '16:00-17:00'],
      dailyTrend: generateDailyTrend(30)
    },
    
    containment: {
      totalIssues: 1247,
      resolvedByAI: 847,
      escalatedToHuman: 400,
      containmentRate: 67.9, // %
      containmentByCategory: {
        'Auth': 78.5,
        'Billing': 45.2,
        'Agents': 82.1,
        'Technical': 52.8,
        'General': 71.3
      },
      trend: generateContainmentTrend(30)
    },

    satisfaction: {
      totalResponses: 623,
      positiveRating: 531,
      negativeRating: 92,
      csat: 85.2, // %
      averageRating: 4.1, // out of 5
      satisfactionByCategory: {
        'Auth': 87.3,
        'Billing': 72.1,
        'Agents': 91.5,
        'Technical': 78.9,
        'General': 84.7
      },
      recentFeedback: [
        {
          rating: 'helpful',
          comment: 'Resolved my login issue quickly!',
          timestamp: new Date('2024-10-09T14:30:00')
        },
        {
          rating: 'helpful',
          comment: 'Great AI responses, very helpful',
          timestamp: new Date('2024-10-09T13:15:00')
        },
        {
          rating: 'not_helpful',
          comment: 'Could not resolve billing question',
          timestamp: new Date('2024-10-09T11:45:00')
        }
      ]
    },

    performance: {
      averageResponseTime: 2.8, // seconds
      firstTokenTime: 1.2, // seconds
      totalResponseTime: 2.8, // seconds
      p95ResponseTime: 4.7, // seconds
      providerPerformance: {
        'gemini': { latency: 2.1, uptime: 99.2, usage: 65.3 },
        'anthropic': { latency: 3.4, uptime: 98.8, usage: 22.1 },
        'openai': { latency: 2.9, uptime: 99.1, usage: 12.6 }
      },
      hourlyPerformance: generateHourlyPerformance()
    },

    escalation: {
      totalEscalations: 400,
      escalationRate: 32.1, // %
      escalationByCategory: {
        'Billing': 54.8,
        'Technical': 47.2,
        'Auth': 21.5,
        'Agents': 17.9,
        'General': 28.7
      },
      escalationBySeverity: {
        'P1': 89.3,
        'P2': 45.7,
        'P3': 18.2
      },
      averageEscalationTime: 6.7, // minutes into conversation
      escalationReasons: {
        'user_request': 35.2,
        'ai_confidence_low': 28.9,
        'billing_access_required': 15.7,
        'technical_complexity': 12.4,
        'security_concern': 7.8
      }
    },

    topIssues: [
      {
        issue: 'Password reset not working',
        category: 'Auth',
        frequency: 127,
        containmentRate: 82.4,
        averageResolutionTime: 3.2
      },
      {
        issue: 'Billing cycle questions',
        category: 'Billing',
        frequency: 98,
        containmentRate: 41.8,
        averageResolutionTime: 12.7
      },
      {
        issue: 'Agent not responding correctly',
        category: 'Agents',
        frequency: 89,
        containmentRate: 78.7,
        averageResolutionTime: 5.1
      },
      {
        issue: 'Account upgrade process',
        category: 'Billing',
        frequency: 76,
        containmentRate: 52.6,
        averageResolutionTime: 8.9
      },
      {
        issue: 'API integration help',
        category: 'Technical',
        frequency: 61,
        containmentRate: 45.9,
        averageResolutionTime: 11.3
      }
    ],

    userSegments: {
      byPlan: {
        'free': { conversations: 523, containment: 72.1, satisfaction: 83.4 },
        'pro': { conversations: 567, containment: 65.8, satisfaction: 86.2 },
        'enterprise': { conversations: 157, containment: 58.6, satisfaction: 89.1 }
      },
      byUserType: {
        'new_users': { conversations: 267, containment: 69.3, satisfaction: 81.6 },
        'returning_users': { conversations: 745, containment: 67.2, satisfaction: 86.8 },
        'enterprise_users': { conversations: 235, containment: 61.7, satisfaction: 88.9 }
      }
    },

    knowledge_base: {
      totalArticles: 127,
      articlesUsed: 98,
      mostUsedArticles: [
        { title: 'How to reset password', usage: 234, helpfulness: 89.2 },
        { title: 'Billing FAQ', usage: 187, helpfulness: 76.3 },
        { title: 'Agent setup guide', usage: 156, helpfulness: 92.1 },
        { title: 'API documentation', usage: 134, helpfulness: 85.7 },
        { title: 'Account management', usage: 123, helpfulness: 79.8 }
      ],
      averageHelpfulness: 84.6,
      articlesNeedingUpdate: [
        { title: 'Old billing process', lastUpdated: '2024-08-15', usage: 45 },
        { title: 'Deprecated API methods', lastUpdated: '2024-07-22', usage: 23 }
      ]
    }
  }

  // Return specific metric or overview
  if (metric === 'overview') {
    return {
      timeframe,
      generated: new Date(),
      kpis: {
        containmentRate: baseMetrics.containment.containmentRate,
        csat: baseMetrics.satisfaction.csat,
        averageResponseTime: baseMetrics.performance.averageResponseTime,
        escalationRate: baseMetrics.escalation.escalationRate,
        totalConversations: baseMetrics.overview.totalConversations
      },
      ...baseMetrics
    }
  }

  return baseMetrics[metric as keyof typeof baseMetrics] || baseMetrics.overview
}

function generateDailyTrend(days: number) {
  const trend = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    trend.push({
      date: date.toISOString().split('T')[0],
      conversations: Math.floor(Math.random() * 50) + 30,
      escalations: Math.floor(Math.random() * 20) + 5,
      satisfaction: Math.floor(Math.random() * 20) + 80
    })
  }
  return trend
}

function generateContainmentTrend(days: number) {
  const trend = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    trend.push({
      date: date.toISOString().split('T')[0],
      total: Math.floor(Math.random() * 50) + 30,
      contained: Math.floor(Math.random() * 35) + 20,
      escalated: Math.floor(Math.random() * 15) + 10
    })
  }
  return trend
}

function generateHourlyPerformance() {
  const hours = []
  for (let hour = 0; hour < 24; hour++) {
    hours.push({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      avgResponseTime: (Math.random() * 2 + 1.5).toFixed(1),
      volume: Math.floor(Math.random() * 100) + 20,
      satisfaction: (Math.random() * 15 + 80).toFixed(1)
    })
  }
  return hours
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}