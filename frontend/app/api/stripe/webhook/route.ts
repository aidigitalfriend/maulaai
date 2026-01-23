/**
 * Stripe Webhook Handler - PostgreSQL/Prisma version
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function safeDateFromUnix(seconds?: number | null, plan?: 'daily' | 'weekly' | 'monthly') {
  const base = seconds ? new Date(seconds * 1000) : new Date();
  const date = isNaN(base.getTime()) ? new Date() : base;
  if (!plan) return date;
  const fallback = new Date(date);
  switch (plan) {
    case 'daily': fallback.setDate(fallback.getDate() + 1); break;
    case 'weekly': fallback.setDate(fallback.getDate() + 7); break;
    case 'monthly': default: fallback.setMonth(fallback.getMonth() + 1); break;
  }
  return fallback;
}

export async function POST(request: NextRequest) {
  console.log('🔥 STRIPE WEBHOOK RECEIVED');

  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      if (!WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET not configured');
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
      console.log('✅ Webhook signature verified');
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('🎯 Stripe webhook event:', { type: event.type, id: event.id });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
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
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('📦 Processing checkout.session.completed:', session.id);

  const userId = session.metadata?.userId;
  const agentId = session.metadata?.agentId;
  const plan = (session.metadata?.plan || 'monthly') as 'daily' | 'weekly' | 'monthly';

  if (!userId || !agentId) {
    console.warn('Missing userId or agentId in session metadata');
    return;
  }

  const amount = session.amount_total ? session.amount_total / 100 : 0;
  const expiryDate = safeDateFromUnix(null, plan);

  // Create subscription
  await prisma.agentSubscription.create({
    data: {
      userId,
      agentId,
      plan,
      price: amount,
      status: 'active',
      startDate: new Date(),
      expiryDate,
      stripeSubscriptionId: session.subscription as string || null,
      autoRenew: session.mode === 'subscription',
    },
  });

  // Create transaction record
  await prisma.transaction.create({
    data: {
      transactionId: session.id,
      userId,
      stripePaymentIntentId: session.payment_intent as string || null,
      type: 'subscription',
      item: { agentId, plan },
      amount,
      currency: session.currency?.toUpperCase() || 'USD',
      status: 'completed',
    },
  });

  console.log(`✅ Subscription created for user ${userId}, agent ${agentId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('📦 Processing subscription update:', subscription.id);

  const existingSub = await prisma.agentSubscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (existingSub) {
    // Get period end from first subscription item
    const periodEnd = subscription.items?.data?.[0]?.current_period_end;
    
    await prisma.agentSubscription.update({
      where: { id: existingSub.id },
      data: {
        status: subscription.status === 'active' ? 'active' : 'cancelled',
        expiryDate: periodEnd ? safeDateFromUnix(periodEnd) : undefined,
      },
    });
    console.log(`✅ Subscription ${subscription.id} updated`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('📦 Processing subscription deletion:', subscription.id);

  await prisma.agentSubscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'cancelled' },
  });
  console.log(`✅ Subscription ${subscription.id} cancelled`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('📦 Processing invoice.paid:', invoice.id);

  // Get subscription info from parent.subscription_details (new API structure)
  const subscriptionDetails = invoice.parent?.subscription_details;
  const subscriptionId = subscriptionDetails?.subscription as string | undefined;
  
  if (!subscriptionId || !invoice.customer) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (userId) {
    await prisma.transaction.create({
      data: {
        transactionId: invoice.id,
        userId,
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: subscriptionId,
        type: 'renewal',
        amount: (invoice.amount_paid || 0) / 100,
        currency: invoice.currency?.toUpperCase() || 'USD',
        status: 'completed',
      },
    });
    console.log(`✅ Invoice ${invoice.id} recorded`);
  }
}
