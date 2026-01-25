'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export type ChatTheme = 'default' | 'neural';

interface ThemeContextType {
  theme: ChatTheme;
  setTheme: (theme: ChatTheme) => void;
  toggleTheme: () => ChatTheme;
  isNeural: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  agentId: string;
}

export function ThemeProvider({ children, agentId }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ChatTheme>('default');

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem(
      `chat-theme-${agentId}`
    ) as ChatTheme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, [agentId]);

  // Update theme and persist to localStorage
  const setTheme = useCallback(
    (newTheme: ChatTheme) => {
      setThemeState(newTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`chat-theme-${agentId}`, newTheme);
      }
    },
    [agentId]
  );

  // Toggle between themes
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'default' ? 'neural' : 'default';
    setTheme(newTheme);
    return newTheme;
  }, [theme, setTheme]);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isNeural: theme === 'neural',
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useChatTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fallback for components not wrapped in provider (backward compatibility)
    return {
      theme: 'default' as ChatTheme,
      setTheme: () => {},
      toggleTheme: () => 'default' as ChatTheme,
      isNeural: false,
    };
  }
  return context;
}

// Legacy hook for backward compatibility (accepts agentId but ignores it when context exists)
export function useChatThemeWithAgent(agentId: string) {
  const context = useContext(ThemeContext);

  // Always call hooks at the top level
  const [theme, setThemeState] = useState<ChatTheme>('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem(
      `chat-theme-${agentId}`
    ) as ChatTheme;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, [agentId]);

  const setTheme = useCallback(
    (newTheme: ChatTheme) => {
      setThemeState(newTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`chat-theme-${agentId}`, newTheme);
      }
    },
    [agentId]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'default' ? 'neural' : 'default';
    setTheme(newTheme);
    return newTheme;
  }, [theme, setTheme]);

  // If we're inside a provider, use it instead of the fallback
  if (context !== undefined) {
    return context;
  }

  // Fallback: standalone usage (not recommended but maintains backward compatibility)
  return { theme, setTheme, toggleTheme, isNeural: theme === 'neural' };
}
