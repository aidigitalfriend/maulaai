import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/user/analytics
 * Fallback analytics endpoint for when NGINX routes to backend
 * Returns mock data to prevent dashboard errors
 */
export async function GET(request: NextRequest) {
  try {
    // Return consistent mock analytics data
    // This prevents 404 errors and dashboard breakage
    const analyticsData = {
      subscription: {
        plan: 'Free',
        status: 'none',
        price: 0,
        period: 'none',
        startDate: new Date().toISOString().split('T')[0],
        renewalDate: 'N/A',
        daysUntilRenewal: 0,
        billingCycle: 'none',
      },
      usage: {
        conversations: {
          current: 0,
          limit: 1000,
          percentage: 0,
          unit: 'conversations',
        },
        agents: {
          current: 0,
          limit: 18,
          percentage: 0,
          unit: 'agents',
        },
        apiCalls: {
          current: 0,
          limit: 10000,
          percentage: 0,
          unit: 'calls',
        },
        storage: {
          current: 0,
          limit: 5,
          percentage: 0,
          unit: 'GB',
        },
        messages: {
          current: 0,
          limit: 5000,
          percentage: 0,
          unit: 'messages',
        },
      },
      dailyUsage: Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          date: date.toISOString().split('T')[0],
          conversations: Math.floor(Math.random() * 50),
          messages: Math.floor(Math.random() * 200),
          apiCalls: Math.floor(Math.random() * 300),
        }
      }),
      weeklyTrend: {
        conversationsChange: '+0%',
        messagesChange: '+0%',
        apiCallsChange: '+0%',
        responseTimeChange: '-0%',
      },
      agentPerformance: [
        {
          name: 'Customer Support',
          conversations: 0,
          messages: 0,
          avgResponseTime: 1.2,
          successRate: 94.2,
        },
        {
          name: 'Sales Assistant',
          conversations: 0,
          messages: 0,
          avgResponseTime: 0.8,
          successRate: 96.1,
        },
      ],
      recentActivity: [
        {
          timestamp: new Date().toISOString(),
          agent: 'System',
          action: 'Analytics loaded',
          status: 'success',
        },
      ],
      costAnalysis: {
        currentMonth: 0,
        projectedMonth: 0,
        breakdown: [],
      },
      topAgents: [
        { name: 'Customer Support', usage: 0 },
        { name: 'Sales Assistant', usage: 0 },
      ],
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics endpoint error:', error)
    
    // Return minimal valid response even on error
    return NextResponse.json({
      subscription: { plan: 'Free', status: 'none', price: 0 },
      usage: {},
      dailyUsage: [],
      weeklyTrend: {},
      agentPerformance: [],
      recentActivity: [],
      costAnalysis: { currentMonth: 0, projectedMonth: 0, breakdown: [] },
      topAgents: [],
    })
  }
}