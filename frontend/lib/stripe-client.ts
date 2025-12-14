/**
 * Stripe Client Library
 * Wrapper for Stripe API functions used by API routes
 */

import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Subscription plans with pricing
export const SUBSCRIPTION_PLANS = {
  daily: {
    name: 'Daily Access',
    price: 1,
    interval: 'day' as const,
    productId: process.env.STRIPE_PRODUCT_DAILY!,
    priceId: process.env.STRIPE_PRICE_DAILY!,
  },
  weekly: {
    name: 'Weekly Access',
    price: 5,
    interval: 'week' as const,
    productId: process.env.STRIPE_PRODUCT_WEEKLY!,
    priceId: process.env.STRIPE_PRICE_WEEKLY!,
  },
  monthly: {
    name: 'Monthly Access',
    price: 19,
    interval: 'month' as const,
    productId: process.env.STRIPE_PRODUCT_MONTHLY!,
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
  },
};

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Create a Stripe checkout session for agent subscription
 */
export async function createCheckoutSession({
  agentId,
  agentName,
  plan,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
}: {
  agentId: string;
  agentName: string;
  plan: SubscriptionPlan;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const planDetails = SUBSCRIPTION_PLANS[plan];

  if (!planDetails) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [
      {
        price: planDetails.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      agentId,
      agentName,
      plan,
    },
    subscription_data: {
      metadata: {
        userId,
        agentId,
        agentName,
        plan,
      },
    },
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    throw new Error(
      `Webhook signature verification failed: ${
        err instanceof Error ? err.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Get subscription by ID
 */
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get customer subscriptions
 */
export async function getCustomerSubscriptions(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
  });
  return subscriptions.data;
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string) {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });
  return customers.data[0] || null;
}

export { stripe };
