'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Draggable, Observer, CustomWiggle, MotionPathPlugin, InertiaPlugin } from '@/lib/gsap';

// Register plugins

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
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [topMembers, setTopMembers] = useState<CommunityUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [postCategory, setPostCategory] = useState<'general' | 'agents' | 'ideas' | 'help'>('general');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'agents' | 'ideas' | 'help'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<{ totalMembers: number; onlineNow: number; totalPosts: number; postsThisWeek: number; activeReplies: number; newMembersWeek: number; } | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const communityLinks = [
    { icon: '💬', title: 'Discord Community', desc: 'Join 10K+ members', href: '/community/discord', color: 'from-indigo-500 to-purple-600' },
    { icon: '🔧', title: 'Contributing', desc: 'Help improve Maula AI', href: '/community/contributing', color: 'from-green-500 to-emerald-600' },
    { icon: '🗺️', title: 'Open Roadmap', desc: 'See what\'s coming', href: '/community/roadmap', color: 'from-amber-500 to-orange-600' },
    { icon: '💡', title: 'Suggestions', desc: 'Share your ideas', href: '/community/suggestions', color: 'from-pink-500 to-rose-600' },
  ];

  const stats = [
    { value: '10K+', label: 'Active Members', icon: '👥' },
    { value: '5K+', label: 'GitHub Stars', icon: '⭐' },
    { value: '500+', label: 'Contributions', icon: '🔧' },
    { value: '18', label: 'AI Agents', icon: '🤖' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Data fetching effects (preserved from original)
  useEffect(() => {
    const ping = async () => {
      try {
        if (!userProfile?.token) return;
        await fetch('/api/community/presence/ping', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      } catch (error) { console.error('Presence ping failed:', error); }
    };
    ping();
    const interval = setInterval(ping, 20000);
    return () => clearInterval(interval);
  }, [userProfile?.token]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingPosts(true);
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (searchQuery) params.set('search', searchQuery);

        const res = await fetch(`/api/community/posts?${params.toString()}`);
        const json = await res.json();
        if (json.success) {
          const list: CommunityMessage[] = (json.data || []).map((p: any) => ({
            id: p._id, author: p.authorName, avatar: p.authorAvatar || '👤', content: p.content,
            timestamp: new Date(p.createdAt), likes: p.likesCount || 0, replies: p.repliesCount || 0,
            category: p.category, isPinned: !!p.isPinned,
          }));
          setMessages(list);
        } else { setError(json.error || 'Failed to load posts'); }

        const membersRes = await fetch('/api/community/top-members');
        const membersJson = await membersRes.json();
        if (membersJson.success && membersJson.data) {
          const membersList: CommunityUser[] = membersJson.data.map((m: any) => ({
            id: m._id, name: m.name || m.email || 'Member', avatar: m.avatar || '👤',
            title: m.title || `${m.postsCount || 0} posts`, joinedDate: new Date(m.createdAt), postsCount: m.postsCount || 0,
          }));
          setTopMembers(membersList);
        }
      } catch (e: any) { setError('Failed to load posts'); } finally { setLoadingPosts(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const loadUserProfile = async () => {
      const token = document.cookie.match(/token=([^;]+)/)?.[1];
      if (!token) return;
      try {
        const res = await fetch('/api/user/profile', { credentials: 'include' });
        if (res.ok) { const profile = await res.json(); setUserProfile({ ...profile.data, token }); }
      } catch (error) { console.error('Failed to load user profile:', error); }
    };
    loadUserProfile();
  }, []);

  useEffect(() => {
    const es = new EventSource('/api/community/stream');
    es.onmessage = (ev) => { try { const msg = JSON.parse(ev.data); if (msg?.type === 'metrics') { setMetrics(msg.data); } } catch (_) {} };
    es.onerror = () => { es.close(); };
    return () => es.close();
  }, []);

  // ===== GSAP ANIMATIONS =====
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. SplitText Hero Animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 100, opacity: 0, rotateX: -90 });
      gsap.set(heroSub.words, { y: 40, opacity: 0 });
      gsap.set('.hero-icon', { scale: 0, rotation: -360 });
      gsap.set('.stat-card', { y: 80, opacity: 0, scale: 0.8 });
      gsap.set('.link-card', { y: 60, opacity: 0, rotateY: -15 });
      gsap.set('.activity-section', { y: 60, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-icon', { scale: 1, rotation: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.02 }, '-=0.8')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.03 }, '-=0.5');

      // 2. ScrambleText on stats
      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el, i) => {
        gsap.to(el, {
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          duration: 1.5,
          scrambleText: { text: el.dataset.value || el.innerText, chars: '0123456789+K', speed: 0.6 },
          delay: i * 0.1
        });
      });

      // 3. ScrollTrigger for stat cards
      ScrollTrigger.batch('.stat-card', {
        start: 'top 85%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 80, opacity: 0, scale: 0.8, duration: 0.3 })
      });

      // 4. ScrollTrigger for link cards with 3D reveal
      ScrollTrigger.batch('.link-card', {
        start: 'top 80%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, rotateY: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 60, opacity: 0, rotateY: -15, duration: 0.3 })
      });

      // 5. Observer for parallax scrolling effects
      Observer.create({
        target: window,
        type: 'scroll',
        onChangeY: (self) => {
          const scrollY = self.scrollY;
          gsap.to('.parallax-orb-1', { y: scrollY * 0.3, duration: 0.5, ease: 'none' });
          gsap.to('.parallax-orb-2', { y: scrollY * -0.2, duration: 0.5, ease: 'none' });
          gsap.to('.grid-pattern', { y: scrollY * 0.1, duration: 0.5, ease: 'none' });
        }
      });

      // 6. Physics2D-like floating particles
      gsap.utils.toArray<HTMLElement>('.floating-particle').forEach((p, i) => {
        gsap.to(p, {
          x: `random(-100, 100)`,
          y: `random(-80, 80)`,
          rotation: `random(-180, 180)`,
          duration: `random(6, 12)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3
        });
      });

      // 7. MotionPath for orbiting elements
      gsap.to('.orbit-element', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 50, y: -30 }, { x: 100, y: 0 }, { x: 50, y: 30 }, { x: 0, y: 0 }],
          curviness: 1.5,
        },
        duration: 8,
        repeat: -1,
        ease: 'none'
      });

      // 8. CustomWiggle on hover icons
      gsap.utils.toArray<HTMLElement>('.wiggle-icon').forEach((icon) => {
        icon.addEventListener('mouseenter', () => {
          gsap.to(icon, { rotation: 20, duration: 0.8, ease: 'wiggle' });
        });
        icon.addEventListener('mouseleave', () => {
          gsap.to(icon, { rotation: 0, duration: 0.4 });
        });
      });

      // 9. Activity section reveal
      gsap.to('.activity-section', {
        scrollTrigger: { trigger: '.activity-section', start: 'top 80%' },
        y: 0, opacity: 1, duration: 0.8, ease: 'power3.out'
      });

      // 10. Inertia-enabled draggable message cards (read-only visual)
      if (typeof window !== 'undefined' && cardsRef.current) {
        Draggable.create('.draggable-card', {
          type: 'x,y',
          bounds: cardsRef.current,
          inertia: true,
          onDragEnd: function() {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
          }
        });
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleLikeMessage = (id: string) => {
    const newLiked = new Set(likedMessages);
    if (newLiked.has(id)) { newLiked.delete(id); } else { newLiked.add(id); }
    setLikedMessages(newLiked);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!userProfile?.token) { setError('Please log in to post messages'); return; }
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage, category: postCategory }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newPost: CommunityMessage = {
          id: json.data._id, author: userProfile.name || userProfile.email, avatar: userProfile.avatar || '👤',
          content: newMessage, timestamp: new Date(), likes: 0, replies: 0, category: postCategory,
        };
        setMessages((prev) => [newPost, ...prev]);
        setNewMessage('');
      } else { setError(json.error || 'Failed to post message'); }
    } catch (err) { setError('Failed to post message'); }
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      general: 'from-blue-500 to-cyan-500', agents: 'from-purple-500 to-pink-500',
      ideas: 'from-amber-500 to-orange-500', help: 'from-green-500 to-emerald-500',
    };
    return colors[cat] || colors.general;
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="parallax-orb-1 absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[180px]" />
        <div className="parallax-orb-2 absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px]" />
        <div className="grid-pattern absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        {[...Array(15)].map((_, i) => (
          <div key={i} className="floating-particle absolute w-2 h-2 bg-cyan-400/40 rounded-full" style={{ left: `${5 + i * 6}%`, top: `${10 + (i % 5) * 18}%` }} />
        ))}
        <div className="orbit-element absolute top-20 right-40 w-3 h-3 bg-purple-400/60 rounded-full" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="hero-icon inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl border border-cyan-500/30 mb-8">
            <span className="text-5xl wiggle-icon">👥</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">Our Community</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Join thousands of AI enthusiasts, developers, and innovators building the future together.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm text-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
                <span className="text-3xl mb-3 block wiggle-icon">{stat.icon}</span>
                <div className="stat-value text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" data-value={stat.value}>{stat.value}</div>
                <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Links */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Get Involved</h2>
            <p className="text-gray-400 text-lg">Choose how you'd like to be part of our community</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {communityLinks.map((link, idx) => (
              <Link key={idx} href={link.href} className="link-card group relative block">
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden transition-all duration-300 group-hover:border-cyan-500/50">
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg group-hover:border-cyan-400/60 transition-colors" />
                  <div className="flex items-start gap-5">
                    <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${link.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{link.title}</h3>
                      <p className="text-gray-400">{link.desc}</p>
                      <div className="mt-4 flex items-center gap-2 text-cyan-400 font-medium">
                        <span>Explore</span>
                        <span className="group-hover:translate-x-2 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section ref={cardsRef} className="activity-section relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Community Activity</h2>
            <p className="text-gray-400 text-lg">Latest discussions and updates</p>
          </div>

          {/* Post Form */}
          {userProfile && (
            <form onSubmit={handleSendMessage} className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm">
              <div className="flex flex-col gap-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Share something with the community..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between gap-4">
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value as any)}
                    className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="general">💬 General</option>
                    <option value="agents">🤖 Agents</option>
                    <option value="ideas">💡 Ideas</option>
                    <option value="help">❓ Help</option>
                  </select>
                  <button type="submit" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                    Post →
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">{error}</div>
          )}

          {loadingPosts ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading posts...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.slice(0, 10).map((msg) => (
                <div key={msg.id} className="draggable-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm transition-all hover:border-gray-600/50">
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-gray-600/30 rounded-tr-lg" />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-2xl flex-shrink-0">
                      {msg.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-white">{msg.author}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(msg.category)} text-white`}>
                          {msg.category}
                        </span>
                        <span className="text-gray-500 text-sm">{msg.timestamp.toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 mb-3">{msg.content}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <button onClick={() => handleLikeMessage(msg.id)} className={`flex items-center gap-2 transition-colors ${likedMessages.has(msg.id) ? 'text-pink-400' : 'text-gray-500 hover:text-pink-400'}`}>
                          <span>{likedMessages.has(msg.id) ? '❤️' : '🤍'}</span>
                          <span>{msg.likes + (likedMessages.has(msg.id) ? 1 : 0)}</span>
                        </button>
                        <span className="flex items-center gap-2 text-gray-500">
                          <span>💬</span>
                          <span>{msg.replies}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Connect with fellow innovators, share your ideas, and help shape the future of AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/community/discord" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                  💬 Join Discord
                </Link>
                <Link href="/auth/signup" className="px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
