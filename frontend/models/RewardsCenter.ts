import mongoose, { Schema, Document } from 'mongoose'

export interface IRewardsCenter extends Document {
  userId: string
  email: string
  points: number
  level: number
  badges: Array<{
    id: string
    name: string
    description: string
    icon: string
    earnedAt: Date
    category: string
  }>
  achievements: Array<{
    id: string
    name: string
    description: string
    progress: number
    maxProgress: number
    completed: boolean
    completedAt?: Date
    reward: {
      type: 'points' | 'badge' | 'discount'
      value: any
    }
  }>
  streaks: {
    current: number
    longest: number
    lastActivity: Date
  }
  referrals: Array<{
    referredEmail: string
    status: 'pending' | 'completed'
    reward: number
    createdAt: Date
  }>
  pointsHistory: Array<{
    amount: number
    action: string
    description: string
    timestamp: Date
  }>
  availableRewards: Array<{
    id: string
    name: string
    description: string
    cost: number
    type: 'discount' | 'feature' | 'merchandise'
    value: any
  }>
  redeemedRewards: Array<{
    rewardId: string
    name: string
    cost: number
    redeemedAt: Date
    status: 'pending' | 'delivered' | 'expired'
  }>
  createdAt: Date
  updatedAt: Date
}

const RewardsCenterSchema = new Schema<IRewardsCenter>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  badges: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    category: String
  }],
  achievements: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    progress: {
      type: Number,
      default: 0
    },
    maxProgress: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    reward: {
      type: {
        type: String,
        enum: ['points', 'badge', 'discount'],
        required: true
      },
      value: Schema.Types.Mixed
    }
  }],
  streaks: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  referrals: [{
    referredEmail: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    reward: {
      type: Number,
      default: 100
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  pointsHistory: [{
    amount: {
      type: Number,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  availableRewards: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    cost: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['discount', 'feature', 'merchandise'],
      required: true
    },
    value: Schema.Types.Mixed
  }],
  redeemedRewards: [{
    rewardId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true
    },
    redeemedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'delivered', 'expired'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
})

// Indexes
RewardsCenterSchema.index({ userId: 1 })
RewardsCenterSchema.index({ email: 1 })
RewardsCenterSchema.index({ points: -1 })
RewardsCenterSchema.index({ level: -1 })

export default mongoose.models.RewardsCenter || mongoose.model<IRewardsCenter>('RewardsCenter', RewardsCenterSchema)