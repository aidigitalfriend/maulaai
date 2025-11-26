import mongoose from 'mongoose'

const { Schema } = mongoose

const RewardsCenterSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsThisLevel: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsToNextLevel: {
    type: Number,
    default: 1000,
    min: 0
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'] },
    category: String,
    points: { type: Number, default: 0 },
    earned: { type: Boolean, default: false },
    earnedDate: Date,
    progress: Number,
    target: Number
  }],
  achievements: [{
    category: String,
    title: String,
    description: String,
    icon: String,
    points: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedDate: Date,
    progress: Number,
    target: Number,
    hidden: { type: Boolean, default: false }
  }],
  rewardHistory: [{
    type: { type: String, enum: ['badge', 'achievement', 'daily', 'bonus', 'manual'] },
    item: String,
    description: String,
    points: Number,
    date: { type: Date, default: Date.now }
  }],
  streaks: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: Date
  },
  statistics: {
    totalBadgesEarned: { type: Number, default: 0 },
    totalAchievementsCompleted: { type: Number, default: 0 },
    averagePointsPerDay: { type: Number, default: 0 },
    daysActive: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

const RewardsCenter = mongoose.model('RewardsCenter', RewardsCenterSchema)

export default RewardsCenter