'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { BookOpen, ArrowRight, Sparkles, Target, Lightbulb, MessageSquare } from 'lucide-react'

export default function TutorialsPage() {
  const [selectedAgent, setSelectedAgent] = useState('einstein')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current && window.innerWidth < 1024) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedAgent])

  const agents = [
    {
      id: 'einstein',
      name: 'Einstein',
      avatar: '🧠',
      description: 'Physics & Mathematics Expert',
      color: 'from-blue-500 to-cyan-500',
      tutorial: {
        features: ['Advanced physics calculations', 'Mathematical theorem explanation', 'Scientific research guidance', 'Problem-solving methodology'],
        specialties: ['Quantum mechanics', 'Relativity theory', 'Complex mathematics', 'Scientific reasoning'],
        howItWorks: 'Einstein specializes in providing in-depth explanations of complex physics and mathematics concepts. Ask questions about theories, equations, or scientific principles and receive expert-level insights.',
        useCases: ['Academic learning and tutoring', 'Research assistance', 'Homework help', 'Scientific concept clarification'],
        example: 'Ask: "Explain the theory of relativity" or "Help me solve this differential equation"'
      }
    },
    {
      id: 'comedy-king',
      name: 'Comedy King',
      avatar: '🎭',
      description: 'Humor & Entertainment',
      color: 'from-purple-500 to-pink-500',
      tutorial: {
        features: ['Joke generation and storytelling', 'Comedy timing and delivery', 'Humorous content creation', 'Entertainment recommendations'],
        specialties: ['Stand-up comedy style', 'Witty remarks and puns', 'Funny story creation', 'Comedy writing'],
        howItWorks: 'Comedy King brings humor and entertainment to conversations. Whether you need a laugh, want to learn about comedy, or need funny content, this agent delivers laughs and entertainment.',
        useCases: ['Entertainment and fun conversations', 'Joke writing and creation', 'Comedy content creation', 'Lighthearted discussions'],
        example: 'Ask: "Tell me a funny joke" or "Create a comedic story about..."'
      }
    },
    {
      id: 'tech-wizard',
      name: 'Tech Wizard',
      avatar: '💻',
      description: 'Technology & Programming',
      color: 'from-green-500 to-emerald-500',
      tutorial: {
        features: ['Code review and debugging', 'Programming language expertise', 'Technology recommendations', 'Development best practices'],
        specialties: ['Full-stack development', 'Cloud technologies', 'DevOps and deployment', 'Software architecture'],
        howItWorks: 'Tech Wizard is your go-to resource for all programming and technology questions. From debugging code to architectural decisions, get expert guidance on technology topics.',
        useCases: ['Code development assistance', 'Bug fixing and debugging', 'Technology selection', 'Development mentoring'],
        example: 'Ask: "How do I implement this feature?" or "Debug this code snippet"'
      }
    },
    {
      id: 'chef-biew',
      name: 'Chef Biew',
      avatar: '👨‍🍳',
      description: 'Cooking & Recipes',
      color: 'from-orange-500 to-red-500',
      tutorial: {
        features: ['Recipe suggestions and guidance', 'Cooking technique explanation', 'Ingredient substitutions', 'Nutritional information'],
        specialties: ['International cuisines', 'Dietary accommodations', 'Meal planning', 'Cooking methodology'],
        howItWorks: 'Chef Biew helps you explore culinary arts. Get recipes, cooking tips, dietary guidance, and learn about different cuisines from around the world.',
        useCases: ['Recipe discovery', 'Cooking instruction', 'Dietary meal planning', 'Culinary learning'],
        example: 'Ask: "What can I make with these ingredients?" or "Teach me how to make pasta from scratch"'
      }
    },
    {
      id: 'fitness-guru',
      name: 'Fitness Guru',
      avatar: '💪',
      description: 'Fitness & Health',
      color: 'from-red-500 to-rose-500',
      tutorial: {
        features: ['Workout planning and guidance', 'Exercise form and technique', 'Nutrition and diet advice', 'Health and wellness tips'],
        specialties: ['Strength training', 'Cardio fitness', 'Flexibility and mobility', 'Holistic health'],
        howItWorks: 'Fitness Guru provides personalized fitness and health guidance. Get workout plans, exercise instructions, nutritional advice, and motivation for your fitness journey.',
        useCases: ['Fitness training plans', 'Exercise instruction', 'Health coaching', 'Wellness motivation'],
        example: 'Ask: "Create a workout plan for me" or "How do I do proper form for squats?"'
      }
    },
    {
      id: 'travel-buddy',
      name: 'Travel Buddy',
      avatar: '✈️',
      description: 'Travel & Exploration',
      color: 'from-cyan-500 to-blue-500',
      tutorial: {
        features: ['Destination recommendations', 'Travel planning assistance', 'Cultural insights and tips', 'Itinerary creation'],
        specialties: ['World geography', 'Cultural experiences', 'Budget travel', 'Adventure planning'],
        howItWorks: 'Travel Buddy is your personal travel guide. Discover destinations, plan itineraries, learn about cultures, and get insider tips for amazing travel experiences.',
        useCases: ['Travel planning and research', 'Destination selection', 'Itinerary creation', 'Cultural learning'],
        example: 'Ask: "Plan a 5-day trip to Japan" or "What should I see in Barcelona?"'
      }
    },
    {
      id: 'professor-astrology',
      name: 'Professor Astrology',
      avatar: '🔭',
      description: 'Astrology & Zodiac',
      color: 'from-indigo-500 to-purple-500',
      tutorial: {
        features: ['Zodiac sign information', 'Birth chart analysis', 'Horoscope readings', 'Astrological guidance'],
        specialties: ['Personality traits by sign', 'Compatibility analysis', 'Planetary influences', 'Astrological timing'],
        howItWorks: 'Professor Astrology explores the fascinating world of astrology. Learn about zodiac signs, get horoscope readings, understand planetary influences, and discover astrological insights.',
        useCases: ['Zodiac learning', 'Compatibility checking', 'Horoscope readings', 'Astrological curiosity'],
        example: 'Ask: "What does my zodiac sign say about me?" or "Are we compatible?"'
      }
    },
    {
      id: 'julie-girlfriend',
      name: 'Julie Girlfriend',
      avatar: '💕',
      description: 'Relationship Advice',
      color: 'from-pink-500 to-rose-500',
      tutorial: {
        features: ['Relationship guidance', 'Communication advice', 'Emotional support', 'Dating tips'],
        specialties: ['Relationship dynamics', 'Communication techniques', 'Emotional intelligence', 'Conflict resolution'],
        howItWorks: 'Julie Girlfriend provides thoughtful relationship advice and support. Get guidance on communication, dating, relationships, and emotional connection.',
        useCases: ['Relationship advice', 'Dating guidance', 'Communication help', 'Emotional support'],
        example: 'Ask: "How do I improve my relationship?" or "What should I do about this situation?"'
      }
    },
    {
      id: 'emma-emotional',
      name: 'Emma Emotional',
      avatar: '🤗',
      description: 'Emotional Support',
      color: 'from-yellow-500 to-orange-500',
      tutorial: {
        features: ['Emotional listening and support', 'Stress management techniques', 'Coping strategies', 'Mental wellness guidance'],
        specialties: ['Empathetic conversation', 'Anxiety management', 'Self-care routines', 'Emotional wellness'],
        howItWorks: 'Emma Emotional provides compassionate emotional support. Talk through your feelings, get coping strategies, and receive guidance on emotional wellness.',
        useCases: ['Emotional support and listening', 'Stress and anxiety management', 'Self-care guidance', 'Wellness coaching'],
        example: "Ask: \"I'm feeling overwhelmed, can you help?\" or \"What are some self-care tips?\""
      }
    },
    {
      id: 'mrs-boss',
      name: 'Mrs Boss',
      avatar: '📊',
      description: 'Business & Management',
      color: 'from-emerald-500 to-teal-500',
      tutorial: {
        features: ['Business strategy advice', 'Management techniques', 'Leadership guidance', 'Decision-making frameworks'],
        specialties: ['Strategic planning', 'Team management', 'Business growth', 'Executive decision-making'],
        howItWorks: 'Mrs Boss provides expert business and management guidance. Get strategic advice, leadership coaching, and business insights from an experienced perspective.',
        useCases: ['Business planning', 'Management coaching', 'Strategic decision-making', 'Leadership guidance'],
        example: "Ask: \"How do I scale my business?\" or \"What's the best approach for team management?\""
      }
    },
    {
      id: 'bishop-burger',
      name: 'Bishop Burger',
      avatar: '🍔',
      description: 'Food & Cuisine',
      color: 'from-amber-500 to-yellow-500',
      tutorial: {
        features: ['Food recommendations', 'Restaurant suggestions', 'Food pairing advice', 'Culinary discussions'],
        specialties: ['Cuisine varieties', 'Food culture', 'Flavor combinations', 'Dining experiences'],
        howItWorks: 'Bishop Burger explores the world of food and cuisine. Get restaurant recommendations, food pairing suggestions, and discuss culinary preferences.',
        useCases: ['Food discovery', 'Restaurant recommendations', 'Dining planning', 'Culinary discussions'],
        example: 'Ask: "Recommend a good restaurant" or "What should I eat today?"'
      }
    },
    {
      id: 'ben-sega',
      name: 'Ben Sega',
      avatar: '🎮',
      description: 'Gaming & Retro',
      color: 'from-violet-500 to-purple-500',
      tutorial: {
        features: ['Gaming recommendations', 'Retro game nostalgia', 'Game strategies and tips', 'Gaming community insights'],
        specialties: ['Classic and retro games', 'Modern gaming trends', 'Game design', 'Gaming culture'],
        howItWorks: 'Ben Sega is your gaming companion. Get game recommendations, retro gaming insights, strategies, and dive into gaming culture and history.',
        useCases: ['Game recommendations', 'Gaming strategy help', 'Retro gaming nostalgia', 'Gaming discussions'],
        example: 'Ask: "Recommend a good game for me" or "Tell me about classic Sega games"'
      }
    },
    {
      id: 'rook-jokey',
      name: 'Rook Jokey',
      avatar: '🃏',
      description: 'Humor & Jokes',
      color: 'from-teal-500 to-green-500',
      tutorial: {
        features: ['Joke telling and humor', 'Funny observations', 'Entertainment value', 'Playful commentary'],
        specialties: ['Classic jokes', 'Wordplay and puns', 'Funny situations', 'Comedic timing'],
        howItWorks: 'Rook Jokey brings fun and laughter. Exchange jokes, enjoy humorous conversations, and lighten your mood with entertaining content.',
        useCases: ['Entertainment and fun', 'Joke exchange', 'Humor appreciation', 'Lighthearted chat'],
        example: 'Ask: "Tell me something funny" or "Make me laugh"'
      }
    }
  ]

  const selectedAgentData = agents.find(a => a.id === selectedAgent) || agents[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-brand-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Agent Tutorials
          </h1>
          <p className="text-xl text-neural-600 leading-relaxed">
            Learn how to use each agent and discover their unique capabilities
          </p>
        </div>

        {/* Quick Stats */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-brand-50 rounded-lg">
                <div className="text-2xl font-bold text-brand-600">{agents.length}</div>
                <div className="text-xs text-neural-600">AI Agents</div>
              </div>
              <div className="text-center p-4 bg-accent-50 rounded-lg">
                <div className="text-2xl font-bold text-accent-600">Free</div>
                <div className="text-xs text-neural-600">To Try</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">24/7</div>
                <div className="text-xs text-neural-600">Available</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">∞</div>
                <div className="text-xs text-neural-600">Possibilities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Agent List Sidebar */}
          <div className="w-full lg:w-72 bg-white rounded-2xl shadow-sm border border-neural-100 p-4 flex-shrink-0">
            <h3 className="text-sm font-bold text-neural-500 uppercase tracking-wider mb-4 px-2">Select an Agent</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition text-sm flex items-center gap-3 ${
                    selectedAgent === agent.id
                      ? 'bg-brand-600 text-white shadow-lg'
                      : 'text-neural-700 hover:bg-neural-50 border border-transparent hover:border-neural-200'
                  }`}
                >
                  <span className="text-xl">{agent.avatar}</span>
                  <span className="font-medium text-xs sm:text-sm">{agent.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tutorial Content */}
          <div ref={contentRef} className="flex-1 bg-white rounded-2xl shadow-sm border border-neural-100 p-6 md:p-8 scroll-mt-4">
            {/* Agent Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neural-100">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedAgentData.color} flex items-center justify-center`}>
                <span className="text-3xl">{selectedAgentData.avatar}</span>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-neural-800">{selectedAgentData.name}</h2>
                <p className="text-neural-600">{selectedAgentData.description}</p>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-brand-600" />
                <h3 className="text-xl font-bold text-neural-800">How It Works</h3>
              </div>
              <p className="text-neural-600 leading-relaxed bg-brand-50 p-4 rounded-xl border border-brand-100">
                {selectedAgentData.tutorial.howItWorks}
              </p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <h3 className="text-xl font-bold text-neural-800">Key Features</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedAgentData.tutorial.features.map((feature, idx) => (
                  <div key={idx} className="bg-neural-50 p-4 rounded-xl border border-neural-100 flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <p className="text-neural-700">{feature}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-brand-600" />
                <h3 className="text-xl font-bold text-neural-800">Specialties</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedAgentData.tutorial.specialties.map((specialty, idx) => (
                  <span key={idx} className={`px-4 py-2 rounded-full bg-gradient-to-r ${selectedAgentData.color} text-white text-sm font-medium`}>
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-brand-600" />
                <h3 className="text-xl font-bold text-neural-800">Use Cases</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedAgentData.tutorial.useCases.map((useCase, idx) => (
                  <div key={idx} className="bg-accent-50 p-4 rounded-xl border border-accent-100 flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-accent-600 mt-0.5 flex-shrink-0" />
                    <p className="text-neural-700">{useCase}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Example */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-brand-600" />
                <h3 className="text-xl font-bold text-neural-800">Try It Out</h3>
              </div>
              <div className="bg-neural-800 text-white p-4 rounded-xl">
                <p className="italic">{selectedAgentData.tutorial.example}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6 border-t border-neural-100">
              <Link
                href={`/agents/${selectedAgentData.id}`}
                className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${selectedAgentData.color} text-white rounded-xl font-semibold hover:opacity-90 transition shadow-lg`}
              >
                Start Using {selectedAgentData.name}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-brand-600 to-accent-500 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg opacity-90 mb-8">
              Explore all our AI agents and find the perfect companion for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/agents" className="btn-primary bg-white text-brand-600 hover:bg-neural-50">
                Browse All Agents
              </Link>
              <Link href="/pricing" className="btn-primary border-2 border-white bg-transparent hover:bg-white hover:text-brand-600">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
