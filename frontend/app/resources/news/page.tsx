'use client'

import Link from 'next/link'
import { Newspaper, Zap, TrendingUp, Award, Calendar, ArrowRight, MessageSquare, Info } from 'lucide-react'
import { useState } from 'react'
import { allAgents } from '@/app/agents/registry'

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [showAgentDetails, setShowAgentDetails] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [showArticleModal, setShowArticleModal] = useState(false)

  // Build Available Agents from the central registry (18 total)
  const agentSlugs: string[] = [
    'ben-sega',
    'bishop-burger',
    'chef-biew',
    'chess-player',
    'comedy-king',
    'drama-queen',
    'einstein',
    'emma-emotional',
    'fitness-guru',
    'julie-girlfriend',
    'knight-logic',
    'lazy-pawn',
    'mrs-boss',
    'nid-gaming',
    'professor-astrology',
    'rook-jokey',
    'tech-wizard',
    'travel-buddy'
  ]

  const availableAgents = agentSlugs
    .map(id => allAgents.find(a => a.id === id))
    .filter(Boolean)
    .map((a: any, i: number) => ({
      key: `${a.id}-${i}`,
      id: a.id,
      name: a.name,
      emoji: a?.details?.icon || '🤖',
      description: a.description,
      path: `/agents/${a.id}`,
      specialties: a?.personality?.specialties || [],
      details: a?.details?.sections || []
    }))

  // Coming Soon Agents (40-50)
  const comingSoonAgents = [
    { id: 1, name: 'Quantum Einstein', emoji: '⚛️', description: 'Quantum Physics Specialist' },
    { id: 2, name: 'Marketing Maven', emoji: '📢', description: 'Marketing Strategy Expert' },
    { id: 3, name: 'Financial Advisor Pro', emoji: '💼', description: 'Investment & Finance Expert' },
    { id: 4, name: 'Legal Eagle', emoji: '⚖️', description: 'Legal Advice Specialist' },
    { id: 5, name: 'Health Guru', emoji: '🏥', description: 'Medical Information Expert' },
    { id: 6, name: 'Design Master', emoji: '🎨', description: 'UI/UX Design Expert' },
    { id: 7, name: 'Yoga Master', emoji: '🧘', description: 'Meditation & Yoga Guide' },
    { id: 8, name: 'Music Producer', emoji: '🎵', description: 'Music & Sound Expert' },
    { id: 9, name: 'Photography Pro', emoji: '📸', description: 'Photography Tips' },
    { id: 10, name: 'Writing Wizard', emoji: '✍️', description: 'Content Writing Expert' },
    { id: 11, name: 'History Scholar', emoji: '📚', description: 'Historical Knowledge' },
    { id: 12, name: 'Language Master', emoji: '🌍', description: 'Language Learning' },
    { id: 13, name: 'Poetry Poet', emoji: '🖋️', description: 'Poetry & Literature' },
    { id: 14, name: 'Movie Critic', emoji: '🎬', description: 'Film & Entertainment' },
    { id: 15, name: 'Sports Analyst', emoji: '⚽', description: 'Sports News & Analysis' },
    { id: 16, name: 'Weather Wizard', emoji: '🌦️', description: 'Weather & Climate Expert' },
    { id: 17, name: 'Car Enthusiast', emoji: '🚗', description: 'Automotive Expert' },
    { id: 18, name: 'Fashion Guru', emoji: '👗', description: 'Fashion & Style Advisor' },
    { id: 19, name: 'Architecture Expert', emoji: '🏛️', description: 'Building & Design Expert' },
    { id: 20, name: 'Astronomy Ace', emoji: '🌌', description: 'Space Science Expert' },
    { id: 21, name: 'Gardening Guide', emoji: '🌿', description: 'Plant Care Expert' },
    { id: 22, name: 'Pet Companion', emoji: '🐕', description: 'Pet Care Advisor' },
    { id: 23, name: 'Coffee Connoisseur', emoji: '☕', description: 'Coffee Expert' },
    { id: 24, name: 'Wine Sommelier', emoji: '🍷', description: 'Wine & Beverages' },
    { id: 25, name: 'Sustainability Expert', emoji: '♻️', description: 'Environmental Expert' },
    { id: 26, name: 'Robotics Engineer', emoji: '🤖', description: 'Robotics & Automation' },
    { id: 27, name: 'Data Scientist', emoji: '📊', description: 'Data Analytics Expert' },
    { id: 28, name: 'Cloud Architect', emoji: '☁️', description: 'Cloud Computing Expert' },
    { id: 29, name: 'Cybersecurity Guard', emoji: '🔐', description: 'Security Expert' },
    { id: 30, name: 'DevOps Master', emoji: '⚙️', description: 'DevOps Specialist' },
    { id: 31, name: 'Mobile Developer', emoji: '📱', description: 'App Development Expert' },
    { id: 32, name: 'Web Designer', emoji: '💻', description: 'Web Development' },
    { id: 33, name: 'Database Pro', emoji: '🗄️', description: 'Database Management' },
    { id: 34, name: 'AI Researcher', emoji: '🤖', description: 'AI & Machine Learning' },
    { id: 35, name: 'Crypto Expert', emoji: '₿', description: 'Cryptocurrency Advisor' },
    { id: 36, name: 'Startup Coach', emoji: '🚀', description: 'Entrepreneurship Guide' },
    { id: 37, name: 'Career Counselor', emoji: '💼', description: 'Career Development' },
    { id: 38, name: 'Lifestyle Coach', emoji: '🌟', description: 'Personal Development' },
    { id: 39, name: 'Parenting Expert', emoji: '👨‍👩‍👧‍👦', description: 'Parenting Advice' },
    { id: 40, name: 'Education Tutor', emoji: '📖', description: 'Learning & Tutoring' },
    { id: 41, name: 'Philosophy Thinker', emoji: '🤔', description: 'Philosophy Expert' },
    { id: 42, name: 'Psychology Analyst', emoji: '🧠', description: 'Psychology & Mind' },
    { id: 43, name: 'Nutrition Specialist', emoji: '🥗', description: 'Diet & Nutrition' },
    { id: 44, name: 'Meditation Guide', emoji: '🙏', description: 'Mindfulness Expert' },
    { id: 45, name: 'Adventure Seeker', emoji: '⛰️', description: 'Adventure & Exploration' },
  ]

  const categories = [
    { id: 'all', label: '📰 All News', icon: Newspaper },
    { id: 'product', label: '🚀 Product Updates', icon: Zap },
    { id: 'industry', label: '📊 Industry News', icon: TrendingUp },
    { id: 'awards', label: '🏆 Awards & Recognition', icon: Award }
  ]

  const newsArticles = [
    {
      id: 1,
      title: 'One Last AI Launches New $1/Day Testing Plan',
      description: 'We\'re excited to announce our affordable new testing plan, allowing users to evaluate all features for just $1 per day before committing to larger subscriptions.',
      category: 'product',
      date: 'October 22, 2025',
      image: '🚀',
      readTime: '3 min read',
      featured: true,
      content: `We\'re making it easier than ever to try our agents. With the new $1/day testing plan,\n\n- Get full access to core features\n- Test any agent at your own pace\n- Upgrade or cancel any time\n\nThis plan is perfect for experimenting with agent workflows, evaluating voice and chat experiences, and validating your use cases before moving to higher tiers.`
    },
    {
      id: 2,
      title: 'AI Adoption Reaches All-Time High in Enterprise',
      description: 'A new industry report shows that 78% of enterprises have adopted some form of AI technology, with chatbots and intelligent agents leading the charge.',
      category: 'industry',
      date: 'October 20, 2025',
      image: '📈',
      readTime: '5 min read',
      featured: true,
      content: `The latest industry data shows enterprise AI adoption at unprecedented levels.\n\nTop drivers include:\n- Intelligent customer support agents\n- Automated content workflows\n- Real-time analytics and insights\n\nOrganizations report faster response times, improved customer satisfaction, and reduced operational costs.`
    },
    {
      id: 3,
      title: 'One Last AI Recognized as Top AI Platform',
      description: 'We\'re thrilled to announce that One Last AI has been recognized by TechCrunch as one of the top 10 emerging AI platforms for 2025.',
      category: 'awards',
      date: 'October 18, 2025',
      image: '🏆',
      readTime: '2 min read',
      featured: true,
      content: `We\'re honored to be recognized for product innovation, real-time community features, and voice-enabled experiences.\n\nThe judges highlighted:\n- Agent catalog breadth\n- Production-ready App Router APIs\n- Robust infrastructure behind Cloudflare with SSE support`
    },
    {
      id: 4,
      title: 'New Voice Integration Features Now Available',
      description: 'We\'ve rolled out enhanced voice capabilities for all agents, enabling more natural and human-like conversations with users.',
      category: 'product',
      date: 'October 15, 2025',
      image: '🎙️',
      readTime: '4 min read',
      featured: false,
      content: `Voice just got better: improved TTS quality, expressive styles, and lower latency.\n\nWhat\'s new:\n- Emotional TTS presets\n- Faster streaming responses\n- Fine-grained voice controls`
    },
    {
      id: 5,
      title: 'The Future of Customer Service with AI',
      description: 'Industry experts discuss how AI-powered agents are transforming customer service and improving customer satisfaction scores.',
      category: 'industry',
      date: 'October 12, 2025',
      image: '💬',
      readTime: '6 min read',
      featured: false,
      content: `AI agents are redefining service with 24/7 availability, instant routing, and personalized responses.\n\nKey takeaways:\n- Augment, don\'t replace, human teams\n- Use analytics to continuously improve\n- Ensure privacy and security from day one`
    },
    {
      id: 6,
      title: 'One Last AI Community Crosses 50,000 Members',
      description: 'Our community has grown to over 50,000 active members sharing insights, best practices, and innovative use cases.',
      category: 'product',
      date: 'October 10, 2025',
      image: '👥',
      readTime: '3 min read',
      featured: false,
      content: `Thank you to our growing global community!\n\nWhat\'s happening:\n- Real-time presence and metrics\n- Weekly AMAs with the dev team\n- Community-driven feature requests`
    },
    {
      id: 7,
      title: 'Natural Language Processing Breakthrough',
      description: 'Researchers announce major advancements in NLP technology, enabling more accurate understanding of human intent and context.',
      category: 'industry',
      date: 'October 8, 2025',
      image: '🧠',
      readTime: '7 min read',
      featured: false,
      content: `Emerging architectures improve context retention, reasoning, and controllability. Expect better performance on complex tasks with fewer tokens.`
    },
    {
      id: 8,
      title: 'One Last AI Security Certification Achieved',
      description: 'We\'re proud to announce that One Last AI has achieved SOC 2 Type II certification, ensuring the highest security standards.',
      category: 'awards',
      date: 'October 5, 2025',
      image: '🔒',
      readTime: '3 min read',
      featured: false,
      content: `Security first: SOC 2 Type II compliance validates our processes, monitoring, and controls across the platform.`
    }
  ]

  const filteredArticles = selectedCategory === 'all' 
    ? newsArticles 
    : newsArticles.filter(article => article.category === selectedCategory)

  const featuredArticles = filteredArticles.filter(article => article.featured)
  const regularArticles = filteredArticles.filter(article => !article.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">
      {/* Header */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Newspaper className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Latest News</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Stay updated with the latest news, product announcements, and industry insights about AI and One Last AI.
          </p>
        </div>
      </section>

      {/* Agent Updates Hero Section */}
      <section className="section-padding border-b border-neural-700 bg-gradient-to-r from-brand-600/10 to-accent-600/10">
        <div className="container-custom text-center max-w-3xl">
          <div className="mb-4 text-5xl">🤖</div>
          <h2 className="text-4xl font-bold mb-4">Discover Our AI Agents</h2>
          <p className="text-lg text-neural-300 mb-6">
            One Last AI offers a diverse collection of AI agents designed to help you with virtually anything. From scientific experts to lifestyle coaches, our agents are ready to assist you. Explore our current agents and stay tuned for exciting new additions coming soon!
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-center">
            <div>
              <p className="text-3xl font-bold text-brand-400">{agentSlugs.length}</p>
              <p className="text-sm text-neural-300">Available Agents</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent-400">{comingSoonAgents.length}</p>
              <p className="text-sm text-neural-300">Coming Soon</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-400">{agentSlugs.length + comingSoonAgents.length}</p>
              <p className="text-sm text-neural-300">Total Agents</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="section-padding border-b border-neural-700">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/50'
                      : 'bg-neural-800 text-neural-300 hover:text-white hover:bg-neural-700 border border-neural-700'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-8 pb-4 border-b border-neural-700">Featured News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <div key={article.id} className="group bg-gradient-to-br from-neural-800 to-neural-700 border border-neural-700 hover:border-brand-600 rounded-lg overflow-hidden transition-all hover:shadow-xl hover:shadow-brand-600/20">
                  {/* Image Area */}
                  <div className="h-40 bg-gradient-to-br from-brand-600/20 to-accent-600/20 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">
                    {article.image}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-neural-400 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{article.date}</span>
                      <span className="text-xs bg-neural-700 px-2 py-1 rounded text-neural-300">
                        {article.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold mb-2 group-hover:text-brand-400 transition line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-neural-400 text-sm mb-4 line-clamp-3">
                      {article.description}
                    </p>

                    <button
                      className="flex items-center text-brand-400 group-hover:translate-x-1 transition-transform"
                      onClick={() => { setSelectedArticle(article); setShowArticleModal(true); }}
                      aria-label={`Read more about ${article.title}`}
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="section-padding border-t border-neural-700">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8 pb-4 border-b border-neural-700">
            {selectedCategory === 'all' ? 'All News' : 'Latest News'}
          </h2>
          
          {regularArticles.length > 0 ? (
            <div className="space-y-4">
              {regularArticles.map((article) => (
                <div key={article.id} className="group bg-gradient-to-r from-neural-800 to-neural-700 border border-neural-700 hover:border-brand-600 rounded-lg p-6 transition-all hover:shadow-lg hover:shadow-brand-600/20">
                  <div className="flex gap-6 items-start">
                    {/* Icon */}
                    <div className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {article.image}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-neural-400 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{article.date}</span>
                        <span className="text-xs bg-neural-700 px-2 py-1 rounded text-neural-300">
                          {article.readTime}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold mb-2 group-hover:text-brand-400 transition line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-neural-400 text-sm mb-3 line-clamp-2">
                        {article.description}
                      </p>

                      <button
                        className="flex items-center text-brand-400 group-hover:translate-x-1 transition-transform"
                        onClick={() => { setSelectedArticle(article); setShowArticleModal(true); }}
                        aria-label={`Read article ${article.title}`}
                      >
                        Read Article
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neural-400 text-lg">No news articles in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Article Modal (floating, scrollable) */}
      {showArticleModal && selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowArticleModal(false)} />

          {/* Modal */}
          <div className="relative bg-neural-800 border border-neural-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-neural-700 bg-neural-800/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedArticle.image}</div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
                  <p className="text-neural-400 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {selectedArticle.date}
                    <span className="text-xs bg-neural-700 px-2 py-1 rounded text-neural-300 ml-2">{selectedArticle.readTime}</span>
                  </p>
                </div>
              </div>
              <button aria-label="Close" onClick={() => setShowArticleModal(false)} className="px-3 py-2 rounded-lg bg-neural-700 hover:bg-neural-600 border border-neural-600 text-sm">
                Close
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[calc(85vh-64px)]">
              <p className="whitespace-pre-line text-neural-200 leading-relaxed">{selectedArticle.content || selectedArticle.description}</p>

              {/* Bottom actions including Close button */}
              <div className="pt-4 border-t border-neural-700 flex justify-end">
                <button onClick={() => setShowArticleModal(false)} className="px-4 py-2 bg-neural-700 hover:bg-neural-600 border border-neural-600 rounded-lg text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Agents Section */}
      <section className="section-padding border-t border-neural-700">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8 pb-4 border-b border-neural-700">Available Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableAgents.map((agent) => (
              <div key={agent.id} className="group bg-gradient-to-br from-neural-800 to-neural-700 border border-neural-700 hover:border-brand-600 rounded-lg p-6 transition-all hover:shadow-xl hover:shadow-brand-600/20">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{agent.emoji}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-brand-400 transition">{agent.name}</h3>
                <p className="text-neural-400 text-sm mb-6">{agent.description}</p>
                <div className="flex gap-2">
                  <Link href={agent.path} className="flex-1 bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg font-semibold text-center transition flex items-center justify-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4" />
                    Launch Agent
                  </Link>
                  <button onClick={() => {
                    setSelectedAgent(agent)
                    setShowAgentDetails(true)
                  }} className="bg-neural-700 hover:bg-neural-600 border border-neural-600 px-4 py-2 rounded-lg transition flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Agents Section */}
      <section className="section-padding border-t border-neural-700">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-8 pb-4 border-b border-neural-700">Coming Soon Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoonAgents.map((agent) => (
              <div key={agent.id} className="group bg-gradient-to-br from-neural-800 to-neural-700 border border-neural-700 hover:border-accent-600 rounded-lg p-6 transition-all hover:shadow-xl hover:shadow-accent-600/20 opacity-75 hover:opacity-100">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{agent.emoji}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent-400 transition">{agent.name}</h3>
                <p className="text-neural-400 text-sm mb-6">{agent.description}</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-accent-600/50 text-accent-300 px-4 py-2 rounded-lg font-semibold text-center cursor-not-allowed opacity-75 text-sm">
                    Available Soon
                  </button>
                  <button onClick={() => {
                    setSelectedAgent(agent)
                    setShowAgentDetails(true)
                  }} className="bg-neural-700 hover:bg-neural-600 border border-neural-600 px-4 py-2 rounded-lg transition flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Details Modal (floating with internal scroll) */}
      {showAgentDetails && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAgentDetails(false)} />

          {/* Modal */}
          <div className="relative bg-neural-800 border border-neural-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-neural-700 bg-neural-800/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{selectedAgent.emoji}</div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                  <p className="text-neural-400 text-sm">{selectedAgent.description}</p>
                </div>
              </div>
              <button aria-label="Close" onClick={() => setShowAgentDetails(false)} className="px-3 py-2 rounded-lg bg-neural-700 hover:bg-neural-600 border border-neural-600 text-sm">
                Close
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[calc(85vh-64px)]">
              {/* Specialties */}
              {selectedAgent.specialties?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.specialties.map((s: string, idx: number) => (
                      <span key={idx} className="text-xs bg-neural-700 border border-neural-600 px-2 py-1 rounded-full text-neural-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* How they work / Details */}
              {selectedAgent.details?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">How this agent works</h3>
                  <div className="space-y-4">
                    {selectedAgent.details.map((section: any, idx: number) => (
                      <div key={idx} className="bg-neural-700/40 border border-neural-600 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl" aria-hidden>{section.icon}</span>
                          <h4 className="font-semibold">{section.title}</h4>
                        </div>
                        {section.items?.length ? (
                          <ul className="list-disc list-inside text-neural-300 space-y-1">
                            {section.items.map((item: string, i: number) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-neural-300">{section.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Getting Started */}
              <div>
                <h3 className="text-lg font-semibold mb-2">How to Get Started</h3>
                <ol className="list-decimal list-inside text-neural-300 space-y-1">
                  <li>Open the agent and try a conversation using the Launch button.</li>
                  <li>Create an account or sign in when prompted.</li>
                  <li>Choose a subscription to unlock full features. You can manage or cancel anytime.</li>
                </ol>
                <div className="mt-3 flex gap-3">
                  <Link href="/pricing" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-sm font-semibold">View Plans</Link>
                  <Link href={selectedAgent.path} className="px-4 py-2 bg-neural-700 hover:bg-neural-600 border border-neural-600 rounded-lg text-sm">Launch Agent</Link>
                </div>
                <p className="text-yellow-300 text-sm mt-3">Pro tip: Our lowest subscription is just $1 — test an agent before committing to a larger plan.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Section */}
      <section className="section-padding border-t border-neural-700" style={{ backgroundColor: 'rgba(224, 242, 254, 0.05)' }}>
        <div className="container-custom max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-neural-300 mb-6">
            Subscribe to our newsletter to get the latest news, product updates, and industry insights delivered directly to your inbox.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-neural-800 border border-neural-700 rounded-lg focus:outline-none focus:border-brand-600 text-white placeholder-neural-500"
            />
            <button className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition">
              Subscribe
            </button>
          </div>
          <p className="text-neural-400 text-sm mt-3">No spam, just quality news and updates.</p>
        </div>
      </section>

      {/* Related Links */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 pb-4 border-b border-neural-700">Explore More</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/resources/blog" className="group bg-neural-800 border border-neural-700 hover:border-brand-600 p-6 rounded-lg transition">
              <p className="text-3xl mb-3">📖</p>
              <h3 className="text-lg font-bold mb-2 group-hover:text-brand-400 transition">Read Blog Articles</h3>
              <p className="text-neural-400 text-sm mb-4">Explore in-depth articles on AI, agents, and technology trends.</p>
              <div className="flex items-center text-brand-400 group-hover:translate-x-1 transition-transform">
                Read Blog
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </Link>

            <Link href="/community" className="group bg-neural-800 border border-neural-700 hover:border-brand-600 p-6 rounded-lg transition">
              <p className="text-3xl mb-3">👥</p>
              <h3 className="text-lg font-bold mb-2 group-hover:text-brand-400 transition">Join Community</h3>
              <p className="text-neural-400 text-sm mb-4">Connect with other users and share insights with the community.</p>
              <div className="flex items-center text-brand-400 group-hover:translate-x-1 transition-transform">
                Go to Community
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </Link>

            <Link href="/resources/documentation" className="group bg-neural-800 border border-neural-700 hover:border-brand-600 p-6 rounded-lg transition">
              <p className="text-3xl mb-3">📚</p>
              <h3 className="text-lg font-bold mb-2 group-hover:text-brand-400 transition">View Documentation</h3>
              <p className="text-neural-400 text-sm mb-4">Check out our comprehensive documentation and guides.</p>
              <div className="flex items-center text-brand-400 group-hover:translate-x-1 transition-transform">
                Read Docs
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
