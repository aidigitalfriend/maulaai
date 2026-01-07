# Universal Chat Database Collections

This document lists the MongoDB collections required for the Universal Chat components and canvas mode. Each section covers expected documents, schema, indexes, typical aggregations/queries, and validation rules.

## chat_sessions

- **Purpose**: Stores user chat sessions and per-session model/settings state.
- **Documents (example)**:

```json
{
  "sessionId": "session-1704650000000-abc123",
  "userId": "<ObjectId>",
  "agentId": "<ObjectId>",
  "name": "Research Draft",
  "description": "Notes on Q1 plan",
  "isActive": true,
  "isArchived": false,
  "tags": ["work", "draft"],
  "settings": {
    "temperature": 0.7,
    "maxTokens": 2000,
    "mode": "balanced",
    "provider": "mistral",
    "model": "mistral-large-latest"
  },
  "stats": {
    "messageCount": 42,
    "totalTokens": 18000,
    "durationMs": 540000,
    "lastMessageAt": "2025-12-31T23:59:59.000Z"
  },
  "archivedAt": null,
  "createdAt": "2025-12-31T23:00:00.000Z",
  "updatedAt": "2025-12-31T23:59:59.000Z"
}
```

- **Schema**:
  - `sessionId` string (required, unique, indexed)
  - `userId` ObjectId ref User (required, indexed)
  - `agentId` ObjectId ref Agent (indexed)
  - `name` string ≤100 (required)
  - `description` string ≤500
  - `isActive` bool default true
  - `isArchived` bool default false
  - `tags` [string]
  - `settings.temperature` number 0–2 default 0.7
  - `settings.maxTokens` number 1–4000 default 2000
  - `settings.mode` enum `professional|balanced|creative|fast|coding` default `balanced`
  - `settings.provider` enum `openai|anthropic|gemini|cohere|mistral|xai|huggingface|groq` default `mistral`
  - `settings.model` string
  - `stats.messageCount` number default 0
  - `stats.totalTokens` number default 0
  - `stats.durationMs` number default 0
  - `stats.lastMessageAt` date
  - `archivedAt` date
  - `createdAt`/`updatedAt` timestamps
- **Indexes**:
  - `{ userId: 1, updatedAt: -1 }`
  - `{ agentId: 1, createdAt: -1 }`
  - `{ isActive: 1, updatedAt: -1 }`
  - `{ tags: 1 }`
  - `{ "settings.provider": 1 }`
  - Unique `{ sessionId: 1 }`
- **Aggregations / Common queries**:
  - Recent sessions for a user sorted by `updatedAt` with limit/pagination.
  - Filter active sessions by provider or mode for analytics.
  - Count archived vs active sessions per user.
  - Tag-based search using `$in` on `tags`.
- **Validation**:
  - Enforced by schema: required `sessionId`, `userId`, `name`; enums for mode/provider; numeric ranges for temperature/maxTokens; unique `sessionId`.

## chat_feedback

- **Purpose**: Captures per-message or per-conversation feedback.
- **Documents (example)**:

```json
{
  "conversationId": "session-1704650000000-abc123",
  "messageId": "msg-1704650500000-xyz789",
  "userId": "<ObjectId>",
  "agentId": "<ObjectId>",
  "feedbackType": "message",
  "rating": 5,
  "comment": "Great explanation",
  "category": "accuracy",
  "tags": ["math"],
  "metadata": { "latencyMs": 850 },
  "createdAt": "2025-12-31T23:10:00.000Z",
  "updatedAt": "2025-12-31T23:10:00.000Z"
}
```

- **Schema**:
  - `conversationId` string (required, indexed)
  - `messageId` string (indexed)
  - `userId` ObjectId ref User (required, indexed)
  - `agentId` ObjectId ref Agent (indexed)
  - `feedbackType` enum `message|conversation|agent` (required)
  - `rating` number 1–5 (required)
  - `comment` string ≤1000
  - `category` enum `accuracy|helpfulness|speed|tone|creativity|technical`
  - `tags` [string]
  - `metadata` Mixed
  - `createdAt`/`updatedAt` timestamps
- **Indexes**:
  - `{ conversationId: 1, createdAt: -1 }`
  - `{ userId: 1, createdAt: -1 }`
  - `{ agentId: 1, rating: -1 }`
  - `{ feedbackType: 1, createdAt: -1 }`
- **Aggregations / Common queries**:
  - Average `rating` by `agentId` or `conversationId`.
  - Distribution of `feedbackType` per agent for QA.
  - Time-bucketed counts for trend lines using `$group` on day/week.
- **Validation**:
  - Required `conversationId`, `userId`, `feedbackType`, `rating`; enum checks on `feedbackType`/`category`; rating range 1–5.

## chat_quick_actions

- **Purpose**: Stores reusable quick prompts for the chat UI.
- **Documents (example)**:

```json
{
  "actionId": "qa-write-outline",
  "label": "Write Outline",
  "prompt": "Draft a detailed outline for...",
  "category": "Creative",
  "icon": "SparklesIcon",
  "isDefault": true,
  "isActive": true,
  "usageCount": 120,
  "createdBy": "<ObjectId>",
  "createdAt": "2025-12-15T12:00:00.000Z",
  "updatedAt": "2025-12-20T12:00:00.000Z"
}
```

- **Schema**:
  - `actionId` string (required, unique, indexed)
  - `label` string ≤50 (required)
  - `prompt` string ≤500 (required)
  - `category` enum `Learning|Creative|Technical|Utility|General` (required)
  - `icon` string (required)
  - `isDefault` bool default false
  - `isActive` bool default true
  - `usageCount` number default 0
  - `createdBy` ObjectId ref User
  - `createdAt`/`updatedAt` timestamps
- **Indexes**:
  - `{ category: 1, isActive: 1 }`
  - `{ usageCount: -1 }`
  - `{ isDefault: 1 }`
  - Unique `{ actionId: 1 }`
- **Aggregations / Common queries**:
  - Top quick actions by `usageCount`.
  - Filter defaults or active actions by `category` for UI presets.
- **Validation**:
  - Required `actionId`, `label`, `prompt`, `category`, `icon`; enum for `category`; unique `actionId`.

## chat_settings

- **Purpose**: Per-user chat preferences, theme, and defaults.
- **Documents (example)**:

```json
{
  "userId": "<ObjectId>",
  "theme": "auto",
  "fontSize": "medium",
  "notifications": {
    "messageReceived": true,
    "agentResponses": true,
    "systemUpdates": false
  },
  "autoSave": true,
  "defaultAgent": "<ObjectId>",
  "quickActions": { "enabled": true, "favorites": ["qa-write-outline"] },
  "privacy": {
    "saveHistory": true,
    "allowAnalytics": true,
    "shareConversations": false
  },
  "accessibility": {
    "highContrast": false,
    "reducedMotion": false,
    "screenReader": false
  },
  "createdAt": "2025-12-10T10:00:00.000Z",
  "updatedAt": "2025-12-20T10:00:00.000Z"
}
```

- **Schema**:
  - `userId` ObjectId ref User (required, unique, indexed)
  - `theme` enum `light|dark|auto|neural` default `auto`
  - `fontSize` enum `small|medium|large` default `medium`
  - `notifications.messageReceived` bool default true
  - `notifications.agentResponses` bool default true
  - `notifications.systemUpdates` bool default false
  - `autoSave` bool default true
  - `defaultAgent` ObjectId ref Agent
  - `quickActions.enabled` bool default true
  - `quickActions.favorites` [string]
  - `privacy.saveHistory` bool default true
  - `privacy.allowAnalytics` bool default true
  - `privacy.shareConversations` bool default false
  - `accessibility.highContrast` bool default false
  - `accessibility.reducedMotion` bool default false
  - `accessibility.screenReader` bool default false
  - `createdAt`/`updatedAt` timestamps
- **Indexes**:
  - Unique `{ userId: 1 }`
  - `{ defaultAgent: 1 }`
- **Aggregations / Common queries**:
  - Fetch by `userId` (one document per user).
  - Count theme preferences across users for analytics.
- **Validation**:
  - Required/unique `userId`; enums on `theme`/`fontSize`; booleans defaulted; at most one document per user enforced by unique index.

## chat_canvas_projects

- **Purpose**: Canvas mode projects linked to chat sessions.
- **Documents (example)**:

```json
{
  "projectId": "canvas-1704651000000-ab1",
  "userId": "<ObjectId>",
  "conversationId": "session-1704650000000-abc123",
  "name": "Landing Page",
  "description": "Hero + features",
  "template": "next-landing",
  "category": "web",
  "status": "active",
  "settings": { "theme": "light", "responsive": true, "animations": true },
  "stats": {
    "filesGenerated": 6,
    "totalSize": 42000,
    "lastModified": "2025-12-31T23:30:00.000Z"
  },
  "createdAt": "2025-12-31T23:05:00.000Z",
  "updatedAt": "2025-12-31T23:30:00.000Z"
}
```

- **Schema**:
  - `projectId` string (required, unique, indexed)
  - `userId` ObjectId ref User (required, indexed)
  - `conversationId` string (indexed)
  - `name` string ≤100 (required)
  - `description` string ≤500
  - `template` string (required)
  - `category` string (required)
  - `status` enum `active|archived|deleted` default `active`
  - `settings.theme` string default `light`
  - `settings.responsive` bool default true
  - `settings.animations` bool default true
  - `stats.filesGenerated` number default 0
  - `stats.totalSize` number default 0
  - `stats.lastModified` date
  - `createdAt`/`updatedAt` timestamps
- **Indexes**:
  - `{ userId: 1, updatedAt: -1 }`
  - `{ conversationId: 1 }`
  - `{ template: 1 }`
  - `{ status: 1 }`
  - Unique `{ projectId: 1 }`
- **Aggregations / Common queries**:
  - List projects by `userId` sorted by `updatedAt`.
  - Filter by `status` for trash/archive views.
  - Template/category usage counts for analytics.
- **Validation**:
  - Required `projectId`, `userId`, `name`, `template`, `category`; enum for `status`; unique `projectId`.

## chat_canvas_files

- **Purpose**: Files generated within a canvas project.
- **Documents (example)**:

```json
{
  "fileId": "file-1704651200000-xyz",
  "projectId": "canvas-1704651000000-ab1",
  "userId": "<ObjectId>",
  "name": "index.tsx",
  "path": "src/pages/index.tsx",
  "type": "tsx",
  "content": "export default function Page() { return <div>Hi</div>; }",
  "size": 820,
  "checksum": "sha256:...",
  "metadata": {
    "language": "TypeScript",
    "framework": "Next.js",
    "dependencies": ["react"]
  },
  "createdAt": "2025-12-31T23:06:00.000Z",
  "updatedAt": "2025-12-31T23:30:00.000Z"
}
```

- **Schema**:
  - `fileId` string (required, unique, indexed)
  - `projectId` string (required, indexed)
  - `userId` ObjectId ref User (required, indexed)
  - `name` string (required)
  - `path` string (required)
  - `type` enum `html|css|js|tsx|json|image|other` (required)
  - `content` string
  - `size` number (required)
  - `checksum` string
  - `metadata.language` string
  - `metadata.framework` string
  - `metadata.dependencies` [string]
  - `createdAt`/`updatedAt` timestamps
- **Indexes**:
  - `{ projectId: 1, path: 1 }`
  - `{ userId: 1, updatedAt: -1 }`
  - `{ type: 1 }`
  - Unique `{ fileId: 1 }`
- **Aggregations / Common queries**:
  - Fetch all files by `projectId` sorted by path for tree view.
  - Count files by `type` within a project.
  - Total size per project using `$group` on `projectId`.
- **Validation**:
  - Required `fileId`, `projectId`, `userId`, `name`, `path`, `type`, `size`; enum on `type`; unique `fileId`.

## chat_canvas_history

- **Purpose**: Tracks canvas generation runs per project.
- **Documents (example)**:

```json
{
  "historyId": "hist-1704651400000-pqr",
  "projectId": "canvas-1704651000000-ab1",
  "userId": "<ObjectId>",
  "prompt": "Generate a landing page with hero and pricing",
  "status": "completed",
  "result": { "filesGenerated": 6, "totalSize": 42000, "duration": 18 },
  "error": null,
  "metadata": { "model": "mistral-large-latest" },
  "createdAt": "2025-12-31T23:07:00.000Z",
  "updatedAt": "2025-12-31T23:07:20.000Z"
}
```

- **Schema**:
  - `historyId` string (required, unique, indexed)
  - `projectId` string (required, indexed)
  - `userId` ObjectId ref User (required, indexed)
  - `prompt` string (required)
  - `status` enum `pending|completed|failed` (required)
  - `result.filesGenerated` number
  - `result.totalSize` number
  - `result.duration` number
  - `error` string
  - `metadata` Mixed
  - `createdAt`/`updatedAt` timestamps
- **Indexes**:
  - `{ projectId: 1, createdAt: -1 }`
  - `{ userId: 1, status: 1, createdAt: -1 }`
  - Unique `{ historyId: 1 }`
- **Aggregations / Common queries**:
  - Recent runs by `projectId` sorted by `createdAt`.
  - Success/failure rates grouped by `status` per user or project.
  - Duration averages per `template` (via metadata) using `$group`.
- **Validation**:
  - Required `historyId`, `projectId`, `userId`, `prompt`, `status`; enum on `status`; unique `historyId`.

## Notes

- ObjectId references: `userId` → `users`, `agentId`/`defaultAgent` → `agents`. Ensure referenced collections exist and are indexed on `_id`.
- All collections use Mongoose timestamping (`createdAt`, `updatedAt`).
- Enforce index creation in production (ensure `autoIndex` in connection options or run `Model.syncIndexes()`).

## Gaps to add (not yet implemented in backend)

The project currently lacks persistence for message-level history, audit logs, and canvas edit trails. Add these collections to complete coverage:

- **chat_messages**
  - Purpose: Store every chat turn per session and agent.
  - Schema: `messageId` (string, unique), `sessionId` (string, indexed), `userId` (ObjectId), `agentId` (ObjectId), `role` (`user|assistant|system`), `content` (string), `tokens` (number), `model` (string), `createdAt`/`updatedAt`.
  - Indexes: `{ sessionId: 1, createdAt: 1 }`, `{ userId: 1, createdAt: -1 }`, `{ agentId: 1, createdAt: -1 }`, unique `{ messageId: 1 }`.
  - Queries: paginate by session; count tokens per session; latest message per session.

- **chat_session_events**
  - Purpose: Audit trail for session lifecycle and settings changes (rename, archive, model switch, tag updates).
  - Schema: `eventId` (string, unique), `sessionId` (string, indexed), `userId` (ObjectId), `agentId` (ObjectId), `eventType` (enum: `create|rename|archive|unarchive|setting_change|tag_change|delete`), `payload` (Mixed), `createdAt`.
  - Indexes: `{ sessionId: 1, createdAt: -1 }`, `{ userId: 1, createdAt: -1 }`, unique `{ eventId: 1 }`.
  - Queries: timeline per session; last setting change per session; counts by eventType.

- **chat_settings_history**
  - Purpose: Audit of user settings changes (theme, notifications, privacy, defaultAgent).
  - Schema: `historyId` (string, unique), `userId` (ObjectId, indexed), `changedBy` (ObjectId), `diff` (Mixed), `createdAt`.
  - Indexes: `{ userId: 1, createdAt: -1 }`, unique `{ historyId: 1 }`.
  - Queries: latest settings snapshot; trend of privacy toggles; who changed what.

- **canvas_activity**
  - Purpose: File-level edit/version events inside a canvas project.
  - Schema: `activityId` (string, unique), `projectId` (string, indexed), `fileId` (string, indexed), `userId` (ObjectId), `action` (enum: `create|update|delete|rename`), `checksum` (string), `diffSummary` (string), `metadata` (Mixed), `createdAt`.
  - Indexes: `{ projectId: 1, createdAt: -1 }`, `{ fileId: 1, createdAt: -1 }`, unique `{ activityId: 1 }`.
  - Queries: per-file timeline; latest checksum for restore; activity heatmap per project.

- **chat_analytics_rollups** (optional but useful)
  - Purpose: Pre-aggregated metrics for sessions/messages to keep dashboards cheap.
  - Schema: `period` (day/week), `sessionId` (string), `userId` (ObjectId), `agentId` (ObjectId), `messageCount` (number), `tokenCount` (number), `avgLatencyMs` (number), `createdAt`.
  - Indexes: `{ period: 1, sessionId: 1 }`, `{ userId: 1, period: 1 }`, `{ agentId: 1, period: 1 }`.

Implementing these will align stored data with the UI needs (chat streams, audits, canvas edit tracking) and avoid losing history currently held only in memory on the frontend.
