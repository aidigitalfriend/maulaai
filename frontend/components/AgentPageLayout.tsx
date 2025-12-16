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
      <div className="h-[calc(100vh-64px)] flex gap-0 lg:gap-6 p-0 lg:p-6 overflow-hidden relative">
        {/* Desktop Hamburger Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-20 left-4 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg shadow-lg transition-all"
          aria-label="Toggle chat history"
        >
          <svg
            className="w-5 h-5"
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

        {/* Left Panel - Slide in/out */}
        <div className={`
          fixed lg:fixed top-0 left-0 bottom-0 z-40
          w-80 lg:w-1/4 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col h-full overflow-hidden
          pt-24 lg:pt-16
        `}>
          {sidebarContent}
        </div>

        {/* Overlay when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Right Panel (Chat) */}
        <div className={`
          w-full h-full flex flex-col
          transition-all duration-300
          ${isSidebarOpen ? 'lg:ml-[25%]' : 'lg:ml-0'}
        `}>
          {children}
        </div>
      </div>
    </div>
  )
}
