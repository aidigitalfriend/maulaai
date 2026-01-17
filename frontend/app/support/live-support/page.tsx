'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Send,
  Mic,
  Phone,
  MessageCircle,
  HelpCircle,
  Users,
  Mail,
  Facebook,
  Instagram,
  Github,
  X,
  MessageSquare,
  Copy,
  DownloadCloud,
  Loader,
  AlertCircle,
  CheckCircle,
  Zap,
  Clock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// Social Media Icon component
const SocialIcon = ({ icon: Icon, href, label, color }: any) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`p-3 rounded-lg transition-all duration-300 hover:scale-110 ${color}`}
    title={label}
    aria-label={label}
  >
    <Icon size={20} />
  </a>
);

// Support button component
const SupportButton = ({ icon: Icon, label, href, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 rounded-lg bg-neural-800 hover:bg-neural-700 transition-all duration-300 text-white group"
  >
    <Icon
      size={20}
      className="text-brand-400 group-hover:text-accent-400 transition-colors"
    />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subscription?: string;
  issue: string;
  status: 'open' | 'in-progress' | 'escalated' | 'resolved';
  createdAt: Date;
  messages: Message[];
}

const SOCIAL_LINKS = [
  {
    icon: Facebook,
    href: 'https://facebook.com',
    label: 'Facebook',
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    icon: Instagram,
    href: 'https://instagram.com',
    label: 'Instagram',
    color: 'bg-pink-600 hover:bg-pink-700 text-white',
  },
  {
    icon: Github,
    href: 'https://github.com',
    label: 'GitHub',
    color: 'bg-gray-700 hover:bg-gray-800 text-white',
  },
  {
    icon: X,
    href: 'https://twitter.com',
    label: 'X (Twitter)',
    color: 'bg-black hover:bg-gray-900 text-white',
  },
  {
    icon: MessageSquare,
    href: 'https://line.me',
    label: 'LINE',
    color: 'bg-green-500 hover:bg-green-600 text-white',
  },
  {
    icon: MessageCircle,
    href: 'https://telegram.me',
    label: 'Telegram',
    color: 'bg-cyan-500 hover:bg-cyan-600 text-white',
  },
  {
    icon: MessageCircle,
    href: 'https://tiktok.com',
    label: 'TikTok',
    color: 'bg-black hover:bg-gray-900 text-white',
  },
];

export default function LiveSupportPage() {
  const auth = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(
    !auth.state.isAuthenticated
  );
  const [userProfile, setUserProfile] = useState<any>(null);
  const [supportTicket, setSupportTicket] = useState<SupportTicket | null>(
    null
  );
  const [ticketGenerated, setTicketGenerated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch user profile data when authenticated
  useEffect(() => {
    if (auth.state.isAuthenticated && auth.state.user) {
      setShowLoginPrompt(false);
      fetchUserProfile();
      initializeChat();
    } else {
      setShowLoginPrompt(true);
    }
  }, [auth.state.isAuthenticated]);

  const fetchUserProfile = async () => {
    try {
      // Fetch real user profile from backend
      const response = await fetch(`/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${auth.state.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      if (data.success && data.profile) {
        setUserProfile({
          name: data.profile.name || auth.state.user?.name || 'User',
          email: data.profile.email || auth.state.user?.email,
          subscription: 'Pro', // Should come from subscription API
          joinedDate: data.profile.createdAt || auth.state.user?.createdAt,
          supportTickets: 0, // Should query from support tickets collection
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Don't set mock data - leave userProfile as null to show error state
    }
  };

  const initializeChat = () => {
    const userName = auth.state.user?.name || 'lovely';
    const welcomeMessage: Message = {
      id: '0',
      role: 'assistant',
      content: `Hey there, ${userName}! 🌙💕\n\nI'm Luna, your personal support companion here at One Last AI! It's so wonderful to have you here, darling!\n\nI know everything about your account, our amazing agents, billing, and all our platform features. Whether you need help with something or just want to chat about what we offer, I'm here for you, sweetheart! ✨\n\nHow can I make your day better today? 🥰`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;
    if (!auth.state.isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsStreamingResponse(true);

    try {
      const response = await fetch('/api/live-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          userId: auth.state.user?.id,
          userEmail: auth.state.user?.email,
          userName: auth.state.user?.name,
          chatId: chatId,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      let fullResponse = '';
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      // Streaming response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                // Handle context message (includes chatId)
                if (data.type === 'context' && data.chatId) {
                  setChatId(data.chatId);
                  if (data.userContext) {
                    setUserContext(data.userContext);
                  }
                }
                // Handle content chunks
                if (data.content) {
                  fullResponse += data.content;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: fullResponse,
                    };
                    return updated;
                  });
                }
                // Handle done message
                if (data.type === 'done' && data.chatId) {
                  setChatId(data.chatId);
                }
                scrollToBottom();
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

      // Check if response suggests escalation
      if (
        fullResponse.toLowerCase().includes('escalat') ||
        fullResponse.toLowerCase().includes('ticket')
      ) {
        setTicketGenerated(true);
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].isStreaming = false;
        return updated;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content:
          '⚠️ Failed to get response. Please try again or contact support directly.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreamingResponse(false);
    }
  };

  const generateTicket = async () => {
    try {
      const issueDescription = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('\n\n');

      // Send to backend
      const response = await fetch('/api/live-support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          userId: auth.state.user?.id,
          userEmail: auth.state.user?.email,
          userName: userProfile?.name || auth.state.user?.name,
          issue: issueDescription || 'Support request from live chat',
          messages: messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const ticket = data.ticket;
        
        setSupportTicket({
          id: ticket.ticketId,
          userId: auth.state.user?.id || '',
          userEmail: auth.state.user?.email || '',
          userName: userProfile?.name || '',
          subscription: userProfile?.subscription || 'Monthly',
          issue: issueDescription,
          status: 'open',
          createdAt: new Date(),
          messages: messages,
        });

        const ticketMessage: Message = {
          id: Date.now().toString(),
          role: 'system',
          content: `✅ Support ticket created!\n\n📋 Ticket Number: #${ticket.ticketNumber}\n📝 Ticket ID: ${ticket.ticketId}\n📊 Status: ${ticket.status}\n⏰ Expected Response: Within 48 hours\n\nOur human support team will review your case and contact you at ${auth.state.user?.email}. You can also view and track this ticket in your Dashboard > Support Tickets.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, ticketMessage]);
        setTicketGenerated(false);
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (error) {
      console.error('Error generating ticket:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: '⚠️ Failed to create support ticket. Please try again or contact us directly at support@onelastai.com',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const downloadChat = () => {
    const chatContent = messages
      .map(
        (m) =>
          `[${m.role.toUpperCase()}] ${m.timestamp.toLocaleTimeString()}\n${
            m.content
          }`
      )
      .join('\n\n');

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(chatContent)
    );
    element.setAttribute('download', `support-chat-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyChat = () => {
    const chatContent = messages
      .map((m) => `[${m.role.toUpperCase()}] ${m.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(chatContent);
  };

  if (showLoginPrompt && !auth.state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-neural-800 rounded-2xl p-8 border border-neural-700">
            <div className="bg-gradient-to-br from-brand-600 to-accent-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Live Support</h1>
            <p className="text-neural-400 mb-8">
              Please log in to access our real-time AI support agent with
              personalized assistance based on your account.
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <AlertCircle size={18} />
                Sign In Now
              </Link>
              <p className="text-sm text-neural-500">
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="text-brand-400 hover:text-brand-300"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-neural-800/50 backdrop-blur border-b border-neural-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <h1 className="font-bold text-lg">Live Support</h1>
                <p className="text-sm text-neural-400">
                  AI-Powered Support Agent
                </p>
              </div>
            </div>

            {userProfile && (
              <div className="flex items-center gap-2 px-4 py-2 bg-neural-700 rounded-lg">
                <span className="text-sm">
                  <span className="text-neural-400">Account:</span>{' '}
                  {userProfile.name}
                </span>
              </div>
            )}
          </div>

          {/* Messages Container */}
          <div
            ref={messageContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-neural-700 scrollbar-track-neural-800"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-lg lg:max-w-xl px-4 py-3 rounded-xl ${
                    message.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : message.role === 'system'
                      ? 'bg-yellow-900/30 border border-yellow-700/50 text-yellow-200'
                      : 'bg-neural-700 text-neural-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {isStreamingResponse && (
              <div className="flex justify-start">
                <div className="bg-neural-700 rounded-xl rounded-bl-none px-4 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-neural-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neural-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-neural-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-neural-800/50 backdrop-blur border-t border-neural-700 p-6">
            {ticketGenerated && (
              <div className="mb-4 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-blue-400" />
                  <span className="text-sm">
                    Your issue needs escalation. Our team will create a support
                    ticket.
                  </span>
                </div>
                <button
                  onClick={generateTicket}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                >
                  Create Ticket
                </button>
              </div>
            )}

            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your issue or ask a question..."
                disabled={isLoading}
                className="flex-1 bg-neural-700 border border-neural-600 rounded-lg px-4 py-3 text-white placeholder-neural-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="px-4 py-3 bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2 flex-wrap">
              <button
                onClick={downloadChat}
                className="flex items-center gap-2 px-3 py-2 bg-neural-700 hover:bg-neural-600 rounded text-sm transition-colors"
              >
                <DownloadCloud size={16} />
                Download
              </button>
              <button
                onClick={copyChat}
                className="flex items-center gap-2 px-3 py-2 bg-neural-700 hover:bg-neural-600 rounded text-sm transition-colors"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-neural-800 border-l border-neural-700 p-6 overflow-y-auto hidden lg:block">
          {/* User Profile Section */}
          {userProfile && (
            <div className="mb-8 p-4 bg-neural-700 rounded-lg border border-neural-600">
              <h3 className="font-bold mb-3 text-sm uppercase text-neural-300">
                Your Profile
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-neural-400">Name:</span>
                  <p className="text-white font-medium">{userProfile.name}</p>
                </div>
                <div>
                  <span className="text-neural-400">Email:</span>
                  <p className="text-white font-medium">{userProfile.email}</p>
                </div>
                <div>
                  <span className="text-neural-400">Plan:</span>
                  <p className="text-white font-medium flex items-center gap-2">
                    <Zap size={16} className="text-yellow-400" />
                    {userProfile.subscription}
                  </p>
                </div>
                <div>
                  <span className="text-neural-400">Member Since:</span>
                  <p className="text-white font-medium">
                    {new Date(userProfile.joinedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Support Ticket Info */}
          {supportTicket && (
            <div className="mb-8 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-green-400" />
                <h3 className="font-bold text-sm uppercase">
                  Ticket Generated
                </h3>
              </div>
              <p className="text-sm text-green-200 mb-2">Ticket ID:</p>
              <p className="font-mono text-xs bg-black/30 p-2 rounded mb-3 break-all">
                {supportTicket.id}
              </p>
              <p className="text-xs text-green-300 mb-3">
                Our human support team will contact you within 48 hours.
              </p>
              <Link
                href="/dashboard/support-tickets"
                className="block w-full text-center px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
              >
                View My Tickets
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="font-bold mb-3 text-sm uppercase text-neural-300">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <SupportButton
                icon={Mail}
                label="Contact Us"
                href="/support/contact-us"
                onClick={() => (window.location.href = '/support/contact-us')}
              />
              <SupportButton
                icon={HelpCircle}
                label="Help Center"
                href="/support/help-center"
                onClick={() => (window.location.href = '/support/help-center')}
              />
              <SupportButton
                icon={MessageCircle}
                label="Support Page"
                href="/support"
                onClick={() => (window.location.href = '/support')}
              />
              <SupportButton
                icon={Users}
                label="Community"
                href="/community"
                onClick={() => (window.location.href = '/community')}
              />
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold mb-3 text-sm uppercase text-neural-300">
              Follow Us
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {SOCIAL_LINKS.map((social) => (
                <SocialIcon
                  key={social.label}
                  icon={social.icon}
                  href={social.href}
                  label={social.label}
                  color={social.color}
                />
              ))}
            </div>
          </div>

          {/* Support Hours */}
          <div className="mt-8 p-4 bg-neural-700 rounded-lg border border-neural-600">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-blue-400" />
              <h3 className="font-bold text-sm">Support Hours</h3>
            </div>
            <p className="text-xs text-neural-400">
              24/7 AI Support • Human team Monday-Friday, 9AM-6PM EST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
