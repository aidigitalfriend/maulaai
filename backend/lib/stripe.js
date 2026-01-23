import Stripe from 'stripe';
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
const AGENT_PRODUCTS = {
  'julie-girlfriend': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_JULIE_GIRLFRIEND_DAILY || '',
      priceId: process.env.STRIPE_PRICE_JULIE_GIRLFRIEND_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_JULIE_GIRLFRIEND_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_JULIE_GIRLFRIEND_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_JULIE_GIRLFRIEND_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_JULIE_GIRLFRIEND_MONTHLY || '',
    },
  },
  'emma-emotional': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_EMMA_EMOTIONAL_DAILY || '',
      priceId: process.env.STRIPE_PRICE_EMMA_EMOTIONAL_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_EMMA_EMOTIONAL_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_EMMA_EMOTIONAL_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_EMMA_EMOTIONAL_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_EMMA_EMOTIONAL_MONTHLY || '',
    },
  },
  einstein: {
    daily: {
      productId: process.env.STRIPE_PRODUCT_EINSTEIN_DAILY || '',
      priceId: process.env.STRIPE_PRICE_EINSTEIN_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_EINSTEIN_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_EINSTEIN_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_EINSTEIN_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_EINSTEIN_MONTHLY || '',
    },
  },
  'tech-wizard': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_TECH_WIZARD_DAILY || '',
      priceId: process.env.STRIPE_PRICE_TECH_WIZARD_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_TECH_WIZARD_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_TECH_WIZARD_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_TECH_WIZARD_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_TECH_WIZARD_MONTHLY || '',
    },
  },
  'mrs-boss': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_MRS_BOSS_DAILY || '',
      priceId: process.env.STRIPE_PRICE_MRS_BOSS_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_MRS_BOSS_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_MRS_BOSS_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_MRS_BOSS_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_MRS_BOSS_MONTHLY || '',
    },
  },
  'comedy-king': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_COMEDY_KING_DAILY || '',
      priceId: process.env.STRIPE_PRICE_COMEDY_KING_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_COMEDY_KING_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_COMEDY_KING_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_COMEDY_KING_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_COMEDY_KING_MONTHLY || '',
    },
  },
  'chess-player': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_CHESS_PLAYER_DAILY || '',
      priceId: process.env.STRIPE_PRICE_CHESS_PLAYER_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_CHESS_PLAYER_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_CHESS_PLAYER_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_CHESS_PLAYER_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_CHESS_PLAYER_MONTHLY || '',
    },
  },
  'fitness-guru': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_FITNESS_GURU_DAILY || '',
      priceId: process.env.STRIPE_PRICE_FITNESS_GURU_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_FITNESS_GURU_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_FITNESS_GURU_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_FITNESS_GURU_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_FITNESS_GURU_MONTHLY || '',
    },
  },
  'travel-buddy': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_TRAVEL_BUDDY_DAILY || '',
      priceId: process.env.STRIPE_PRICE_TRAVEL_BUDDY_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_TRAVEL_BUDDY_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_TRAVEL_BUDDY_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_TRAVEL_BUDDY_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_TRAVEL_BUDDY_MONTHLY || '',
    },
  },
  'drama-queen': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_DRAMA_QUEEN_DAILY || '',
      priceId: process.env.STRIPE_PRICE_DRAMA_QUEEN_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_DRAMA_QUEEN_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_DRAMA_QUEEN_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_DRAMA_QUEEN_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_DRAMA_QUEEN_MONTHLY || '',
    },
  },
  'chef-biew': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_CHEF_BIEW_DAILY || '',
      priceId: process.env.STRIPE_PRICE_CHEF_BIEW_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_CHEF_BIEW_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_CHEF_BIEW_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_CHEF_BIEW_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_CHEF_BIEW_MONTHLY || '',
    },
  },
  'professor-astrology': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_PROFESSOR_ASTROLOGY_DAILY || '',
      priceId: process.env.STRIPE_PRICE_PROFESSOR_ASTROLOGY_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_PROFESSOR_ASTROLOGY_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_PROFESSOR_ASTROLOGY_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_PROFESSOR_ASTROLOGY_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_PROFESSOR_ASTROLOGY_MONTHLY || '',
    },
  },
  // New Agents
  'nid-gaming': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_NID_GAMING_DAILY || '',
      priceId: process.env.STRIPE_PRICE_NID_GAMING_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_NID_GAMING_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_NID_GAMING_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_NID_GAMING_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_NID_GAMING_MONTHLY || '',
    },
  },
  'ben-sega': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_BEN_SEGA_DAILY || '',
      priceId: process.env.STRIPE_PRICE_BEN_SEGA_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_BEN_SEGA_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_BEN_SEGA_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_BEN_SEGA_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_BEN_SEGA_MONTHLY || '',
    },
  },
  'bishop-burger': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_BISHOP_BURGER_DAILY || '',
      priceId: process.env.STRIPE_PRICE_BISHOP_BURGER_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_BISHOP_BURGER_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_BISHOP_BURGER_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_BISHOP_BURGER_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_BISHOP_BURGER_MONTHLY || '',
    },
  },
  'knight-logic': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_KNIGHT_LOGIC_DAILY || '',
      priceId: process.env.STRIPE_PRICE_KNIGHT_LOGIC_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_KNIGHT_LOGIC_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_KNIGHT_LOGIC_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_KNIGHT_LOGIC_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_KNIGHT_LOGIC_MONTHLY || '',
    },
  },
  'lazy-pawn': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_LAZY_PAWN_DAILY || '',
      priceId: process.env.STRIPE_PRICE_LAZY_PAWN_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_LAZY_PAWN_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_LAZY_PAWN_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_LAZY_PAWN_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_LAZY_PAWN_MONTHLY || '',
    },
  },
  'rook-jokey': {
    daily: {
      productId: process.env.STRIPE_PRODUCT_ROOK_JOKEY_DAILY || '',
      priceId: process.env.STRIPE_PRICE_ROOK_JOKEY_DAILY || '',
    },
    weekly: {
      productId: process.env.STRIPE_PRODUCT_ROOK_JOKEY_WEEKLY || '',
      priceId: process.env.STRIPE_PRICE_ROOK_JOKEY_WEEKLY || '',
    },
    monthly: {
      productId: process.env.STRIPE_PRODUCT_ROOK_JOKEY_MONTHLY || '',
      priceId: process.env.STRIPE_PRICE_ROOK_JOKEY_MONTHLY || '',
    },
  },
};
function getAgentSubscriptionPlan(agentId, plan) {
  const agentProducts = AGENT_PRODUCTS[agentId];
  if (!agentProducts) {
    throw new Error(`Agent ${agentId} not found in product mappings`);
  }
  const planData = agentProducts[plan];
  if (!planData.productId || !planData.priceId) {
    throw new Error(
      `Product/price IDs not configured for agent ${agentId} plan ${plan}`
    );
  }
  const intervals = { daily: 'day', weekly: 'week', monthly: 'month' };
  const prices = { daily: 1, weekly: 5, monthly: 15 };
  return {
    id: plan,
    name: `${agentId} ${plan.charAt(0).toUpperCase() + plan.slice(1)} Access`,
    price: prices[plan],
    interval: intervals[plan],
    productId: planData.productId,
    priceId: planData.priceId,
  };
}
const SUBSCRIPTION_PLANS = {
  daily: {
    id: 'daily',
    name: 'Daily Agent Access',
    price: 1,
    interval: 'day',
    productId: process.env.STRIPE_PRODUCT_DAILY || 'prod_TbZO0rzMhIt9NJ',
    priceId: process.env.STRIPE_PRICE_DAILY || 'price_1SeMFLKFZS9GJlvabsNzQPSJ',
  },
  weekly: {
    id: 'weekly',
    name: 'Weekly Agent Access',
    price: 5,
    interval: 'week',
    productId: process.env.STRIPE_PRODUCT_WEEKLY || 'prod_TbZOafTW8O3IOz',
    priceId: process.env.STRIPE_PRICE_WEEKLY || 'price_1SeMFLKFZS9GJlvaYDMon8k6',
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly Agent Access',
    price: 15,
    interval: 'month',
    productId: process.env.STRIPE_PRODUCT_MONTHLY || 'prod_TbZO7jC7Iyn0gu',
    priceId: process.env.STRIPE_PRICE_MONTHLY || 'price_1SeMFMKFZS9GJlvaGgm63W9i',
  },
};
async function createCheckoutSession(params) {
  const { agentId, agentName, plan, userId, userEmail, successUrl, cancelUrl } =
    params;
  const subscriptionPlan = getAgentSubscriptionPlan(agentId, plan);
  const priceId = subscriptionPlan.priceId;
  if (!priceId) {
    throw new Error(
      `Price ID not configured for agent ${agentId} plan ${plan}`
    );
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
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
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  });
  return session;
}
async function getSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return null;
  }
}
async function cancelSubscription(subscriptionId) {
  return await stripe.subscriptions.cancel(subscriptionId);
}
async function getCustomerSubscriptions(customerId) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 100,
  });
  return subscriptions.data;
}
function verifyWebhookSignature(payload, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
export {
  SUBSCRIPTION_PLANS,
  cancelSubscription,
  createCheckoutSession,
  getAgentSubscriptionPlan,
  getCustomerSubscriptions,
  getSubscription,
  stripe,
  verifyWebhookSignature,
};
