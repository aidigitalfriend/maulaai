/**
 * Billing Helpers - Invoice and Payment Record Creation
 * 
 * Creates invoice and payment records when subscriptions are purchased
 */

import { connectToDatabase } from './mongodb-client';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';

export interface InvoiceRecord {
  _id?: ObjectId;
  userId: ObjectId;
  email: string;
  stripeInvoiceId?: string;
  stripeSubscriptionId: string;
  agentId: string;
  agentName: string;
  plan: 'daily' | 'weekly' | 'monthly';
  amount: number; // In dollars
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'void';
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  _id?: ObjectId;
  userId: ObjectId;
  email: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeInvoiceId?: string;
  stripeSubscriptionId: string;
  agentId: string;
  agentName: string;
  plan: 'daily' | 'weekly' | 'monthly';
  amount: number; // In dollars
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  paymentMethod: string; // e.g., 'card', 'apple_pay'
  last4?: string; // Last 4 digits of card
  brand?: string; // e.g., 'visa', 'mastercard'
  paidAt: Date;
  createdAt: Date;
}

/**
 * Create an invoice record when a subscription is purchased
 */
export async function createInvoiceRecord(params: {
  userId: string;
  email: string;
  stripeSubscriptionId: string;
  stripeInvoiceId?: string;
  agentId: string;
  agentName: string;
  plan: 'daily' | 'weekly' | 'monthly';
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  paidAt?: Date;
}): Promise<InvoiceRecord> {
  const { db } = await connectToDatabase();
  const invoices = db.collection<InvoiceRecord>('invoices');

  const invoiceRecord: InvoiceRecord = {
    userId: new ObjectId(params.userId),
    email: params.email,
    stripeInvoiceId: params.stripeInvoiceId,
    stripeSubscriptionId: params.stripeSubscriptionId,
    agentId: params.agentId,
    agentName: params.agentName,
    plan: params.plan,
    amount: params.amount,
    currency: params.currency,
    status: params.status,
    paidAt: params.paidAt || new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await invoices.insertOne(invoiceRecord);
  console.log('✅ Invoice record created:', invoiceRecord._id);
  
  return invoiceRecord;
}

/**
 * Create a payment record when a payment is successful
 */
export async function createPaymentRecord(params: {
  userId: string;
  email: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeInvoiceId?: string;
  stripeSubscriptionId: string;
  agentId: string;
  agentName: string;
  plan: 'daily' | 'weekly' | 'monthly';
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  paymentMethod: string;
  last4?: string;
  brand?: string;
}): Promise<PaymentRecord> {
  const { db } = await connectToDatabase();
  const payments = db.collection<PaymentRecord>('payments');

  const paymentRecord: PaymentRecord = {
    userId: new ObjectId(params.userId),
    email: params.email,
    stripePaymentIntentId: params.stripePaymentIntentId,
    stripeChargeId: params.stripeChargeId,
    stripeInvoiceId: params.stripeInvoiceId,
    stripeSubscriptionId: params.stripeSubscriptionId,
    agentId: params.agentId,
    agentName: params.agentName,
    plan: params.plan,
    amount: params.amount,
    currency: params.currency,
    status: params.status,
    paymentMethod: params.paymentMethod,
    last4: params.last4,
    brand: params.brand,
    paidAt: new Date(),
    createdAt: new Date(),
  };

  await payments.insertOne(paymentRecord);
  console.log('✅ Payment record created:', paymentRecord._id);
  
  return paymentRecord;
}

/**
 * Create billing history entry
 */
export async function createBillingRecord(params: {
  userId: string;
  email: string;
  type: 'subscription' | 'renewal' | 'cancellation' | 'refund';
  stripeSubscriptionId: string;
  agentId: string;
  agentName: string;
  plan: 'daily' | 'weekly' | 'monthly';
  amount?: number;
  currency?: string;
  description: string;
}): Promise<void> {
  const { db } = await connectToDatabase();
  const billings = db.collection('billings');

  const billingRecord = {
    userId: new ObjectId(params.userId),
    email: params.email,
    type: params.type,
    stripeSubscriptionId: params.stripeSubscriptionId,
    agentId: params.agentId,
    agentName: params.agentName,
    plan: params.plan,
    amount: params.amount || 0,
    currency: params.currency || 'usd',
    description: params.description,
    createdAt: new Date(),
  };

  await billings.insertOne(billingRecord);
  console.log('✅ Billing record created:', billingRecord);
}

/**
 * Helper to extract payment details from Stripe subscription
 */
export async function getPaymentDetailsFromSubscription(
  stripe: Stripe,
  subscriptionId: string
): Promise<{
  paymentMethod?: string;
  last4?: string;
  brand?: string;
  invoiceId?: string;
  chargeId?: string;
  paymentIntentId?: string;
} | null> {
  try {
    // Get the subscription with expanded invoice data
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice'],
    });

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
    
    if (!latestInvoice) {
      console.warn('No latest invoice found for subscription:', subscriptionId);
      return null;
    }

    const charge = latestInvoice.charge as Stripe.Charge | null;
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent | null;

    // Extract payment method details
    let paymentMethod = 'card';
    let last4: string | undefined;
    let brand: string | undefined;

    if (charge?.payment_method_details) {
      paymentMethod = charge.payment_method_details.type;
      if (charge.payment_method_details.card) {
        last4 = charge.payment_method_details.card.last4;
        brand = charge.payment_method_details.card.brand;
      }
    }

    return {
      invoiceId: latestInvoice.id,
      chargeId: typeof charge === 'string' ? charge : charge?.id,
      paymentIntentId: typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id,
      paymentMethod,
      last4,
      brand,
    };
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return null;
  }
}
