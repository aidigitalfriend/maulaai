# 🎨 Universal Chat Canvas - Complete Technical Specification

> **Document Version:** 1.0  
> **Created:** January 3, 2026  
> **Status:** Draft for Review  
> **Location:** Inside Universal Chat (Every Agent)

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [User Flow Diagrams](#2-user-flow-diagrams)
3. [Features & Functionality](#3-features--functionality)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend API Endpoints](#5-backend-api-endpoints)
6. [Database Schema (MongoDB)](#6-database-schema-mongodb)
7. [File Storage (S3)](#7-file-storage-s3)
8. [Real-time Communication](#8-real-time-communication)
9. [Security & Permissions](#9-security--permissions)
10. [Implementation Phases](#10-implementation-phases)

---

## 1. Overview

### 1.1 What is Canvas?

Canvas is an **AI-driven design/code generation tool** embedded inside the Universal Chat of every agent. Users request, AI delivers.

### 1.2 Key Principle

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER = REQUESTOR ONLY                        │
│                    AI = BUILDER/CREATOR                         │
│                                                                 │
│  ✅ User CAN:                    ❌ User CANNOT:                │
│  • Request AI to build           • Edit code directly           │
│  • Select templates              • Drag-drop components         │
│  • Upload files/images           • Write code manually          │
│  • View preview                  • Add blocks                   │
│  • View file tree                • Manual building              │
│  • Download results              • Direct manipulation          │
│  • Give feedback/iterate                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Access Control

```
┌─────────────────────────────────────────────────────────────────┐
│                      ACCESS REQUIREMENT                          │
├─────────────────────────────────────────────────────────────────┤
│  User must have:                                                │
│  ✓ Active subscription to ANY agent                             │
│  ✓ Logged in with valid session                                 │
│                                                                 │
│  Same access model as: AI Lab, Toolbox pages                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. User Flow Diagrams

### 2.1 Main User Journey

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY                                    │
└──────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌───────────┐
    │  Login  │────▶│ Agent Chat  │────▶│ Click Canvas │────▶│  Canvas   │
    │         │     │  (Comedy    │     │   Button     │     │  Opens    │
    └─────────┘     │   King)     │     │  (Right)     │     │           │
                    └─────────────┘     └──────────────┘     └─────┬─────┘
                                                                   │
                    ┌──────────────────────────────────────────────┘
                    ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                         CANVAS WORKSPACE                             │
    │  ┌─────────────┐  ┌─────────────────────────┐  ┌─────────────────┐  │
    │  │   AI CHAT   │  │      FILE TREE          │  │    PREVIEW      │  │
    │  │   PANEL     │  │   (View Only)           │  │    WINDOW       │  │
    │  │             │  │                         │  │                 │  │
    │  │ • Templates │  │  📁 project/            │  │  Live result    │
    │  │ • Request   │  │  ├── 📄 index.html     │  │  of AI work     │
    │  │ • Upload    │  │  ├── 📄 styles.css     │  │                 │  │
    │  │ • Iterate   │  │  └── 📄 script.js      │  │                 │  │
    │  └─────────────┘  └─────────────────────────┘  └─────────────────┘  │
    └─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Request → Response Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                    AI REQUEST → RESPONSE FLOW                               │
└────────────────────────────────────────────────────────────────────────────┘

  USER                          FRONTEND                         BACKEND
   │                               │                                │
   │  1. Select Template           │                                │
   │      OR                       │                                │
   │  1. Type Request              │                                │
   │      OR                       │                                │
   │  1. Upload Image              │                                │
   │──────────────────────────────▶│                                │
   │                               │  2. POST /api/canvas/generate  │
   │                               │──────────────────────────────▶│
   │                               │                                │
   │                               │                      ┌─────────┴─────────┐
   │                               │                      │  3. Process:      │
   │                               │                      │  • Parse request  │
   │                               │                      │  • Call AI API    │
   │                               │                      │  • Generate code  │
   │                               │                      │  • Save to DB     │
   │                               │                      │  • Upload to S3   │
   │                               │                      └─────────┬─────────┘
   │                               │                                │
   │                               │  4. Return generated files     │
   │                               │◀──────────────────────────────│
   │                               │                                │
   │  5. Show in Preview           │                                │
   │  6. Show File Tree            │                                │
   │◀──────────────────────────────│                                │
   │                               │                                │
   │  7. User can:                 │                                │
   │     • Download                │                                │
   │     • Request changes         │                                │
   │     • Upload more files       │                                │
   │                               │                                │
```

### 2.3 File Upload Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         FILE UPLOAD FLOW                                    │
└────────────────────────────────────────────────────────────────────────────┘

  USER                    FRONTEND                S3 BUCKET              MONGODB
   │                         │                        │                      │
   │  1. Click Upload        │                        │                      │
   │     (Image/File)        │                        │                      │
   │────────────────────────▶│                        │                      │
   │                         │                        │                      │
   │                         │  2. Get presigned URL  │                      │
   │                         │  POST /api/upload/url  │                      │
   │                         │───────────────────────▶│                      │
   │                         │                        │                      │
   │                         │  3. Return signed URL  │                      │
   │                         │◀───────────────────────│                      │
   │                         │                        │                      │
   │                         │  4. Upload directly    │                      │
   │                         │       to S3            │                      │
   │                         │───────────────────────▶│                      │
   │                         │                        │                      │
   │                         │  5. Upload success     │                      │
   │                         │◀───────────────────────│                      │
   │                         │                        │                      │
   │                         │  6. Save metadata      │                      │
   │                         │  POST /api/canvas/file │                      │
   │                         │────────────────────────┼─────────────────────▶│
   │                         │                        │                      │
   │  7. Show in file tree   │                        │                      │
   │◀────────────────────────│                        │                      │
   │                         │                        │                      │
```

---

## 3. Features & Functionality

### 3.1 Complete Feature List

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CANVAS FEATURES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🤖 AI CHAT PANEL (Left Side)                                               │
│  ├── Chat with AI agent                                                     │
│  ├── Select from 25+ templates                                              │
│  ├── Request custom designs                                                 │
│  ├── Upload images for AI to use                                            │
│  ├── Upload reference files                                                 │
│  ├── Iterate on designs ("make it darker", "add more space")               │
│  ├── View conversation history                                              │
│  └── Clear/New conversation                                                 │
│                                                                             │
│  📁 FILE TREE PANEL (Center/Collapsible)                                    │
│  ├── View generated files (READ ONLY)                                       │
│  ├── Folder structure display                                               │
│  ├── File icons by type                                                     │
│  ├── Click to preview file content                                          │
│  ├── File size indicator                                                    │
│  └── Uploaded assets section                                                │
│                                                                             │
│  👁️ PREVIEW PANEL (Right Side)                                              │
│  ├── Live preview of generated code                                         │
│  ├── Desktop/Tablet/Mobile view toggle                                      │
│  ├── Refresh preview                                                        │
│  ├── Open in new tab                                                        │
│  └── Fullscreen mode                                                        │
│                                                                             │
│  📥 ACTIONS                                                                 │
│  ├── Download single file                                                   │
│  ├── Download all as ZIP                                                    │
│  ├── Copy code (view only)                                                  │
│  ├── Share preview link                                                     │
│  └── Save to projects (future)                                              │
│                                                                             │
│  🎨 TEMPLATES (25 Categories)                                               │
│  ├── Landing Pages (5)                                                      │
│  ├── Dashboards (5)                                                         │
│  ├── E-commerce (5)                                                         │
│  ├── Components (5)                                                         │
│  └── Creative (5)                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Template Categories Detail

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         25 TEMPLATES                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🚀 LANDING PAGES                    📊 DASHBOARDS                          │
│  ├── SaaS Landing                    ├── Analytics Dashboard                │
│  ├── Portfolio                       ├── Admin Panel                        │
│  ├── Startup                         ├── Finance Dashboard                  │
│  ├── Agency                          ├── Project Manager                    │
│  └── App Promo                       └── CRM Dashboard                      │
│                                                                             │
│  🛒 E-COMMERCE                       🧩 COMPONENTS                          │
│  ├── Product Store                   ├── Login Form                         │
│  ├── Product Page                    ├── Pricing Table                      │
│  ├── Checkout                        ├── Contact Form                       │
│  ├── Fashion Store                   ├── Navigation                         │
│  └── Food Delivery                   └── Cards Gallery                      │
│                                                                             │
│  🎨 CREATIVE                                                                │
│  ├── Blog                                                                   │
│  ├── Event Page                                                             │
│  ├── Resume/CV                                                              │
│  ├── Restaurant                                                             │
│  └── Fitness App                                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Frontend Architecture

### 4.1 Component Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND COMPONENT TREE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

frontend/
├── components/
│   └── universal-chat/
│       ├── CanvasMode.tsx              # Main Canvas Component
│       │   ├── CanvasChatPanel.tsx     # Left: AI Chat + Templates
│       │   ├── CanvasFileTree.tsx      # Center: File/Folder View
│       │   ├── CanvasPreview.tsx       # Right: Live Preview
│       │   ├── CanvasToolbar.tsx       # Top: Actions Bar
│       │   └── CanvasUploader.tsx      # File Upload Component
│       │
│       ├── ChatRightPanel.tsx          # Canvas Trigger Button
│       └── ... other chat components
│
├── hooks/
│   ├── useCanvasGenerate.ts            # AI generation hook
│   ├── useCanvasFiles.ts               # File management hook
│   └── useCanvasUpload.ts              # S3 upload hook
│
├── services/
│   └── canvasService.ts                # Canvas API calls
│
└── types/
    └── canvas.ts                       # TypeScript interfaces
```

### 4.2 Component Details

```tsx
// CanvasMode.tsx - Main Layout
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER TOOLBAR                                                              │
│  [Project Name] [View: Preview | Files] [Download ▼] [Share] [Close X]     │
├─────────────┬───────────────────────────┬───────────────────────────────────┤
│             │                           │                                   │
│   AI CHAT   │      FILE TREE            │         PREVIEW                   │
│   PANEL     │      (Read Only)          │         WINDOW                    │
│             │                           │                                   │
│  [Templates]│  📁 project/              │    ┌─────────────────────────┐   │
│             │  ├── 📄 index.html        │    │                         │   │
│  Chat       │  ├── 📄 styles.css        │    │    Generated            │   │
│  Messages   │  ├── 📄 script.js         │    │    Website              │   │
│             │  └── 📁 assets/           │    │    Preview              │   │
│             │      └── 🖼️ logo.png      │    │                         │   │
│  [Upload]   │                           │    └─────────────────────────┘   │
│             │                           │                                   │
│  ┌────────┐ │                           │    [Desktop] [Tablet] [Mobile]   │
│  │ Input  │ │                           │                                   │
│  └────────┘ │                           │                                   │
│  [Send 🚀] │                           │                                   │
├─────────────┴───────────────────────────┴───────────────────────────────────┤
│  STATUS BAR: Ready | Files: 3 | Last updated: 2 min ago                     │
└─────────────────────────────────────────────────────────────────────────────┘

Width Ratios: Chat 25% | FileTree 25% (collapsible) | Preview 50%
```

### 4.3 State Management

```typescript
// Canvas State Interface
interface CanvasState {
  // Session
  sessionId: string;
  userId: string;
  agentId: string;
  
  // UI State
  isOpen: boolean;
  activePanel: 'chat' | 'files' | 'preview';
  isFileTreeCollapsed: boolean;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  
  // Chat State
  messages: ChatMessage[];
  isGenerating: boolean;
  showTemplates: boolean;
  selectedCategory: string;
  
  // Files State
  files: CanvasFile[];
  selectedFile: string | null;
  uploadProgress: number;
  
  // Generated Content
  generatedCode: string;
  projectName: string;
  lastUpdated: Date;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
}

interface CanvasFile {
  id: string;
  name: string;
  path: string;
  type: 'html' | 'css' | 'js' | 'image' | 'other';
  size: number;
  content?: string;        // For code files
  s3Url?: string;          // For uploaded files
  isGenerated: boolean;    // AI generated vs uploaded
  createdAt: Date;
}

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}
```

---

## 5. Backend API Endpoints

### 5.1 API Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CANVAS API ENDPOINTS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🤖 AI GENERATION                                                           │
│  POST   /api/canvas/generate          Generate code from prompt             │
│  POST   /api/canvas/iterate           Modify existing code                  │
│  POST   /api/canvas/stream            Stream generation (SSE)               │
│                                                                             │
│  📁 PROJECT MANAGEMENT                                                      │
│  POST   /api/canvas/project           Create new project                    │
│  GET    /api/canvas/project/:id       Get project details                   │
│  GET    /api/canvas/projects          List user's projects                  │
│  DELETE /api/canvas/project/:id       Delete project                        │
│                                                                             │
│  📄 FILE MANAGEMENT                                                         │
│  GET    /api/canvas/files/:projectId  Get project files                     │
│  GET    /api/canvas/file/:fileId      Get file content                      │
│  POST   /api/canvas/file              Save generated file                   │
│                                                                             │
│  📤 UPLOAD                                                                  │
│  POST   /api/canvas/upload/url        Get S3 presigned URL                  │
│  POST   /api/canvas/upload/confirm    Confirm upload completion             │
│                                                                             │
│  📥 DOWNLOAD                                                                │
│  GET    /api/canvas/download/:fileId  Download single file                  │
│  GET    /api/canvas/download/zip/:id  Download project as ZIP              │
│                                                                             │
│  💬 CHAT HISTORY                                                            │
│  GET    /api/canvas/history/:id       Get canvas chat history               │
│  POST   /api/canvas/history           Save chat message                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 API Request/Response Examples

```typescript
// POST /api/canvas/generate
// Request
{
  "userId": "user_123",
  "agentId": "comedy-king",
  "projectId": "proj_456",      // Optional, creates new if not provided
  "prompt": "Create a modern SaaS landing page with hero section...",
  "template": "t1",             // Optional template ID
  "attachments": [              // Optional uploaded files
    {
      "id": "file_789",
      "name": "logo.png",
      "url": "https://s3.../logo.png"
    }
  ],
  "previousCode": "...",        // For iterations
  "provider": "Anthropic",
  "modelId": "claude-3-5-sonnet"
}

// Response
{
  "success": true,
  "projectId": "proj_456",
  "files": [
    {
      "id": "file_001",
      "name": "index.html",
      "path": "/index.html",
      "type": "html",
      "content": "<!DOCTYPE html>...",
      "size": 4523
    },
    {
      "id": "file_002",
      "name": "styles.css",
      "path": "/styles.css",
      "type": "css",
      "content": "/* Generated styles */...",
      "size": 1234
    }
  ],
  "message": "Generated SaaS landing page with 2 files",
  "tokensUsed": 2500
}
```

```typescript
// POST /api/canvas/upload/url
// Request
{
  "userId": "user_123",
  "projectId": "proj_456",
  "fileName": "my-logo.png",
  "fileType": "image/png",
  "fileSize": 45678
}

// Response
{
  "success": true,
  "uploadUrl": "https://s3.amazonaws.com/bucket/...?signature=...",
  "fileId": "file_789",
  "expiresIn": 300
}
```

---

## 6. Database Schema (MongoDB)

### 6.1 Collections Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONGODB COLLECTIONS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📦 canvasProjects        - User's canvas projects                          │
│  📄 canvasFiles           - Generated and uploaded files                    │
│  💬 canvasMessages        - Chat history per project                        │
│  📊 canvasUsage           - Usage tracking for billing                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Schema Definitions

```javascript
// canvasProjects Collection
{
  _id: ObjectId,
  userId: ObjectId,                    // Reference to users collection
  agentId: String,                     // Which agent was used
  
  name: String,                        // Project name
  description: String,                 // Optional description
  templateId: String,                  // If created from template
  
  // Generated content
  mainCode: String,                    // Primary HTML/code
  files: [ObjectId],                   // Reference to canvasFiles
  
  // Metadata
  status: String,                      // 'active' | 'archived' | 'deleted'
  totalGenerations: Number,            // How many times AI was called
  totalTokensUsed: Number,             // For usage tracking
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastGeneratedAt: Date
}

// Index
db.canvasProjects.createIndex({ userId: 1, status: 1 })
db.canvasProjects.createIndex({ userId: 1, createdAt: -1 })
```

```javascript
// canvasFiles Collection
{
  _id: ObjectId,
  projectId: ObjectId,                 // Reference to canvasProjects
  userId: ObjectId,                    // For permission check
  
  name: String,                        // File name (e.g., "index.html")
  path: String,                        // Full path (e.g., "/src/index.html")
  type: String,                        // 'html' | 'css' | 'js' | 'image' | etc
  mimeType: String,                    // MIME type
  
  // Content (for code files)
  content: String,                     // Actual code content
  
  // S3 Reference (for uploaded files)
  s3Key: String,                       // S3 object key
  s3Url: String,                       // Full S3 URL
  
  // Metadata
  size: Number,                        // File size in bytes
  isGenerated: Boolean,                // true = AI generated, false = uploaded
  version: Number,                     // Version number for iterations
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.canvasFiles.createIndex({ projectId: 1 })
db.canvasFiles.createIndex({ userId: 1, type: 1 })
```

```javascript
// canvasMessages Collection
{
  _id: ObjectId,
  projectId: ObjectId,                 // Reference to canvasProjects
  userId: ObjectId,
  
  role: String,                        // 'user' | 'assistant'
  content: String,                     // Message text
  
  // Attachments (for user uploads)
  attachments: [{
    fileId: ObjectId,
    name: String,
    type: String,
    url: String
  }],
  
  // AI Response metadata
  tokensUsed: Number,                  // For AI responses
  modelUsed: String,                   // Which AI model
  generationTime: Number,              // ms taken
  
  timestamp: Date
}

// Index
db.canvasMessages.createIndex({ projectId: 1, timestamp: 1 })
```

```javascript
// canvasUsage Collection (for billing/limits)
{
  _id: ObjectId,
  userId: ObjectId,
  
  // Daily usage
  date: Date,                          // Day (YYYY-MM-DD)
  
  // Counters
  generationsCount: Number,            // API calls made
  tokensUsed: Number,                  // Total tokens
  uploadsCount: Number,                // Files uploaded
  uploadsSizeMB: Number,               // Total upload size
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}

// Index
db.canvasUsage.createIndex({ userId: 1, date: -1 })
```

### 6.3 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE DATA FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  USER REQUEST                      MONGODB                           S3
       │                               │                              │
       │  "Create landing page"        │                              │
       │                               │                              │
       ▼                               ▼                              │
  ┌─────────┐                    ┌───────────┐                        │
  │ Frontend │───── Save ───────▶│ canvas    │                        │
  │         │      Message       │ Messages  │                        │
  └────┬────┘                    └───────────┘                        │
       │                               │                              │
       │  AI generates code            │                              │
       │                               ▼                              │
       │                         ┌───────────┐                        │
       │─────── Create ─────────▶│ canvas    │                        │
       │        Project          │ Projects  │                        │
       │                         └───────────┘                        │
       │                               │                              │
       │                               ▼                              │
       │                         ┌───────────┐                        │
       │─────── Save ───────────▶│ canvas    │                        │
       │        Files            │ Files     │                        │
       │                         └───────────┘                        │
       │                               │                              │
       │  User uploads image           │                              │
       │                               │                              │
       │─────────────────────────────────────── Upload ──────────────▶│
       │                               │                    ┌─────────┴───┐
       │                               │                    │ S3 Bucket   │
       │                         ┌───────────┐              │             │
       │─────── Save ───────────▶│ canvas    │◀── URL ─────│ /canvas/    │
       │        Metadata         │ Files     │              │ {userId}/   │
       │                         └───────────┘              │ {projectId}/│
       │                               │                    │ {fileName}  │
       │                               ▼                    └─────────────┘
       │                         ┌───────────┐
       │─────── Track ──────────▶│ canvas    │
       │        Usage            │ Usage     │
       │                         └───────────┘
```

---

## 7. File Storage (S3)

### 7.1 S3 Bucket Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           S3 BUCKET STRUCTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  onelastai-canvas-files/                                                    │
│  │                                                                          │
│  ├── uploads/                        # User uploaded files                  │
│  │   └── {userId}/                                                          │
│  │       └── {projectId}/                                                   │
│  │           ├── images/                                                    │
│  │           │   ├── logo.png                                               │
│  │           │   └── hero-bg.jpg                                            │
│  │           └── assets/                                                    │
│  │               └── data.json                                              │
│  │                                                                          │
│  ├── generated/                      # AI generated files (backup)          │
│  │   └── {userId}/                                                          │
│  │       └── {projectId}/                                                   │
│  │           └── v{version}/                                                │
│  │               ├── index.html                                             │
│  │               └── styles.css                                             │
│  │                                                                          │
│  └── exports/                        # ZIP downloads (temporary)            │
│      └── {userId}/                                                          │
│          └── {projectId}.zip                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 S3 Configuration

```javascript
// S3 bucket policy for presigned URLs
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::onelastai-canvas-files/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-acl": "private"
        }
      }
    }
  ]
}

// Upload limits
const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024,       // 10MB per file
  maxTotalPerProject: 50 * 1024 * 1024, // 50MB per project
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'application/json',
    'text/plain',
    'text/csv'
  ],
  maxFilesPerProject: 20
};
```

---

## 8. Real-time Communication

### 8.1 Streaming AI Response

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STREAMING GENERATION (SSE)                              │
└─────────────────────────────────────────────────────────────────────────────┘

  CLIENT                              SERVER                           AI API
    │                                    │                                │
    │  POST /api/canvas/stream           │                                │
    │  (Accept: text/event-stream)       │                                │
    │───────────────────────────────────▶│                                │
    │                                    │                                │
    │                                    │  Call AI with stream=true      │
    │                                    │───────────────────────────────▶│
    │                                    │                                │
    │  event: start                      │                                │
    │  data: {"status":"generating"}     │                                │
    │◀───────────────────────────────────│                                │
    │                                    │                                │
    │  event: chunk                      │◀── chunk ─────────────────────│
    │  data: {"code":"<!DOCTYPE..."}     │                                │
    │◀───────────────────────────────────│                                │
    │                                    │                                │
    │  event: chunk                      │◀── chunk ─────────────────────│
    │  data: {"code":"<html>..."}        │                                │
    │◀───────────────────────────────────│                                │
    │                                    │                                │
    │  ... more chunks ...               │                                │
    │                                    │                                │
    │  event: complete                   │                                │
    │  data: {"files":[...],"msg":"..."}│                                │
    │◀───────────────────────────────────│                                │
    │                                    │                                │
    │  Preview updates live!             │                                │
    │                                    │                                │
```

### 8.2 Progress Indicators

```typescript
// Event types for streaming
type StreamEvent = 
  | { type: 'start'; message: string }
  | { type: 'thinking'; message: string }        // "Understanding your request..."
  | { type: 'generating'; message: string }      // "Creating HTML structure..."
  | { type: 'chunk'; code: string }              // Partial code
  | { type: 'styling'; message: string }         // "Adding styles..."
  | { type: 'complete'; files: CanvasFile[] }    // Final result
  | { type: 'error'; error: string };            // Error occurred
```

---

## 9. Security & Permissions

### 9.1 Access Control

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ACCESS CONTROL MATRIX                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Type              │ Canvas Access │ Project Limit │ Storage Limit    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  No Subscription        │ ❌ No         │ 0             │ 0                │
│  Any Agent (Active)     │ ✅ Yes        │ 10 projects   │ 100MB            │
│  Multiple Agents        │ ✅ Yes        │ 25 projects   │ 250MB            │
│  Premium/Pro            │ ✅ Yes        │ Unlimited     │ 1GB              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Security Measures

```typescript
// Security checklist
const SECURITY_MEASURES = {
  // Authentication
  authentication: {
    requireLogin: true,
    sessionValidation: true,
    jwtVerification: true
  },
  
  // Authorization
  authorization: {
    checkSubscription: true,          // Must have active agent subscription
    checkProjectOwnership: true,      // Can only access own projects
    checkUsageLimits: true           // Enforce storage/generation limits
  },
  
  // Input Validation
  inputValidation: {
    sanitizePrompts: true,            // Clean user input
    validateFileTypes: true,          // Only allow safe file types
    limitFileSize: true,              // Enforce size limits
    preventXSS: true                  // Sanitize for preview
  },
  
  // Output Security
  outputSecurity: {
    sandboxPreview: true,             // iframe sandbox attribute
    cspHeaders: true,                 // Content Security Policy
    sanitizeGenerated: true           // Clean AI output
  },
  
  // Rate Limiting
  rateLimiting: {
    generationsPerHour: 20,           // Max AI calls per hour
    uploadsPerHour: 50,               // Max uploads per hour
    requestsPerMinute: 30             // General rate limit
  }
};
```

---

## 10. Implementation Phases

### 10.1 Phase Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      IMPLEMENTATION PHASES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1: Core Foundation (Week 1)                                          │
│  ├── ✅ AI Chat integration (already done)                                  │
│  ├── ✅ 25 Templates (already done)                                         │
│  ├── 🔲 Remove code editor (read-only)                                      │
│  ├── 🔲 Preview panel improvements                                          │
│  └── 🔲 Basic file tree display                                             │
│                                                                             │
│  PHASE 2: File Management (Week 2)                                          │
│  ├── 🔲 File upload to S3                                                   │
│  ├── 🔲 File tree with folders                                              │
│  ├── 🔲 Download single file                                                │
│  ├── 🔲 Download as ZIP                                                     │
│  └── 🔲 MongoDB schemas                                                     │
│                                                                             │
│  PHASE 3: Project Management (Week 3)                                       │
│  ├── 🔲 Save/load projects                                                  │
│  ├── 🔲 Project history                                                     │
│  ├── 🔲 Chat history persistence                                            │
│  └── 🔲 Usage tracking                                                      │
│                                                                             │
│  PHASE 4: Polish & UX (Week 4)                                              │
│  ├── 🔲 Device preview (desktop/tablet/mobile)                              │
│  ├── 🔲 Streaming generation UI                                             │
│  ├── 🔲 Error handling & retry                                              │
│  ├── 🔲 Loading states & animations                                         │
│  └── 🔲 Responsive design                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Detailed Task Breakdown

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PHASE 1: CORE FOUNDATION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Frontend Tasks:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1.1 Remove editable textarea from CanvasMode.tsx                    │   │
│  │ 1.2 Replace with read-only code display (syntax highlighted)        │   │
│  │ 1.3 Add file tree component (left side, collapsible)                │   │
│  │ 1.4 Improve preview panel with device toggle                        │   │
│  │ 1.5 Add download button for generated files                         │   │
│  │ 1.6 Better loading states during generation                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Backend Tasks:                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1.7 Update /api/canvas/generate to return file structure            │   │
│  │ 1.8 Add file parsing (split HTML into files if needed)              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     PHASE 2: FILE MANAGEMENT                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Frontend Tasks:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 2.1 Create CanvasUploader component (drag & drop)                   │   │
│  │ 2.2 Show upload progress indicator                                  │   │
│  │ 2.3 Display uploaded files in file tree                             │   │
│  │ 2.4 Add "Download All as ZIP" button                                │   │
│  │ 2.5 File preview modal (click to view)                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Backend Tasks:                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 2.6 Create canvasFiles collection in MongoDB                        │   │
│  │ 2.7 Create canvasProjects collection                                │   │
│  │ 2.8 Implement POST /api/canvas/upload/url (S3 presigned)            │   │
│  │ 2.9 Implement POST /api/canvas/upload/confirm                       │   │
│  │ 2.10 Implement GET /api/canvas/download/zip/:id                     │   │
│  │ 2.11 Configure S3 bucket and IAM                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    PHASE 3: PROJECT MANAGEMENT                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Frontend Tasks:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 3.1 Project name input/edit                                         │   │
│  │ 3.2 Projects list sidebar (recent projects)                         │   │
│  │ 3.3 Load existing project                                           │   │
│  │ 3.4 New project button                                              │   │
│  │ 3.5 Delete project confirmation                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Backend Tasks:                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 3.6 Implement POST /api/canvas/project                              │   │
│  │ 3.7 Implement GET /api/canvas/projects (list)                       │   │
│  │ 3.8 Implement GET /api/canvas/project/:id                           │   │
│  │ 3.9 Implement DELETE /api/canvas/project/:id                        │   │
│  │ 3.10 Create canvasMessages collection                               │   │
│  │ 3.11 Implement chat history save/load                               │   │
│  │ 3.12 Create canvasUsage collection                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                      PHASE 4: POLISH & UX                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Frontend Tasks:                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 4.1 Device preview toggle (desktop/tablet/mobile frames)            │   │
│  │ 4.2 Streaming generation with live code update                      │   │
│  │ 4.3 Smooth animations for panel transitions                         │   │
│  │ 4.4 Error boundary with retry option                                │   │
│  │ 4.5 Empty states and onboarding hints                               │   │
│  │ 4.6 Keyboard shortcuts (Ctrl+Enter to send, etc.)                   │   │
│  │ 4.7 Mobile responsive layout                                        │   │
│  │ 4.8 Dark/Light theme sync                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Backend Tasks:                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 4.9 Implement SSE streaming for generation                          │   │
│  │ 4.10 Add rate limiting middleware                                   │   │
│  │ 4.11 Add usage limit checks                                         │   │
│  │ 4.12 Error logging and monitoring                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. UI Mockup

### 11.1 Final Canvas Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║ 🎨 Canvas                     My Landing Page        [↓] [Share] [X]  ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║                                                                       ║  │
│  ║  ┌──────────────┐ ┌─────────────────┐ ┌─────────────────────────────┐║  │
│  ║  │ 🤖 AI Chat   │ │ 📁 Files        │ │ 👁️ Preview                  │║  │
│  ║  │              │ │                 │ │                             │║  │
│  ║  │ ┌──────────┐ │ │ 📁 project/     │ │ ┌─────────────────────────┐│║  │
│  ║  │ │🎨 Browse │ │ │ ├── 📄 index   │ │ │                         ││║  │
│  ║  │ │Templates │ │ │ ├── 📄 styles  │ │ │    ┌─────────────┐      ││║  │
│  ║  │ └──────────┘ │ │ ├── 📄 script  │ │ │    │  HERO       │      ││║  │
│  ║  │              │ │ └── 📁 assets/ │ │ │    │  SECTION    │      ││║  │
│  ║  │ ┌──────────┐ │ │     └── 🖼️ img │ │ │    └─────────────┘      ││║  │
│  ║  │ │ Welcome! │ │ │                 │ │ │                         ││║  │
│  ║  │ │ I can    │ │ │                 │ │ │    ┌───┐ ┌───┐ ┌───┐   ││║  │
│  ║  │ │ help...  │ │ │                 │ │ │    │ F │ │ E │ │ A │   ││║  │
│  ║  │ └──────────┘ │ │                 │ │ │    │ 1 │ │ 2 │ │ 3 │   ││║  │
│  ║  │              │ │                 │ │ │    └───┘ └───┘ └───┘   ││║  │
│  ║  │ ┌──────────┐ │ │ ─────────────── │ │ │                         ││║  │
│  ║  │ │ Create a │ │ │ 📤 Uploaded     │ │ │    [  Get Started  ]    ││║  │
│  ║  │ │ landing  │◀│ │ └── 🖼️ logo.png│ │ │                         ││║  │
│  ║  │ │ page...  │ │ │                 │ │ └─────────────────────────┘│║  │
│  ║  │ └──────────┘ │ │                 │ │                             │║  │
│  ║  │       ▲      │ │                 │ │ [💻 Desktop] [📱] [📋]      │║  │
│  ║  │       │      │ │                 │ │                             │║  │
│  ║  │ ┌──────────┐ │ │                 │ │                             │║  │
│  ║  │ │✨ Done!  │ │ │                 │ │                             │║  │
│  ║  │ │I've made │ │ │                 │ │                             │║  │
│  ║  │ │your page │ │ │                 │ │                             │║  │
│  ║  │ └──────────┘ │ │                 │ │                             │║  │
│  ║  │              │ │                 │ │                             │║  │
│  ║  │ ┌──────────┐ │ └─────────────────┘ └─────────────────────────────┘║  │
│  ║  │ │ 📎 │     │ │                                                    ║  │
│  ║  │ │Upload    │ │                                                    ║  │
│  ║  │ └──────────┘ │                                                    ║  │
│  ║  │ ┌──────────────────────────────┐                                  ║  │
│  ║  │ │ Describe what you want...    │                                  ║  │
│  ║  │ │                          [➤] │                                  ║  │
│  ║  │ └──────────────────────────────┘                                  ║  │
│  ║  └──────────────┘                                                    ║  │
│  ║                                                                       ║  │
│  ╠═══════════════════════════════════════════════════════════════════════╣  │
│  ║ Ready │ Files: 4 │ Last: 2m ago │ [📥 Download All]                   ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Questions for Discussion

Before implementation, please confirm:

### 12.1 Feature Confirmation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      QUESTIONS TO CONFIRM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. FILE VIEWING                                                            │
│     When user clicks a file in tree, should we:                             │
│     □ Show in modal popup?                                                  │
│     □ Show in right panel (replace preview)?                                │
│     □ Show in collapsible bottom panel?                                     │
│                                                                             │
│  2. MULTIPLE FILES GENERATION                                               │
│     Should AI generate:                                                     │
│     □ Single HTML file (all in one)?                                        │
│     □ Separate files (index.html, styles.css, script.js)?                   │
│     □ User choice via settings?                                             │
│                                                                             │
│  3. PROJECT PERSISTENCE                                                     │
│     Should projects be saved:                                               │
│     □ Automatically after each generation?                                  │
│     □ Only when user clicks "Save"?                                         │
│     □ Both (auto-save + manual save)?                                       │
│                                                                             │
│  4. IMAGE UPLOAD PURPOSE                                                    │
│     When user uploads image:                                                │
│     □ AI uses it in generated design?                                       │
│     □ Just stored in assets folder?                                         │
│     □ Both (AI reference + storage)?                                        │
│                                                                             │
│  5. CHAT HISTORY                                                            │
│     Should chat history:                                                    │
│     □ Persist per project (load when reopening)?                            │
│     □ Reset each session?                                                   │
│     □ Be exportable?                                                        │
│                                                                             │
│  6. USAGE LIMITS                                                            │
│     What limits should apply:                                               │
│     □ Generations per day: ___                                              │
│     □ Storage per user: ___                                                 │
│     □ Files per project: ___                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Summary

This document outlines the complete technical specification for the Universal Chat Canvas feature:

| Aspect | Description |
|--------|-------------|
| **Purpose** | AI-driven design tool inside every agent chat |
| **User Role** | Request only, no direct editing |
| **AI Role** | Generate all code/designs |
| **Storage** | MongoDB (data) + S3 (files) |
| **Access** | Users with active agent subscription |
| **Templates** | 25 pre-built across 5 categories |

**Next Steps:**
1. Review this document
2. Discuss any changes/additions
3. Confirm answers to Section 12 questions
4. Begin Phase 1 implementation

---

*Document created for onelastai.co Canvas feature development*
