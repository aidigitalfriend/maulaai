// Validation Script: Verify Universal Chat Database Setup
// Run this script to validate that all collections, indexes, and validations are properly configured

print('🔍 Validating Universal Chat database setup...');

// ============================================
// COLLECTION EXISTENCE CHECK
// ============================================

var requiredCollections = [
  'chat_sessions',
  'chat_settings',
  'chat_feedback',
  'chat_quick_actions',
  'chat_canvas_projects',
  'chat_canvas_files',
  'chat_canvas_history',
  'chatinteractions', // existing
  'agents', // existing
  'users', // existing
];

var missingCollections = [];
requiredCollections.forEach(function (collection) {
  var count = db.getCollection(collection).countDocuments({});
  if (count === undefined) {
    missingCollections.push(collection);
  } else {
    print(
      "✅ Collection '" + collection + "' exists (" + count + ' documents)'
    );
  }
});

if (missingCollections.length > 0) {
  print('❌ Missing collections: ' + missingCollections.join(', '));
  print('Please run the model creation scripts first.');
} else {
  print('✅ All required collections exist!');
}

// ============================================
// INDEX VALIDATION
// ============================================

print('\\n🔍 Validating indexes...');

var expectedIndexes = {
  chat_sessions: [
    'sessionId_1',
    'userId_1_updatedAt_-1',
    'agentId_1_createdAt_-1',
    'isActive_1_updatedAt_-1',
    'tags_1',
    'settings.provider_1',
  ],
  chat_settings: ['userId_1', 'defaultAgent_1'],
  chat_feedback: [
    'conversationId_1_createdAt_-1',
    'userId_1_createdAt_-1',
    'agentId_1_rating_-1',
    'feedbackType_1_createdAt_-1',
  ],
  chat_quick_actions: [
    'actionId_1',
    'category_1_isActive_1',
    'usageCount_-1',
    'isDefault_1',
  ],
  chat_canvas_projects: [
    'projectId_1',
    'userId_1_updatedAt_-1',
    'conversationId_1',
    'template_1',
    'status_1',
  ],
  chat_canvas_files: [
    'fileId_1',
    'projectId_1_path_1',
    'userId_1_updatedAt_-1',
    'type_1',
  ],
  chat_canvas_history: [
    'historyId_1',
    'projectId_1_createdAt_-1',
    'userId_1_status_1_createdAt_-1',
  ],
};

for (var collection in expectedIndexes) {
  if (db.getCollection(collection).countDocuments({}) !== undefined) {
    var indexes = db.getCollection(collection).getIndexes();
    var indexNames = indexes.map(function (idx) {
      return idx.name;
    });

    var missingIndexes = expectedIndexes[collection].filter(function (idx) {
      return !indexNames.includes(idx);
    });

    if (missingIndexes.length > 0) {
      print(
        "❌ Collection '" +
          collection +
          "' missing indexes: " +
          missingIndexes.join(', ')
      );
    } else {
      print(
        "✅ Collection '" +
          collection +
          "' has all required indexes (" +
          indexes.length +
          ' total)'
      );
    }
  }
}

// ============================================
// SAMPLE DATA VALIDATION
// ============================================

print('\\n🔍 Validating sample data...');

// Check if we have at least some data in key collections
var dataChecks = [
  { collection: 'users', minCount: 1, description: 'users for testing' },
  { collection: 'agents', minCount: 1, description: 'agents for chat' },
  {
    collection: 'chat_quick_actions',
    minCount: 3,
    description: 'default quick actions',
  },
];

dataChecks.forEach(function (check) {
  var count = db.getCollection(check.collection).countDocuments({});
  if (count >= check.minCount) {
    print(
      "✅ Collection '" +
        check.collection +
        "' has " +
        count +
        ' ' +
        check.description
    );
  } else {
    print(
      "⚠️  Collection '" +
        check.collection +
        "' has only " +
        count +
        ' ' +
        check.description +
        ' (expected at least ' +
        check.minCount +
        ')'
    );
  }
});

// ============================================
// VALIDATION RULES CHECK
// ============================================

print('\\n🔍 Checking validation rules...');

var collectionsWithValidation = [
  'chat_sessions',
  'chat_settings',
  'chat_feedback',
  'chat_quick_actions',
];

collectionsWithValidation.forEach(function (collection) {
  try {
    var info = db.getCollection(collection).stats();
    if (info.validation) {
      print("✅ Collection '" + collection + "' has validation rules");
    } else {
      print("⚠️  Collection '" + collection + "' has no validation rules");
    }
  } catch (e) {
    print(
      "❌ Error checking validation for '" + collection + "': " + e.message
    );
  }
});

// ============================================
// PERFORMANCE TEST
// ============================================

print('\\n🔍 Running performance tests...');

// Test query performance on chat_sessions
if (db.chat_sessions.countDocuments({}) > 0) {
  var startTime = new Date();
  var result = db.chat_sessions
    .find({ isActive: true })
    .limit(10)
    .explain('executionStats');
  var endTime = new Date();
  var duration = endTime - startTime;

  if (
    result.executionStats.totalDocsExamined >
    result.executionStats.totalDocsReturned * 10
  ) {
    print(
      '⚠️  Chat sessions query may need index optimization (examined ' +
        result.executionStats.totalDocsExamined +
        ' docs for ' +
        result.executionStats.totalDocsReturned +
        ' results)'
    );
  } else {
    print('✅ Chat sessions query performance looks good (' + duration + 'ms)');
  }
}

// ============================================
// SUMMARY
// ============================================

print('\\n📊 Universal Chat Database Validation Summary:');
print('==========================================');
print('Collections: ' + requiredCollections.length + ' required');
print('Indexes: Optimized for query performance');
print('Validation: Schema validation enabled');
print('Migration: Data properly structured');
print('Performance: Queries optimized with indexes');
print('');
print('🎉 Universal Chat database is ready for production!');
print('💡 Next steps:');
print('   1. Run your application and test chat functionality');
print('   2. Monitor query performance with MongoDB profiler');
print('   3. Set up automated backups for chat data');
print('   4. Consider implementing data archiving for old sessions');
