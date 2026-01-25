#!/usr/bin/env node

/**
 * Stripe Product Cleanup Script
 * Deletes all products except the 3 currently in use
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

// Products to KEEP (currently in use)
const PRODUCTS_TO_KEEP = [
  'prod_Ta7WUJhUHlt1NN', // Daily Plan
  'prod_Ta7Wq9Imowrm91', // Weekly Plan
  'prod_Ta7WCiX1iu9g6C', // Monthly Plan
];

async function cleanupStripeProducts() {
  try {
    console.log('🧹 Starting Stripe product cleanup...\n');

    // Get all products
    const products = await stripe.products.list({ limit: 100 });

    console.log(`📦 Found ${products.data.length} total products\n`);

    let deletedCount = 0;
    let keptCount = 0;

    for (const product of products.data) {
      if (PRODUCTS_TO_KEEP.includes(product.id)) {
        console.log(`✅ KEEPING: ${product.name} (${product.id})`);
        keptCount++;
        continue;
      }

      // Check if product has any active subscriptions before deleting
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100,
      });

      // Check for active subscriptions on any of the prices
      let hasActiveSubscriptions = false;
      try {
        for (const price of prices.data) {
          // Only check subscriptions for recurring prices
          if (price.recurring) {
            const subscriptions = await stripe.subscriptions.list({
              price: price.id,
              status: 'active',
              limit: 1,
            });
            if (subscriptions.data.length > 0) {
              hasActiveSubscriptions = true;
              break;
            }
          }
        }
      } catch (_error) {
        // If we can't check subscriptions, be safe and skip
        console.log(
          `⚠️  SKIPPING: ${product.name} (${product.id}) - Cannot verify subscriptions`,
        );
        continue;
      }

      if (hasActiveSubscriptions) {
        console.log(
          `⚠️  SKIPPING: ${product.name} (${product.id}) - Has active subscriptions!`,
        );
        continue;
      }

      try {
        // Archive the product instead of deleting (safer)
        await stripe.products.update(product.id, { active: false });
        console.log(`🗑️  ARCHIVED: ${product.name} (${product.id})`);
        deletedCount++;
      } catch (error) {
        console.log(
          `❌ FAILED to archive: ${product.name} (${product.id}) - ${error.message}`,
        );
      }
    }

    console.log('\n📊 Cleanup Summary:');
    console.log(`   ✅ Kept: ${keptCount} products`);
    console.log(`   🗑️  Archived: ${deletedCount} products`);
    console.log(
      `   ⚠️  Skipped: ${
        products.data.length - keptCount - deletedCount
      } products (active subscriptions)`,
    );

    console.log('\n🎯 Products kept:');
    PRODUCTS_TO_KEEP.forEach((id) => console.log(`   - ${id}`));
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    console.log(
      '\n💡 Note: Products with active subscriptions were not deleted for safety',
    );
  }
}

cleanupStripeProducts();
