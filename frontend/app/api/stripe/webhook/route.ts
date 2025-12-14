/**
 * Stripe Webhook Handler
 * Receives events from Stripe and saves subscriptions to MongoDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '../../../../lib/stripe-client';
import { connectToDatabase } from '../../../../lib/mongodb-client';
import { getAgentSubscriptionModel } from '../../../../models/AgentSubscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  console.log('🔥 STRIPE WEBHOOK RECEIVED - STARTING PROCESSING');

  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    console.log('📨 Webhook headers received:', {
      hasSignature: !!signature,
      contentType: headersList.get('content-type'),
      userAgent: headersList.get('user-agent'),
    });

    if (!signature) {
      console.error('❌ No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
      console.log('✅ Webhook signature verified successfully');
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('🎯 Stripe webhook event received:', {
      type: event.type,
      id: event.id,
      created: event.created,
      livemode: event.livemode,
    });

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await connectToDatabase();
    console.log('✅ Connected to MongoDB successfully');

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('💥 WEBHOOK HANDLER ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  console.log('🛒 Processing checkout session completed:', {
    sessionId: session.id,
    paymentStatus: session.payment_status,
    status: session.status,
  });

  const {
    client_reference_id: userId,
    customer_email: email,
    subscription: subscriptionId,
  } = session;
  const metadata = session.metadata;

  console.log('👤 Session data extracted:', {
    userId,
    email,
    subscriptionId,
    metadata,
  });

  if (!metadata || !userId || !email || !subscriptionId) {
    console.error('❌ Missing required session data:', {
      userId,
      email,
      subscriptionId,
      metadata,
    });
    return;
  }

  // Get full subscription details from Stripe
  console.log('🔍 Fetching subscription details from Stripe:', subscriptionId);
  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId as string
  );
  console.log('✅ Subscription details retrieved:', {
    id: subscription.id,
    status: subscription.status,
    items: subscription.items.data.length,
  });

  // Save subscription to MongoDB
  console.log('💾 Saving agent subscription to database...');
  const AgentSubscriptionModel = await getAgentSubscriptionModel();

  // Check if agent subscription already exists
  const existingSubscription = await AgentSubscriptionModel.findOne({
    userId: metadata?.userId,
    agentId: metadata?.agentId,
  });

  if (!existingSubscription) {
    // Map Stripe interval to our plan types
    let planType: 'daily' | 'weekly' | 'monthly' = 'monthly';
    if (subscription.items.data[0]?.price?.recurring?.interval === 'day')
      planType = 'daily';
    else if (subscription.items.data[0]?.price?.recurring?.interval === 'week')
      planType = 'weekly';

    const agentSub = new AgentSubscriptionModel({
      userId: metadata?.userId,
      agentId: metadata?.agentId,
      plan: planType,
      price: subscription.items.data[0]?.price?.unit_amount
        ? subscription.items.data[0].price.unit_amount / 100
        : 0,
      status: subscription.status === 'active' ? 'active' : 'expired',
      startDate: new Date(subscription.current_period_start * 1000),
      expiryDate: new Date(subscription.current_period_end * 1000),
      autoRenew: !subscription.cancel_at_period_end,
    });

    await agentSub.save();
    console.log('✅ Agent subscription created:', agentSub._id);
  } else {
    console.log('ℹ️ Agent subscription already exists, skipping creation');
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  const AgentSubscriptionModel = await getAgentSubscriptionModel();

  const existingSubscription = await AgentSubscriptionModel.findOne({
    userId: subscription.metadata?.userId,
    agentId: subscription.metadata?.agentId,
  });

  if (!existingSubscription) {
    // Map Stripe interval to our plan types
    let planType: 'daily' | 'weekly' | 'monthly' = 'monthly';
    if (subscription.items.data[0]?.price?.recurring?.interval === 'day')
      planType = 'daily';
    else if (subscription.items.data[0]?.price?.recurring?.interval === 'week')
      planType = 'weekly';

    const agentSub = new AgentSubscriptionModel({
      userId: subscription.metadata?.userId,
      agentId: subscription.metadata?.agentId,
      plan: planType,
      price: subscription.items.data[0]?.price?.unit_amount
        ? subscription.items.data[0].price.unit_amount / 100
        : 0,
      status: subscription.status === 'active' ? 'active' : 'expired',
      startDate: new Date(subscription.current_period_start * 1000),
      expiryDate: new Date(subscription.current_period_end * 1000),
      autoRenew: !subscription.cancel_at_period_end,
    });

    await agentSub.save();
    console.log('Agent subscription created:', agentSub._id);
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  const AgentSubscriptionModel = await getAgentSubscriptionModel();

  const existingSubscription = await AgentSubscriptionModel.findOne({
    userId: subscription.metadata?.userId,
    agentId: subscription.metadata?.agentId,
  });

  if (!existingSubscription) {
    console.log(
      'Agent subscription not found in database, creating new record'
    );

    // Map Stripe interval to our plan types
    let planType: 'daily' | 'weekly' | 'monthly' = 'monthly';
    if (subscription.items.data[0]?.price?.recurring?.interval === 'day')
      planType = 'daily';
    else if (subscription.items.data[0]?.price?.recurring?.interval === 'week')
      planType = 'weekly';

    const agentSub = new AgentSubscriptionModel({
      userId: subscription.metadata?.userId,
      agentId: subscription.metadata?.agentId,
      plan: planType,
      price: subscription.items.data[0]?.price?.unit_amount
        ? subscription.items.data[0].price.unit_amount / 100
        : 0,
      status: subscription.status === 'active' ? 'active' : 'expired',
      startDate: new Date(subscription.current_period_start * 1000),
      expiryDate: new Date(subscription.current_period_end * 1000),
      autoRenew: !subscription.cancel_at_period_end,
    });

    await agentSub.save();
    console.log('Agent subscription created:', agentSub._id);
  } else {
    // Update existing subscription
    existingSubscription.status =
      subscription.status === 'active' ? 'active' : 'expired';
    existingSubscription.expiryDate = new Date(
      subscription.current_period_end * 1000
    );
    existingSubscription.autoRenew = !subscription.cancel_at_period_end;
    existingSubscription.updatedAt = new Date();

    await existingSubscription.save();
    console.log('Agent subscription updated:', existingSubscription._id);
  }
}

/**
 * Handle subscription deleted/cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  const AgentSubscriptionModel = await getAgentSubscriptionModel();

  const existingSubscription = await AgentSubscriptionModel.findOne({
    userId: subscription.metadata?.userId,
    agentId: subscription.metadata?.agentId,
  });

  if (existingSubscription) {
    existingSubscription.status = 'canceled';
    existingSubscription.updatedAt = new Date();
    await existingSubscription.save();
    console.log('Agent subscription marked as canceled in database');
  }
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);

  if (invoice.subscription) {
    // Get the subscription object from Stripe to access metadata
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    const AgentSubscriptionModel = await getAgentSubscriptionModel();

    const existingSubscription = await AgentSubscriptionModel.findOne({
      userId: subscription.metadata?.userId,
      agentId: subscription.metadata?.agentId,
    });

    if (existingSubscription && existingSubscription.status !== 'active') {
      existingSubscription.status = 'active';
      existingSubscription.updatedAt = new Date();
      await existingSubscription.save();
      console.log('Agent subscription reactivated after payment');
    }
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);

  if (invoice.subscription) {
    // Get the subscription object from Stripe to access metadata
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    const AgentSubscriptionModel = await getAgentSubscriptionModel();

    const existingSubscription = await AgentSubscriptionModel.findOne({
      userId: subscription.metadata?.userId,
      agentId: subscription.metadata?.agentId,
    });

    if (existingSubscription) {
      existingSubscription.status = 'past_due';
      existingSubscription.updatedAt = new Date();
      await existingSubscription.save();
      console.log('Agent subscription marked as past_due');
    }
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
