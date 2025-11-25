import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@backend/lib/mongodb';
import Subscription from '@backend/models/Subscription';

/**
 * GET /api/subscriptions
 * Get all subscriptions for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Build query
    const query: any = {};
    if (userId) query.userId = userId;
    if (email) query.email = email;

    // Get all active subscriptions
    const subscriptions = await Subscription.find({
      ...query,
      status: { $in: ['active', 'trialing'] },
      currentPeriodEnd: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      subscriptions,
      count: subscriptions.length,
    });
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions', details: error.message },
      { status: 500 }
    );
  }
}
