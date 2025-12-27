import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/mongodb-client';
import { getAgentSubscriptionModel } from '@/models/AgentSubscription';
import { ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * Verify one-time payment session and grant access
 * No recurring subscriptions - users purchase access for a fixed period
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Verifying Stripe session:', sessionId);

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session) {
      console.error('❌ Session not found:', sessionId);
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      console.error('❌ Payment not completed:', session.payment_status);
      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get payment period object (we use Stripe subscription mode with cancel_at_period_end)
    const subscriptionData = session.subscription as Stripe.Subscription | null;

    if (!subscriptionData) {
      console.error('❌ No subscription found in session');
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 400 }
      );
    }

    // Get customer email
    const customer = session.customer as Stripe.Customer;
    const customerEmail = customer?.email || session.customer_email;

    if (!customerEmail) {
      console.error('❌ No customer email found');
      return NextResponse.json(
        { success: false, error: 'Customer information missing' },
        { status: 400 }
      );
    }

    // Extract metadata (from subscription_data metadata)
    const agentId =
      subscriptionData.metadata?.agentId || session.metadata?.agentId;
    const agentName =
      subscriptionData.metadata?.agentName || session.metadata?.agentName;
    const plan = (subscriptionData.metadata?.plan || session.metadata?.plan) as
      | 'daily'
      | 'weekly'
      | 'monthly';

    if (!agentId || !agentName || !plan) {
      console.error('❌ Missing metadata:', { agentId, agentName, plan });
      return NextResponse.json(
        { success: false, error: 'Payment information missing' },
        { status: 400 }
      );
    }

    console.log('✅ Payment verified successfully:', {
      sessionId,
      customerEmail,
      agentId,
      agentName,
      plan,
      amount: session.amount_total,
      subscriptionId: subscriptionData.id,
      cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
    });

    // Connect to database and create/update access record
    const { db } = await connectToDatabase();
    const subscriptions = db.collection('subscriptions');

    // Use subscription period dates (cancel_at_period_end is true, so it won't auto-renew)
    const startDate = new Date(subscriptionData.current_period_start * 1000);
    const expiryDate = new Date(subscriptionData.current_period_end * 1000);

    // Get price from session
    const price = session.amount_total ? session.amount_total / 100 : 0;

    // Convert userId to ObjectId for proper backend filtering
    const userId = session.metadata?.userId ? new ObjectId(session.metadata.userId) : null;

    if (!userId) {
      console.error('❌ Missing userId in session metadata');
      return NextResponse.json(
        { success: false, error: 'User information missing' },
        { status: 400 }
      );
    }

    // Check if subscription already exists (avoid duplicates)
    const existingByStripeId = await subscriptions.findOne({
      stripeSubscriptionId: subscriptionData.id,
    });

    if (existingByStripeId) {
      // Update user field if missing
      if (!existingByStripeId.user) {
        await subscriptions.updateOne(
          { _id: existingByStripeId._id },
          { $set: { user: userId, updatedAt: new Date() } }
        );
        console.log('✅ Updated user field for existing subscription');
      }

      console.log('✅ Subscription already verified:', subscriptionData.id);
      return NextResponse.json({
        success: true,
        hasAccess: true,
        subscription: {
          id: existingByStripeId._id?.toString() || existingByStripeId._id,
          agentId: existingByStripeId.agentId,
          plan: existingByStripeId.plan || existingByStripeId.billing?.interval,
          status: existingByStripeId.status,
          expiryDate: existingByStripeId.expiryDate || existingByStripeId.billing?.currentPeriodEnd,
          daysRemaining: Math.ceil(
            ((existingByStripeId.expiryDate?.getTime?.() || new Date(existingByStripeId.billing?.currentPeriodEnd).getTime()) - Date.now()) /
              (1000 * 60 * 60 * 24)
          ),
          price: existingByStripeId.price || (existingByStripeId.billing?.amount / 100),
        },
      });
    }

    // Check if user already has subscription for this agent
    const existingSubscription = await subscriptions.findOne({
      user: userId,
      agentId: agentId,
    });

    let subscriptionRecord;
    if (existingSubscription) {
      // Update existing record - extend access
      const result = await subscriptions.findOneAndUpdate(
        { _id: existingSubscription._id },
        {
          $set: {
            status: 'active',
            plan: plan,
            price: price,
            startDate: startDate,
            expiryDate: expiryDate,
            stripeSubscriptionId: subscriptionData.id,
            updatedAt: new Date(),
            // Ensure billing structure exists
            billing: {
              interval: plan === 'daily' ? 'day' : plan === 'weekly' ? 'week' : 'month',
              amount: Math.round(price * 100), // Convert to cents
              currentPeriodEnd: expiryDate,
            },
          },
        },
        { returnDocument: 'after' }
      );
      subscriptionRecord = result;
    } else {
      // Create new subscription record with proper schema
      const newSubscription = {
        user: userId,
        agentId: agentId,
        agentName: agentName,
        plan: plan,
        price: price,
        status: 'active',
        startDate: startDate,
        expiryDate: expiryDate,
        stripeSubscriptionId: subscriptionData.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        billing: {
          interval: plan === 'daily' ? 'day' : plan === 'weekly' ? 'week' : 'month',
          amount: Math.round(price * 100), // Convert to cents
          currentPeriodEnd: expiryDate,
        },
      };

      const insertResult = await subscriptions.insertOne(newSubscription);
      subscriptionRecord = { ...newSubscription, _id: insertResult.insertedId };
    }

    // Return access details
    return NextResponse.json({
      success: true,
      hasAccess: true,
      subscription: {
        id: subscriptionRecord._id?.toString(),
        agentId: subscriptionRecord.agentId,
        agentName: subscriptionRecord.agentName,
        plan: subscriptionRecord.plan,
        status: subscriptionRecord.status,
        expiryDate: subscriptionRecord.expiryDate,
        daysRemaining: Math.ceil(
          (subscriptionRecord.expiryDate.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        ),
        price: subscriptionRecord.price,
      },
      session: {
        id: session.id,
        customerEmail,
        paymentStatus: session.payment_status,
      },
    });
  } catch (error) {
    console.error('❌ Session verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      },
      { status: 500 }
    );
  }
}
