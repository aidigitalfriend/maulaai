import { Node, Edge } from '@xyflow/react'

// =====================
// Canvas Types
// =====================

export type NodeType = 'code' | 'preview' | 'agent' | 'file' | 'folder' | 'note' | 'image'

export interface CanvasNodeData extends Record<string, unknown> {
  type: NodeType
  title: string
  content?: string
  language?: string
  isExpanded?: boolean
  width?: number
  height?: number
  metadata?: Record<string, unknown>
}

export type CanvasNode = Node<CanvasNodeData>
export type CanvasEdge = Edge

export interface CanvasState {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  selectedNodeIds: string[]
  viewport: { x: number; y: number; zoom: number }
  history: CanvasHistoryEntry[]
  historyIndex: number
}

export interface CanvasHistoryEntry {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  timestamp: number
}

// =====================
// File System Types
// =====================

export type FileType = 'file' | 'folder'

export interface FileNode {
  id: string
  name: string
  type: FileType
  content?: string
  language?: string
  children?: FileNode[]
  parentId: string | null
  isOpen?: boolean
  createdAt: number
  updatedAt: number
}

export interface FileSystemState {
  root: FileNode
  activeFileId: string | null
  openFileIds: string[]
  expandedFolderIds: string[]
}

// =====================
// Agent Types
// =====================

export type ModelProvider = 'OpenAI' | 'Anthropic' | 'Google' | 'Groq' | 'Mistral' | 'xAI'

export interface ModelOption {
  id: string
  name: string
  provider: ModelProvider
  description: string
  icon: string
  isThinking?: boolean
  maxTokens?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  isStreaming?: boolean
  codeBlocks?: {
    language: string
    code: string
    filename?: string
  }[]
  metadata?: {
    model?: string
    tokensUsed?: number
    generationTime?: number
  }
}

export interface AgentSession {
  id: string
  name: string
  messages: ChatMessage[]
  model: ModelOption
  context?: string
  createdAt: number
  updatedAt: number
}

export interface AgentState {
  sessions: AgentSession[]
  activeSessionId: string | null
  isGenerating: boolean
  streamingContent: string
  error: string | null
}

// =====================
// UI Types
// =====================

export type SidebarPanel = 'files' | 'components' | 'templates' | 'agent' | 'settings' | null

export type ViewMode = 'canvas' | 'split' | 'code' | 'preview'

export interface UIState {
  sidebarPanel: SidebarPanel
  viewMode: ViewMode
  isToolbarExpanded: boolean
  isMiniMapVisible: boolean
  isDevToolsOpen: boolean
  theme: 'dark' | 'light'
}

// =====================
// Project Types
// =====================

export interface Project {
  id: string
  name: string
  description?: string
  canvas: CanvasState
  files: FileSystemState
  agents: AgentState
  settings: ProjectSettings
  createdAt: number
  updatedAt: number
}

export interface ProjectSettings {
  defaultModel: string
  autoSave: boolean
  livePreview: boolean
  gridSnap: boolean
  gridSize: number
}

// =====================
// API Types
// =====================

export interface GenerateRequest {
  prompt: string
  model: string
  provider: ModelProvider
  currentCode?: string
  context?: string
  stream?: boolean
}

export interface GenerateResponse {
  success: boolean
  code?: string
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface StreamChunk {
  type: 'text' | 'code' | 'done' | 'error'
  content: string
}

// =====================
// Template Types
// =====================

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  category: TemplateCategory
  prompt: string
  preview?: string
}

export type TemplateCategory = 
  | 'landing'
  | 'dashboard'
  | 'ecommerce'
  | 'portfolio'
  | 'blog'
  | 'admin'
  | 'mobile'
  | 'components'

// =====================
// Component Library Types
// =====================

export interface ComponentItem {
  id: string
  name: string
  description: string
  icon: string
  category: ComponentCategory
  code: string
  preview?: string
}

export type ComponentCategory = 
  | 'layout'
  | 'navigation'
  | 'forms'
  | 'display'
  | 'feedback'
  | 'data'
  | 'charts'
  | 'media'
