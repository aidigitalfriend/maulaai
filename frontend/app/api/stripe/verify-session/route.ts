import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectToDatabase } from '@/lib/mongodb-client';
import { getAgentSubscriptionModel } from '@/models/AgentSubscription';

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
    const plan = session.metadata?.plan as 'daily' | 'weekly' | 'monthly';

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
    });

    // Connect to database and create/update access record
    await connectToDatabase();
    const AgentSubscription = await getAgentSubscriptionModel();

    // Calculate expiry date based on plan (one-time purchase, no auto-renewal)
    const startDate = new Date();
    const expiryDate = new Date(startDate);

    switch (plan) {
      case 'daily':
        expiryDate.setDate(expiryDate.getDate() + 1);
        break;
      case 'weekly':
        expiryDate.setDate(expiryDate.getDate() + 7);
        break;
      case 'monthly':
        expiryDate.setDate(expiryDate.getDate() + 30);
        break;
    }

    // Get price from session
    const price = session.amount_total ? session.amount_total / 100 : 0;

    // Check if access already exists
    const existingSubscription = await AgentSubscription.findOne({
      userId: session.metadata?.userId,
      agentId,
    });

    let subscriptionRecord;
    if (existingSubscription) {
      // Update existing record - extend access
      subscriptionRecord = await AgentSubscription.findByIdAndUpdate(
        existingSubscription._id,
        {
          status: 'active',
          plan: plan,
          price: price,
          startDate: startDate,
          expiryDate: expiryDate,
          autoRenew: false, // No auto-renewal for one-time payments
          updatedAt: new Date(),
        },
        { new: true }
      );
    } else {
      // Create new access record
      subscriptionRecord = new AgentSubscription({
        userId: session.metadata?.userId,
        agentId,
        plan: plan,
        price: price,
        status: 'active',
        startDate: startDate,
        expiryDate: expiryDate,
        autoRenew: false, // No auto-renewal for one-time payments
      });

      await subscriptionRecord.save();
    }

    // Return access details
    return NextResponse.json({
      success: true,
      hasAccess: true,
      subscription: {
        id: subscriptionRecord._id?.toString() || subscriptionRecord._id,
        agentId: subscriptionRecord.agentId,
        plan: subscriptionRecord.plan,
        status: subscriptionRecord.status,
        expiryDate: subscriptionRecord.expiryDate,
        daysRemaining: Math.ceil(
          (subscriptionRecord.expiryDate.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        ),
        price: subscriptionRecord.price,
        autoRenew: false, // One-time payment, no auto-renewal
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
