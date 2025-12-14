/**
 * Stripe Session Verification API Route
 * Verifies a Stripe checkout session and returns subscription details
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/mongodb-client';
import { getAgentSubscriptionModel } from '@/models/AgentSubscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

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

    // Extract subscription details
    const subscription = session.subscription as Stripe.Subscription;
    if (!subscription) {
      console.error('❌ No subscription found in session');
      return NextResponse.json(
        { success: false, error: 'No subscription found' },
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

    // Extract metadata
    const agentId = session.metadata?.agentId;
    const agentName = session.metadata?.agentName;

    if (!agentId || !agentName) {
      console.error('❌ Missing agent metadata:', { agentId, agentName });
      return NextResponse.json(
        { success: false, error: 'Agent information missing' },
        { status: 400 }
      );
    }

    console.log('✅ Session verified successfully:', {
      sessionId,
      customerEmail,
      agentId,
      agentName,
      subscriptionId: subscription.id,
    });

    // Connect to database and create/update subscription record
    await connectToDatabase();
    const AgentSubscription = await getAgentSubscriptionModel();

    // Check if subscription already exists
    const existingSubscription = await AgentSubscription.findOne({
      userId: session.metadata?.userId,
      agentId,
    });

    let subscriptionRecord;
    if (existingSubscription) {
      // Update existing subscription
      subscriptionRecord = await AgentSubscription.findByIdAndUpdate(
        existingSubscription._id,
        {
          status: subscription.status === 'active' ? 'active' : 'expired',
          expiryDate: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        },
        { new: true }
      );
    } else {
      // Create new subscription record
      const plan = subscription.items.data[0]?.price?.recurring?.interval;
      const price = subscription.items.data[0]?.price?.unit_amount;

      // Map Stripe interval to our plan types
      let planType: 'daily' | 'weekly' | 'monthly' = 'monthly';
      if (plan === 'day') planType = 'daily';
      else if (plan === 'week') planType = 'weekly';
      else if (plan === 'month') planType = 'monthly';

      subscriptionRecord = new AgentSubscription({
        userId: session.metadata?.userId,
        agentId,
        plan: planType,
        price: price ? price / 100 : 0,
        status: subscription.status === 'active' ? 'active' : 'expired',
        startDate: new Date(subscription.current_period_start * 1000),
        expiryDate: new Date(subscription.current_period_end * 1000),
        autoRenew: !subscription.cancel_at_period_end,
      });

      await subscriptionRecord.save();
    }

    // Return subscription details
    return NextResponse.json({
      success: true,
      hasAccess: true,
      subscription: {
        id: subscriptionRecord._id?.toString() || subscriptionRecord._id,
        agentId: subscriptionRecord.agentId,
        plan: subscriptionRecord.plan,
        status: subscriptionRecord.status,
        expiryDate: subscriptionRecord.expiryDate,
        daysUntilRenewal: Math.ceil(
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
