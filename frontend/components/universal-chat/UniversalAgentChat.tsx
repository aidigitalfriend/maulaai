'use client';

/**
 * UniversalAgentChat - Bridge Component
 * 
 * This file bridges the old API (UniversalAgentChat) with the new Neural-Link App.
 * It wraps the new App component and accepts the old AgentChatConfig interface.
 */

import React from 'react';
import App from './App';

// Legacy interface for backwards compatibility
export interface AgentChatConfig {
  agentId?: string;
  agentName?: string;
  systemPrompt?: string;
  provider?: string;
  model?: string;
  theme?: 'dark' | 'light';
  showCanvas?: boolean;
  showHistory?: boolean;
  maxHeight?: string;
  className?: string;
}

interface UniversalAgentChatProps {
  config?: AgentChatConfig;
}

/**
 * UniversalAgentChat Component
 * 
 * Wrapper that accepts the old config format and renders the new Neural-Link App.
 * The new App manages its own state internally.
 */
const UniversalAgentChat: React.FC<UniversalAgentChatProps> = ({ config }) => {
  // The new App component is self-contained with its own state management
  // Config props can be used in the future to customize the App
  
  return (
    <div className={`universal-agent-chat ${config?.className || ''}`} style={{ height: config?.maxHeight || '100vh' }}>
      <App />
    </div>
  );
};

export default UniversalAgentChat;
