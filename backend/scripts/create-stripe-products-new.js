#!/usr/bin/env node

/**
 * Create Agent-Specific Stripe Products for New Account
 * Creates separate products for each AI agent with one-time payment prices
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🔑 STRIPE_SECRET_KEY loaded:', process.env.STRIPE_SECRET_KEY ? 'YES' : 'NO');
console.log('🔑 Key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 15) + '...');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Agent configurations with their display names
const AGENTS = {
  'julie-girlfriend': 'AI Girlfriend',
  'emma-emotional': 'Emma Emotional',
  'einstein': 'Einstein AI',
  'tech-wizard': 'Tech Wizard',
  'mrs-boss': 'Mrs Boss',
  'comedy-king': 'Comedy King',
  'chess-player': 'Chess Player',
  'fitness-guru': 'Fitness Guru',
  'travel-buddy': 'Travel Buddy',
  'drama-queen': 'Drama Queen',
  'chef-biew': 'Chef Biew',
  'professor-astrology': 'Professor Astrology',
  // Additional agents
  'nid-gaming': 'Nid Gaming',
  'ben-sega': 'Ben Sega',
  'bishop-burger': 'Bishop Burger',
  'knight-logic': 'Knight Logic',
  'lazy-pawn': 'Lazy Pawn',
  'rook-jokey': 'Rook Jokey',
};

// Pricing for each plan type (in cents) - ONE-TIME PAYMENTS
const PRICING = {
  daily: { amount: 100, label: 'Daily' },   // $1.00
  weekly: { amount: 500, label: 'Weekly' },  // $5.00
  monthly: { amount: 1500, label: 'Monthly' }, // $15.00
};

async function createAgentProducts() {
  console.log('🚀 Creating agent-specific Stripe products for NEW account...\n');
  console.log('💰 Pricing: Daily $1 | Weekly $5 | Monthly $15');
  console.log('📝 Payment Mode: One-time payments (not recurring)\n');

  const results = {};
  const envLines = [];

  for (const [agentId, agentName] of Object.entries(AGENTS)) {
    console.log(`\n🤖 Creating products for: ${agentName} (${agentId})`);
    results[agentId] = {};

    try {
      // Create Daily Product & Price
      const dailyProduct = await stripe.products.create({
        name: `${agentName} - Daily Access`,
        description: `24-hour access to ${agentName}`,
        metadata: {
          agentId: agentId,
          planType: 'daily',
        },
      });

      const dailyPrice = await stripe.prices.create({
        product: dailyProduct.id,
        unit_amount: PRICING.daily.amount,
        currency: 'usd',
        metadata: {
          agentId: agentId,
          planType: 'daily',
        },
      });

      results[agentId].daily = {
        productId: dailyProduct.id,
        priceId: dailyPrice.id,
      };
      console.log(`  ✅ Daily: ${dailyProduct.id} / ${dailyPrice.id}`);

      // Create Weekly Product & Price
      const weeklyProduct = await stripe.products.create({
        name: `${agentName} - Weekly Access`,
        description: `7-day access to ${agentName}`,
        metadata: {
          agentId: agentId,
          planType: 'weekly',
        },
      });

      const weeklyPrice = await stripe.prices.create({
        product: weeklyProduct.id,
        unit_amount: PRICING.weekly.amount,
        currency: 'usd',
        metadata: {
          agentId: agentId,
          planType: 'weekly',
        },
      });

      results[agentId].weekly = {
        productId: weeklyProduct.id,
        priceId: weeklyPrice.id,
      };
      console.log(`  ✅ Weekly: ${weeklyProduct.id} / ${weeklyPrice.id}`);

      // Create Monthly Product & Price
      const monthlyProduct = await stripe.products.create({
        name: `${agentName} - Monthly Access`,
        description: `30-day access to ${agentName}`,
        metadata: {
          agentId: agentId,
          planType: 'monthly',
        },
      });

      const monthlyPrice = await stripe.prices.create({
        product: monthlyProduct.id,
        unit_amount: PRICING.monthly.amount,
        currency: 'usd',
        metadata: {
          agentId: agentId,
          planType: 'monthly',
        },
      });

      results[agentId].monthly = {
        productId: monthlyProduct.id,
        priceId: monthlyPrice.id,
      };
      console.log(`  ✅ Monthly: ${monthlyProduct.id} / ${monthlyPrice.id}`);

      // Build env lines with proper format
      const envKey = agentId.toUpperCase().replace(/-/g, '_');
      envLines.push(`# ${agentName} (${agentId})`);
      envLines.push(`STRIPE_PRODUCT_${envKey}_DAILY=${results[agentId].daily.productId}`);
      envLines.push(`STRIPE_PRICE_${envKey}_DAILY=${results[agentId].daily.priceId}`);
      envLines.push(`STRIPE_PRODUCT_${envKey}_WEEKLY=${results[agentId].weekly.productId}`);
      envLines.push(`STRIPE_PRICE_${envKey}_WEEKLY=${results[agentId].weekly.priceId}`);
      envLines.push(`STRIPE_PRODUCT_${envKey}_MONTHLY=${results[agentId].monthly.productId}`);
      envLines.push(`STRIPE_PRICE_${envKey}_MONTHLY=${results[agentId].monthly.priceId}`);
      envLines.push('');

    } catch (error) {
      console.log(`  ❌ Error creating products for ${agentName}: ${error.message}`);
    }
  }

  // Also generate frontend format (with hyphens)
  const frontendEnvLines = [];
  for (const [agentId, plans] of Object.entries(results)) {
    if (!plans.daily) continue;
    const envKey = agentId.toUpperCase();
    frontendEnvLines.push(`# ${AGENTS[agentId]} (${agentId})`);
    frontendEnvLines.push(`STRIPE_PRODUCT_${envKey}_DAILY=${plans.daily.productId}`);
    frontendEnvLines.push(`STRIPE_PRICE_${envKey}_DAILY=${plans.daily.priceId}`);
    frontendEnvLines.push(`STRIPE_PRODUCT_${envKey}_WEEKLY=${plans.weekly.productId}`);
    frontendEnvLines.push(`STRIPE_PRICE_${envKey}_WEEKLY=${plans.weekly.priceId}`);
    frontendEnvLines.push(`STRIPE_PRODUCT_${envKey}_MONTHLY=${plans.monthly.productId}`);
    frontendEnvLines.push(`STRIPE_PRICE_${envKey}_MONTHLY=${plans.monthly.priceId}`);
    frontendEnvLines.push('');
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 BACKEND .env (use underscores):');
  console.log('='.repeat(70));
  console.log('\n# ===== STRIPE AGENT PRODUCT & PRICE IDS =====');
  console.log(envLines.join('\n'));

  // Set first agent as default
  const firstAgentId = Object.keys(results)[0];
  if (results[firstAgentId]) {
    console.log('# ===== DEFAULT SUBSCRIPTION PLANS (Fallback) =====');
    console.log(`STRIPE_PRODUCT_DAILY=${results[firstAgentId].daily.productId}`);
    console.log(`STRIPE_PRICE_DAILY=${results[firstAgentId].daily.priceId}`);
    console.log(`STRIPE_PRODUCT_WEEKLY=${results[firstAgentId].weekly.productId}`);
    console.log(`STRIPE_PRICE_WEEKLY=${results[firstAgentId].weekly.priceId}`);
    console.log(`STRIPE_PRODUCT_MONTHLY=${results[firstAgentId].monthly.productId}`);
    console.log(`STRIPE_PRICE_MONTHLY=${results[firstAgentId].monthly.priceId}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 FRONTEND .env.local (use hyphens for agent IDs):');
  console.log('='.repeat(70));
  console.log('\n# ===== STRIPE PRODUCTS =====');
  console.log(frontendEnvLines.join('\n'));

  console.log('\n✅ Products created successfully!');
  console.log('📝 Copy the environment variables above to your .env files');
  console.log('\n⚠️  IMPORTANT: Update both backend/.env AND frontend/.env.local');
}

createAgentProducts().catch(console.error);
