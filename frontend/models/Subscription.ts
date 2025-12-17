/**
 * Subscription Model - Serverless Compatible
 * Uses dynamic import to avoid webpack bundling issues
 */

export interface ISubscription {
  _id?: any;
  userId: string;
  email: string;
  agentId: string;
  agentName: string;
  plan: 'daily' | 'weekly' | 'monthly';
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  status:
    | 'active'
    | 'canceled'
    | 'past_due'
    | 'incomplete'
    | 'incomplete_expired'
    | 'trialing'
    | 'unpaid';
  price: number;
  currency: string;
  startDate: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: () => boolean;
  toJSON?: () => any;
}

let SubscriptionModel: any = null;

/**
 * Get Subscription model (lazy loaded)
 */
export async function getSubscriptionModel() {
  if (SubscriptionModel) {
    return SubscriptionModel;
  }

  const mongoose = await import('mongoose');

  // Check if model already exists
  if (mongoose.default.models.Subscription) {
    SubscriptionModel = mongoose.default.models.Subscription;
    return SubscriptionModel;
  }

  const SubscriptionSchema = new mongoose.Schema(
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
        enum: [
          'active',
          'canceled',
          'past_due',
          'incomplete',
          'incomplete_expired',
          'trialing',
          'unpaid',
        ],
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
  );

  // Compound indexes
  SubscriptionSchema.index({ userId: 1, agentId: 1 });
  SubscriptionSchema.index({ userId: 1, status: 1 });
  SubscriptionSchema.index({ email: 1, status: 1 });

  // Methods
  SubscriptionSchema.methods.isActive = function (): boolean {
    const now = new Date();
    return (
      (this.status === 'active' || this.status === 'trialing') &&
      this.currentPeriodEnd > now
    );
  };

  SubscriptionSchema.methods.toJSON = function () {
    const subscription = this.toObject();
    delete subscription.__v;
    return subscription;
  };

  SubscriptionModel = mongoose.default.model(
    'Subscription',
    SubscriptionSchema
  );
  return SubscriptionModel;
}

// Default export for compatibility
export default { getSubscriptionModel };
