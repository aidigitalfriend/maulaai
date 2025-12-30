// Universal Chat - Complete Chatbox Component Library
// This folder contains all the files needed for the professional chat interface

// Main Chat Component
export { default as UniversalAgentChat } from './UniversalAgentChat';
export type { AgentChatConfig } from './UniversalAgentChat';

// Layout Components
export {
  default as EnhancedChatLayout,
  useChatTheme,
} from './EnhancedChatLayout';
export type { ChatTheme } from './EnhancedChatLayout';

// Sub-Components
export { default as ChatSessionSidebar } from './ChatSessionSidebar';
export {
  default as ChatSettingsPanel,
  NEURAL_PRESETS,
} from './ChatSettingsPanel';
export type { AgentSettings } from './ChatSettingsPanel';
export { default as ChatRightPanel } from './ChatRightPanel';
export { default as QuickActionsPanel } from './QuickActionsPanel';
export { default as CanvasMode } from './CanvasMode';

// Services
export { default as realtimeChatService } from './realtimeChatService';
export type {
  ChatMessage,
  CodeBlock,
  ChatSession,
  AgentConfig,
  StreamCallbacks,
} from './realtimeChatService';

// Types & Configs
export type { AIProvider } from './types';
export { PROVIDER_MODEL_OPTIONS } from './aiProviders';
export type { ProviderModelOption } from './aiProviders';
