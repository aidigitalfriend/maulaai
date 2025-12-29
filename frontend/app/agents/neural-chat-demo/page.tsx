'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  PaperClipIcon,
  PhoneIcon,
} from '@heroicons/react/24/solid';
import EnhancedChatLayout from '../../../components/EnhancedChatLayout';
import { AgentSettings } from '../../../components/ChatSettingsPanel';
import QuickActionsPanel from '../../../components/QuickActionsPanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  lastMessage?: string;
  messageCount?: number;
  updatedAt?: Date;
}

const DEMO_RESPONSES = [
  '🧠 **Fascinating question!** Let me analyze this from multiple angles...\n\nBased on my neural processing, I can offer several insights that might be helpful for your situation.',
  "⚡ **I've processed your request.** Here's what I found:\n\n1. First, consider the core problem\n2. Then, evaluate potential solutions\n3. Finally, implement the best approach",
  '🔬 **Excellent observation!** The data suggests several possibilities...\n\n> *"The best way to predict the future is to create it."* - Peter Drucker',
  "💡 **That's a creative approach!** Let me build on that idea...\n\nYour thinking aligns well with modern best practices. Here's how we can enhance it further.",
  '🎯 **Based on my analysis,** I recommend the following:\n\n- Start with a clear plan\n- Execute in small iterations\n- Review and refine continuously',
  "✨ **Great thinking!** Here's an enhanced version of your concept:\n\n```\nStep 1: Define objectives\nStep 2: Gather resources\nStep 3: Execute with precision\n```",
];

export default function NeuralChatDemo() {
  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'demo-1',
      name: 'Welcome Conversation',
      messages: [
        {
          id: 'msg-1',
          role: 'assistant',
          content:
            '👋 **Welcome to the Neural Chat Demo!**\n\nThis showcases the new Neural-Link inspired features:\n\n• **Neural Theme** - Toggle the ✨ icon in the header for cyberpunk mode\n• **Settings Panel** - Click ⚙️ for AI presets & customization\n• **Session Sidebar** - Manage multiple conversations on the left\n• **Quick Actions** - Use shortcuts below for common tasks\n\n---\n\n*Try typing a message below or use Quick Actions!*',
          timestamp: new Date(),
        },
      ],
      lastMessage: 'Welcome to Enhanced Chat!',
      messageCount: 1,
      updatedAt: new Date(),
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>('demo-1');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickActionsCollapsed, setIsQuickActionsCollapsed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings state
  const [settings, setSettings] = useState<AgentSettings>({
    temperature: 0.7,
    maxTokens: 2000,
    mode: 'balanced',
    systemPrompt: '',
    provider: 'openai',
    model: 'gpt-4o',
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  // Handlers
  const handleNewSession = useCallback(() => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      name: `Conversation ${sessions.length + 1}`,
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content:
            '🚀 **New neural channel opened!**\n\nHow can I assist you today? Feel free to ask anything or explore the settings panel for different AI modes.',
          timestamp: new Date(),
        },
      ],
      lastMessage: 'New conversation started',
      messageCount: 1,
      updatedAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  }, [sessions.length]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const handleDeleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (activeSessionId === id && filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeSessionId]
  );

  const handleRenameSession = useCallback((id: string, newName: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  }, []);

  const handleExportSession = useCallback(
    (id: string) => {
      const session = sessions.find((s) => s.id === id);
      if (!session) return;

      let exportText = `Chat Session: ${session.name}\n`;
      exportText += `Exported: ${new Date().toLocaleString()}\n\n`;
      exportText += '='.repeat(60) + '\n\n';

      session.messages.forEach((msg) => {
        const role = msg.role === 'user' ? 'You' : 'Assistant';
        exportText += `[${msg.timestamp.toLocaleString()}] ${role}:\n`;
        exportText += `${msg.content}\n\n`;
      });

      const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.name.replace(
        /[^a-z0-9]/gi,
        '_'
      )}_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [sessions]
  );

  const handleUpdateSettings = useCallback(
    (newSettings: Partial<AgentSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    []
  );

  const handleResetSettings = useCallback(() => {
    setSettings({
      temperature: 0.7,
      maxTokens: 2000,
      mode: 'balanced',
      systemPrompt: '',
      provider: 'openai',
      model: 'gpt-4o',
    });
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !activeSession || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    // Add user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [...s.messages, userMessage],
              lastMessage: inputValue.slice(0, 50),
              messageCount: s.messages.length + 1,
              updatedAt: new Date(),
            }
          : s
      )
    );

    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 1200)
    );

    const responseContent =
      DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
    const modeInfo =
      settings.mode !== 'balanced'
        ? `\n\n---\n*Currently using **${settings.mode}** mode with temperature ${settings.temperature}*`
        : '';

    const assistantMessage: Message = {
      id: `asst-${Date.now()}`,
      role: 'assistant',
      content: `${responseContent}\n\nRegarding your message: *"${inputValue}"*${modeInfo}`,
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [...s.messages, assistantMessage],
              messageCount: s.messages.length + 1,
              updatedAt: new Date(),
            }
          : s
      )
    );

    setIsLoading(false);
  }, [inputValue, activeSession, activeSessionId, isLoading, settings]);

  return (
    <EnhancedChatLayout
      agentId="neural-demo"
      agentName="Neural Assistant"
      agentIcon="🧠"
      sessions={sessions}
      activeSessionId={activeSessionId}
      onNewSession={handleNewSession}
      onSelectSession={handleSelectSession}
      onDeleteSession={handleDeleteSession}
      onRenameSession={handleRenameSession}
      onExportSession={handleExportSession}
      settings={settings}
      onUpdateSettings={handleUpdateSettings}
      onResetSettings={handleResetSettings}
      externalUrl="https://onelastai.co"
    >
      {/* Chat Content */}
      <div className="flex flex-col h-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {activeSession?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                {/* Simple markdown-like rendering */}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content
                    .split('\n')
                    .map((line, i) => {
                      // Bold text
                      let processedLine = line.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong>$1</strong>'
                      );
                      // Italic text
                      processedLine = processedLine.replace(
                        /\*(.*?)\*/g,
                        '<em>$1</em>'
                      );
                      // Code blocks
                      if (line.startsWith('```')) return null;
                      if (line.startsWith('---')) {
                        return <hr key={i} className="my-2 border-gray-300" />;
                      }
                      // Headers
                      if (line.startsWith('## ')) {
                        return (
                          <h3 key={i} className="font-bold text-base mt-2">
                            {line.slice(3)}
                          </h3>
                        );
                      }
                      if (line.startsWith('# ')) {
                        return (
                          <h2 key={i} className="font-bold text-lg mt-2">
                            {line.slice(2)}
                          </h2>
                        );
                      }
                      // Blockquote
                      if (line.startsWith('> ')) {
                        return (
                          <blockquote
                            key={i}
                            className="border-l-4 border-indigo-300 pl-3 italic my-2 text-gray-600"
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: processedLine.slice(2),
                              }}
                            />
                          </blockquote>
                        );
                      }
                      // List items
                      if (line.startsWith('• ') || line.startsWith('- ')) {
                        return (
                          <div key={i} className="flex items-start space-x-2">
                            <span className="text-indigo-500">•</span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: processedLine.slice(2),
                              }}
                            />
                          </div>
                        );
                      }
                      // Numbered list
                      if (/^\d+\.\s/.test(line)) {
                        const num = line.match(/^(\d+)\./)?.[1];
                        return (
                          <div key={i} className="flex items-start space-x-2">
                            <span className="text-indigo-500 font-medium">
                              {num}.
                            </span>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: processedLine.replace(/^\d+\.\s/, ''),
                              }}
                            />
                          </div>
                        );
                      }
                      return (
                        <span
                          key={i}
                          dangerouslySetInnerHTML={{ __html: processedLine }}
                        />
                      );
                    })
                    .filter(Boolean)}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-white/60' : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">Processing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Panel */}
        <QuickActionsPanel
          onSelectAction={(prompt) => {
            setInputValue(prompt);
          }}
          theme="default"
          isCollapsed={isQuickActionsCollapsed}
          onToggleCollapse={() =>
            setIsQuickActionsCollapsed(!isQuickActionsCollapsed)
          }
        />

        {/* Input Area */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Handle file upload - for demo just show filename
                setInputValue(`[File: ${file.name}] `);
              }
            }}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Mic Button (Speech to Text) */}
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2.5 rounded-xl transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Speech to Text"
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>

            {/* File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              title="Upload File"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>

            {/* Voice Call Button */}
            <button
              type="button"
              onClick={() => alert('Voice-to-Voice coming soon!')}
              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              title="Voice Conversation"
            >
              <PhoneIcon className="w-5 h-5" />
            </button>

            {/* Input with embedded send button */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:from-indigo-600 hover:to-purple-700"
              >
                {isLoading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          {/* Current settings preview */}
          <div className="mt-3 flex items-center justify-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span>
                Mode: <strong className="text-gray-700">{settings.mode}</strong>
              </span>
            </span>
            <span>
              Temp:{' '}
              <strong className="text-gray-700">{settings.temperature}</strong>
            </span>
            <span>
              Tokens:{' '}
              <strong className="text-gray-700">{settings.maxTokens}</strong>
            </span>
            <span>
              Provider:{' '}
              <strong className="text-gray-700">{settings.provider}</strong>
            </span>
          </div>
        </div>
      </div>
    </EnhancedChatLayout>
  );
}
