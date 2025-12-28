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
import {
  createInvoiceRecord,
  createPaymentRecord,
  createBillingRecord,
  getPaymentDetailsFromSubscription,
} from '../../../../lib/billing-helpers';

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
    payment_status: paymentStatus,
    mode,
  } = session;
  const metadata = session.metadata;

  console.log('👤 Session data extracted:', {
    userId,
    email,
    subscriptionId,
    paymentStatus,
    mode,
    metadata,
  });

  if (!metadata || !userId || !email) {
    console.error('❌ Missing required session data:', {
      userId,
      email,
      subscriptionId,
      paymentStatus,
      mode,
      metadata,
    });
    return;
  }

  // For payment mode, check if payment was successful
  if (mode === 'payment' && paymentStatus !== 'paid') {
    console.log('ℹ️ Payment not completed yet, status:', paymentStatus);
    return;
  }

  // For subscription mode, ensure subscription exists
  if (mode === 'subscription' && !subscriptionId) {
    console.error('❌ Missing subscription ID for subscription mode');
    return;
  }

  let stripeSubscriptionId: string | undefined;

  if (mode === 'subscription' && subscriptionId) {
    // Get full subscription details from Stripe
    console.log(
      '🔍 Fetching subscription details from Stripe:',
      subscriptionId
    );
    const subscription = await stripe.subscriptions.retrieve(
      subscriptionId as string
    );
    console.log('✅ Subscription details retrieved:', {
      id: subscription.id,
      status: subscription.status,
      items: subscription.items.data.length,
      cancel_at_period_end: subscription.cancel_at_period_end,
    });

    // ✅ CRITICAL: Set cancel_at_period_end = true for one-time purchase model
    if (!subscription.cancel_at_period_end) {
      console.log('🔧 Setting cancel_at_period_end for one-time purchase...');
      try {
        await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true,
        });
        console.log(
          '✅ Subscription set to cancel at period end (no auto-renewal)'
        );
      } catch (error) {
        console.error('❌ Failed to set cancel_at_period_end:', error);
      }
    }
    stripeSubscriptionId = subscription.id;
  } else if (mode === 'payment') {
    // For payment mode, use session id as reference
    stripeSubscriptionId = session.id;
  }

  // Save subscription to MongoDB
  console.log('💾 Saving agent subscription to database...');
  const AgentSubscriptionModel = await getAgentSubscriptionModel();

  // Check if subscription already exists by Stripe ID (avoid duplicates)
  const existingByStripeId = await AgentSubscriptionModel.findOne({
    stripeSubscriptionId: stripeSubscriptionId,
  });

  if (existingByStripeId) {
    console.log(
      'ℹ️ Subscription already processed (Stripe ID):',
      stripeSubscriptionId
    );
    return;
  }

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
      agentName: metadata?.agentName, // Add agent name
      plan: planType,
      price: subscription.items.data[0]?.price?.unit_amount
        ? subscription.items.data[0].price.unit_amount / 100
        : 0,
      status: subscription.status === 'active' ? 'active' : 'expired',
      startDate: new Date(subscription.current_period_start * 1000),
      expiryDate: new Date(subscription.current_period_end * 1000),
      autoRenew: false, // Always false for one-time purchase model
      stripeSubscriptionId: subscription.id, // Store Stripe ID to prevent duplicates
      billing: {
        // Add billing sub-document
        interval:
          planType === 'daily'
            ? 'day'
            : planType === 'weekly'
            ? 'week'
            : 'month',
        amount: subscription.items.data[0]?.price?.unit_amount || 0,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    await agentSub.save();
    console.log('✅ Agent subscription created:', agentSub._id);

    // 💰 CREATE INVOICE RECORD
    await createInvoiceRecord({
      userId: metadata?.userId as string,
      email: email as string,
      stripeSubscriptionId: subscription.id,
      agentId: metadata?.agentId as string,
      agentName: metadata?.agentName as string,
      plan: planType,
      amount: agentSub.price,
      currency: 'usd',
      status: 'paid',
      paidAt: new Date(subscription.current_period_start * 1000),
    });

    // 💳 CREATE PAYMENT RECORD
    const paymentDetails = await getPaymentDetailsFromSubscription(
      stripe,
      subscription.id
    );
    await createPaymentRecord({
      userId: metadata?.userId as string,
      email: email as string,
      stripePaymentIntentId: paymentDetails?.paymentIntentId,
      stripeChargeId: paymentDetails?.chargeId,
      stripeInvoiceId: paymentDetails?.invoiceId,
      stripeSubscriptionId: subscription.id,
      agentId: metadata?.agentId as string,
      agentName: metadata?.agentName as string,
      plan: planType,
      amount: agentSub.price,
      currency: 'usd',
      status: 'succeeded',
      paymentMethod: paymentDetails?.paymentMethod || 'card',
      last4: paymentDetails?.last4,
      brand: paymentDetails?.brand,
    });

    // 📋 CREATE BILLING HISTORY RECORD
    await createBillingRecord({
      userId: metadata?.userId as string,
      email: email as string,
      type: 'subscription',
      stripeSubscriptionId: subscription.id,
      agentId: metadata?.agentId as string,
      agentName: metadata?.agentName as string,
      plan: planType,
      amount: agentSub.price,
      currency: 'usd',
      description: `Purchased ${metadata?.agentName} - ${planType} plan`,
    });
  } else {
    console.log('ℹ️ Agent subscription already exists, skipping creation');
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🆕 Subscription created:', subscription.id);

  // ✅ CRITICAL: Set cancel_at_period_end = true for one-time purchase model
  // If the subscription has the cancelAtPeriodEnd metadata flag, update it in Stripe
  if (
    subscription.metadata?.cancelAtPeriodEnd === 'true' &&
    !subscription.cancel_at_period_end
  ) {
    console.log('🔧 Setting cancel_at_period_end for one-time purchase...');
    try {
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
      console.log(
        '✅ Subscription set to cancel at period end (no auto-renewal)'
      );
    } catch (error) {
      console.error('❌ Failed to set cancel_at_period_end:', error);
    }
  }

  const AgentSubscriptionModel = await getAgentSubscriptionModel();

  // Check if subscription already exists by Stripe ID (avoid duplicates)
  const existingByStripeId = await AgentSubscriptionModel.findOne({
    stripeSubscriptionId: subscription.id,
  });

  if (existingByStripeId) {
    console.log(
      'ℹ️ Subscription already processed (Stripe ID):',
      subscription.id
    );
    return;
  }

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
      autoRenew: false, // Always false for one-time purchase model
      stripeSubscriptionId: subscription.id, // Store Stripe ID to prevent duplicates
    });

    await agentSub.save();
    console.log('✅ Agent subscription created:', agentSub._id);
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
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
      autoRenew: false, // Always false for one-time purchase model
    });

    await agentSub.save();
    console.log('✅ Agent subscription created:', agentSub._id);
  } else {
    // Update existing subscription
    existingSubscription.status =
      subscription.status === 'active' ? 'active' : 'expired';
    existingSubscription.expiryDate = new Date(
      subscription.current_period_end * 1000
    );
    existingSubscription.autoRenew = false; // Always false for one-time purchase model
    existingSubscription.updatedAt = new Date();

    await existingSubscription.save();
    console.log('✅ Agent subscription updated:', existingSubscription._id);
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
