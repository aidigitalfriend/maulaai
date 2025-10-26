import { NextRequest, NextResponse } from 'next/server'
import { SupportTools } from '../../../../lib/support-tools'

export async function GET(request: NextRequest) {
  try {
    // In production, extract user ID from JWT token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid token provided' },
        { status: 401 }
      )
    }

    // For now, use mock user ID - in production, decode JWT
    const userId = 'user1' // Extract from JWT: jwt.verify(token, secret).userId

    // Fetch user profile with subscription history
    const userProfile = await SupportTools.getUserProfile(userId)
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Fetch subscription details
    const subscription = await SupportTools.getSubscriptionStatus(userId)

    // Fetch recent support history (last 30 days)
    const recentTickets = await fetchRecentSupportHistory(userId)

    // Fetch recent payment history
    const recentPayments = await fetchRecentPayments(userId)

    // Build comprehensive profile response
    const enhancedProfile = {
      ...userProfile,
      subscription: subscription || null,
      supportHistory: {
        totalTickets: recentTickets.length,
        recentTickets: recentTickets.slice(0, 5), // Last 5 tickets
        lastTicketDate: recentTickets[0]?.createdAt || null
      },
      paymentHistory: {
        lastPayment: recentPayments[0] || null,
        paymentStatus: recentPayments[0]?.status || 'unknown',
        nextBilling: subscription?.nextBilling || null
      },
      accountHealth: {
        status: determineAccountHealth(userProfile, subscription, recentPayments),
        flags: getAccountFlags(userProfile, subscription, recentTickets)
      }
    }

    return NextResponse.json(enhancedProfile)

  } catch (error) {
    console.error('Error fetching user profile for support:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

/**
 * Fetch recent support ticket history
 */
async function fetchRecentSupportHistory(userId: string) {
  // In production, query your ticket database
  // For now, return mock data
  return [
    {
      id: 'TICKET-ABC123',
      subject: 'Login issues with 2FA',
      status: 'resolved',
      category: 'Auth',
      severity: 'P2',
      createdAt: new Date('2024-10-01'),
      resolvedAt: new Date('2024-10-02')
    },
    {
      id: 'TICKET-DEF456',
      subject: 'Billing question about plan upgrade',
      status: 'resolved',
      category: 'Billing',
      severity: 'P3',
      createdAt: new Date('2024-09-15'),
      resolvedAt: new Date('2024-09-16')
    }
  ]
}

/**
 * Fetch recent payment history
 */
async function fetchRecentPayments(userId: string) {
  // In production, query your payment system
  return [
    {
      id: 'pay_123456',
      amount: 29.99,
      currency: 'USD',
      status: 'succeeded',
      date: new Date('2024-10-01'),
      description: 'Pro Plan - Monthly'
    },
    {
      id: 'pay_789012',
      amount: 29.99,
      currency: 'USD',
      status: 'succeeded',
      date: new Date('2024-09-01'),
      description: 'Pro Plan - Monthly'
    }
  ]
}

/**
 * Determine overall account health
 */
function determineAccountHealth(profile: any, subscription: any, payments: any[]) {
  if (!subscription) return 'no_subscription'
  
  if (subscription.status === 'cancelled') return 'cancelled'
  if (subscription.status === 'past_due') return 'payment_issue'
  
  const lastPayment = payments[0]
  if (lastPayment && lastPayment.status === 'failed') return 'payment_failed'
  
  if (subscription.status === 'active') return 'healthy'
  
  return 'unknown'
}

/**
 * Get account flags for support context
 */
function getAccountFlags(profile: any, subscription: any, tickets: any[]) {
  const flags = []
  
  // High-value customer
  if (profile.plan === 'enterprise') {
    flags.push('enterprise_customer')
  }
  
  // Recent support activity
  const recentTickets = tickets.filter(t => 
    new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  )
  if (recentTickets.length > 2) {
    flags.push('frequent_support_requests')
  }
  
  // Payment issues
  if (subscription?.status === 'past_due') {
    flags.push('payment_overdue')
  }
  
  // New customer
  const daysSinceJoin = (Date.now() - new Date(profile.joinDate).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceJoin < 30) {
    flags.push('new_customer')
  }
  
  // Long-time customer
  if (daysSinceJoin > 365) {
    flags.push('loyal_customer')
  }
  
  return flags
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}