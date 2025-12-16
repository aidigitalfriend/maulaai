/**
 * AgentSubscription Model - Serverless Compatible
 * Simple subscription model for agent access
 */

export interface IAgentSubscription {
  _id?: any;
  userId: string;
  agentId: string;
  plan: 'daily' | 'weekly' | 'monthly';
  price: number;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  expiryDate: Date;
  autoRenew: boolean;
  stripeSubscriptionId?: string; // Optional Stripe subscription ID to prevent duplicates
  createdAt?: Date;
  updatedAt?: Date;
}

let AgentSubscriptionModel: any = null;

/**
 * Get AgentSubscription model (lazy loaded)
 */
export async function getAgentSubscriptionModel() {
  if (AgentSubscriptionModel) {
    return AgentSubscriptionModel;
  }

  const mongoose = await import('mongoose');

  // Check if model already exists
  if (mongoose.default.models.AgentSubscription) {
    AgentSubscriptionModel = mongoose.default.models.AgentSubscription;
    return AgentSubscriptionModel;
  }

  const AgentSubscriptionSchema = new mongoose.Schema(
    {
      userId: {
        type: String,
        required: true,
        index: true,
      },
      agentId: {
        type: String,
        required: true,
        index: true,
      },
      plan: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      expiryDate: {
        type: Date,
        required: true,
      },
      autoRenew: {
        type: Boolean,
        default: false, // One-time purchase - no auto-renewal
      },
      stripeSubscriptionId: {
        type: String,
        sparse: true, // Sparse index allows multiple null values but enforces uniqueness for non-null
        index: true,
      },
    },
    {
      timestamps: true,
      // Keep collection aligned with backend (see backend/models/AgentSubscription.js)
      collection: 'subscriptions',
    }
  );

  // Compound index for efficient queries
  AgentSubscriptionSchema.index({ userId: 1, agentId: 1 });

  // Method to check if subscription is valid
  AgentSubscriptionSchema.methods.isValid = function () {
    return this.status === 'active' && this.expiryDate > new Date();
  };

  // Static method to calculate expiry date
  AgentSubscriptionSchema.statics.calculateExpiryDate = function (
    plan: string,
    startDate: Date
  ) {
    const date = new Date(startDate);
    switch (plan) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        throw new Error('Invalid plan');
    }
    return date;
  };

  AgentSubscriptionModel = mongoose.default.model(
    'AgentSubscription',
    AgentSubscriptionSchema
  );
  return AgentSubscriptionModel;
}

// Default export for compatibility
export default { getAgentSubscriptionModel };
