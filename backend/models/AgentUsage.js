import mongoose from 'mongoose';

const sessionLogSchema = new mongoose.Schema({
  sessionId: String,
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number, // in seconds
  messagesCount: {
    type: Number,
    default: 0
  },
  tokensUsed: {
    type: Number,
    default: 0
  }
}, { _id: false });

const agentUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  agentId: {
    type: String,
    required: true,
    index: true
  },
  // Daily usage metrics
  date: {
    type: Date,
    required: true,
    index: true
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  totalTokensUsed: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0 // in seconds
  },
  sessions: [sessionLogSchema],
  // Interaction details
  interactions: {
    textMessages: {
      type: Number,
      default: 0
    },
    fileUploads: {
      type: Number,
      default: 0
    },
    voiceMessages: {
      type: Number,
      default: 0
    },
    feedbackProvided: {
      positive: {
        type: Number,
        default: 0
      },
      negative: {
        type: Number,
        default: 0
      }
    }
  },
  // Model usage breakdown
  modelUsage: {
    'gpt-3.5-turbo': {
      type: Number,
      default: 0
    },
    'gpt-4': {
      type: Number,
      default: 0
    },
    'claude-3': {
      type: Number,
      default: 0
    },
    'mistral': {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
agentUsageSchema.index({ userId: 1, agentId: 1, date: 1 }, { unique: true });
agentUsageSchema.index({ userId: 1, date: -1 });
agentUsageSchema.index({ agentId: 1, date: -1 });

// Calculate total usage for a user across all agents
agentUsageSchema.statics.getUserTotalUsage = async function(userId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: '$totalSessions' },
        totalMessages: { $sum: '$totalMessages' },
        totalTokens: { $sum: '$totalTokensUsed' },
        totalDuration: { $sum: '$totalDuration' }
      }
    }
  ]);
};

// Get usage breakdown by agent
agentUsageSchema.statics.getAgentUsageBreakdown = async function(userId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$agentId',
        totalSessions: { $sum: '$totalSessions' },
        totalMessages: { $sum: '$totalMessages' },
        totalTokens: { $sum: '$totalTokensUsed' },
        totalDuration: { $sum: '$totalDuration' }
      }
    },
    {
      $sort: { totalMessages: -1 }
    }
  ]);
};

// Record a new session
agentUsageSchema.methods.recordSession = function(sessionId, messagesCount, tokensUsed, duration) {
  this.totalSessions += 1;
  this.totalMessages += messagesCount;
  this.totalTokensUsed += tokensUsed;
  this.totalDuration += duration;
  
  this.sessions.push({
    sessionId,
    startTime: new Date(Date.now() - (duration * 1000)),
    endTime: new Date(),
    duration,
    messagesCount,
    tokensUsed
  });
};

const AgentUsage = mongoose.model('AgentUsage', agentUsageSchema);

export default AgentUsage;
