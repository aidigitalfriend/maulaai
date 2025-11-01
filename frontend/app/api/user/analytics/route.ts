import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // In production, this would fetch real user data from database
    // For now, we'll return simulated real-time data
    
    const analyticsData = {
      subscription: {
        plan: 'Professional',
        status: 'active',
        price: 5,
        period: 'week',
        startDate: '2024-10-01',
        renewalDate: '2024-11-08',
        daysUntilRenewal: 7,
        billingCycle: 'weekly',
      },
      usage: {
        conversations: {
          current: 6847,
          limit: 10000,
          percentage: 68.47,
        },
        agents: {
          current: 12,
          limit: 15,
          percentage: 80,
        },
        apiCalls: {
          current: 28453,
          limit: 50000,
          percentage: 56.91,
        },
        storage: {
          current: 7.2,
          limit: 20,
          percentage: 36,
          unit: 'GB',
        },
        messages: {
          current: 15423,
          limit: 25000,
          percentage: 61.69,
        },
      },
      dailyUsage: [
        { date: '2024-10-26', conversations: 245, messages: 892, apiCalls: 1240 },
        { date: '2024-10-27', conversations: 312, messages: 1043, apiCalls: 1456 },
        { date: '2024-10-28', conversations: 298, messages: 978, apiCalls: 1389 },
        { date: '2024-10-29', conversations: 276, messages: 845, apiCalls: 1198 },
        { date: '2024-10-30', conversations: 334, messages: 1124, apiCalls: 1567 },
        { date: '2024-10-31', conversations: 289, messages: 956, apiCalls: 1342 },
        { date: '2024-11-01', conversations: 318, messages: 1089, apiCalls: 1521 },
      ],
      weeklyTrend: {
        conversationsChange: '+15.3%',
        messagesChange: '+12.8%',
        apiCallsChange: '+18.2%',
        responseTimeChange: '-8.5%',
      },
      agentPerformance: [
        { name: 'Customer Support', conversations: 2847, messages: 8234, avgResponseTime: 0.6, successRate: 96.2 },
        { name: 'Sales Assistant', conversations: 1923, messages: 4562, avgResponseTime: 0.8, successRate: 94.5 },
        { name: 'Tech Support', conversations: 1456, messages: 3891, avgResponseTime: 1.2, successRate: 92.1 },
        { name: 'Lead Generator', conversations: 621, messages: 1456, avgResponseTime: 0.5, successRate: 97.8 },
      ],
      recentActivity: [
        { timestamp: '2024-11-01 14:32:15', agent: 'Customer Support', action: 'Conversation completed', status: 'success' },
        { timestamp: '2024-11-01 14:28:42', agent: 'Sales Assistant', action: 'Lead captured', status: 'success' },
        { timestamp: '2024-11-01 14:25:18', agent: 'Tech Support', action: 'Ticket resolved', status: 'success' },
        { timestamp: '2024-11-01 14:20:33', agent: 'Customer Support', action: 'Conversation started', status: 'active' },
        { timestamp: '2024-11-01 14:15:07', agent: 'Lead Generator', action: 'Form submitted', status: 'success' },
      ],
      costAnalysis: {
        currentMonth: 28.45,
        projectedMonth: 42.67,
        breakdown: [
          { category: 'API Calls', cost: 15.23, percentage: 53.5 },
          { category: 'Storage', cost: 8.92, percentage: 31.4 },
          { category: 'Bandwidth', cost: 4.30, percentage: 15.1 },
        ],
      },
      topAgents: [
        { name: 'Customer Support', usage: 41.5 },
        { name: 'Sales Assistant', usage: 28.1 },
        { name: 'Tech Support', usage: 21.3 },
        { name: 'Lead Generator', usage: 9.1 },
      ],
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
