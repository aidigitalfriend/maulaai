'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
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

gsap.registerPlugin(ScrollTrigger);

// Creative styles for cards
const creativeStyles = `
  .glow-card {
    position: relative;
    background: linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(15, 15, 15, 0.9));
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .glow-card::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, #00d4ff, #00ff88, #0066ff, #00d4ff);
    background-size: 300% 300%;
    animation: glowRotate 4s ease infinite;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .glow-card:hover::before {
    opacity: 1;
  }
  @keyframes glowRotate {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .shimmer-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent);
    transition: left 0.6s ease;
    pointer-events: none;
  }
  .shimmer-card:hover::after {
    left: 100%;
  }

  .glass-card {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    background: rgba(26, 26, 26, 0.7);
  }

  .float-card {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;
  }
  .float-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 212, 255, 0.15);
  }

  .cyber-grid::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(0, 212, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 212, 255, 0.02) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }
  .cyber-grid:hover::before {
    opacity: 1;
  }
`;

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
  const containerRef = useRef<HTMLDivElement>(null);
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

  // 3D tilt effect handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  useGSAP(() => {
    // Hero entrance animation
    const heroTl = gsap.timeline({ defaults: { ease: 'elastic.out(1, 0.8)' } });
    
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 30, scale: 0.8, filter: 'blur(10px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1 })
      .fromTo('.hero-title', { opacity: 0, y: 60, scale: 0.9, filter: 'blur(20px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2 }, '-=0.6')
      .fromTo('.hero-subtitle', { opacity: 0, y: 40, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, '-=0.6');

    // Stats cards with explosive stagger
    gsap.fromTo('.stat-card', 
      { opacity: 0, y: 80, scale: 0.8, rotationX: 20, filter: 'blur(10px)' },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        filter: 'blur(0px)',
        duration: 1,
        stagger: { each: 0.1, from: 'center' },
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: '.stats-grid', start: 'top 85%', toggleActions: 'play none none reverse' },
      }
    );

    // Section animations
    gsap.utils.toArray<HTMLElement>('.section-animate').forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 60, filter: 'blur(5px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
    });
  }, { scope: containerRef });

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
          credentials: 'include', // Use HttpOnly cookies
          headers: {
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
        // HttpOnly cookies handle authentication automatically
        document.cookie.match(/token=([^;]+)/)?.[1];
      if (!token) return;

      try {
        const res = await fetch('/api/user/profile', {
          credentials: 'include', // Use HttpOnly cookies
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
        credentials: 'include', // Use HttpOnly cookies
        headers: {
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
      color: '#00d4ff',
    },
    {
      id: 'general',
      label: 'General',
      icon: '🌍',
      color: '#a855f7',
    },
    {
      id: 'agents',
      label: 'Agents & Features',
      icon: '🤖',
      color: '#00ff88',
    },
    {
      id: 'ideas',
      label: 'Ideas & Suggestions',
      icon: '💡',
      color: '#f59e0b',
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: '❓',
      color: '#ef4444',
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx>{creativeStyles}</style>
      {/* Header Section */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-6">
            <Users className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-sm text-[#00d4ff] font-medium">Community Hub</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            One Last AI Community
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Join real-time discussions with thousands of developers, AI
            enthusiasts, and innovators
          </p>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => {
              const colors = ['#00d4ff', '#00ff88', '#a855f7', '#f59e0b'];
              const color = colors[idx % colors.length];
              return (
                <div
                  key={idx}
                  className="stat-card glass-card float-card shimmer-card text-center p-6 rounded-2xl overflow-hidden relative group cursor-pointer"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${color}20, transparent 60%)` }}
                  ></div>
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-3xl font-bold mb-1" style={{ color }}>{stat.number}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Community Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Categories & Top Members */}
            <div className="lg:col-span-1 space-y-8">
              {/* Category Navigation */}
              <div className="section-animate glass-card rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#00d4ff]/20 to-transparent rounded-lg flex items-center justify-center">
                    <Filter size={16} className="text-[#00d4ff]" />
                  </div>
                  Categories
                </h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
                        selectedCategory === cat.id
                          ? 'text-white shadow-lg'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                      }`}
                      style={selectedCategory === cat.id ? { background: `linear-gradient(135deg, ${cat.color}40, ${cat.color}20)`, borderColor: `${cat.color}50` } : undefined}
                    >
                      <span className="text-lg mr-2">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Members */}
              <div className="section-animate glass-card rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#a855f7]/20 to-transparent rounded-lg flex items-center justify-center">
                    <Users size={16} className="text-[#a855f7]" />
                  </div>
                  Top Members
                </h3>
                <div className="space-y-4">
                  {topMembers.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No members yet
                    </div>
                  ) : (
                    topMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 border border-white/5 transition-colors cursor-pointer"
                      >
                        <div className="text-2xl">{member.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-white">
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {member.title}
                          </div>
                          <div className="text-xs text-gray-500">
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
                    className="absolute left-4 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search discussions..."
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-2 focus:ring-[#00d4ff]/20"
                  />
                </div>
              </div>

              {/* Messages Feed */}
              <div className="section-animate space-y-4 max-h-96 overflow-y-auto mb-8 pr-4 glass-card p-6 rounded-2xl border border-white/5">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">💭</div>
                    <p className="text-gray-500">
                      {loadingPosts
                        ? 'Loading discussions…'
                        : 'No discussions found. Be the first to start one!'}
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-5 rounded-xl border transition-all ${
                        message.isPinned
                          ? 'bg-[#00d4ff]/10 border-[#00d4ff]/30 ring-2 ring-[#00d4ff]/20'
                          : 'bg-white/5 border-white/10 hover:border-[#00d4ff]/30 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{message.avatar}</div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              {message.author}
                              {message.isPinned && (
                                <span className="text-xs bg-[#00d4ff] text-black px-2 py-1 rounded-full">
                                  📌 Pinned
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round(
                                (Date.now() - message.timestamp.getTime()) /
                                  60000
                              )}{' '}
                              mins ago
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-gray-300">
                          {
                            categories.find((c) => c.id === message.category)
                              ?.icon
                          }{' '}
                          {message.category}
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4 whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <div className="flex gap-6 text-sm text-gray-500">
                        <button
                          onClick={() => handleLike(message.id)}
                          className={`flex items-center gap-2 transition-colors ${
                            likedMessages.has(message.id)
                              ? 'text-pink-500'
                              : 'hover:text-pink-500'
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
                        <button className="flex items-center gap-2 hover:text-[#00d4ff] transition-colors">
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
                className="section-animate glass-card p-6 rounded-2xl border border-white/5"
              >
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block font-medium">
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
                      className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-[#00d4ff]/50 focus:ring-2 focus:ring-[#00d4ff]/20 pr-10"
                    >
                      <option value="general">🌍 General</option>
                      <option value="agents">🤖 Agents & Features</option>
                      <option value="ideas">💡 Ideas & Suggestions</option>
                      <option value="help">❓ Help & Support</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
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
                    className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-2 focus:ring-[#00d4ff]/20"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] hover:from-[#00b8e6] hover:to-[#00e077] rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap text-black shadow-lg shadow-[#00d4ff]/25"
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
      <section className="py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">
              Community Guidelines
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              className="section-animate glass-card glow-card shimmer-card p-6 rounded-2xl border border-white/5 hover:border-[#00d4ff]/30 transition-all duration-500 cursor-pointer group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff]/20 to-transparent rounded-xl flex items-center justify-center mb-4 text-2xl">🤝</div>
              <h3 className="font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">Be Respectful</h3>
              <p className="text-gray-400 text-sm">
                Harassment, hate speech, doxxing, and threats are strictly
                prohibited. Disagreements are fine—keep them civil and on-topic.
              </p>
            </div>
            <div 
              className="section-animate glass-card glow-card shimmer-card p-6 rounded-2xl border border-white/5 hover:border-[#f59e0b]/30 transition-all duration-500 cursor-pointer group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b]/20 to-transparent rounded-xl flex items-center justify-center mb-4 text-2xl">💡</div>
              <h3 className="font-bold text-white mb-2 group-hover:text-[#f59e0b] transition-colors">Share Knowledge</h3>
              <p className="text-gray-400 text-sm">
                Provide constructive, good-faith contributions. Don't post spam,
                scams, or misleading content.
              </p>
            </div>
            <div 
              className="section-animate glass-card glow-card shimmer-card p-6 rounded-2xl border border-white/5 hover:border-[#00ff88]/30 transition-all duration-500 cursor-pointer group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ff88]/20 to-transparent rounded-xl flex items-center justify-center mb-4 text-2xl">🎯</div>
              <h3 className="font-bold text-white mb-2 group-hover:text-[#00ff88] transition-colors">Stay On Topic</h3>
              <p className="text-gray-400 text-sm">
                Keep discussions relevant to One Last AI and applicable law.
                Don't share illegal content or proprietary data without
                permission.
              </p>
            </div>
            <div 
              className="section-animate glass-card glow-card shimmer-card p-6 rounded-2xl border border-white/5 hover:border-[#a855f7]/30 transition-all duration-500 cursor-pointer group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#a855f7]/20 to-transparent rounded-xl flex items-center justify-center mb-4 text-2xl">✨</div>
              <h3 className="font-bold text-white mb-2 group-hover:text-[#a855f7] transition-colors">Be Authentic</h3>
              <p className="text-gray-400 text-sm">
                Protect your account. Don't impersonate others. By
                participating, you agree to our Terms and applicable policies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">
              Community Activity
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div 
              className="section-animate glass-card glow-card text-center p-8 rounded-2xl border border-white/5 cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="text-5xl font-bold text-[#00d4ff] mb-2">
                {metrics?.postsThisWeek ?? '—'}
              </div>
              <p className="text-gray-400">Posts This Week</p>
              <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88] w-3/4 rounded-full"></div>
              </div>
            </div>
            <div 
              className="section-animate glass-card glow-card text-center p-8 rounded-2xl border border-white/5 cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="text-5xl font-bold text-[#a855f7] mb-2">
                {metrics?.activeReplies ?? '—'}
              </div>
              <p className="text-gray-400">Active Replies</p>
              <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] w-4/5 rounded-full"></div>
              </div>
            </div>
            <div 
              className="section-animate glass-card glow-card text-center p-8 rounded-2xl border border-white/5 cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="text-5xl font-bold text-[#00ff88] mb-2">
                {metrics?.newMembersWeek ?? '—'}
              </div>
              <p className="text-gray-400">New Members</p>
              <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] w-2/3 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
