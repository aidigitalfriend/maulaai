/**
 * Stripe Client Library
 * Handles one-time payments for agent access (NOT recurring subscriptions)
 */

import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Agent-specific product mappings
const AGENT_PRODUCTS: Record<
  string,
  Record<string, { productId: string; priceId: string }>
> = {
  'julie-girlfriend': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_JULIE-GIRLFRIEND_DAILY']!,
      priceId: process.env['STRIPE_PRICE_JULIE-GIRLFRIEND_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_JULIE-GIRLFRIEND_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_JULIE-GIRLFRIEND_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_JULIE-GIRLFRIEND_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_JULIE-GIRLFRIEND_MONTHLY']!,
    },
  },
  'emma-emotional': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_EMMA-EMOTIONAL_DAILY']!,
      priceId: process.env['STRIPE_PRICE_EMMA-EMOTIONAL_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_EMMA-EMOTIONAL_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_EMMA-EMOTIONAL_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_EMMA-EMOTIONAL_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_EMMA-EMOTIONAL_MONTHLY']!,
    },
  },
  einstein: {
    daily: {
      productId: process.env['STRIPE_PRODUCT_EINSTEIN_DAILY']!,
      priceId: process.env['STRIPE_PRICE_EINSTEIN_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_EINSTEIN_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_EINSTEIN_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_EINSTEIN_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_EINSTEIN_MONTHLY']!,
    },
  },
  'tech-wizard': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_TECH-WIZARD_DAILY']!,
      priceId: process.env['STRIPE_PRICE_TECH-WIZARD_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_TECH-WIZARD_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_TECH-WIZARD_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_TECH-WIZARD_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_TECH-WIZARD_MONTHLY']!,
    },
  },
  'mrs-boss': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_MRS-BOSS_DAILY']!,
      priceId: process.env['STRIPE_PRICE_MRS-BOSS_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_MRS-BOSS_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_MRS-BOSS_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_MRS-BOSS_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_MRS-BOSS_MONTHLY']!,
    },
  },
  'comedy-king': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_COMEDY-KING_DAILY']!,
      priceId: process.env['STRIPE_PRICE_COMEDY-KING_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_COMEDY-KING_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_COMEDY-KING_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_COMEDY-KING_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_COMEDY-KING_MONTHLY']!,
    },
  },
  'chess-player': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_CHESS-PLAYER_DAILY']!,
      priceId: process.env['STRIPE_PRICE_CHESS-PLAYER_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_CHESS-PLAYER_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_CHESS-PLAYER_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_CHESS-PLAYER_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_CHESS-PLAYER_MONTHLY']!,
    },
  },
  'fitness-guru': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_FITNESS-GURU_DAILY']!,
      priceId: process.env['STRIPE_PRICE_FITNESS-GURU_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_FITNESS-GURU_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_FITNESS-GURU_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_FITNESS-GURU_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_FITNESS-GURU_MONTHLY']!,
    },
  },
  'travel-buddy': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_TRAVEL-BUDDY_DAILY']!,
      priceId: process.env['STRIPE_PRICE_TRAVEL-BUDDY_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_TRAVEL-BUDDY_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_TRAVEL-BUDDY_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_TRAVEL-BUDDY_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_TRAVEL-BUDDY_MONTHLY']!,
    },
  },
  'drama-queen': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_DRAMA-QUEEN_DAILY']!,
      priceId: process.env['STRIPE_PRICE_DRAMA-QUEEN_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_DRAMA-QUEEN_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_DRAMA-QUEEN_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_DRAMA-QUEEN_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_DRAMA-QUEEN_MONTHLY']!,
    },
  },
  'chef-biew': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_CHEF-BIEW_DAILY']!,
      priceId: process.env['STRIPE_PRICE_CHEF-BIEW_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_CHEF-BIEW_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_CHEF-BIEW_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_CHEF-BIEW_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_CHEF-BIEW_MONTHLY']!,
    },
  },
  'professor-astrology': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_PROFESSOR-ASTROLOGY_DAILY']!,
      priceId: process.env['STRIPE_PRICE_PROFESSOR-ASTROLOGY_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_PROFESSOR-ASTROLOGY_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_PROFESSOR-ASTROLOGY_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_PROFESSOR-ASTROLOGY_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_PROFESSOR-ASTROLOGY_MONTHLY']!,
    },
  },
  // ✅ ALL 18 AGENTS NOW HAVE DEDICATED STRIPE PRODUCTS
  'nid-gaming': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_NID-GAMING_DAILY']!,
      priceId: process.env['STRIPE_PRICE_NID-GAMING_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_NID-GAMING_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_NID-GAMING_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_NID-GAMING_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_NID-GAMING_MONTHLY']!,
    },
  },
  'ben-sega': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_BEN-SEGA_DAILY']!,
      priceId: process.env['STRIPE_PRICE_BEN-SEGA_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_BEN-SEGA_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_BEN-SEGA_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_BEN-SEGA_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_BEN-SEGA_MONTHLY']!,
    },
  },
  'bishop-burger': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_BISHOP-BURGER_DAILY']!,
      priceId: process.env['STRIPE_PRICE_BISHOP-BURGER_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_BISHOP-BURGER_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_BISHOP-BURGER_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_BISHOP-BURGER_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_BISHOP-BURGER_MONTHLY']!,
    },
  },
  'knight-logic': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_KNIGHT-LOGIC_DAILY']!,
      priceId: process.env['STRIPE_PRICE_KNIGHT-LOGIC_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_KNIGHT-LOGIC_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_KNIGHT-LOGIC_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_KNIGHT-LOGIC_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_KNIGHT-LOGIC_MONTHLY']!,
    },
  },
  'lazy-pawn': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_LAZY-PAWN_DAILY']!,
      priceId: process.env['STRIPE_PRICE_LAZY-PAWN_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_LAZY-PAWN_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_LAZY-PAWN_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_LAZY-PAWN_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_LAZY-PAWN_MONTHLY']!,
    },
  },
  'rook-jokey': {
    daily: {
      productId: process.env['STRIPE_PRODUCT_ROOK-JOKEY_DAILY']!,
      priceId: process.env['STRIPE_PRICE_ROOK-JOKEY_DAILY']!,
    },
    weekly: {
      productId: process.env['STRIPE_PRODUCT_ROOK-JOKEY_WEEKLY']!,
      priceId: process.env['STRIPE_PRICE_ROOK-JOKEY_WEEKLY']!,
    },
    monthly: {
      productId: process.env['STRIPE_PRODUCT_ROOK-JOKEY_MONTHLY']!,
      priceId: process.env['STRIPE_PRICE_ROOK-JOKEY_MONTHLY']!,
    },
  },
};

/**
 * Get agent-specific subscription plan
 */
export function getAgentSubscriptionPlan(
  agentId: string,
  plan: 'daily' | 'weekly' | 'monthly'
) {
  const agentProducts = AGENT_PRODUCTS[agentId];
  if (!agentProducts) {
    console.warn(
      `Agent ${agentId} not found in product mappings, using fallback products`
    );
    // Fallback to generic products if agent not configured
    return {
      name: `${agentId} ${plan.charAt(0).toUpperCase() + plan.slice(1)} Access`,
      price: plan === 'daily' ? 1 : plan === 'weekly' ? 5 : 19,
      interval: plan === 'daily' ? 'day' : plan === 'weekly' ? 'week' : 'month',
      productId:
        process.env['STRIPE_PRODUCT_JULIE-GIRLFRIEND_' + plan.toUpperCase()]!,
      priceId:
        process.env['STRIPE_PRICE_JULIE-GIRLFRIEND_' + plan.toUpperCase()]!,
    };
  }

  const planData = agentProducts[plan];
  if (!planData.productId || !planData.priceId) {
    throw new Error(
      `Product/price IDs not configured for agent ${agentId} plan ${plan}`
    );
  }

  const intervals = { daily: 'day', weekly: 'week', monthly: 'month' } as const;
  const prices = { daily: 1, weekly: 5, monthly: 15 };

  return {
    name: `${agentId} ${plan.charAt(0).toUpperCase() + plan.slice(1)} Access`,
    price: prices[plan],
    interval: intervals[plan],
    productId: planData.productId,
    priceId: planData.priceId,
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
