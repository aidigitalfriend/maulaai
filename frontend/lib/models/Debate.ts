import mongoose, { Schema, Document } from 'mongoose';

export interface IDebate extends Document {
  debateId: string;
  topic: string;
  status: 'active' | 'completed' | 'archived';
  agent1: {
    name: string;
    position: string;
    avatar: string;
    provider: string;
    response: string;
    responseTime: number;
    votes: number;
  };
  agent2: {
    name: string;
    position: string;
    avatar: string;
    provider: string;
    response: string;
    responseTime: number;
    votes: number;
  };
  totalVotes: number;
  viewers: number;
  votedUsers: string[]; // Track user IDs who have voted
  createdAt: Date;
  updatedAt: Date;
}

const DebateSchema = new Schema<IDebate>(
  {
    debateId: { type: String, required: true, unique: true, index: true },
    topic: { type: String, required: true },
    status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
    agent1: {
      name: { type: String, default: 'Nova' },
      position: { type: String, default: 'Pro' },
      avatar: { type: String, default: '⚡' },
      provider: { type: String, default: 'Nova' },
      response: { type: String, default: '' },
      responseTime: { type: Number, default: 0 },
      votes: { type: Number, default: 0 },
    },
    agent2: {
      name: { type: String, default: 'Blaze' },
      position: { type: String, default: 'Con' },
      avatar: { type: String, default: '🔥' },
      provider: { type: String, default: 'Blaze' },
      response: { type: String, default: '' },
      responseTime: { type: Number, default: 0 },
      votes: { type: Number, default: 0 },
    },
    totalVotes: { type: Number, default: 0 },
    viewers: { type: Number, default: 0 },
    votedUsers: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
DebateSchema.index({ status: 1, createdAt: -1 });

export const Debate = mongoose.models.Debate || mongoose.model<IDebate>('Debate', DebateSchema);
