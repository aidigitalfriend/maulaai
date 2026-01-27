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

// Convert agent-id to display name: chess-player -> Chess Player
function agentIdToDisplayName(agentId: string): string {
  return agentId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Pricing configuration (in cents for Stripe)
const PLAN_CONFIG = {
  daily: { price: 1, priceCents: 100, interval: 'day' as const },
  weekly: { price: 5, priceCents: 500, interval: 'week' as const },
  monthly: { price: 15, priceCents: 1500, interval: 'month' as const },
};

// Cache for dynamically created products/prices
const productCache = new Map<string, string>();
const priceCache = new Map<string, string>();

/**
 * Get or create a Stripe product for an agent
 */
async function getOrCreateProduct(agentId: string, agentName?: string): Promise<string> {
  const cacheKey = agentId;
  
  if (productCache.has(cacheKey)) {
    return productCache.get(cacheKey)!;
  }

  // Check env var first
  const envKey = agentIdToEnvKey(agentId);
  const envProductId = process.env[`STRIPE_PRODUCT_${envKey}`];
  if (envProductId) {
    productCache.set(cacheKey, envProductId);
    return envProductId;
  }

  // Search for existing product
  const displayName = agentName || agentIdToDisplayName(agentId);
  const existingProducts = await stripe.products.search({
    query: `metadata['agentId']:'${agentId}'`,
    limit: 1,
  });

  if (existingProducts.data.length > 0) {
    const productId = existingProducts.data[0].id;
    productCache.set(cacheKey, productId);
    return productId;
  }

  // Create new product
  const product = await stripe.products.create({
    name: `${displayName} - AI Agent Access`,
    description: `Access to ${displayName} AI agent on OnelastAI.com`,
    metadata: {
      agentId,
      type: 'agent_access',
    },
  });

  productCache.set(cacheKey, product.id);
  console.log(`[Stripe] Created product for agent ${agentId}: ${product.id}`);
  return product.id;
}

/**
 * Get or create a Stripe price for an agent plan
 */
async function getOrCreatePrice(
  agentId: string, 
  plan: 'daily' | 'weekly' | 'monthly',
  productId: string
): Promise<string> {
  const cacheKey = `${agentId}_${plan}`;
  
  if (priceCache.has(cacheKey)) {
    return priceCache.get(cacheKey)!;
  }

  // Check env var first
  const envKey = agentIdToEnvKey(agentId);
  const planUpper = plan.toUpperCase();
  const envPriceId = process.env[`STRIPE_PRICE_${envKey}_${planUpper}`];
  if (envPriceId) {
    priceCache.set(cacheKey, envPriceId);
    return envPriceId;
  }

  // Search for existing price
  const existingPrices = await stripe.prices.search({
    query: `metadata['agentId']:'${agentId}' AND metadata['plan']:'${plan}'`,
    limit: 1,
  });

  if (existingPrices.data.length > 0) {
    const priceId = existingPrices.data[0].id;
    priceCache.set(cacheKey, priceId);
    return priceId;
  }

  // Create new price (one-time payment)
  const config = PLAN_CONFIG[plan];
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: config.priceCents,
    currency: 'usd',
    metadata: {
      agentId,
      plan,
      type: 'one_time_access',
    },
  });

  priceCache.set(cacheKey, price.id);
  console.log(`[Stripe] Created price for agent ${agentId} ${plan}: ${price.id}`);
  return price.id;
}

/**
 * Get agent-specific subscription plan - dynamically creates if not configured
 */
export async function getAgentSubscriptionPlan(
  agentId: string,
  plan: 'daily' | 'weekly' | 'monthly',
  agentName?: string
) {
  const envKey = agentIdToEnvKey(agentId);
  const planUpper = plan.toUpperCase();

  // Check for pre-configured env vars first
  let productId = process.env[`STRIPE_PRODUCT_${envKey}_${planUpper}`];
  let priceId = process.env[`STRIPE_PRICE_${envKey}_${planUpper}`];

  // If not configured, dynamically create/retrieve
  if (!productId || !priceId) {
    console.log(`[Stripe] No env vars for ${agentId} ${plan}, creating dynamically...`);
    productId = await getOrCreateProduct(agentId, agentName);
    priceId = await getOrCreatePrice(agentId, plan, productId);
  }

  const config = PLAN_CONFIG[plan];

  return {
    name: `${agentIdToDisplayName(agentId)} ${plan.charAt(0).toUpperCase() + plan.slice(1)} Access`,
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
  // Get agent-specific plan details (now async to support dynamic creation)
  const planDetails = await getAgentSubscriptionPlan(agentId, plan, agentName);

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
