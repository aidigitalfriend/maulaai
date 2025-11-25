/**
 * Stripe Webhook Handler
 * Processes Stripe webhook events for subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';

// Disable body parsing for webhooks
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get raw body
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout session completed:', {
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription,
    metadata: session.metadata,
  });

  const { userId, agentId, agentName, plan } = session.metadata || {};

  if (!userId || !agentId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  try {
    await dbConnect();
    
    // Get subscription details from Stripe to get all needed data
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-11-17.clover',
    });
    
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Get customer email
    const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
    
    // Create subscription in database
    await Subscription.create({
      userId,
      email: customer.email || session.customer_details?.email || '',
      agentId,
      agentName: agentName || agentId,
      plan: plan as 'daily' | 'weekly' | 'monthly',
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: session.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      status: subscription.status,
      price: subscription.items.data[0].price.unit_amount || 0,
      currency: subscription.items.data[0].price.currency,
      startDate: new Date(subscription.start_date * 1000),
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    console.log(`✅ Subscription saved to database: User ${userId} subscribed to ${agentName} (${plan} plan)`);
  } catch (error: any) {
    console.error('Error saving subscription to database:', error.message);
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('✅ Subscription created:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    metadata: subscription.metadata,
  });

  const { userId, agentId, agentName, plan } = subscription.metadata || {};

  if (!userId || !agentId) {
    console.error('Missing metadata in subscription.created event');
    return;
  }

  try {
    await dbConnect();
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-11-17.clover',
    });
    
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    
    // Upsert subscription (create if doesn't exist, update if exists)
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        userId,
        email: customer.email || '',
        agentId,
        agentName: agentName || agentId,
        plan: plan as 'daily' | 'weekly' | 'monthly',
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        status: subscription.status,
        price: subscription.items.data[0].price.unit_amount || 0,
        currency: subscription.items.data[0].price.currency,
        startDate: new Date(subscription.start_date * 1000),
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Subscription created in database: ${subscription.id}`);
  } catch (error: any) {
    console.error('Error updating subscription in database:', error.message);
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('✅ Subscription updated:', {
    subscriptionId: subscription.id,
    status: subscription.status,
    metadata: subscription.metadata,
  });

  try {
    await dbConnect();
    
    // Update subscription in database
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
      },
      { new: true }
    );

    console.log(`✅ Subscription updated in database: ${subscription.id}`);
  } catch (error: any) {
    console.error('Error updating subscription in database:', error.message);
  }
}

/**
 * Handle subscription deleted/cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', {
    subscriptionId: subscription.id,
    metadata: subscription.metadata,
  });

  const { userId, agentId } = subscription.metadata || {};

  if (!userId || !agentId) {
    console.error('Missing metadata in subscription');
    return;
  }

  try {
    await dbConnect();
    
    // Mark subscription as canceled in database
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status: 'canceled',
        canceledAt: new Date(),
      },
      { new: true }
    );

    console.log(`✅ Subscription cancelled in database for user ${userId}, agent ${agentId}`);
  } catch (error: any) {
    console.error('Error cancelling subscription in database:', error.message);
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('✅ Invoice payment succeeded:', {
    invoiceId: invoice.id,
    subscriptionId: (invoice as any).subscription,
    amountPaid: invoice.amount_paid / 100,
  });

  try {
    await dbConnect();
    
    const subscriptionId = (invoice as any).subscription as string;
    if (subscriptionId) {
      // Ensure subscription is marked as active
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        { status: 'active' },
        { new: true }
      );
      console.log(`✅ Payment recorded for subscription: ${subscriptionId}`);
    }
  } catch (error: any) {
    console.error('Error recording payment in database:', error.message);
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Invoice payment failed:', {
    invoiceId: invoice.id,
    subscriptionId: (invoice as any).subscription,
    attemptCount: invoice.attempt_count,
  });

  try {
    await dbConnect();
    
    const subscriptionId = (invoice as any).subscription as string;
    if (subscriptionId) {
      // Mark subscription as past_due
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        { status: 'past_due' },
        { new: true }
      );
      console.log(`⚠️ Subscription marked as past_due: ${subscriptionId}`);
    }
  } catch (error: any) {
    console.error('Error updating subscription status in database:', error.message);
  }
}
