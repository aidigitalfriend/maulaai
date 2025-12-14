import mongoose from 'mongoose';

const AgentSubscriptionSchema = new mongoose.Schema({
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
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient queries
AgentSubscriptionSchema.index({ userId: 1, agentId: 1 });

// Method to check if subscription is valid
AgentSubscriptionSchema.methods.isValid = function () {
  return this.status === 'active' && this.expiryDate > new Date();
};

// Static method to calculate expiry date
AgentSubscriptionSchema.statics.calculateExpiryDate = function (
  plan,
  startDate
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

// Update updatedAt on save
AgentSubscriptionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const AgentSubscription = mongoose.model(
  'AgentSubscription',
  AgentSubscriptionSchema,
  'agentsubscriptions'
);

export default AgentSubscription;
