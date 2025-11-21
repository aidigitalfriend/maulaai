/**
 * Stripe Payment Integration
 * Handles subscription creation, management, and webhooks
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export interface SubscriptionPlan {
  id: 'daily' | 'weekly' | 'monthly';
  name: string;
  price: number;
  interval: 'day' | 'week' | 'month';
  productId: string;
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  daily: {
    id: 'daily',
    name: 'Daily Agent Access',
    price: 1.00,
    interval: 'day',
    productId: process.env.STRIPE_PRODUCT_DAILY || 'prod_TSuDEWjIhWSjqX',
  },
  weekly: {
    id: 'weekly',
    name: 'Weekly Agent Access',
    price: 5.00,
    interval: 'week',
    productId: process.env.STRIPE_PRODUCT_WEEKLY || 'prod_TSuEOiHfZqKpEi',
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly Agent Access',
    price: 19.00,
    interval: 'month',
    productId: process.env.STRIPE_PRODUCT_MONTHLY || 'prod_TSuFWXRAcysUCu',
  },
};

/**
 * Create a Stripe checkout session for agent subscription
 */
export async function createCheckoutSession(params: {
  agentId: string;
  agentName: string;
  plan: 'daily' | 'weekly' | 'monthly';
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const { agentId, agentName, plan, userId, userEmail, successUrl, cancelUrl } = params;

  const subscriptionPlan = SUBSCRIPTION_PLANS[plan];
  if (!subscriptionPlan) {
    throw new Error(`Invalid subscription plan: ${plan}`);
  }

  // Get or create price for this product
  const prices = await stripe.prices.list({
    product: subscriptionPlan.productId,
    active: true,
    limit: 10,
  });

  let priceId = prices.data.find(
    (p) => p.recurring?.interval === subscriptionPlan.interval
  )?.id;

  // If price doesn't exist, create it
  if (!priceId) {
    const price = await stripe.prices.create({
      product: subscriptionPlan.productId,
      unit_amount: Math.round(subscriptionPlan.price * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: subscriptionPlan.interval,
        interval_count: 1,
      },
    });
    priceId = price.id;
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId,
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
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  });

  return session;
}

/**
 * Get subscription details by Stripe subscription ID
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return null;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get customer's active subscriptions
 */
export async function getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 100,
  });
  return subscriptions.data;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
