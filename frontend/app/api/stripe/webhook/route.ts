/**
 * Stripe Webhook Handler
 * Receives events from Stripe and saves subscriptions to MongoDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '../../../../lib/stripe-client';
import { connectToDatabase } from '../../../../lib/mongodb-client';
import { getSubscriptionModel } from '../../../../models/Subscription';
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
  console.log('💾 Saving subscription to database...');
  await saveSubscriptionToDatabase(subscription, userId, email, metadata);
  console.log('✅ Subscription saved successfully');
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);

  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);

  if ('deleted' in customer && customer.deleted) {
    console.error('Customer deleted:', customerId);
    return;
  }

  const email = customer.email || '';
  const userId = subscription.metadata?.userId || '';

  if (!userId || !email) {
    console.error('Missing userId or email in subscription metadata');
    return;
  }

  await saveSubscriptionToDatabase(
    subscription,
    userId,
    email,
    subscription.metadata
  );
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  const SubscriptionModel = await getSubscriptionModel();

  const existingSubscription = await SubscriptionModel.findOne({
    stripeSubscriptionId: subscription.id,
  });

  if (!existingSubscription) {
    console.log('Subscription not found in database, creating new record');
    const customerId = subscription.customer as string;
    const customer = await stripe.customers.retrieve(customerId);

    if ('deleted' in customer && customer.deleted) {
      console.error('Customer deleted:', customerId);
      return;
    }

    const email = customer.email || '';
    const userId = subscription.metadata?.userId || '';

    await saveSubscriptionToDatabase(
      subscription,
      userId,
      email,
      subscription.metadata
    );
    return;
  }

  // Update existing subscription
  existingSubscription.status = subscription.status;
  existingSubscription.currentPeriodStart = new Date(
    subscription.current_period_start * 1000
  );
  existingSubscription.currentPeriodEnd = new Date(
    subscription.current_period_end * 1000
  );
  existingSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;

  if (subscription.canceled_at) {
    existingSubscription.canceledAt = new Date(subscription.canceled_at * 1000);
  }

  await existingSubscription.save();
  console.log('Subscription updated in database:', subscription.id);

  // Also update agent subscription status
  await updateAgentSubscriptionStatus(subscription);
}

/**
 * Handle subscription deleted/cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  const SubscriptionModel = await getSubscriptionModel();

  const existingSubscription = await SubscriptionModel.findOne({
    stripeSubscriptionId: subscription.id,
  });

  if (existingSubscription) {
    existingSubscription.status = 'canceled';
    existingSubscription.canceledAt = new Date();
    await existingSubscription.save();
    console.log('Subscription marked as canceled in database');
  }

  // Also cancel agent subscription
  await cancelAgentSubscription(subscription);
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);
  const SubscriptionModel = await getSubscriptionModel();

  if (invoice.subscription) {
    const subscription = await SubscriptionModel.findOne({
      stripeSubscriptionId: invoice.subscription as string,
    });

    if (subscription && subscription.status !== 'active') {
      subscription.status = 'active';
      await subscription.save();
      console.log('Subscription reactivated after payment');
    }
  }

  // Also reactivate agent subscription
  await reactivateAgentSubscription(invoice);
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  const SubscriptionModel = await getSubscriptionModel();

  if (invoice.subscription) {
    const subscription = await SubscriptionModel.findOne({
      stripeSubscriptionId: invoice.subscription as string,
    });

    if (subscription) {
      subscription.status = 'past_due';
      await subscription.save();
      console.log('Subscription marked as past_due');
    }
  }

  // Also mark agent subscription as past_due
  await failAgentSubscriptionPayment(invoice);
}

/**
 * Save subscription to MongoDB database
 */
async function saveSubscriptionToDatabase(
  subscription: Stripe.Subscription,
  userId: string,
  email: string,
  metadata: Stripe.Metadata | undefined
) {
  const { agentId, agentName, plan } = metadata || {};
  const SubscriptionModel = await getSubscriptionModel();

  if (!agentId || !agentName || !plan) {
    console.error('Missing required metadata:', metadata);
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id || '';
  const amount = subscription.items.data[0]?.price?.unit_amount || 0;

  // Check if subscription already exists
  const existingSubscription = await SubscriptionModel.findOne({
    stripeSubscriptionId: subscription.id,
  });

  if (existingSubscription) {
    console.log('Subscription already exists in database:', subscription.id);
    return;
  }

  // Create new subscription record
  const newSubscription = new SubscriptionModel({
    userId,
    email,
    agentId,
    agentName,
    plan,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: priceId,
    status: subscription.status,
    price: amount,
    currency: subscription.currency || 'usd',
    startDate: new Date(subscription.start_date * 1000),
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  await newSubscription.save();
  console.log('Subscription saved to database:', subscription.id);

  // Also create AgentSubscription record for frontend compatibility
  await saveAgentSubscriptionToDatabase(subscription, userId, metadata);
}

/**
 * Save agent subscription to MongoDB database (for frontend compatibility)
 */
async function saveAgentSubscriptionToDatabase(
  subscription: Stripe.Subscription,
  userId: string,
  metadata: Stripe.Metadata | undefined
) {
  console.log('🤖 Starting agent subscription save process:', {
    userId,
    metadata,
  });

  const { agentId, agentName, plan } = metadata || {};
  const AgentSubscriptionModel = await getAgentSubscriptionModel();

  console.log('📋 Extracted metadata:', { agentId, agentName, plan });

  if (!agentId || !agentName || !plan) {
    console.error(
      '❌ Missing required metadata for agent subscription:',
      metadata
    );
    return;
  }

  const price = subscription.items.data[0]?.price?.unit_amount || 0;
  console.log('💰 Subscription price:', price);

  // Check if agent subscription already exists
  console.log('🔍 Checking for existing agent subscription...');
  const existingSubscription = await AgentSubscriptionModel.findOne({
    userId,
    agentId,
  });

  if (existingSubscription) {
    console.log('📝 Agent subscription already exists, updating status');
    existingSubscription.status = 'active';
    existingSubscription.expiryDate = new Date(
      subscription.current_period_end * 1000
    );
    await existingSubscription.save();
    console.log('✅ Existing agent subscription updated');
    return;
  }

  // Calculate expiry date based on plan
  const startDate = new Date();
  let expiryDate = new Date(startDate);
  switch (plan) {
    case 'daily':
      expiryDate.setDate(expiryDate.getDate() + 1);
      break;
    case 'weekly':
      expiryDate.setDate(expiryDate.getDate() + 7);
      break;
    case 'monthly':
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      break;
    default:
      expiryDate = new Date(subscription.current_period_end * 1000);
  }

  console.log('📅 Calculated expiry date:', {
    plan,
    startDate,
    expiryDate,
  });

  // Create new agent subscription record
  const newAgentSubscription = new AgentSubscriptionModel({
    userId,
    agentId,
    plan,
    price: price / 100, // Convert from cents
    status: 'active',
    startDate,
    expiryDate,
    autoRenew: !subscription.cancel_at_period_end,
  });

  console.log('💾 Saving new agent subscription to database...');
  await newAgentSubscription.save();
  console.log('✅ Agent subscription saved successfully:', {
    id: newAgentSubscription._id,
    agentId,
    userId,
    plan,
    status: 'active',
  });
}

/**
 * Update agent subscription status based on Stripe subscription
 */
async function updateAgentSubscriptionStatus(
  subscription: Stripe.Subscription
) {
  const AgentSubscriptionModel = await getAgentSubscriptionModel();

  // Find agent subscription by userId (we need to get userId from metadata or customer)
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);

  if ('deleted' in customer && customer.deleted) {
    console.error('Customer deleted:', customerId);
    return;
  }

  const userId = subscription.metadata?.userId || '';
  const agentId = subscription.metadata?.agentId || '';

  if (!userId || !agentId) {
    console.log(
      'Missing userId or agentId in subscription metadata for update'
    );
    return;
  }

  const agentSubscription = await AgentSubscriptionModel.findOne({
    userId,
    agentId,
  });

  if (agentSubscription) {
    // Update status based on Stripe subscription status
    if (subscription.status === 'active') {
      agentSubscription.status = 'active';
      agentSubscription.expiryDate = new Date(
        subscription.current_period_end * 1000
      );
    } else if (
      subscription.status === 'canceled' ||
      subscription.status === 'past_due'
    ) {
      agentSubscription.status = 'cancelled';
    } else if (subscription.status === 'incomplete_expired') {
      agentSubscription.status = 'expired';
    }

    agentSubscription.autoRenew = !subscription.cancel_at_period_end;
    await agentSubscription.save();
    console.log('Agent subscription updated:', agentId, subscription.status);
  }
}

/**
 * Cancel agent subscription when Stripe subscription is deleted
 */
async function cancelAgentSubscription(subscription: Stripe.Subscription) {
  const AgentSubscriptionModel = await getAgentSubscriptionModel();

  // Find agent subscription by userId (we need to get userId from metadata or customer)
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);

  if ('deleted' in customer && customer.deleted) {
    console.error('Customer deleted:', customerId);
    return;
  }

  const userId = subscription.metadata?.userId || '';
  const agentId = subscription.metadata?.agentId || '';

  if (!userId || !agentId) {
    console.log(
      'Missing userId or agentId in subscription metadata for cancellation'
    );
    return;
  }

  const agentSubscription = await AgentSubscriptionModel.findOne({
    userId,
    agentId,
  });

  if (agentSubscription) {
    agentSubscription.status = 'cancelled';
    await agentSubscription.save();
    console.log('Agent subscription cancelled:', agentId);
  }
}

/**
 * Reactivate agent subscription when invoice is paid
 */
async function reactivateAgentSubscription(invoice: Stripe.Invoice) {
  const AgentSubscriptionModel = await getAgentSubscriptionModel();

  if (invoice.subscription) {
    // Get the Stripe subscription to find metadata
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    const userId = subscription.metadata?.userId || '';
    const agentId = subscription.metadata?.agentId || '';

    if (userId && agentId) {
      const agentSubscription = await AgentSubscriptionModel.findOne({
        userId,
        agentId,
      });

      if (agentSubscription && agentSubscription.status !== 'active') {
        agentSubscription.status = 'active';
        agentSubscription.expiryDate = new Date(
          subscription.current_period_end * 1000
        );
        await agentSubscription.save();
        console.log('Agent subscription reactivated after payment:', agentId);
      }
    }
  }
}

/**
 * Mark agent subscription as past_due when payment fails
 */
async function failAgentSubscriptionPayment(invoice: Stripe.Invoice) {
  const AgentSubscriptionModel = await getAgentSubscriptionModel();

  if (invoice.subscription) {
    // Get the Stripe subscription to find metadata
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    const userId = subscription.metadata?.userId || '';
    const agentId = subscription.metadata?.agentId || '';

    if (userId && agentId) {
      const agentSubscription = await AgentSubscriptionModel.findOne({
        userId,
        agentId,
      });

      if (agentSubscription) {
        agentSubscription.status = 'cancelled'; // or 'past_due' if we add that status
        await agentSubscription.save();
        console.log(
          'Agent subscription marked as cancelled due to payment failure:',
          agentId
        );
      }
    }
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
