/**
 * Stripe Webhook Handler
 * Receives events from Stripe and saves subscriptions to MongoDB
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { verifyWebhookSignature } from '../../../../lib/stripe-client'
import { connectToDatabase } from '../../../../lib/mongodb-client'
import { getSubscriptionModel } from '../../../../models/Subscription'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Stripe webhook event received:', event.type)

    // Connect to MongoDB
    await connectToDatabase()

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session:', session.id)

  const { client_reference_id: userId, customer_email: email, subscription: subscriptionId } = session
  const metadata = session.metadata

  if (!metadata || !userId || !email || !subscriptionId) {
    console.error('Missing required session data:', { userId, email, subscriptionId, metadata })
    return
  }

  // Get full subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId as string)

  // Save subscription to MongoDB
  await saveSubscriptionToDatabase(subscription, userId, email, metadata)
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)

  const customerId = subscription.customer as string
  const customer = await stripe.customers.retrieve(customerId)

  if ('deleted' in customer && customer.deleted) {
    console.error('Customer deleted:', customerId)
    return
  }

  const email = customer.email || ''
  const userId = subscription.metadata?.userId || ''

  if (!userId || !email) {
    console.error('Missing userId or email in subscription metadata')
    return
  }

  await saveSubscriptionToDatabase(subscription, userId, email, subscription.metadata)
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  const SubscriptionModel = await getSubscriptionModel()

  const existingSubscription = await SubscriptionModel.findOne({
    stripeSubscriptionId: subscription.id,
  })

  if (!existingSubscription) {
    console.log('Subscription not found in database, creating new record')
    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)
    
    if ('deleted' in customer && customer.deleted) {
      console.error('Customer deleted:', customerId)
      return
    }

    const email = customer.email || ''
    const userId = subscription.metadata?.userId || ''
    
    await saveSubscriptionToDatabase(subscription, userId, email, subscription.metadata)
    return
  }

  // Update existing subscription
  existingSubscription.status = subscription.status
  existingSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000)
  existingSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000)
  existingSubscription.cancelAtPeriodEnd = subscription.cancel_at_period_end
  
  if (subscription.canceled_at) {
    existingSubscription.canceledAt = new Date(subscription.canceled_at * 1000)
  }

  await existingSubscription.save()
  console.log('Subscription updated in database:', subscription.id)
}

/**
 * Handle subscription deleted/cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  const SubscriptionModel = await getSubscriptionModel()

  const existingSubscription = await SubscriptionModel.findOne({
    stripeSubscriptionId: subscription.id,
  })

  if (existingSubscription) {
    existingSubscription.status = 'canceled'
    existingSubscription.canceledAt = new Date()
    await existingSubscription.save()
    console.log('Subscription marked as canceled in database')
  }
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id)
  const SubscriptionModel = await getSubscriptionModel()

  if (invoice.subscription) {
    const subscription = await SubscriptionModel.findOne({
      stripeSubscriptionId: invoice.subscription as string,
    })

    if (subscription && subscription.status !== 'active') {
      subscription.status = 'active'
      await subscription.save()
      console.log('Subscription reactivated after payment')
    }
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)
  const SubscriptionModel = await getSubscriptionModel()

  if (invoice.subscription) {
    const subscription = await SubscriptionModel.findOne({
      stripeSubscriptionId: invoice.subscription as string,
    })

    if (subscription) {
      subscription.status = 'past_due'
      await subscription.save()
      console.log('Subscription marked as past_due')
    }
  }
}

/**
 * Save subscription to MongoDB database
 */
async function saveSubscriptionToDatabase(
  subscription: Stripe.Subscription,
  userId: string,
  email: string,
  metadata: Stripe.Metadata | undefined
) {
  const { agentId, agentName, plan } = metadata || {}
  const SubscriptionModel = await getSubscriptionModel()

  if (!agentId || !agentName || !plan) {
    console.error('Missing required metadata:', metadata)
    return
  }

  const priceId = subscription.items.data[0]?.price?.id || ''
  const amount = subscription.items.data[0]?.price?.unit_amount || 0

  // Check if subscription already exists
  const existingSubscription = await SubscriptionModel.findOne({
    stripeSubscriptionId: subscription.id,
  })

  if (existingSubscription) {
    console.log('Subscription already exists in database:', subscription.id)
    return
  }

  // Create new subscription record
  const newSubscription = new SubscriptionModel({
    userId,
    email,
    agentId,
    agentName,
    plan,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: subscription.customer as string,
    stripePriceId: priceId,
    status: subscription.status,
    price: amount,
    currency: subscription.currency || 'usd',
    startDate: new Date(subscription.start_date * 1000),
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  })

  await newSubscription.save()
  console.log('Subscription saved to database:', subscription.id)
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
