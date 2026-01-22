import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';

const PLAN_TEMPLATES = [
  { key: 'daily', name: 'Daily Agent Access', description: '$1 per day per agent', defaultPrice: 1, billingPeriod: 'daily', interval: 'day' },
  { key: 'weekly', name: 'Weekly Agent Access', description: '$5 per week per agent', defaultPrice: 5, billingPeriod: 'weekly', interval: 'week' },
  { key: 'monthly', name: 'Monthly Agent Access', description: '$15 per month per agent', defaultPrice: 19, billingPeriod: 'monthly', interval: 'month' },
];

const getUsageDefaults = (planKey: string | null) => {
  switch (planKey) {
    case 'daily': return { apiCalls: 500, storage: 1024 };
    case 'weekly': return { apiCalls: 2500, storage: 2048 };
    default: return { apiCalls: 15000, storage: 10240 };
  }
};

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const sessionUser = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });

    if (!sessionUser) {
      return NextResponse.json({ message: 'Invalid or expired session' }, { status: 401 });
    }

    // Get active subscription
    const activeSubscription = await prisma.agentSubscription.findFirst({
      where: {
        userId: sessionUser.id,
        status: { in: ['active'] },
        expiryDate: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    const planOptions = PLAN_TEMPLATES.map((template) => ({
      id: template.key,
      key: template.key,
      name: template.name,
      description: template.description,
      price: template.defaultPrice,
      currency: 'USD',
      billingPeriod: template.billingPeriod,
      interval: template.interval,
      status: activeSubscription?.plan === template.key ? 'active' : 'not_active',
      isActive: activeSubscription?.plan === template.key,
    }));

    const currentPlanKey = activeSubscription?.plan || 'monthly';
    const usageDefaults = getUsageDefaults(currentPlanKey);
    const billingCycleEnd = activeSubscription?.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        currentPlan: activeSubscription ? {
          name: activeSubscription.plan,
          type: activeSubscription.plan,
          price: activeSubscription.price,
          currency: 'USD',
          period: activeSubscription.plan,
          status: activeSubscription.status,
          renewalDate: activeSubscription.expiryDate,
          daysUntilRenewal: Math.ceil((activeSubscription.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        } : {
          name: 'No Active Plan',
          type: 'none',
          price: 0,
          currency: 'USD',
          period: 'monthly',
          status: 'inactive',
          renewalDate: null,
          daysUntilRenewal: 0,
        },
        planOptions,
        usage: {
          currentPeriod: {
            apiCalls: { used: 0, limit: usageDefaults.apiCalls, percentage: 0 },
            storage: { used: 0, limit: usageDefaults.storage, percentage: 0 },
          },
          billingCycleEnd: billingCycleEnd.toISOString(),
        },
        paymentMethods: [],
        billingHistory: transactions.map((t) => ({
          id: t.id,
          date: t.createdAt,
          description: t.type,
          amount: t.amount,
          status: t.status,
          downloadUrl: null,
        })),
      },
    });
  } catch (error) {
    console.error('Billing fetch error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
