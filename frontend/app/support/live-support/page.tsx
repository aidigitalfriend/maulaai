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
    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 text-gray-700 group"
  >
    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
      <Icon size={16} className="text-white" />
    </div>
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

  const fetchUserProfile = useCallback(async () => {
    try {
      const userId = auth.state.user?.id;
      if (!userId) {
        console.error('No user ID available');
        return;
      }

      // Fetch real user profile from backend - cookie auth
      const profileResponse = await fetch(`/api/user/profile`, {
        credentials: 'include',  // Required to send session_id cookie for auth
      });

      // Fetch real subscription data - cookie auth via credentials: include
      console.log('[Live Support] Fetching subscriptions for userId:', userId);
      const subscriptionResponse = await fetch(`/api/subscriptions/${userId}`, {
        credentials: 'include',  // Required to send session_id cookie for auth
      });

      let subscriptionStatus = 'Inactive';  // Default: no active subscriptions
      let activeSubCount = 0;
      let subscriptionDetails: any[] = [];

      console.log('[Live Support] Subscription API response status:', subscriptionResponse.status);
      
      if (subscriptionResponse.ok) {
        const subData = await subscriptionResponse.json();
        console.log('[Live Support] Subscription data:', subData);
        
        if (subData.subscriptions && subData.subscriptions.length > 0) {
          // Find active subscriptions (status active AND not expired)
          const activeSubs = subData.subscriptions.filter(
            (s: any) => s.status === 'active' && new Date(s.expiryDate) > new Date()
          );
          console.log('[Live Support] Active subs after filter:', activeSubs.length);
          activeSubCount = activeSubs.length;
          subscriptionDetails = activeSubs;
          
          if (activeSubCount > 0) {
            subscriptionStatus = 'Active';
          }
        }
      } else {
        console.error('[Live Support] Failed to fetch subscriptions:', subscriptionResponse.status);
      }

      // Set user profile with real data
      setUserProfile({
        name: auth.state.user?.name || 'User',
        email: auth.state.user?.email,
        subscription: subscriptionStatus,
        activeAgents: activeSubCount,
        subscriptionDetails,
        joinedDate: auth.state.user?.createdAt,
        supportTickets: 0,
      });
    } catch (error) {
      console.error('[Live Support] Error fetching user profile:', error);
      // Fallback to basic profile
      setUserProfile({
        name: auth.state.user?.name || 'User',
        email: auth.state.user?.email,
        subscription: 'Inactive',
        activeAgents: 0,
        subscriptionDetails: [],
        joinedDate: auth.state.user?.createdAt,
        supportTickets: 0,
      });
    }
  }, [auth.state.user?.id, auth.state.user?.name, auth.state.user?.email, auth.state.user?.createdAt, setUserProfile]);

  const initializeChat = useCallback(() => {
    const userName = auth.state.user?.name || 'lovely';
    const welcomeMessage: Message = {
      id: '0',
      role: 'assistant',
      content: `Hey there, ${userName}! 🌙💕\n\nI'm Luna, your personal support companion here at One Last AI! It's so wonderful to have you here, darling!\n\nHow can I make your day better today? 🥰`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [auth.state.user?.name, setMessages]);

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
  }, [auth.state.isAuthenticated, auth.state.user, fetchUserProfile, initializeChat]);


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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
              <Phone size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Live Support</h1>
            <p className="text-gray-600 mb-8">
              Please log in to access our real-time AI support agent with
              personalized assistance based on your account.
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <AlertCircle size={18} />
                Sign In Now
              </Link>
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium"
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">Live Support</h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  AI-Powered Support Agent
                </p>
              </div>
            </div>

            {userProfile && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                <span className="text-sm text-gray-700">
                  <span className="text-gray-500">Account:</span>{' '}
                  <span className="font-medium">{userProfile.name}</span>
                </span>
              </div>
            )}
          </div>

          {/* Messages Container */}
          <div
            ref={messageContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-white/50"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-lg lg:max-w-xl px-4 py-3 rounded-2xl shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
                      : message.role === 'system'
                      ? 'bg-amber-50 border border-amber-200 text-amber-800'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {isStreamingResponse && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200 p-6">
            {ticketGenerated && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AlertCircle size={18} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-800">
                    Your issue needs escalation. Our team will create a support
                    ticket.
                  </span>
                </div>
                <button
                  onClick={generateTicket}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg text-sm font-medium text-white transition-all shadow-lg shadow-blue-500/25"
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
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white"
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
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
              >
                <DownloadCloud size={16} />
                Download
              </button>
              <button
                onClick={copyChat}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto hidden lg:block">
          {/* User Profile Section */}
          {userProfile && (
            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-bold mb-3 text-sm uppercase text-gray-500">
                Your Profile
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <p className="text-gray-900 font-medium">{userProfile.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="text-gray-900 font-medium">{userProfile.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    {userProfile.subscription === 'Active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        Inactive
                      </span>
                    )}
                    {userProfile.activeAgents > 0 && (
                      <span className="text-xs text-gray-500">
                        ({userProfile.activeAgents} agent{userProfile.activeAgents > 1 ? 's' : ''})
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Member Since:</span>
                  <p className="text-gray-900 font-medium">
                    {new Date(userProfile.joinedDate).toLocaleDateString()}
                  </p>
                </div>
                {userProfile.subscription === 'Inactive' && (
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <Link
                      href="/pricing"
                      className="block w-full text-center px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg text-sm font-medium text-white transition-all shadow-lg shadow-blue-500/25"
                    >
                      Browse Agents
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Support Ticket Info */}
          {supportTicket && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <h3 className="font-bold text-sm uppercase text-green-800">
                  Ticket Generated
                </h3>
              </div>
              <p className="text-sm text-green-700 mb-2">Ticket ID:</p>
              <p className="font-mono text-xs bg-white border border-green-200 p-2 rounded-lg mb-3 break-all text-gray-800">
                {supportTicket.id}
              </p>
              <p className="text-xs text-green-600 mb-3">
                Our human support team will contact you within 48 hours.
              </p>
              <Link
                href="/dashboard/support-tickets"
                className="block w-full text-center px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-sm font-medium text-white transition-all shadow-lg shadow-green-500/25"
              >
                View My Tickets
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="font-bold mb-3 text-sm uppercase text-gray-500">
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
            <h3 className="font-bold mb-3 text-sm uppercase text-gray-500">
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
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock size={16} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Support Hours</h3>
            </div>
            <p className="text-xs text-gray-600">
              24/7 AI Support • Human team Monday-Friday, 9AM-6PM EST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
