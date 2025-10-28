'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Send, Heart, MessageCircle, Users, TrendingUp, Search, Filter } from 'lucide-react'

interface CommunityMessage {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: Date
  likes: number
  replies: number
  category: 'general' | 'agents' | 'ideas' | 'help'
  isPinned?: boolean
}

interface CommunityUser {
  id: string
  name: string
  avatar: string
  title: string
  joinedDate: Date
}

export default function CommunityPage() {
  const [messages, setMessages] = useState<CommunityMessage[]>([
    {
      id: '1',
      author: 'Alex Chen',
      avatar: '👨‍💻',
      content: 'Just finished a project using Einstein for solving complex math problems. The accuracy is incredible!',
      timestamp: new Date(Date.now() - 5 * 60000),
      likes: 42,
      replies: 8,
      category: 'agents',
      isPinned: false
    },
    {
      id: '2',
      author: 'Sarah Johnson',
      avatar: '👩‍🔬',
      content: 'Has anyone successfully integrated voice features into their custom agent? Would love to hear your experience!',
      timestamp: new Date(Date.now() - 15 * 60000),
      likes: 28,
      replies: 5,
      category: 'help',
      isPinned: false
    },
    {
      id: '3',
      author: 'Tech Wizard Team',
      avatar: '🎯',
      content: '📢 New platform feature: Live analytics dashboard is now available for all users. Check your settings to enable it!',
      timestamp: new Date(Date.now() - 30 * 60000),
      likes: 156,
      replies: 23,
      category: 'general',
      isPinned: true
    },
    {
      id: '4',
      author: 'Mike Rodriguez',
      avatar: '🚀',
      content: 'Anyone interested in collaborating on an AI agent for customer support? I\'m looking for team members!',
      timestamp: new Date(Date.now() - 45 * 60000),
      likes: 35,
      replies: 12,
      category: 'ideas',
      isPinned: false
    }
  ])

  const [newMessage, setNewMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'agents' | 'ideas' | 'help'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  const [onlineUsers, setOnlineUsers] = useState(45)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const newMsg: CommunityMessage = {
      id: Date.now().toString(),
      author: 'You',
      avatar: '😊',
      content: newMessage,
      timestamp: new Date(),
      likes: 0,
      replies: 0,
      category: selectedCategory !== 'all' ? (selectedCategory as any) : 'general',
      isPinned: false
    }

    setMessages([...messages, newMsg])
    setNewMessage('')
  }

  const handleLike = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, likes: likedMessages.has(messageId) ? msg.likes - 1 : msg.likes + 1 }
        : msg
    ))
    
    const newLiked = new Set(likedMessages)
    if (newLiked.has(messageId)) {
      newLiked.delete(messageId)
    } else {
      newLiked.add(messageId)
    }
    setLikedMessages(newLiked)
  }

  const filteredMessages = messages
    .filter(msg => selectedCategory === 'all' || msg.category === selectedCategory)
    .filter(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()) || msg.author.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.timestamp.getTime() - a.timestamp.getTime())

  const stats = [
    { number: '15K+', label: 'Community Members', icon: '👥' },
    { number: '2.5K+', label: 'Active Discussions', icon: '💬' },
    { number: onlineUsers, label: 'Online Now', icon: '🟢' },
    { number: '5.2K+', label: 'Total Posts', icon: '📝' }
  ]

  const categories = [
    { id: 'all', label: 'All Discussions', icon: '💭', color: 'from-blue-500 to-cyan-500' },
    { id: 'general', label: 'General', icon: '🌍', color: 'from-purple-500 to-pink-500' },
    { id: 'agents', label: 'Agents & Features', icon: '🤖', color: 'from-green-500 to-emerald-500' },
    { id: 'ideas', label: 'Ideas & Suggestions', icon: '💡', color: 'from-yellow-500 to-orange-500' },
    { id: 'help', label: 'Help & Support', icon: '❓', color: 'from-red-500 to-pink-500' }
  ]

  const topMembers: CommunityUser[] = [
    { id: '1', name: 'Alex Chen', avatar: '👨‍💻', title: 'Platform Expert', joinedDate: new Date('2024-01-15') },
    { id: '2', name: 'Sarah Johnson', avatar: '👩‍🔬', title: 'AI Researcher', joinedDate: new Date('2024-02-20') },
    { id: '3', name: 'Mike Rodriguez', avatar: '🚀', title: 'Agent Developer', joinedDate: new Date('2024-03-10') },
    { id: '4', name: 'Emma Wilson', avatar: '🎨', title: 'Designer', joinedDate: new Date('2024-01-30') }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 text-white">
      {/* Header Section */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">One Last AI Community</h1>
          <p className="text-xl opacity-90">Join real-time discussions with thousands of developers, AI enthusiasts, and innovators</p>
        </div>
      </section>

      {/* Community Stats */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center p-6 bg-neural-800 rounded-lg border border-neural-700 hover:border-brand-500 transition-colors">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-brand-400 mb-1">{stat.number}</div>
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
                  {topMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-neural-700 rounded-lg hover:bg-neural-600 transition-colors cursor-pointer">
                      <div className="text-2xl">{member.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{member.name}</div>
                        <div className="text-xs text-neural-400">{member.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-3 text-neural-400" size={20} />
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
                    <p className="text-neural-400">No discussions found. Be the first to start one!</p>
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
                              {message.isPinned && <span className="text-xs bg-brand-600 px-2 py-1 rounded-full">📌 Pinned</span>}
                            </div>
                            <div className="text-xs text-neural-400">
                              {Math.round((Date.now() - message.timestamp.getTime()) / 60000)} mins ago
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-neural-600 rounded-full text-xs font-medium text-neural-200">
                          {categories.find(c => c.id === message.category)?.icon} {message.category}
                        </div>
                      </div>
                      <p className="text-neural-100 mb-4 whitespace-pre-wrap">{message.content}</p>
                      <div className="flex gap-6 text-sm text-neural-400">
                        <button 
                          onClick={() => handleLike(message.id)}
                          className={`flex items-center gap-2 transition-colors ${
                            likedMessages.has(message.id) ? 'text-brand-400' : 'hover:text-brand-400'
                          }`}
                        >
                          <Heart size={16} fill={likedMessages.has(message.id) ? 'currentColor' : 'none'} /> {message.likes}
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
              <form onSubmit={handleSendMessage} className="bg-neural-800 p-6 rounded-lg border border-neural-700">
                <div className="mb-4">
                  <label className="text-sm text-neural-300 mb-2 block">Category</label>
                  <div className="flex gap-2 flex-wrap">
                    {['general', 'agents', 'ideas', 'help'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat as any)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedCategory === cat
                            ? 'bg-brand-600 text-white'
                            : 'bg-neural-700 text-neural-300 hover:bg-neural-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
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
          <h2 className="text-3xl font-bold mb-8 text-center">Community Guidelines</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neural-800 p-6 rounded-lg border border-neural-700">
              <div className="text-3xl mb-3">🤝</div>
              <h3 className="font-bold mb-2">Be Respectful</h3>
              <p className="text-neural-400 text-sm">Treat all community members with respect and kindness. Healthy disagreements are welcome.</p>
            </div>
            <div className="bg-neural-800 p-6 rounded-lg border border-neural-700">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-bold mb-2">Share Knowledge</h3>
              <p className="text-neural-400 text-sm">Help others by sharing your experience and insights. We all grow together.</p>
            </div>
            <div className="bg-neural-800 p-6 rounded-lg border border-neural-700">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">Stay On Topic</h3>
              <p className="text-neural-400 text-sm">Keep discussions relevant to One Last AI and our platform community.</p>
            </div>
            <div className="bg-neural-800 p-6 rounded-lg border border-neural-700">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-bold mb-2">Be Authentic</h3>
              <p className="text-neural-400 text-sm">Share genuine experiences and constructive feedback to help our community thrive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Stats Section */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8 text-center">Community Activity</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-neural-800 rounded-lg border border-neural-700">
              <div className="text-5xl font-bold text-brand-400 mb-2">892</div>
              <p className="text-neural-300">Posts This Week</p>
              <div className="mt-4 h-1 bg-neural-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-600 to-accent-600 w-3/4"></div>
              </div>
            </div>
            <div className="text-center p-8 bg-neural-800 rounded-lg border border-neural-700">
              <div className="text-5xl font-bold text-brand-400 mb-2">3.2K</div>
              <p className="text-neural-300">Active Replies</p>
              <div className="mt-4 h-1 bg-neural-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-600 to-accent-600 w-4/5"></div>
              </div>
            </div>
            <div className="text-center p-8 bg-neural-800 rounded-lg border border-neural-700">
              <div className="text-5xl font-bold text-brand-400 mb-2">156</div>
              <p className="text-neural-300">New Members</p>
              <div className="mt-4 h-1 bg-neural-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-600 to-accent-600 w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}