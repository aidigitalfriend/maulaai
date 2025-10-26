'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function TutorialsPage() {
  const [selectedAgent, setSelectedAgent] = useState('einstein')

  const agents = [
    {
      id: 'einstein',
      name: 'Einstein',
      avatar: '🧠',
      description: 'Physics & Mathematics Expert',
      tutorial: {
        features: [
          'Advanced physics calculations',
          'Mathematical theorem explanation',
          'Scientific research guidance',
          'Problem-solving methodology'
        ],
        specialties: [
          'Quantum mechanics',
          'Relativity theory',
          'Complex mathematics',
          'Scientific reasoning'
        ],
        howItWorks: 'Einstein specializes in providing in-depth explanations of complex physics and mathematics concepts. Ask questions about theories, equations, or scientific principles and receive expert-level insights.',
        useCases: [
          'Academic learning and tutoring',
          'Research assistance',
          'Homework help',
          'Scientific concept clarification'
        ],
        example: 'Ask: "Explain the theory of relativity" or "Help me solve this differential equation"'
      }
    },
    {
      id: 'comedy-king',
      name: 'Comedy King',
      avatar: '🎭',
      description: 'Humor & Entertainment',
      tutorial: {
        features: [
          'Joke generation and storytelling',
          'Comedy timing and delivery',
          'Humorous content creation',
          'Entertainment recommendations'
        ],
        specialties: [
          'Stand-up comedy style',
          'Witty remarks and puns',
          'Funny story creation',
          'Comedy writing'
        ],
        howItWorks: 'Comedy King brings humor and entertainment to conversations. Whether you need a laugh, want to learn about comedy, or need funny content, this agent delivers laughs and entertainment.',
        useCases: [
          'Entertainment and fun conversations',
          'Joke writing and creation',
          'Comedy content creation',
          'Lighthearted discussions'
        ],
        example: 'Ask: "Tell me a funny joke" or "Create a comedic story about..."'
      }
    },
    {
      id: 'tech-wizard',
      name: 'Tech Wizard',
      avatar: '💻',
      description: 'Technology & Programming',
      tutorial: {
        features: [
          'Code review and debugging',
          'Programming language expertise',
          'Technology recommendations',
          'Development best practices'
        ],
        specialties: [
          'Full-stack development',
          'Cloud technologies',
          'DevOps and deployment',
          'Software architecture'
        ],
        howItWorks: 'Tech Wizard is your go-to resource for all programming and technology questions. From debugging code to architectural decisions, get expert guidance on technology topics.',
        useCases: [
          'Code development assistance',
          'Bug fixing and debugging',
          'Technology selection',
          'Development mentoring'
        ],
        example: 'Ask: "How do I implement this feature?" or "Debug this code snippet"'
      }
    },
    {
      id: 'chef-biew',
      name: 'Chef Biew',
      avatar: '👨‍🍳',
      description: 'Cooking & Recipes',
      tutorial: {
        features: [
          'Recipe suggestions and guidance',
          'Cooking technique explanation',
          'Ingredient substitutions',
          'Nutritional information'
        ],
        specialties: [
          'International cuisines',
          'Dietary accommodations',
          'Meal planning',
          'Cooking methodology'
        ],
        howItWorks: 'Chef Biew helps you explore culinary arts. Get recipes, cooking tips, dietary guidance, and learn about different cuisines from around the world.',
        useCases: [
          'Recipe discovery',
          'Cooking instruction',
          'Dietary meal planning',
          'Culinary learning'
        ],
        example: 'Ask: "What can I make with these ingredients?" or "Teach me how to make pasta from scratch"'
      }
    },
    {
      id: 'fitness-guru',
      name: 'Fitness Guru',
      avatar: '💪',
      description: 'Fitness & Health',
      tutorial: {
        features: [
          'Workout planning and guidance',
          'Exercise form and technique',
          'Nutrition and diet advice',
          'Health and wellness tips'
        ],
        specialties: [
          'Strength training',
          'Cardio fitness',
          'Flexibility and mobility',
          'Holistic health'
        ],
        howItWorks: 'Fitness Guru provides personalized fitness and health guidance. Get workout plans, exercise instructions, nutritional advice, and motivation for your fitness journey.',
        useCases: [
          'Fitness training plans',
          'Exercise instruction',
          'Health coaching',
          'Wellness motivation'
        ],
        example: 'Ask: "Create a workout plan for me" or "How do I do proper form for squats?"'
      }
    },
    {
      id: 'travel-buddy',
      name: 'Travel Buddy',
      avatar: '✈️',
      description: 'Travel & Exploration',
      tutorial: {
        features: [
          'Destination recommendations',
          'Travel planning assistance',
          'Cultural insights and tips',
          'Itinerary creation'
        ],
        specialties: [
          'World geography',
          'Cultural experiences',
          'Budget travel',
          'Adventure planning'
        ],
        howItWorks: 'Travel Buddy is your personal travel guide. Discover destinations, plan itineraries, learn about cultures, and get insider tips for amazing travel experiences.',
        useCases: [
          'Travel planning and research',
          'Destination selection',
          'Itinerary creation',
          'Cultural learning'
        ],
        example: 'Ask: "Plan a 5-day trip to Japan" or "What should I see in Barcelona?"'
      }
    },
    {
      id: 'professor-astrology',
      name: 'Professor Astrology',
      avatar: '🔭',
      description: 'Astrology & Zodiac',
      tutorial: {
        features: [
          'Zodiac sign information',
          'Birth chart analysis',
          'Horoscope readings',
          'Astrological guidance'
        ],
        specialties: [
          'Personality traits by sign',
          'Compatibility analysis',
          'Planetary influences',
          'Astrological timing'
        ],
        howItWorks: 'Professor Astrology explores the fascinating world of astrology. Learn about zodiac signs, get horoscope readings, understand planetary influences, and discover astrological insights.',
        useCases: [
          'Zodiac learning',
          'Compatibility checking',
          'Horoscope readings',
          'Astrological curiosity'
        ],
        example: 'Ask: "What does my zodiac sign say about me?" or "Are we compatible?"'
      }
    },
    {
      id: 'julie-girlfriend',
      name: 'Julie Girlfriend',
      avatar: '💕',
      description: 'Relationship Advice',
      tutorial: {
        features: [
          'Relationship guidance',
          'Communication advice',
          'Emotional support',
          'Dating tips'
        ],
        specialties: [
          'Relationship dynamics',
          'Communication techniques',
          'Emotional intelligence',
          'Conflict resolution'
        ],
        howItWorks: 'Julie Girlfriend provides thoughtful relationship advice and support. Get guidance on communication, dating, relationships, and emotional connection.',
        useCases: [
          'Relationship advice',
          'Dating guidance',
          'Communication help',
          'Emotional support'
        ],
        example: 'Ask: "How do I improve my relationship?" or "What should I do about this situation?"'
      }
    },
    {
      id: 'emma-emotional',
      name: 'Emma Emotional',
      avatar: '🤗',
      description: 'Emotional Support',
      tutorial: {
        features: [
          'Emotional listening and support',
          'Stress management techniques',
          'Coping strategies',
          'Mental wellness guidance'
        ],
        specialties: [
          'Empathetic conversation',
          'Anxiety management',
          'Self-care routines',
          'Emotional wellness'
        ],
        howItWorks: 'Emma Emotional provides compassionate emotional support. Talk through your feelings, get coping strategies, and receive guidance on emotional wellness.',
        useCases: [
          'Emotional support and listening',
          'Stress and anxiety management',
          'Self-care guidance',
          'Wellness coaching'
        ],
        example: 'Ask: "I\'m feeling overwhelmed, can you help?" or "What are some self-care tips?"'
      }
    },
    {
      id: 'mrs-boss',
      name: 'Mrs Boss',
      avatar: '📊',
      description: 'Business & Management',
      tutorial: {
        features: [
          'Business strategy advice',
          'Management techniques',
          'Leadership guidance',
          'Decision-making frameworks'
        ],
        specialties: [
          'Strategic planning',
          'Team management',
          'Business growth',
          'Executive decision-making'
        ],
        howItWorks: 'Mrs Boss provides expert business and management guidance. Get strategic advice, leadership coaching, and business insights from an experienced perspective.',
        useCases: [
          'Business planning',
          'Management coaching',
          'Strategic decision-making',
          'Leadership guidance'
        ],
        example: 'Ask: "How do I scale my business?" or "What\'s the best approach for team management?"'
      }
    },
    {
      id: 'bishop-burger',
      name: 'Bishop Burger',
      avatar: '🍔',
      description: 'Food & Cuisine',
      tutorial: {
        features: [
          'Food recommendations',
          'Restaurant suggestions',
          'Food pairing advice',
          'Culinary discussions'
        ],
        specialties: [
          'Cuisine varieties',
          'Food culture',
          'Flavor combinations',
          'Dining experiences'
        ],
        howItWorks: 'Bishop Burger explores the world of food and cuisine. Get restaurant recommendations, food pairing suggestions, and discuss culinary preferences.',
        useCases: [
          'Food discovery',
          'Restaurant recommendations',
          'Dining planning',
          'Culinary discussions'
        ],
        example: 'Ask: "Recommend a good restaurant" or "What should I eat today?"'
      }
    },
    {
      id: 'ben-sega',
      name: 'Ben Sega',
      avatar: '🎮',
      description: 'Gaming & Retro',
      tutorial: {
        features: [
          'Gaming recommendations',
          'Retro game nostalgia',
          'Game strategies and tips',
          'Gaming community insights'
        ],
        specialties: [
          'Classic and retro games',
          'Modern gaming trends',
          'Game design',
          'Gaming culture'
        ],
        howItWorks: 'Ben Sega is your gaming companion. Get game recommendations, retro gaming insights, strategies, and dive into gaming culture and history.',
        useCases: [
          'Game recommendations',
          'Gaming strategy help',
          'Retro gaming nostalgia',
          'Gaming discussions'
        ],
        example: 'Ask: "Recommend a good game for me" or "Tell me about classic Sega games"'
      }
    },
    {
      id: 'rook-jokey',
      name: 'Rook Jokey',
      avatar: '🃏',
      description: 'Humor & Jokes',
      tutorial: {
        features: [
          'Joke telling and humor',
          'Funny observations',
          'Entertainment value',
          'Playful commentary'
        ],
        specialties: [
          'Classic jokes',
          'Wordplay and puns',
          'Funny situations',
          'Comedic timing'
        ],
        howItWorks: 'Rook Jokey brings fun and laughter. Exchange jokes, enjoy humorous conversations, and lighten your mood with entertaining content.',
        useCases: [
          'Entertainment and fun',
          'Joke exchange',
          'Humor appreciation',
          'Lighthearted chat'
        ],
        example: 'Ask: "Tell me something funny" or "Make me laugh"'
      }
    }
  ]

  const selectedAgentData = agents.find(a => a.id === selectedAgent) || agents[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white flex flex-col">
      {/* Header */}
      <section className="section-padding bg-gradient-to-r from-accent-600 to-brand-600 text-white flex-shrink-0">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Agent Tutorials</h1>
          <p className="text-xl opacity-90">Learn how to use each agent and discover their unique capabilities</p>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 container-custom py-8 flex gap-6 overflow-hidden">
        {/* Left Sidebar - Agent List */}
        <div className="w-64 bg-neural-800 rounded-lg border border-neural-700 p-4 overflow-y-auto flex-shrink-0">
          <h3 className="text-sm font-bold text-neural-400 uppercase tracking-wider mb-4">All Agents</h3>
          <div className="space-y-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`w-full text-left px-3 py-2 rounded transition text-sm ${
                  selectedAgent === agent.id
                    ? 'bg-brand-600 text-white'
                    : 'text-neural-300 hover:bg-neural-700'
                }`}
              >
                <span className="mr-2">{agent.avatar}</span>
                {agent.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Tutorial Content */}
        <div className="flex-1 bg-neural-800 rounded-lg border border-neural-700 p-8 overflow-y-auto flex flex-col">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-neural-700">
            <span className="text-5xl">{selectedAgentData.avatar}</span>
            <div>
              <h2 className="text-3xl font-bold">{selectedAgentData.name}</h2>
              <p className="text-neural-300">{selectedAgentData.description}</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-3">How It Works</h3>
            <p className="text-neural-300 leading-relaxed">
              {selectedAgentData.tutorial.howItWorks}
            </p>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-3">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedAgentData.tutorial.features.map((feature, idx) => (
                <div key={idx} className="bg-neural-700 p-3 rounded border border-neural-600">
                  <p className="text-neural-200">
                    <span className="text-green-400 mr-2">✓</span>
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-3">Specialties</h3>
            <ul className="space-y-2">
              {selectedAgentData.tutorial.specialties.map((specialty, idx) => (
                <li key={idx} className="flex items-center text-neural-300">
                  <span className="w-2 h-2 bg-brand-500 rounded-full mr-3"></span>
                  {specialty}
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-3">Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedAgentData.tutorial.useCases.map((useCase, idx) => (
                <div key={idx} className="bg-brand-600 bg-opacity-20 p-3 rounded border border-brand-500 border-opacity-30">
                  <p className="text-neural-200">
                    <span className="text-brand-400 mr-2">→</span>
                    {useCase}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Example */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-3">Try It Out</h3>
            <div className="bg-neural-700 p-4 rounded border border-neural-600">
              <p className="text-neural-300 italic">
                {selectedAgentData.tutorial.example}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-6 border-t border-neural-700">
            <Link
              href={`/agents/${selectedAgentData.id}`}
              className="inline-block px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition"
            >
              Start Using {selectedAgentData.name} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
