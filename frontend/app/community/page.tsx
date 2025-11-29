'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';

interface CommunityMessage {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: number;
  category: 'general' | 'agents' | 'ideas' | 'help';
  isPinned?: boolean;
}

interface CommunityUser {
  id: string;
  name: string;
  avatar: string;
  title: string;
  joinedDate: Date;
  postsCount?: number;
}

export default function CommunityPage() {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [topMembers, setTopMembers] = useState<CommunityUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [postCategory, setPostCategory] = useState<
    'general' | 'agents' | 'ideas' | 'help'
  >('general');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'general' | 'agents' | 'ideas' | 'help'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<{
    totalMembers: number;
    onlineNow: number;
    totalPosts: number;
    postsThisWeek: number;
    activeReplies: number;
    newMembersWeek: number;
  } | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Presence ping with JWT authentication (20s)
  useEffect(() => {
    const ping = async () => {
      try {
        if (!userProfile?.token) return; // Only ping if authenticated

        await fetch('/api/community/presence/ping', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userProfile.token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Presence ping failed:', error);
      }
    };
    ping();
    const interval = setInterval(ping, 20000);
    return () => clearInterval(interval);
  }, [userProfile?.token]);

  // Fetch initial posts and top members
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingPosts(true);
        const params = new URLSearchParams();
        if (selectedCategory !== 'all')
          params.set('category', selectedCategory);
        if (searchQuery) params.set('search', searchQuery);

        // Fetch posts
        const res = await fetch(`/api/community/posts?${params.toString()}`);
        const json = await res.json();
        if (json.success) {
          const list: CommunityMessage[] = (json.data || []).map((p: any) => ({
            id: p._id,
            author: p.authorName,
            avatar: p.authorAvatar || '👤',
            content: p.content,
            timestamp: new Date(p.createdAt),
            likes: p.likesCount || 0,
            replies: p.repliesCount || 0,
            category: p.category,
            isPinned: !!p.isPinned,
          }));
          setMessages(list);
        } else {
          setError(json.error || 'Failed to load posts');
        }

        // Fetch top members
        const membersRes = await fetch('/api/community/top-members');
        const membersJson = await membersRes.json();
        if (membersJson.success && membersJson.data) {
          const membersList: CommunityUser[] = membersJson.data.map(
            (m: any) => ({
              id: m._id,
              name: m.name || m.email || 'Member',
              avatar: m.avatar || '👤',
              title: m.title || `${m.postsCount || 0} posts`,
              joinedDate: new Date(m.createdAt),
              postsCount: m.postsCount || 0,
            })
          );
          setTopMembers(membersList);
        }
      } catch (e: any) {
        setError('Failed to load posts');
      } finally {
        setLoadingPosts(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load user profile from API instead of localStorage
  useEffect(() => {
    const loadUserProfile = async () => {
      const token =
        localStorage.getItem('auth_token') ||
        document.cookie.match(/token=([^;]+)/)?.[1];
      if (!token) return;

      try {
        const res = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const profile = await res.json();
          // Include token with user profile for API calls
          setUserProfile({
            ...profile.data,
            token,
          });
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };
    loadUserProfile();
  }, []);

  // SSE for metrics
  useEffect(() => {
    const es = new EventSource('/api/community/stream');
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === 'metrics') {
          setMetrics(msg.data);
        }
      } catch (_) {}
    };
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!userProfile?.token) {
      setError('Please log in to post messages');
      return;
    }
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userProfile.token}`,
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          category: postCategory,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const p = json.data;
        const newMsg: CommunityMessage = {
          id: p._id,
          author: p.authorName,
          avatar: p.authorAvatar || '👤',
          content: p.content,
          timestamp: new Date(p.createdAt),
          likes: p.likesCount || 0,
          replies: p.repliesCount || 0,
          category: p.category,
          isPinned: !!p.isPinned,
        };
        setMessages((prev) => [newMsg, ...prev]);
        setNewMessage('');
      }
    } catch (_) {}
  };

  const handleLike = async (messageId: string) => {
    if (!userProfile?.token) {
      setError('Please log in to like posts');
      return;
    }
    const isLiked = likedMessages.has(messageId);
    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      const res = await fetch(`/api/community/posts/${messageId}/${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userProfile.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error('Failed to update like');
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, likes: Math.max(0, m.likes + (isLiked ? -1 : 1)) }
            : m
        )
      );
      const next = new Set(likedMessages);
      if (isLiked) next.delete(messageId);
      else next.add(messageId);
      setLikedMessages(next);
    } catch (_) {}
  };

  const filteredMessages = messages
    .filter(
      (msg) => selectedCategory === 'all' || msg.category === selectedCategory
    )
    .filter(
      (msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.author.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort(
      (a, b) =>
        (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) ||
        b.timestamp.getTime() - a.timestamp.getTime()
    );

  const stats = [
    {
      number: metrics?.totalMembers ?? '—',
      label: 'Community Members',
      icon: '👥',
    },
    {
      number: metrics?.totalPosts ?? '—',
      label: 'Total Discussions',
      icon: '💬',
    },
    { number: metrics?.onlineNow ?? '—', label: 'Online Now', icon: '🟢' },
    {
      number: metrics?.postsThisWeek ?? '—',
      label: 'Posts This Week',
      icon: '📝',
    },
  ];

  const categories = [
    {
      id: 'all',
      label: 'All Discussions',
      icon: '💭',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'general',
      label: 'General',
      icon: '🌍',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'agents',
      label: 'Agents & Features',
      icon: '🤖',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'ideas',
      label: 'Ideas & Suggestions',
      icon: '💡',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      color: 'from-red-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 text-white">
      {/* Header Section */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            One Last AI Community
          </h1>
          <p className="text-xl opacity-90">
            Join real-time discussions with thousands of developers, AI
            enthusiasts, and innovators
          </p>
        </div>
      </section>

      {/* Community Stats */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-6 bg-neural-800 rounded-lg border border-neural-700 hover:border-brand-500 transition-colors"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-brand-400 mb-1">
                  {stat.number}
                </div>
                <div className="text-neural-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Community Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Categories & Top Members */}
            <div className="lg:col-span-1 space-y-8">
              {/* Category Navigation */}
              <div className="bg-neural-800 rounded-lg border border-neural-700 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Filter size={20} /> Categories
                </h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedCategory === cat.id
                          ? `bg-gradient-to-r ${cat.color} text-white`
                          : 'bg-neural-700 text-neural-300 hover:bg-neural-600'
                      }`}
                    >
                      <span className="text-lg mr-2">{cat.icon}</span>
                      <span className="text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Members */}
              <div className="bg-neural-800 rounded-lg border border-neural-700 p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Users size={20} /> Top Members
                </h3>
                <div className="space-y-4">
                  {topMembers.length === 0 ? (
                    <div className="text-center py-4 text-neural-400 text-sm">
                      No members yet
                    </div>
                  ) : (
                    topMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-neural-700 rounded-lg hover:bg-neural-600 transition-colors cursor-pointer"
                      >
                        <div className="text-2xl">{member.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">
                            {member.name}
                          </div>
                          <div className="text-xs text-neural-400">
                            {member.title}
                          </div>
                          <div className="text-xs text-neural-500">
                            Joined{' '}
                            {new Date(member.joinedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search
                    className="absolute left-4 top-3 text-neural-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search discussions..."
                    className="w-full bg-neural-800 border border-neural-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-neural-400 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Messages Feed */}
              <div className="space-y-4 max-h-96 overflow-y-auto mb-8 pr-4 bg-neural-800/30 p-6 rounded-lg border border-neural-700">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">💭</div>
                    <p className="text-neural-400">
                      {loadingPosts
                        ? 'Loading discussions…'
                        : 'No discussions found. Be the first to start one!'}
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-5 rounded-lg border transition-all ${
                        message.isPinned
                          ? 'bg-brand-900/30 border-brand-500/50 ring-2 ring-brand-500/20'
                          : 'bg-neural-700/50 border-neural-600 hover:border-brand-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{message.avatar}</div>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              {message.author}
                              {message.isPinned && (
                                <span className="text-xs bg-brand-600 px-2 py-1 rounded-full">
                                  📌 Pinned
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neural-400">
                              {Math.round(
                                (Date.now() - message.timestamp.getTime()) /
                                  60000
                              )}{' '}
                              mins ago
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-neural-600 rounded-full text-xs font-medium text-neural-200">
                          {
                            categories.find((c) => c.id === message.category)
                              ?.icon
                          }{' '}
                          {message.category}
                        </div>
                      </div>
                      <p className="text-neural-100 mb-4 whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <div className="flex gap-6 text-sm text-neural-400">
                        <button
                          onClick={() => handleLike(message.id)}
                          className={`flex items-center gap-2 transition-colors ${
                            likedMessages.has(message.id)
                              ? 'text-brand-400'
                              : 'hover:text-brand-400'
                          }`}
                        >
                          <Heart
                            size={16}
                            fill={
                              likedMessages.has(message.id)
                                ? 'currentColor'
                                : 'none'
                            }
                          />{' '}
                          {message.likes}
                        </button>
                        <button className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                          <MessageCircle size={16} /> {message.replies}
                        </button>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="bg-neural-800 p-6 rounded-lg border border-neural-700"
              >
                <div className="mb-4">
                  <label className="text-sm text-neural-300 mb-2 block">
                    Select Category
                  </label>
                  <div className="relative">
                    <select
                      value={postCategory}
                      onChange={(e) =>
                        setPostCategory(
                          e.target.value as
                            | 'general'
                            | 'agents'
                            | 'ideas'
                            | 'help'
                        )
                      }
                      className="w-full bg-neural-700 border border-neural-600 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-brand-500 pr-10"
                    >
                      <option value="general">🌍 General</option>
                      <option value="agents">🤖 Agents & Features</option>
                      <option value="ideas">💡 Ideas & Suggestions</option>
                      <option value="help">❓ Help & Support</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neural-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Share your thoughts, ask questions, or join the discussion..."
                    className="flex-1 bg-neural-700 border border-neural-600 rounded-lg px-4 py-3 text-white placeholder-neural-400 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-700 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <Send size={18} /> Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Community Guidelines Section */}
      <section className="section-padding border-t border-neural-700 bg-neural-900">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Community Guidelines
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neural-800 p-6 rounded-lg border border-neural-700">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-bold mb-2">Be Respectful</h3>
              <p className="text-neural-400 text-sm">
                Harassment, hate speech, doxxing, and threats are strictly
                prohibited. Disagreements are fine—keep them civil and on-topic.
              </p>
            </div>
            <div className="bg-neural-800 p-6 rounded-lg border border-neural-700">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-bold mb-2">Share Knowledge</h3>
              <p className="text-neural-400 text-sm">
                Provide constructive, good-faith contributions. Don't post spam,
                scams, or misleading content.
              </p>
            </div>
            <div className="bg-neural-800 p-6 rounded-lg border border-neural-700">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">Stay On Topic</h3>
              <p className="text-neural-400 text-sm">
                Keep discussions relevant to One Last AI and applicable law.
                Don't share illegal content or proprietary data without
                permission.
              </p>
            </div>
            <div className="bg-neural-800 p-6 rounded-lg border border-neural-700">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-bold mb-2">Be Authentic</h3>
              <p className="text-neural-400 text-sm">
                Protect your account. Don't impersonate others. By
                participating, you agree to our Terms and applicable policies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Stats Section */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Community Activity
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-neural-800 rounded-lg border border-neural-700">
              <div className="text-5xl font-bold text-brand-400 mb-2">
                {metrics?.postsThisWeek ?? '—'}
              </div>
              <p className="text-neural-300">Posts This Week</p>
              <div className="mt-4 h-1 bg-neural-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-600 to-accent-600 w-3/4"></div>
              </div>
            </div>
            <div className="text-center p-8 bg-neural-800 rounded-lg border border-neural-700">
              <div className="text-5xl font-bold text-brand-400 mb-2">
                {metrics?.activeReplies ?? '—'}
              </div>
              <p className="text-neural-300">Active Replies</p>
              <div className="mt-4 h-1 bg-neural-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-600 to-accent-600 w-4/5"></div>
              </div>
            </div>
            <div className="text-center p-8 bg-neural-800 rounded-lg border border-neural-700">
              <div className="text-5xl font-bold text-brand-400 mb-2">
                {metrics?.newMembersWeek ?? '—'}
              </div>
              <p className="text-neural-300">New Members</p>
              <div className="mt-4 h-1 bg-neural-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-600 to-accent-600 w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
