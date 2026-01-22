import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const PLAN_TEMPLATES = [
  {
    key: 'daily',
    name: 'Daily Agent Access',
    description: '$1 per day per agent',
    defaultPrice: 1,
    billingPeriod: 'daily',
    interval: 'day',
    slugMatches: ['daily-agent-access', 'daily-agent'],
  },
  {
    key: 'weekly',
    name: 'Weekly Agent Access',
    description: '$5 per week per agent',
    defaultPrice: 5,
    billingPeriod: 'weekly',
    interval: 'week',
    slugMatches: ['weekly-agent-access', 'weekly-agent'],
  },
  {
    key: 'monthly',
    name: 'Monthly Agent Access',
    description: '$15 per month per agent',
    defaultPrice: 19,
    billingPeriod: 'monthly',
    interval: 'month',
    slugMatches: ['monthly-agent-access', 'monthly-agent'],
  },
];

const normalizePlanKey = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.startsWith('day')) return 'daily';
  if (normalized.startsWith('week')) return 'weekly';
  if (normalized.startsWith('month')) return 'monthly';
  return normalized;
};

const derivePlanKeyFromName = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.includes('daily')) return 'daily';
  if (normalized.includes('week')) return 'weekly';
  if (normalized.includes('month')) return 'monthly';
  return null;
};

const buildPlanOptions = (planDocs: any[] = []) => {
  return PLAN_TEMPLATES.map((template) => {
    const match = planDocs.find((doc) => {
      const slug = (doc.slug || '').toLowerCase();
      const name = (doc.name || '').toLowerCase();
      const displayName = (doc.displayName || '').toLowerCase();
      const billingPeriod = (
        doc.billingPeriod ||
        doc?.pricing?.interval ||
        doc?.price?.interval ||
        ''
      ).toLowerCase();
      return (
        slug.includes(template.key) ||
        template.slugMatches?.some((candidate) =>
          candidate ? slug.includes(candidate) : false
        ) ||
        name.includes(template.key) ||
        displayName.includes(template.key) ||
        billingPeriod.startsWith(template.interval.replace('ly', ''))
      );
    });

    const amountCents =
      match?.pricing?.amount ??
      match?.price?.amount ??
      Math.round(template.defaultPrice * 100);

    const currency =
      match?.pricing?.currency ?? match?.price?.currency ?? 'USD';

    return {
      id: match?._id?.toString() ?? template.key,
      key: template.key,
      name: match?.displayName || match?.name || template.name,
      description: match?.description || template.description,
      price: amountCents / 100,
      currency,
      billingPeriod: template.billingPeriod,
      interval: template.interval,
      status: 'not_active' as 'active' | 'not_active',
      isActive: false,
    };
  });
};

const applyPlanStatuses = (
  planOptions: ReturnType<typeof buildPlanOptions>,
  activeKey: string | null
) =>
  planOptions.map((plan) => {
    const isActive = activeKey ? plan.key === activeKey : false;
    return {
      ...plan,
      status: isActive ? 'active' : 'not_active',
      isActive,
    };
  });

const getUsageDefaults = (planKey: string | null) => {
  switch (planKey) {
    case 'daily':
      return { apiCalls: 500, storage: 1024 };
    case 'weekly':
      return { apiCalls: 2500, storage: 2048 };
    default:
      return { apiCalls: 15000, storage: 10240 };
  }
};

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const sessionUser = await prisma.user.findFirst({
      where: {
        sessionId,
        sessionExpiry: { gt: new Date() },
      },
    });

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const sessionUserId = sessionUser.id;

    if (params.userId && params.userId !== sessionUserId) {
      console.warn('Billing access mismatch. Using session user.', {
        sessionUserId,
        requestedUserId: params.userId,
      });
    }

    const planDocs = await prisma.plan.findMany();
    const basePlanOptions = buildPlanOptions(planDocs);

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: sessionUser.id,
        status: { in: ['active', 'trialing', 'past_due'] },
      },
    });

    if (!activeSubscription) {
      const planOptions = applyPlanStatuses(basePlanOptions, null);
      const fallbackPlanKey =
        planOptions.find((plan) => plan.key === 'monthly')?.key ||
        planOptions[0]?.key ||
        'monthly';
      const usageDefaults = getUsageDefaults(fallbackPlanKey);
      const billingCycleEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      return NextResponse.json({
        success: true,
        data: {
          currentPlan: {
            name: 'No Active Plan',
            type: 'none',
            price: 0,
            currency: 'USD',
            period: fallbackPlanKey,
            status: 'inactive',
            renewalDate: null,
            daysUntilRenewal: 0,
          },
          planOptions,
          usage: {
            currentPeriod: {
              apiCalls: {
                used: 0,
                limit: usageDefaults.apiCalls,
                percentage: 0,
              },
              storage: {
                used: 0,
                limit: usageDefaults.storage,
                percentage: 0,
                unit: 'MB',
              },
            },
            billingCycle: {
              start: new Date().toISOString().split('T')[0],
              end: billingCycleEnd.toISOString().split('T')[0],
            },
          },
          invoices: [],
          paymentMethods: [],
          billingHistory: [],
          upcomingCharges: [],
          costBreakdown: { subscription: 0, usage: 0, taxes: 0, total: 0 },
        },
      });
    }

    const currentPeriodStart =
      activeSubscription.billing?.currentPeriodStart || new Date();
    const currentPeriodEnd =
      activeSubscription.billing?.currentPeriodEnd ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const usageData = await prisma.usageMetric.findFirst({
      where: {
        userId: sessionUser.id,
        period: { gte: currentPeriodStart, lt: currentPeriodEnd },
      },
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userInvoices = await prisma.invoice.findMany({
      where: { userId: sessionUser.id, createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    const paymentHistory = await prisma.payment.findMany({
      where: { userId: sessionUser.id, createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const activePlanDoc = activeSubscription?.planId
      ? await prisma.plan.findUnique({ where: { id: activeSubscription.planId } })
      : null;

    const planLimits = activePlanDoc?.features || {
      apiCalls: 10000,
      storage: 10240,
    };

    const currentUsage = {
      apiCalls: usageData?.apiCalls || 0,
      storage: usageData?.storage || 0,
    };

    const apiCallsPercentage = planLimits.apiCalls
      ? Math.min(
          100,
          Math.round((currentUsage.apiCalls / planLimits.apiCalls) * 100)
        )
      : 0;
    const storagePercentage = planLimits.storage
      ? Math.min(
          100,
          Math.round((currentUsage.storage / planLimits.storage) * 100)
        )
      : 0;

    const amountCents = activeSubscription.billing?.amount ?? 0;
    const amount = amountCents / 100;
    const currency = activeSubscription.billing?.currency || 'USD';

    const activePlanKey =
      normalizePlanKey(activeSubscription?.billing?.interval) ||
      derivePlanKeyFromName(activeSubscription?.planName) ||
      normalizePlanKey(activePlanDoc?.billingPeriod || null);
    const planOptions = applyPlanStatuses(basePlanOptions, activePlanKey);

    const billingData = {
      currentPlan: {
        name:
          activePlanDoc?.displayName ||
          activePlanDoc?.name ||
          activeSubscription.planName ||
          `${
            activePlanKey
              ? activePlanKey.charAt(0).toUpperCase() + activePlanKey.slice(1)
              : 'Monthly'
          } Access`,
        type:
          activeSubscription.status === 'active'
            ? activePlanKey || activePlanDoc?.type || 'paid'
            : activeSubscription.status,
        price: amount,
        currency,
        period:
          activePlanDoc?.billingPeriod ||
          activeSubscription.billing?.interval ||
          'monthly',
        status: activeSubscription.status,
        renewalDate: currentPeriodEnd.toISOString().split('T')[0],
        daysUntilRenewal: Math.max(
          0,
          Math.ceil(
            (currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        ),
      },
      planOptions,
      usage: {
        currentPeriod: {
          apiCalls: {
            used: currentUsage.apiCalls,
            limit: planLimits.apiCalls,
            percentage: apiCallsPercentage,
          },
          storage: {
            used: currentUsage.storage,
            limit: planLimits.storage,
            percentage: storagePercentage,
            unit: 'MB',
          },
        },
        billingCycle: {
          start: currentPeriodStart.toISOString().split('T')[0],
          end: currentPeriodEnd.toISOString().split('T')[0],
        },
      },
      invoices: userInvoices.map((inv) => ({
        id: inv.id,
        number:
          inv.invoiceNumber ||
          `INV-${inv.id.slice(-6).toUpperCase()}`,
        date: inv.createdAt?.toISOString().split('T')[0] || '',
        amount: `$${((inv.total ?? 0) / 100 || 0).toFixed(2)}`,
        status: inv.status || 'paid',
      })),
      paymentMethods: [],
      billingHistory: paymentHistory.map((payment) => ({
        id: payment.id,
        date: payment.createdAt?.toISOString().split('T')[0] || '',
        description:
          payment.description ||
          `${activeSubscription?.planName || 'Professional'} Plan`,
        amount: `$${((payment.amount ?? 0) / 100 || 0).toFixed(2)}`,
        status: payment.status || 'completed',
        method: payment.paymentMethod || 'card',
      })),
      upcomingCharges:
        activeSubscription.status === 'active'
          ? [
              {
                description: `${
                  activePlanDoc?.displayName ||
                  activePlanDoc?.name ||
                  activeSubscription.planName ||
                  'Monthly Agent Access'
                } Plan - Next billing cycle`,
                amount: `$${amount.toFixed(2)}`,
                date: currentPeriodEnd.toISOString().split('T')[0],
              },
            ]
          : [],
      costBreakdown: {
        subscription: amount,
        usage: 0,
        taxes: amount * 0.08,
        total: amount * 1.08,
      },
    };

    return NextResponse.json({ success: true, data: billingData });
  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
