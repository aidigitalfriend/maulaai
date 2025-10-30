'use client'

import { useState, ReactNode } from 'react'
import AgentChatPanel from './AgentChatPanel'
import * as chatStorage from '../utils/chatStorage'

interface AgentPageLayoutProps {
  agentId?: string
  agentName?: string
  sessions?: chatStorage.ChatSession[]
  activeSessionId?: string | null
  onNewChat?: () => void
  onSelectChat?: (sessionId: string) => void
  onDeleteChat?: (sessionId: string) => void
  onRenameChat?: (sessionId: string, newName: string) => void
  children: ReactNode
  leftPanel?: ReactNode  // Optional: for custom left panel
}

export default function AgentPageLayout({
  agentId,
  agentName,
  sessions,
  activeSessionId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  children,
  leftPanel
}: AgentPageLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Use custom leftPanel if provided, otherwise use default AgentChatPanel
  const sidebarContent = leftPanel || (
    agentId && agentName && sessions ? (
      <AgentChatPanel
        chatSessions={sessions}
        activeSessionId={activeSessionId}
        agentId={agentId}
        agentName={agentName}
        onNewChat={() => {
          onNewChat?.()
          setIsSidebarOpen(false)
        }}
        onSelectChat={(sessionId) => {
          onSelectChat?.(sessionId)
          setIsSidebarOpen(false)
        }}
        onDeleteChat={onDeleteChat || (() => {})}
        onRenameChat={onRenameChat || (() => {})}
      />
    ) : null
  )

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Main Content */}
      <div className="h-[85vh] flex gap-0 lg:gap-6 p-2 lg:p-6 overflow-hidden relative">
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-lg shadow-lg transition-all"
          aria-label="Toggle chat history"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isSidebarOpen ? (
              // X icon when sidebar is open
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              // Menu icon when sidebar is closed
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Left Panel - Hidden on mobile by default, shows when toggled */}
        <div className={`
          fixed lg:relative top-0 left-0 bottom-0 z-40
          w-80 lg:w-1/4 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col h-full overflow-hidden
          pt-24 lg:pt-0
        `}>
          {sidebarContent}
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Right Panel (Chat) - Full width on mobile when sidebar is closed */}
        <div className={`
          w-full lg:w-3/4 h-full flex flex-col
          transition-all duration-300
        `}>
          {children}
        </div>
      </div>
    </div>
  )
}
