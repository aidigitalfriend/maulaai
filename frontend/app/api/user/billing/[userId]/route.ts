import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';

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

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    const sessionUser = await users.findOne({
      sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    if (sessionUser._id.toString() !== params.userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const subscriptions = db.collection('subscriptions');
    const invoices = db.collection('invoices');
    const payments = db.collection('payments');
    const usageMetrics = db.collection('usagemetrics');
    const plans = db.collection('plans');

    const activeSubscription = await subscriptions.findOne({
      user: sessionUser._id,
      status: { $in: ['active', 'trialing', 'past_due'] },
    });

    if (!activeSubscription) {
      const freePlan = (await plans.findOne({ type: 'free' })) || {
        name: 'Free Plan',
        pricing: { amount: 0, currency: 'USD' },
        features: { apiCalls: 100, storage: 1024 },
      };

      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      return NextResponse.json({
        success: true,
        data: {
          currentPlan: {
            name: freePlan.name,
            type: 'free',
            price: 0,
            currency: 'USD',
            period: 'monthly',
            status: 'active',
            renewalDate,
            daysUntilRenewal: 30,
          },
          usage: {
            currentPeriod: {
              apiCalls: {
                used: 0,
                limit: freePlan.features?.apiCalls || 100,
                percentage: 0,
              },
              storage: {
                used: 0,
                limit: freePlan.features?.storage || 1024,
                percentage: 0,
                unit: 'MB',
              },
            },
            billingCycle: {
              start: new Date().toISOString().split('T')[0],
              end: renewalDate,
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

    const usageData = await usageMetrics.findOne({
      user: sessionUser._id,
      period: { $gte: currentPeriodStart, $lt: currentPeriodEnd },
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userInvoices = await invoices
      .find({ user: sessionUser._id, createdAt: { $gte: sixMonthsAgo } })
      .sort({ createdAt: -1 })
      .limit(12)
      .toArray();

    const paymentHistory = await payments
      .find({ user: sessionUser._id, createdAt: { $gte: sixMonthsAgo } })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const planLimits = activeSubscription.plan
      ? (await plans.findOne({ _id: activeSubscription.plan }))?.features || {
          apiCalls: 10000,
          storage: 10240,
        }
      : { apiCalls: 10000, storage: 10240 };

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

    const billingData = {
      currentPlan: {
        name: activeSubscription.planName || 'Professional',
        type:
          activeSubscription.status === 'active'
            ? 'paid'
            : activeSubscription.status,
        price: amount,
        currency,
        period: activeSubscription.billing?.interval || 'monthly',
        status: activeSubscription.status,
        renewalDate: currentPeriodEnd.toISOString().split('T')[0],
        daysUntilRenewal: Math.max(
          0,
          Math.ceil(
            (currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        ),
      },
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
        id: inv._id.toString(),
        number:
          inv.invoiceNumber ||
          `INV-${inv._id.toString().slice(-6).toUpperCase()}`,
        date: inv.createdAt?.toISOString().split('T')[0] || '',
        amount: `$${((inv.financial?.total ?? 0) / 100 || 0).toFixed(2)}`,
        status: inv.status || 'paid',
      })),
      paymentMethods: [],
      billingHistory: paymentHistory.map((payment) => ({
        id: payment._id.toString(),
        date: payment.createdAt?.toISOString().split('T')[0] || '',
        description:
          payment.description ||
          `${activeSubscription.planName || 'Professional'} Plan`,
        amount: `$${((payment.amount ?? 0) / 100 || 0).toFixed(2)}`,
        status: payment.status || 'completed',
        method: payment.paymentMethod || 'card',
      })),
      upcomingCharges:
        activeSubscription.status === 'active'
          ? [
              {
                description: `${
                  activeSubscription.planName || 'Professional'
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
