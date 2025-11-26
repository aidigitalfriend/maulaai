import mongoose from 'mongoose';

const agentSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  agentId: {
    type: String,
    required: true,
    index: true,
    enum: [
      'ben-sega', 'einstein', 'bishop-burger', 'chef-biew', 'chess-player',
      'comedy-king', 'drama-queen', 'emma-emotional', 'fitness-guru',
      'julie-girlfriend', 'knight-logic', 'lazy-pawn', 'mrs-boss',
      'nid-gaming', 'professor-astrology', 'rook-jokey', 'tech-wizard',
      'travel-buddy'
    ]
  },
  plan: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  price: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        const validPrices = {
          daily: 1,
          weekly: 5,
          monthly: 19
        };
        return value === validPrices[this.plan];
      },
      message: 'Price must match plan: daily=$1, weekly=$5, monthly=$19'
    }
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  lastRenewal: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'crypto', 'manual'],
    default: 'stripe'
  },
  transactionIds: [{
    type: String
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
agentSubscriptionSchema.index({ userId: 1, agentId: 1 }, { unique: true }); // One subscription per user per agent
agentSubscriptionSchema.index({ userId: 1, status: 1 });
agentSubscriptionSchema.index({ expiryDate: 1, status: 1 });

// Check if subscription is valid
agentSubscriptionSchema.methods.isValid = function() {
  return this.status === 'active' && this.expiryDate > new Date();
};

// Calculate expiry date based on plan
agentSubscriptionSchema.statics.calculateExpiryDate = function(plan, startDate = new Date()) {
  const expiry = new Date(startDate);
  switch(plan) {
    case 'daily':
      expiry.setDate(expiry.getDate() + 1);
      break;
    case 'weekly':
      expiry.setDate(expiry.getDate() + 7);
      break;
    case 'monthly':
      expiry.setMonth(expiry.getMonth() + 1);
      break;
  }
  return expiry;
};

const AgentSubscription = mongoose.model('AgentSubscription', agentSubscriptionSchema);

export default AgentSubscription;
