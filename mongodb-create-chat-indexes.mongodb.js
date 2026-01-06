// MongoDB Indexes for Universal Chat Collections
// Run this script in MongoDB shell or via mongosh to create all required indexes

// ============================================
// CHAT SESSIONS INDEXES
// ============================================

db.chat_sessions.createIndex({ sessionId: 1 }, { unique: true });
db.chat_sessions.createIndex({ userId: 1, updatedAt: -1 });
db.chat_sessions.createIndex({ agentId: 1, createdAt: -1 });
db.chat_sessions.createIndex({ isActive: 1, updatedAt: -1 });
db.chat_sessions.createIndex({ tags: 1 });
db.chat_sessions.createIndex({ 'settings.provider': 1 });

// ============================================
// CHAT SETTINGS INDEXES
// ============================================

db.chat_settings.createIndex({ userId: 1 }, { unique: true });
db.chat_settings.createIndex({ defaultAgent: 1 });

// ============================================
// CHAT FEEDBACK INDEXES
// ============================================

db.chat_feedback.createIndex({ conversationId: 1, createdAt: -1 });
db.chat_feedback.createIndex({ userId: 1, createdAt: -1 });
db.chat_feedback.createIndex({ agentId: 1, rating: -1 });
db.chat_feedback.createIndex({ feedbackType: 1, createdAt: -1 });

// ============================================
// CHAT QUICK ACTIONS INDEXES
// ============================================

db.chat_quick_actions.createIndex({ actionId: 1 }, { unique: true });
db.chat_quick_actions.createIndex({ category: 1, isActive: 1 });
db.chat_quick_actions.createIndex({ usageCount: -1 });
db.chat_quick_actions.createIndex({ isDefault: 1 });

// ============================================
// CANVAS PROJECTS INDEXES
// ============================================

db.chat_canvas_projects.createIndex({ projectId: 1 }, { unique: true });
db.chat_canvas_projects.createIndex({ userId: 1, updatedAt: -1 });
db.chat_canvas_projects.createIndex({ conversationId: 1 });
db.chat_canvas_projects.createIndex({ template: 1 });
db.chat_canvas_projects.createIndex({ status: 1 });

// ============================================
// CANVAS FILES INDEXES
// ============================================

db.chat_canvas_files.createIndex({ fileId: 1 }, { unique: true });
db.chat_canvas_files.createIndex({ projectId: 1, path: 1 });
db.chat_canvas_files.createIndex({ userId: 1, updatedAt: -1 });
db.chat_canvas_files.createIndex({ type: 1 });

// ============================================
// CANVAS HISTORY INDEXES
// ============================================

db.chat_canvas_history.createIndex({ historyId: 1 }, { unique: true });
db.chat_canvas_history.createIndex({ projectId: 1, createdAt: -1 });
db.chat_canvas_history.createIndex({ userId: 1, status: 1, createdAt: -1 });

// ============================================
// EXISTING COLLECTIONS - ENSURE INDEXES
// ============================================

// Chat Interactions (existing)
db.chatinteractions.createIndex({ conversationId: 1, userId: 1 });
db.chatinteractions.createIndex({ userId: 1, startedAt: -1 });
db.chatinteractions.createIndex({ agentId: 1, startedAt: -1 });
db.chatinteractions.createIndex({ status: 1, updatedAt: -1 });
db.chatinteractions.createIndex({
  'messages.content': 'text',
  conversationId: 1,
});

// Agents (existing)
db.agents.createIndex({ agentId: 1 }, { unique: true });
db.agents.createIndex({ category: 1 });
db.agents.createIndex({ isActive: 1 });
db.agents.createIndex({ 'providerConfig.primaryProvider': 1 });

// Users (existing)
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ authMethod: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: -1 });

print('✅ All Universal Chat database indexes created successfully!');
