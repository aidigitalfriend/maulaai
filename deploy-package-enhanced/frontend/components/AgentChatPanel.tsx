// @/frontend/components/AgentChatPanel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

interface ChatSession {
  id: string;
  name: string;
}

interface AgentChatPanelProps {
  chatSessions: ChatSession[];
  activeSessionId: string | null;
  agentId: string;
  agentName: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newName: string) => void;
}

export default function AgentChatPanel({
  chatSessions,
  activeSessionId,
  agentId,
  agentName,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
}: AgentChatPanelProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRenameStart = (session: ChatSession) => {
    setRenamingId(session.id);
    setRenameValue(session.name);
    setOpenMenuId(null);
  };

  const handleRenameConfirm = () => {
    if (renamingId && renameValue.trim()) {
      onRenameChat(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const handleExportChat = (session: ChatSession) => {
    try {
      // Get chat history from localStorage using the correct storage key
      const chatHistories = localStorage.getItem('agentChatHistory_v2');
      
      if (!chatHistories) {
        alert('No chat history found to export.');
        return;
      }

      const histories = JSON.parse(chatHistories);
      const agentHistory = histories[agentId];
      
      if (!agentHistory || !agentHistory.sessions) {
        alert('No chat history found for this agent.');
        return;
      }

      // Access session by ID from the sessions object
      const sessionData = agentHistory.sessions[session.id];
      
      if (!sessionData || !sessionData.messages) {
        alert('No messages found in this chat session.');
        return;
      }

      // Create a formatted text export
      let exportText = `Chat Session: ${session.name}\n`;
      exportText += `Agent: ${agentName}\n`;
      exportText += `Exported: ${new Date().toLocaleString()}\n`;
      exportText += `Total Messages: ${sessionData.messages.length}\n\n`;
      exportText += '='.repeat(60) + '\n\n';
      
      sessionData.messages.forEach((msg: any) => {
        const role = msg.role === 'user' ? 'You' : agentName;
        const timestamp = new Date(msg.timestamp).toLocaleString();
        exportText += `[${timestamp}] ${role}:\n`;
        exportText += `${msg.content}\n`;
        exportText += '-'.repeat(60) + '\n\n';
      });

      exportText += '\n' + '='.repeat(60) + '\n';
      exportText += 'End of Chat Session\n';

      // Create and download file
      const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `${fileName}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Chat exported successfully!');
    } catch (error) {
      console.error('Error exporting chat:', error);
      alert('Failed to export chat. Please try again.');
    }
    
    setOpenMenuId(null);
  };

  const handleShareChat = (session: ChatSession) => {
    // Create a shareable link
    const shareUrl = `${window.location.origin}/agents/${agentId}?session=${session.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
    
    setOpenMenuId(null);
  };

  const handleDeleteChat = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      onDeleteChat(sessionId);
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === sessionId ? null : sessionId);
  };

  return (
    <div className="bg-gray-800 text-white p-4 flex flex-col h-full rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Chat History</h2>
        <button
          onClick={onNewChat}
          className="p-2 rounded-md hover:bg-gray-700"
          title="New Chat"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        <ul>
          {chatSessions.map((session) => (
            <li
              key={session.id}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer mb-2 ${
                session.id === activeSessionId
                  ? "bg-indigo-600"
                  : "hover:bg-gray-700"
              }`}
            >
              {renamingId === session.id ? (
                <div className="flex-grow flex items-center">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={handleRenameConfirm}
                    onKeyDown={(e) => e.key === "Enter" && handleRenameConfirm()}
                    className="bg-gray-700 text-white p-1 rounded-md w-full"
                    autoFocus
                  />
                  <button
                    onClick={handleRenameConfirm}
                    className="p-1 ml-2 text-green-400 hover:text-green-300"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="flex-grow flex items-center min-w-0"
                    onClick={() => onSelectChat(session.id)}
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{session.name}</span>
                  </div>
                  <div className="flex-shrink-0 relative" ref={openMenuId === session.id ? menuRef : null}>
                    <button
                      onClick={(e) => toggleMenu(session.id, e)}
                      className="p-1 hover:bg-gray-600 rounded"
                      title="More options"
                    >
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                    
                    {openMenuId === session.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-gray-700 rounded-lg shadow-xl z-50 py-1 border border-gray-600">
                        <button
                          onClick={() => handleRenameStart(session)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-3"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Edit Name</span>
                        </button>
                        <button
                          onClick={() => handleExportChat(session)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-3"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          <span>Export Chat</span>
                        </button>
                        <button
                          onClick={() => handleShareChat(session)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-3"
                        >
                          <ShareIcon className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                        <div className="border-t border-gray-600 my-1"></div>
                        <button
                          onClick={() => handleDeleteChat(session.id)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-3 text-red-400"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Delete Chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
