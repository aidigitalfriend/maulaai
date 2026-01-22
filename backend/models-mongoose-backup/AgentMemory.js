/**
 * AGENT MEMORY MODEL
 * Stores long-term memory for AI agents - learnings, user preferences, facts
 * This gives agents a "soul" - they remember and learn from every interaction
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

// Schema for individual memory entries
const memoryEntrySchema = new Schema(
  {
    // Type of memory
    type: {
      type: String,
      enum: [
        'user_preference',    // User likes/dislikes, communication style
        'user_fact',          // Facts about the user (name, job, location, etc.)
        'conversation_insight', // Key insights from conversations
        'learned_behavior',   // How to respond based on past interactions
        'correction',         // When user corrected the agent
        'important_context',  // Important context to remember
        'relationship_history', // Relationship development over time
        'skill_knowledge',    // Things the agent learned to do better
        'emotional_cue',      // Emotional patterns and triggers
      ],
      required: true,
      index: true,
    },

    // The actual memory content
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    // Structured data for the memory (flexible JSON)
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // Source of this memory
    source: {
      conversationId: { type: String },
      messageId: { type: String },
      timestamp: { type: Date, default: Date.now },
    },

    // Memory importance (affects retrieval priority)
    importance: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },

    // How many times this memory was accessed
    accessCount: {
      type: Number,
      default: 0,
    },

    // Last time this memory was accessed
    lastAccessed: {
      type: Date,
      default: Date.now,
    },

    // Confidence score (can be updated over time)
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8,
    },

    // Tags for categorization
    tags: [{ type: String }],

    // Is this memory still valid/active
    isActive: {
      type: Boolean,
      default: true,
    },

    // Expiry (some memories should fade)
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

// Main Agent Memory schema
const agentMemorySchema = new Schema(
  {
    // User reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Agent identifier (slug)
    agentId: {
      type: String,
      required: true,
      index: true,
    },

    // User's profile as understood by this agent
    userProfile: {
      name: { type: String },
      preferredName: { type: String }, // Nickname or how they like to be called
      timezone: { type: String },
      language: { type: String, default: 'en' },
      communicationStyle: {
        type: String,
        enum: ['formal', 'casual', 'professional', 'friendly', 'technical'],
      },
      interests: [{ type: String }],
      expertise: [{ type: String }],
      goals: [{ type: String }],
      challenges: [{ type: String }],
    },

    // Relationship metrics
    relationship: {
      firstInteraction: { type: Date },
      lastInteraction: { type: Date },
      totalInteractions: { type: Number, default: 0 },
      totalMessages: { type: Number, default: 0 },
      averageSessionLength: { type: Number, default: 0 }, // in minutes
      satisfactionScore: { type: Number, min: 0, max: 10 }, // estimated
      trustLevel: { type: Number, min: 0, max: 10, default: 5 },
      engagementLevel: { type: Number, min: 0, max: 10, default: 5 },
    },

    // All memory entries
    memories: [memoryEntrySchema],

    // Summary of who this user is (regenerated periodically)
    userSummary: {
      type: String,
      maxlength: 1000,
    },

    // Conversation patterns
    conversationPatterns: {
      preferredTopics: [{ topic: String, frequency: Number }],
      avoidTopics: [{ type: String }],
      commonQuestions: [{ question: String, frequency: Number }],
      feedbackPatterns: {
        likes: [{ type: String }],
        dislikes: [{ type: String }],
      },
    },

    // Learning progress
    learningMetrics: {
      totalLearnings: { type: Number, default: 0 },
      correctPredictions: { type: Number, default: 0 },
      corrections: { type: Number, default: 0 },
      adaptations: { type: Number, default: 0 },
    },

    // Version for migrations
    schemaVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: 'agent_memories',
  }
);

// Compound indexes for efficient queries
agentMemorySchema.index({ userId: 1, agentId: 1 }, { unique: true });
agentMemorySchema.index({ 'memories.type': 1, 'memories.importance': -1 });
agentMemorySchema.index({ 'memories.tags': 1 });
agentMemorySchema.index({ 'relationship.lastInteraction': -1 });
agentMemorySchema.index({ 'memories.isActive': 1 });

// Methods

// Add a new memory
agentMemorySchema.methods.addMemory = async function (memoryData) {
  const memory = {
    type: memoryData.type,
    content: memoryData.content,
    data: memoryData.data || {},
    source: memoryData.source || {},
    importance: memoryData.importance || 5,
    confidence: memoryData.confidence || 0.8,
    tags: memoryData.tags || [],
  };

  this.memories.push(memory);
  this.learningMetrics.totalLearnings += 1;

  // Keep memories under a limit (oldest, lowest importance first)
  if (this.memories.length > 500) {
    this.memories.sort((a, b) => b.importance - a.importance);
    this.memories = this.memories.slice(0, 400);
  }

  return this.save();
};

// Get relevant memories for a context
agentMemorySchema.methods.getRelevantMemories = function (tags = [], limit = 20) {
  let relevantMemories = this.memories.filter((m) => m.isActive);

  // If tags provided, prioritize matching tags
  if (tags.length > 0) {
    relevantMemories = relevantMemories.sort((a, b) => {
      const aMatchCount = a.tags.filter((t) => tags.includes(t)).length;
      const bMatchCount = b.tags.filter((t) => tags.includes(t)).length;
      if (bMatchCount !== aMatchCount) return bMatchCount - aMatchCount;
      return b.importance - a.importance;
    });
  } else {
    // Sort by importance and recency
    relevantMemories = relevantMemories.sort((a, b) => {
      const importanceDiff = b.importance - a.importance;
      if (importanceDiff !== 0) return importanceDiff;
      return new Date(b.lastAccessed) - new Date(a.lastAccessed);
    });
  }

  return relevantMemories.slice(0, limit);
};

// Update user profile from learned information
agentMemorySchema.methods.updateUserProfile = async function (updates) {
  Object.keys(updates).forEach((key) => {
    if (this.userProfile[key] !== undefined || key in this.userProfile.schema?.paths || true) {
      this.userProfile[key] = updates[key];
    }
  });
  return this.save();
};

// Record an interaction
agentMemorySchema.methods.recordInteraction = async function () {
  const now = new Date();
  if (!this.relationship.firstInteraction) {
    this.relationship.firstInteraction = now;
  }
  this.relationship.lastInteraction = now;
  this.relationship.totalInteractions += 1;
  return this.save();
};

// Build context string from memories for system prompt
agentMemorySchema.methods.buildContextString = function (limit = 15) {
  const memories = this.getRelevantMemories([], limit);
  if (memories.length === 0 && !this.userSummary) return '';

  let context = '';

  // Add user summary if available
  if (this.userSummary) {
    context += `\n\n## About This User\n${this.userSummary}`;
  }

  // Add user profile info
  if (this.userProfile.preferredName) {
    context += `\n- User prefers to be called: ${this.userProfile.preferredName}`;
  }
  if (this.userProfile.communicationStyle) {
    context += `\n- Communication style: ${this.userProfile.communicationStyle}`;
  }
  if (this.userProfile.interests?.length > 0) {
    context += `\n- Interests: ${this.userProfile.interests.join(', ')}`;
  }

  // Add relevant memories
  if (memories.length > 0) {
    context += '\n\n## What You Remember About This User:';
    memories.forEach((m) => {
      context += `\n- [${m.type}] ${m.content}`;
    });
  }

  // Add relationship context
  if (this.relationship.totalInteractions > 5) {
    context += `\n\n## Relationship Context:`;
    context += `\n- You've had ${this.relationship.totalInteractions} conversations together.`;
    if (this.relationship.trustLevel > 7) {
      context += `\n- You have a strong rapport with this user.`;
    }
  }

  return context;
};

// Static method to get or create memory for a user-agent pair
agentMemorySchema.statics.getOrCreate = async function (userId, agentId) {
  let memory = await this.findOne({ userId, agentId });
  if (!memory) {
    memory = new this({
      userId,
      agentId,
      memories: [],
      userProfile: {},
      relationship: {
        firstInteraction: new Date(),
        lastInteraction: new Date(),
        totalInteractions: 0,
        totalMessages: 0,
      },
    });
    await memory.save();
  }
  return memory;
};

export default mongoose.model('AgentMemory', agentMemorySchema);
