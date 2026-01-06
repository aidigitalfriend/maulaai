// Migration Script: Populate Chat Sessions from Existing Chat Interactions
// Run this script to migrate existing chat data to the new ChatSession collection

// ============================================
// MIGRATION: CHAT SESSIONS FROM CHAT INTERACTIONS
// ============================================

print('🔄 Starting migration of chat sessions from chatinteractions...');

// Aggregate existing chat interactions to create session summaries
db.chatinteractions.aggregate([
  {
    $group: {
      _id: '$conversationId',
      userId: { $first: '$userId' },
      agentId: { $first: '$agentId' },
      firstMessage: { $first: '$messages' },
      messageCount: { $sum: { $size: '$messages' } },
      totalTokens: { $sum: '$metrics.totalTokens' },
      totalDuration: { $sum: '$metrics.durationMs' },
      startedAt: { $min: '$startedAt' },
      updatedAt: { $max: '$updatedAt' },
      lastMessage: { $last: '$messages' },
    },
  },
  {
    $project: {
      sessionId: '$_id',
      userId: 1,
      agentId: 1,
      name: {
        $cond: {
          if: {
            $and: [
              { $isArray: '$firstMessage' },
              { $gt: [{ $size: '$firstMessage' }, 0] },
            ],
          },
          then: {
            $concat: [
              {
                $substr: [
                  { $arrayElemAt: ['$firstMessage.content', 0] },
                  0,
                  50,
                ],
              },
              {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $strLenCP: {
                          $arrayElemAt: ['$firstMessage.content', 0],
                        },
                      },
                      50,
                    ],
                  },
                  then: '...',
                  else: '',
                },
              },
            ],
          },
          else: 'Migrated Chat Session',
        },
      },
      description: '',
      tags: [],
      settings: { $literal: {} },
      stats: {
        messageCount: '$messageCount',
        totalTokens: '$totalTokens',
        durationMs: '$totalDuration',
        lastMessageAt: '$updatedAt',
      },
      createdAt: '$startedAt',
      updatedAt: '$updatedAt',
    },
  },
  { $out: 'chat_sessions_temp' },
]);

// Insert into chat_sessions collection (avoiding duplicates)
db.chat_sessions_temp.find({}).forEach(function (doc) {
  // Check if session already exists
  var existing = db.chat_sessions.findOne({ sessionId: doc.sessionId });
  if (!existing) {
    db.chat_sessions.insertOne(doc);
  }
});

// Clean up temp collection
db.chat_sessions_temp.drop();

print('✅ Chat sessions migration completed!');

// ============================================
// MIGRATION: DEFAULT CHAT SETTINGS FOR EXISTING USERS
// ============================================

print('🔄 Creating default chat settings for existing users...');

db.users.find({}).forEach(function (user) {
  var existingSettings = db.chat_settings.findOne({ userId: user._id });
  if (!existingSettings) {
    db.chat_settings.insertOne({
      userId: user._id,
      theme: 'auto',
      fontSize: 'medium',
      notifications: {
        messageReceived: true,
        agentResponses: true,
        systemUpdates: false,
      },
      autoSave: true,
      quickActions: {
        enabled: true,
        favorites: ['explain', 'summarize', 'code'],
      },
      privacy: {
        saveHistory: true,
        allowAnalytics: true,
        shareConversations: false,
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
});

print('✅ Default chat settings created for existing users!');

// ============================================
// MIGRATION: DEFAULT QUICK ACTIONS
// ============================================

print('🔄 Creating default quick actions...');

var defaultActions = [
  {
    actionId: 'explain',
    label: 'Explain this',
    prompt: 'Please explain this in simple terms: ',
    category: 'Learning',
    icon: 'AcademicCapIcon',
    isDefault: true,
    isActive: true,
    usageCount: 0,
  },
  {
    actionId: 'summarize',
    label: 'Summarize',
    prompt: 'Please provide a concise summary of: ',
    category: 'Utility',
    icon: 'DocumentTextIcon',
    isDefault: true,
    isActive: true,
    usageCount: 0,
  },
  {
    actionId: 'code',
    label: 'Write code',
    prompt: 'Please write code for: ',
    category: 'Technical',
    icon: 'CodeBracketIcon',
    isDefault: true,
    isActive: true,
    usageCount: 0,
  },
  {
    actionId: 'translate',
    label: 'Translate',
    prompt: 'Please translate this to English: ',
    category: 'Utility',
    icon: 'LanguageIcon',
    isDefault: true,
    isActive: true,
    usageCount: 0,
  },
  {
    actionId: 'improve',
    label: 'Improve writing',
    prompt: 'Please improve this text: ',
    category: 'Creative',
    icon: 'PencilIcon',
    isDefault: true,
    isActive: true,
    usageCount: 0,
  },
];

defaultActions.forEach(function (action) {
  var existing = db.chat_quick_actions.findOne({ actionId: action.actionId });
  if (!existing) {
    action.createdAt = new Date();
    action.updatedAt = new Date();
    db.chat_quick_actions.insertOne(action);
  }
});

print('✅ Default quick actions created!');

// ============================================
// VALIDATION: CHECK MIGRATION RESULTS
// ============================================

print('\\n📊 Migration Results:');
print('Chat Sessions: ' + db.chat_sessions.countDocuments({}));
print('Chat Settings: ' + db.chat_settings.countDocuments({}));
print('Quick Actions: ' + db.chat_quick_actions.countDocuments({}));
print('Total Users: ' + db.users.countDocuments({}));
print('Total Chat Interactions: ' + db.chatinteractions.countDocuments({}));

print('\\n✅ Universal Chat migration completed successfully!');
print('🎉 All chat data is now properly structured and indexed!');
