import { NextRequest, NextResponse } from 'next/server';
import { getClientPromise } from '@/lib/mongodb';

// Always compute billing data dynamically
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get session ID from HttpOnly cookie
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json({ message: 'No session ID' }, { status: 401 });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    // Find user with valid session
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

    // Ensure user can only access their own billing data
    if (sessionUser._id.toString() !== userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const now = new Date();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const start = new Date(now.getTime() - thirtyDaysMs);
    const end = new Date(now.getTime() + thirtyDaysMs);

    const subscription = (sessionUser as any).subscription || {};

    const price = typeof subscription.price === 'number'
      ? subscription.price
      : 49.99;

    const period = subscription.period || 'monthly';
    const planName = subscription.plan || 'Professional';
    const status = subscription.status || 'active';

    const renewalDate = (subscription.renewalDate
      ? new Date(subscription.renewalDate)
      : new Date(now.getTime() + thirtyDaysMs)
    )
      .toISOString()
      .split('T')[0];

    const daysUntilRenewal = Math.max(
      0,
      Math.ceil(
        (new Date(renewalDate).getTime() - now.getTime()) /
          (24 * 60 * 60 * 1000)
      )
    );

    const billingData = {
      currentPlan: {
        id: 'pro-monthly',
        name: planName,
        type: status === 'active' ? 'paid' : 'free',
        status,
        period,
        price,
        renewalDate,
        daysUntilRenewal,
      },
      usage: {
        billingCycle: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
        currentPeriod: {
          apiCalls: {
            used: 0,
            limit: 50000,
            percentage: 0,
          },
          storage: {
            used: 0, // MB
            limit: 10240, // MB (10 GB)
            percentage: 0,
          },
        },
      },
      upcomingCharges: [],
      invoices: [],
      costBreakdown: {
        subscription: price,
        usage: 0,
        taxes: 0,
        total: price,
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
