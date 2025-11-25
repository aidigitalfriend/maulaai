import mongoose, { Schema, Document } from 'mongoose'

export interface ISubscription extends Document {
  userId: string
  email: string
  agentId: string
  agentName: string
  plan: 'daily' | 'weekly' | 'monthly'
  stripeSubscriptionId: string
  stripeCustomerId: string
  stripePriceId: string
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid'
  price: number // Amount in cents
  currency: string
  startDate: Date
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  canceledAt?: Date
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    agentId: {
      type: String,
      required: true,
      index: true,
    },
    agentName: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      index: true,
    },
    stripePriceId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid'],
      default: 'active',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    startDate: {
      type: Date,
      required: true,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for efficient queries
SubscriptionSchema.index({ userId: 1, agentId: 1 })
SubscriptionSchema.index({ userId: 1, status: 1 })
SubscriptionSchema.index({ email: 1, status: 1 })

/**
 * Check if subscription is currently active and valid
 */
SubscriptionSchema.methods.isActive = function (): boolean {
  const now = new Date()
  return (
    (this.status === 'active' || this.status === 'trialing') &&
    this.currentPeriodEnd > now
  )
}

/**
 * Get days until renewal
 */
SubscriptionSchema.methods.getDaysUntilRenewal = function (): number {
  const now = new Date()
  const diff = this.currentPeriodEnd.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * JSON response method
 */
SubscriptionSchema.methods.toJSON = function () {
  const subscription = this.toObject()
  delete subscription.__v
  return subscription
}

export default mongoose.models.Subscription || 
  mongoose.model<ISubscription>('Subscription', SubscriptionSchema)
