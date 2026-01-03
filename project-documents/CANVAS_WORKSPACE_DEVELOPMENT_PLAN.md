# 🎨 Canvas Workspace Development Plan

## Executive Summary

Transform the current Canvas page from a template/design frame into a **fully functional, real-time, interactive canvas workspace** similar to professional tools like Figma, Miro, Excalidraw, or v0.dev.

---

## 📊 Current State Analysis

### Existing Canvas App

- **Location**: `/canvas-app/` (standalone Vite app) and `/frontend/app/canvas-app/page.tsx` (Next.js page)
- **Features**:
  - AI code generation via Gemini/OpenAI/Anthropic
  - Preview/Code view toggle
  - Chat-based interaction
  - Template presets
  - History management
- **Limitations**:
  - Single HTML output only
  - No real-time collaboration
  - No file/folder system
  - No visual workspace
  - Limited interactivity

---

## 🎯 Target Features

### 1. **Real-Time Visual Workspace**

- Infinite canvas with pan/zoom
- Drag-and-drop components
- Visual node connections
- Multi-select and group operations
- Undo/redo stack
- Layer management

### 2. **AI Agent Integration**

- Real-time code generation streaming
- Multi-model support (Claude, GPT-4, Gemini, etc.)
- Conversational UI improvements
- Context-aware suggestions
- Code explanation and debugging

### 3. **File & Folder System**

- Virtual file system in canvas
- Create/edit/delete files and folders
- File tree explorer
- Syntax highlighting for all languages
- Multi-file project support
- Export as ZIP

### 4. **Real-Time Capabilities**

- WebSocket connections for live updates
- Streaming code generation
- Live preview updates
- Collaborative editing (future)
- Auto-save functionality

### 5. **Visual Components Library**

- Pre-built UI components
- Drag-and-drop from sidebar
- Custom component creation
- Template gallery
- Theme customization

### 6. **Developer Tools Integration**

- Integrated terminal
- Console output
- Network inspector
- Performance metrics
- Error highlighting

---

## 🏗️ Technical Architecture

### Frontend Stack

```
- React 18+ with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Flow for canvas nodes
- Monaco Editor for code editing
- Socket.io-client for real-time
- Framer Motion for animations
```

### Backend API Extensions

```
- WebSocket server for real-time
- File system APIs
- Enhanced canvas generation endpoints
- Streaming response support
```

### Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@xyflow/react": "^12.0.0", // Canvas flow system
    "@monaco-editor/react": "^4.6.0", // Code editor
    "zustand": "^4.5.0", // State management
    "socket.io-client": "^4.7.0", // Real-time
    "framer-motion": "^11.0.0", // Animations
    "lucide-react": "^0.400.0", // Icons
    "jszip": "^3.10.0", // File export
    "prettier": "^3.3.0", // Code formatting
    "@codesandbox/sandpack-react": "^2.0.0" // Live preview
  }
}
```

---

## 📁 Folder Structure

```
canvas-workspace-dev/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   ├── canvas.ts
│   │   ├── files.ts
│   │   ├── agents.ts
│   │   └── index.ts
│   ├── store/
│   │   ├── canvasStore.ts
│   │   ├── fileStore.ts
│   │   ├── agentStore.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── Canvas.tsx
│   │   │   ├── CanvasNode.tsx
│   │   │   ├── CodeNode.tsx
│   │   │   ├── PreviewNode.tsx
│   │   │   ├── AgentNode.tsx
│   │   │   └── ConnectionLine.tsx
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FileExplorer.tsx
│   │   │   ├── ComponentLibrary.tsx
│   │   │   ├── TemplateGallery.tsx
│   │   │   └── AgentPanel.tsx
│   │   ├── Editor/
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── EditorTabs.tsx
│   │   │   └── FileTab.tsx
│   │   ├── Preview/
│   │   │   ├── LivePreview.tsx
│   │   │   ├── PreviewControls.tsx
│   │   │   └── DevTools.tsx
│   │   ├── Toolbar/
│   │   │   ├── Toolbar.tsx
│   │   │   ├── ZoomControls.tsx
│   │   │   ├── ViewToggle.tsx
│   │   │   └── ExportMenu.tsx
│   │   ├── Agent/
│   │   │   ├── AgentChat.tsx
│   │   │   ├── AgentSelector.tsx
│   │   │   ├── StreamingMessage.tsx
│   │   │   └── QuickActions.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Dropdown.tsx
│   │       └── Tooltip.tsx
│   ├── hooks/
│   │   ├── useCanvas.ts
│   │   ├── useFileSystem.ts
│   │   ├── useAgent.ts
│   │   ├── useWebSocket.ts
│   │   └── useKeyboard.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   ├── fileSystem.ts
│   │   └── agentService.ts
│   ├── utils/
│   │   ├── codeFormatter.ts
│   │   ├── fileUtils.ts
│   │   └── canvasUtils.ts
│   └── styles/
│       └── globals.css
└── public/
    └── assets/
```

---

## 🚀 Development Phases

### Phase 1: Foundation (Week 1)

- [ ] Set up development environment
- [ ] Install core dependencies
- [ ] Create basic canvas with pan/zoom
- [ ] Implement state management
- [ ] Build basic node system

### Phase 2: File System (Week 2)

- [ ] Virtual file tree structure
- [ ] File creation/editing/deletion
- [ ] Folder management
- [ ] Monaco editor integration
- [ ] Syntax highlighting

### Phase 3: AI Integration (Week 3)

- [ ] Agent selection UI
- [ ] Streaming code generation
- [ ] Context management
- [ ] Quick actions
- [ ] Chat history

### Phase 4: Visual Workspace (Week 4)

- [ ] Component library sidebar
- [ ] Drag-and-drop nodes
- [ ] Node connections
- [ ] Multi-file preview
- [ ] Export functionality

### Phase 5: Polish & Deploy (Week 5)

- [ ] Performance optimization
- [ ] Error handling
- [ ] Responsive design
- [ ] Testing
- [ ] Production deployment

---

## 🔌 API Endpoints Required

### Canvas API

```
POST /api/canvas/generate      - Generate code (streaming)
POST /api/canvas/stream        - Streaming generation
POST /api/canvas/session       - Manage sessions
GET  /api/canvas/templates     - Get templates
POST /api/canvas/export        - Export project
```

### File System API (New)

```
POST /api/canvas/files/create     - Create file
PUT  /api/canvas/files/update     - Update file
DELETE /api/canvas/files/delete   - Delete file
POST /api/canvas/folders/create   - Create folder
GET  /api/canvas/project/load     - Load project
POST /api/canvas/project/save     - Save project
```

### WebSocket Events

```
connection      - Client connects
code:generate   - Start generation
code:stream     - Receive streaming code
code:complete   - Generation complete
file:update     - File changed
canvas:sync     - Sync canvas state
```

---

## 🎨 UI/UX Design Specifications

### Color Palette

- Primary: Indigo (#6366F1)
- Secondary: Purple (#8B5CF6)
- Background: Dark (#0F0F1A, #1A1A2E)
- Surface: Gray (#1E1E2E, #252536)
- Text: White (#FFFFFF), Gray (#9CA3AF)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Error: Red (#EF4444)

### Layout

- Left: Narrow icon toolbar (60px)
- Left-Inner: Collapsible sidebar (280px)
- Center: Main canvas (flexible)
- Right: Optional properties panel (300px)
- Bottom: Optional terminal/console (200px)

---

## 🛠️ Development Commands

```bash
# Start development server
cd canvas-workspace-dev
npm install
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to production
./deploy-canvas.sh
```

---

## ✅ Success Criteria

1. **Functionality**: All features work without errors
2. **Performance**: 60fps canvas interactions
3. **UX**: Smooth, intuitive interface
4. **AI Integration**: Streaming generation works
5. **File System**: Create/edit/export files
6. **Responsive**: Works on desktop/tablet
7. **Production Ready**: Deployed and accessible

---

## 📋 Next Steps

1. **Create** the `canvas-workspace-dev` folder
2. **Install** all dependencies
3. **Build** the core canvas engine
4. **Implement** the file system
5. **Integrate** AI agents
6. **Test** on localhost
7. **Deploy** to production

---

_Document Created: January 3, 2026_
_Project: OneLastAI Canvas Workspace_
