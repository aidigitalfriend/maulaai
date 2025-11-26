import mongoose from 'mongoose';

const fileAttachmentSchema = new mongoose.Schema({
  name: String,
  size: Number,
  type: String,
  url: String,
  data: String // Base64 encoded
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  feedback: {
    type: String,
    enum: ['positive', 'negative', null],
    default: null
  },
  attachments: [fileAttachmentSchema]
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    default: function() {
      return `Chat ${new Date().toLocaleString()}`;
    }
  },
  messages: [chatMessageSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const agentChatHistorySchema = new mongoose.Schema({
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
  sessions: [chatSessionSchema],
  activeSessionId: {
    type: String
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes
agentChatHistorySchema.index({ userId: 1, agentId: 1 }, { unique: true });
agentChatHistorySchema.index({ userId: 1, lastActivity: -1 });
agentChatHistorySchema.index({ agentId: 1, lastActivity: -1 });

// Middleware to update lastActivity and totalMessages
agentChatHistorySchema.pre('save', function(next) {
  this.lastActivity = new Date();
  this.totalMessages = this.sessions.reduce((total, session) => {
    return total + session.messages.length;
  }, 0);
  next();
});

// Get active session
agentChatHistorySchema.methods.getActiveSession = function() {
  return this.sessions.find(s => s.sessionId === this.activeSessionId);
};

// Add new session
agentChatHistorySchema.methods.addSession = function(sessionId, initialMessage = null) {
  const newSession = {
    sessionId,
    name: `Chat ${new Date().toLocaleString()}`,
    messages: initialMessage ? [initialMessage] : [],
    lastUpdated: new Date()
  };
  this.sessions.unshift(newSession);
  this.activeSessionId = sessionId;
  return newSession;
};

// Add message to session
agentChatHistorySchema.methods.addMessage = function(sessionId, message) {
  const session = this.sessions.find(s => s.sessionId === sessionId);
  if (session) {
    session.messages.push(message);
    session.lastUpdated = new Date();
    return true;
  }
  return false;
};

const AgentChatHistory = mongoose.model('AgentChatHistory', agentChatHistorySchema);

export default AgentChatHistory;
