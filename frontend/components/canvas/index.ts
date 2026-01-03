// Canvas Components - Proper Component Architecture
// Each component is independent and reusable

// Main workspace component
export { default as CanvasWorkspace } from './CanvasWorkspace';

// Individual components
export { default as ActionButton } from './components/ActionButton';
export { default as ChatMessage } from './components/ChatMessage';
export { default as ChatInput } from './components/ChatInput';
export { default as ChatPanel } from './components/ChatPanel';
export { default as TemplateSelector } from './components/TemplateSelector';
export { default as FileItem } from './components/FileItem';
export { default as FileTree } from './components/FileTree';
export { default as ViewToggle } from './components/ViewToggle';
export { default as DeviceToggle } from './components/DeviceToggle';
export { default as Toolbar } from './components/Toolbar';
export { default as StatusBar } from './components/StatusBar';
export { default as PreviewPanel } from './components/PreviewPanel';
export { default as CodeEditor } from './components/CodeEditor';

// Hooks
export { useCanvasState } from './hooks/useCanvasState';

// Types
export * from './types';

// Constants
export * from './constants';

// Utils
export * from './utils';
