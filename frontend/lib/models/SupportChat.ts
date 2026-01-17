import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IUserContext {
  subscriptions: Array<{
    agentId: string;
    agentName: string;
    plan: string;
    status: string;
    expiryDate: Date;
  }>;
  totalSpent: number;
  memberSince: Date;
  previousTickets: number;
  recentTransactions: Array<{
    type: string;
    amount: number;
    item: string;
    date: Date;
  }>;
}

export interface ISupportChat extends Document {
  chatId: string;
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  
  // User context snapshot (at time of chat)
  userContext: IUserContext;
  
  // Conversation
  messages: ISupportChatMessage[];
  
  // Outcome
  ticketCreated: boolean;
  ticketId?: string;
  ticketNumber?: number;
  resolved: boolean;
  resolutionSummary?: string;
  
  // Metadata
  status: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

const SupportChatSchema = new Schema<ISupportChat>(
  {
    chatId: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    },
    userEmail: { 
      type: String, 
      required: true 
    },
    userName: { 
      type: String 
    },
    
    // User context snapshot
    userContext: {
      subscriptions: [{
        agentId: { type: String },
        agentName: { type: String },
        plan: { type: String },
        status: { type: String },
        expiryDate: { type: Date }
      }],
      totalSpent: { type: Number, default: 0 },
      memberSince: { type: Date },
      previousTickets: { type: Number, default: 0 },
      recentTransactions: [{
        type: { type: String },
        amount: { type: Number },
        item: { type: String },
        date: { type: Date }
      }]
    },
    
    // Conversation
    messages: [{
      id: { type: String, required: true },
      role: { 
        type: String, 
        enum: ['user', 'assistant', 'system'], 
        required: true 
      },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }],
    
    // Outcome
    ticketCreated: { type: Boolean, default: false },
    ticketId: { type: String },
    ticketNumber: { type: Number },
    resolved: { type: Boolean, default: false },
    resolutionSummary: { type: String },
    
    // Metadata
    status: { 
      type: String, 
      enum: ['active', 'closed'], 
      default: 'active' 
    },
    closedAt: { type: Date }
  },
  {
    timestamps: true,
    collection: 'supportchats'
  }
);

// Indexes for efficient queries
SupportChatSchema.index({ userId: 1, status: 1 });
SupportChatSchema.index({ createdAt: -1 });
SupportChatSchema.index({ ticketCreated: 1, status: 1 });

export const SupportChat = mongoose.models.SupportChat || mongoose.model<ISupportChat>('SupportChat', SupportChatSchema);
