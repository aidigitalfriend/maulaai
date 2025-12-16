#!/usr/bin/env node

/**
 * 🎯 CREATE MISSING STRIPE PRODUCTS & PRICES
 *
 * This script creates Stripe products and prices for the 6 missing agents:
 * - nid-gaming
 * - ben-sega
 * - bishop-burger
 * - knight-logic
 * - lazy-pawn
 * - rook-jokey
 *
 * Each agent gets:
 * - 3 products (daily, weekly, monthly)
 * - 3 prices ($1, $5, $19)
 *
 * Total: 18 products + 18 prices = 36 Stripe IDs
 */

import dotenv from 'dotenv';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../backend/.env') });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Missing agents configuration
const MISSING_AGENTS = [
  {
    id: 'nid-gaming',
    name: 'Nid Gaming',
    description: 'Your gaming companion and strategy expert',
    emoji: '🎮',
  },
  {
    id: 'ben-sega',
    name: 'Ben Sega',
    description: 'Retro gaming enthusiast and console expert',
    emoji: '🕹️',
  },
  {
    id: 'bishop-burger',
    name: 'Bishop Burger',
    description: 'Strategic thinker and food connoisseur',
    emoji: '🍔',
  },
  {
    id: 'knight-logic',
    name: 'Knight Logic',
    description: 'Master of logical reasoning and problem solving',
    emoji: '♞',
  },
  {
    id: 'lazy-pawn',
    name: 'Lazy Pawn',
    description: 'Relaxed advisor for stress-free living',
    emoji: '😴',
  },
  {
    id: 'rook-jokey',
    name: 'Rook Jokey',
    description: 'Comedy expert with strategic wit',
    emoji: '🃏',
  },
];

// Plan configurations
const PLANS = [
  { interval: 'daily', name: 'Daily', price: 100, intervalCount: 1 }, // $1.00
  { interval: 'weekly', name: 'Weekly', price: 500, intervalCount: 1 }, // $5.00
  { interval: 'monthly', name: 'Monthly', price: 1900, intervalCount: 1 }, // $19.00
];

// Store results for .env output
const envOutput = {
  frontend: [],
  backend: [],
};

/**
 * Create Stripe product and price for an agent plan
 */
async function createProductAndPrice(agent, plan) {
  try {
    console.log(
      `\n${agent.emoji} Creating ${plan.name} plan for ${agent.name}...`
    );

    // Create Product
    const product = await stripe.products.create({
      name: `${agent.name} - ${plan.name} Access`,
      description: `${plan.name} subscription to ${agent.description}`,
      metadata: {
        agentId: agent.id,
        plan: plan.interval,
        createdBy: 'automated-script',
        createdAt: new Date().toISOString(),
      },
    });

    console.log(`  ✅ Product created: ${product.id}`);

    // Create Price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.price,
      currency: 'usd',
      recurring: {
        interval:
          plan.interval === 'daily'
            ? 'day'
            : plan.interval === 'weekly'
            ? 'week'
            : 'month',
        interval_count: plan.intervalCount,
      },
      metadata: {
        agentId: agent.id,
        plan: plan.interval,
      },
    });

    console.log(
      `  ✅ Price created: ${price.id} ($${(plan.price / 100).toFixed(2)})`
    );

    return { product, price, agent, plan };
  } catch (error) {
    console.error(
      `  ❌ Error creating ${plan.name} for ${agent.name}:`,
      error.message
    );
    throw error;
  }
}

/**
 * Generate .env file format output
 */
function generateEnvOutput(results) {
  console.log('\n\n' + '='.repeat(80));
  console.log('📋 COPY THESE TO YOUR .ENV FILES');
  console.log('='.repeat(80));

  // Group by agent
  const agentGroups = {};
  results.forEach(({ product, price, agent, plan }) => {
    if (!agentGroups[agent.id]) {
      agentGroups[agent.id] = {
        name: agent.name,
        emoji: agent.emoji,
        products: {},
        prices: {},
      };
    }
    agentGroups[agent.id].products[plan.interval] = product.id;
    agentGroups[agent.id].prices[plan.interval] = price.id;
  });

  // Generate output for each agent
  Object.entries(agentGroups).forEach(([agentId, data]) => {
    const envName = agentId.toUpperCase().replace(/-/g, '-');

    console.log(`\n# ${data.emoji} ${data.name} (${agentId})`);
    console.log(`STRIPE_PRODUCT_${envName}_DAILY=${data.products.daily}`);
    console.log(`STRIPE_PRODUCT_${envName}_WEEKLY=${data.products.weekly}`);
    console.log(`STRIPE_PRODUCT_${envName}_MONTHLY=${data.products.monthly}`);
    console.log(`STRIPE_PRICE_${envName}_DAILY=${data.prices.daily}`);
    console.log(`STRIPE_PRICE_${envName}_WEEKLY=${data.prices.weekly}`);
    console.log(`STRIPE_PRICE_${envName}_MONTHLY=${data.prices.monthly}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log(
    '✅ Total: ' +
      results.length +
      ' products + ' +
      results.length +
      ' prices = ' +
      results.length * 2 +
      ' IDs'
  );
  console.log('='.repeat(80));
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 STRIPE PRODUCT CREATION SCRIPT');
  console.log('='.repeat(80));
  console.log('📦 Creating products for 6 missing agents...');
  console.log(
    '💳 Using Stripe account:',
    process.env.STRIPE_ACCOUNT_ID || 'Default'
  );
  console.log(
    '🔑 API Key:',
    process.env.STRIPE_SECRET_KEY ? '✅ Found' : '❌ Missing'
  );

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('\n❌ ERROR: STRIPE_SECRET_KEY not found in backend/.env');
    process.exit(1);
  }

  const results = [];

  // Create products and prices for each agent
  for (const agent of MISSING_AGENTS) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${agent.emoji} Processing: ${agent.name} (${agent.id})`);
    console.log('='.repeat(80));

    for (const plan of PLANS) {
      const result = await createProductAndPrice(agent, plan);
      results.push(result);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Generate .env output
  generateEnvOutput(results);

  console.log('\n✅ ALL PRODUCTS CREATED SUCCESSFULLY!');
  console.log('\n📝 Next steps:');
  console.log('1. Copy the output above');
  console.log('2. Add to /frontend/.env file');
  console.log('3. Add to /backend/.env file');
  console.log('4. Restart both servers');
  console.log('5. Test subscription flow for all agents\n');
}

// Run the script
main().catch((error) => {
  console.error('\n💥 FATAL ERROR:', error.message);
  process.exit(1);
});
