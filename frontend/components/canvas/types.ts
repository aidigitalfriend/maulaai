// =============================================================================
// CANVAS TYPES - All TypeScript interfaces in one place
// =============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  isStreaming?: boolean;
}

export interface FileAttachment {
  type: 'image' | 'file';
  content: string;
  name: string;
}

export interface GeneratedFile {
  name: string;
  content: string;
  language: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  icon: string;
  prompt: string;
}

export type ViewMode = 'preview' | 'code';
export type DeviceType = 'desktop' | 'tablet' | 'mobile';
