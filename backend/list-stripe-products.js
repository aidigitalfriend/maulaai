#!/usr/bin/env node

/**
 * Simple Stripe Product Lister
 * Shows current products and prices from Stripe dashboard
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

console.log(
  '🔑 STRIPE_SECRET_KEY loaded:',
  process.env.STRIPE_SECRET_KEY ? 'YES' : 'NO',
);
console.log(
  '🔑 Key starts with:',
  process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function listStripeProducts() {
  try {
    console.log('🔄 Fetching products from Stripe...\n');

    // Get all products
    const products = await stripe.products.list({ limit: 100 });

    console.log('📦 ALL PRODUCTS IN STRIPE:');
    console.log('='.repeat(50));

    for (const product of products.data) {
      console.log(`\n🏷️  Product: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Active: ${product.active}`);

      // Get prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 10,
      });

      if (prices.data.length > 0) {
        console.log('   💰 Prices:');
        prices.data.forEach((price) => {
          const amount = price.unit_amount / 100;
          const interval = price.recurring?.interval || 'one-time';
          console.log(`      - $${amount}/${interval}: ${price.id}`);
        });
      } else {
        console.log('   💰 No active prices');
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 Copy the correct product IDs and price IDs from above');
    console.log('   Update your .env files with these values');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure STRIPE_SECRET_KEY is set in backend/.env');
  }
}

listStripeProducts();
