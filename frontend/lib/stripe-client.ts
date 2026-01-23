/**
 * Stripe Client Library
 * Handles one-time payments for agent access (NOT recurring subscriptions)
 */

import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// All supported agents - single source of truth
const AGENT_IDS = [
  'julie-girlfriend',
  'emma-emotional',
  'einstein',
  'tech-wizard',
  'mrs-boss',
  'comedy-king',
  'chess-player',
  'fitness-guru',
  'travel-buddy',
  'drama-queen',
  'chef-biew',
  'professor-astrology',
  'nid-gaming',
  'ben-sega',
  'bishop-burger',
  'knight-logic',
  'lazy-pawn',
  'rook-jokey',
] as const;

type AgentId = (typeof AGENT_IDS)[number];

// Convert agent-id to ENV_VAR format: julie-girlfriend -> JULIE_GIRLFRIEND
function agentIdToEnvKey(agentId: string): string {
  return agentId.toUpperCase().replace(/-/g, '_');
}

// Pricing configuration
const PLAN_CONFIG = {
  daily: { price: 1, interval: 'day' as const },
  weekly: { price: 5, interval: 'week' as const },
  monthly: { price: 15, interval: 'month' as const },
};

/**
 * Get agent-specific subscription plan - dynamically reads env vars
 */
export function getAgentSubscriptionPlan(
  agentId: string,
  plan: 'daily' | 'weekly' | 'monthly'
) {
  const envKey = agentIdToEnvKey(agentId);
  const planUpper = plan.toUpperCase();

  const productId = process.env[`STRIPE_PRODUCT_${envKey}_${planUpper}`];
  const priceId = process.env[`STRIPE_PRICE_${envKey}_${planUpper}`];

  if (!productId || !priceId) {
    throw new Error(
      `Product/price IDs not configured for agent ${agentId} plan ${plan}. ` +
        `Expected env vars: STRIPE_PRODUCT_${envKey}_${planUpper}, STRIPE_PRICE_${envKey}_${planUpper}`
    );
  }

  const config = PLAN_CONFIG[plan];

  return {
    name: `${agentId} ${plan.charAt(0).toUpperCase() + plan.slice(1)} Access`,
    price: config.price,
    interval: config.interval,
    productId,
    priceId,
  };
}

// Legacy global plans (kept for backward compatibility)
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
    price: 15,
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
  // Get agent-specific plan details
  const planDetails = getAgentSubscriptionPlan(agentId, plan);

  // Create checkout session for ONE-TIME PAYMENT (not recurring subscription)
  // Users pay once for access period (daily/weekly/monthly) - NO auto-renewal
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: userEmail,
    line_items: [
      {
        price: planDetails.priceId,
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        userId,
        agentId,
        agentName,
        plan,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      agentId,
      agentName,
      plan,
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
