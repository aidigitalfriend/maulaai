#!/usr/bin/env node

/**
 * Create Agent-Specific Stripe Products
 * Creates separate products for each AI agent
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Agent configurations with their display names
const AGENTS = {
  'julie-girlfriend': 'AI Girlfriend',
  'emma-emotional': 'Emma Emotional',
  einstein: 'Einstein AI',
  'tech-wizard': 'Tech Wizard',
  'mrs-boss': 'Mrs Boss',
  'comedy-king': 'Comedy King',
  'chess-player': 'Chess Player',
  'fitness-guru': 'Fitness Guru',
  'travel-buddy': 'Travel Buddy',
  'drama-queen': 'Drama Queen',
  'chef-biew': 'Chef Biew',
  'professor-astrology': 'Professor Astrology',
};

// Pricing for each plan type
const PRICING = {
  daily: { amount: 100, interval: 'day' }, // $1.00
  weekly: { amount: 500, interval: 'week' }, // $5.00
  monthly: { amount: 1900, interval: 'month' }, // $15.00
};

async function createAgentProducts() {
  console.log('🚀 Creating agent-specific Stripe products...\n');

  const results = {};

  for (const [agentId, agentName] of Object.entries(AGENTS)) {
    console.log(`\n🤖 Creating products for: ${agentName} (${agentId})`);
    results[agentId] = {};

    try {
      // Create Daily Product
      const dailyProduct = await stripe.products.create({
        name: `${agentName} - Daily Access`,
        description: `24-hour access to ${agentName}`,
        metadata: {
          agentId,
          planType: 'daily',
        },
      });

      const dailyPrice = await stripe.prices.create({
        product: dailyProduct.id,
        unit_amount: PRICING.daily.amount,
        currency: 'usd',
        recurring: {
          interval: PRICING.daily.interval,
        },
        metadata: {
          agentId,
          planType: 'daily',
        },
      });

      results[agentId].daily = {
        productId: dailyProduct.id,
        priceId: dailyPrice.id,
      };

      console.log(`  ✅ Daily: ${dailyProduct.id} / ${dailyPrice.id}`);

      // Create Weekly Product
      const weeklyProduct = await stripe.products.create({
        name: `${agentName} - Weekly Access`,
        description: `7-day access to ${agentName}`,
        metadata: {
          agentId,
          planType: 'weekly',
        },
      });

      const weeklyPrice = await stripe.prices.create({
        product: weeklyProduct.id,
        unit_amount: PRICING.weekly.amount,
        currency: 'usd',
        recurring: {
          interval: PRICING.weekly.interval,
        },
        metadata: {
          agentId,
          planType: 'weekly',
        },
      });

      results[agentId].weekly = {
        productId: weeklyProduct.id,
        priceId: weeklyPrice.id,
      };

      console.log(`  ✅ Weekly: ${weeklyProduct.id} / ${weeklyPrice.id}`);

      // Create Monthly Product
      const monthlyProduct = await stripe.products.create({
        name: `${agentName} - Monthly Access`,
        description: `30-day access to ${agentName}`,
        metadata: {
          agentId,
          planType: 'monthly',
        },
      });

      const monthlyPrice = await stripe.prices.create({
        product: monthlyProduct.id,
        unit_amount: PRICING.monthly.amount,
        currency: 'usd',
        recurring: {
          interval: PRICING.monthly.interval,
        },
        metadata: {
          agentId,
          planType: 'monthly',
        },
      });

      results[agentId].monthly = {
        productId: monthlyProduct.id,
        priceId: monthlyPrice.id,
      };

      console.log(`  ✅ Monthly: ${monthlyProduct.id} / ${monthlyPrice.id}`);
    } catch (error) {
      console.log(
        `  ❌ Error creating products for ${agentName}: ${error.message}`,
      );
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 GENERATED PRODUCTS SUMMARY:');
  console.log('='.repeat(60));

  console.log('\n// Add this to your .env files:');
  console.log('// Backend .env');
  for (const [agentId, plans] of Object.entries(results)) {
    console.log(`# ${AGENTS[agentId]} (${agentId})`);
    console.log(
      `STRIPE_PRODUCT_${agentId.toUpperCase()}_DAILY=${plans.daily.productId}`,
    );
    console.log(
      `STRIPE_PRODUCT_${agentId.toUpperCase()}_WEEKLY=${plans.weekly.productId}`,
    );
    console.log(
      `STRIPE_PRODUCT_${agentId.toUpperCase()}_MONTHLY=${
        plans.monthly.productId
      }`,
    );
    console.log(
      `STRIPE_PRICE_${agentId.toUpperCase()}_DAILY=${plans.daily.priceId}`,
    );
    console.log(
      `STRIPE_PRICE_${agentId.toUpperCase()}_WEEKLY=${plans.weekly.priceId}`,
    );
    console.log(
      `STRIPE_PRICE_${agentId.toUpperCase()}_MONTHLY=${plans.monthly.priceId}`,
    );
    console.log('');
  }

  console.log('\n// Frontend .env (same as backend)');
  console.log('\n✅ Products created successfully!');
  console.log('📝 Copy the environment variables above to your .env files');
}

createAgentProducts();
