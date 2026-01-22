'use client'

import { useState } from 'react'
import AgentSettingsModal from '../../../components/AgentSettingsModal'
import { AgentConfig } from '../types'

export default function AgentSettingsDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Sample agent configuration for demonstration
  const [sampleAgent, setSampleAgent] = useState<AgentConfig>({
    id: 'bishop-burger',
    name: 'Bishop Burger',
    specialty: 'Culinary Arts',
    description: 'Creative chef with spiritual wisdom about food and cooking. Combines culinary expertise with mindful approach to nourishment.',
    avatarUrl: 'https://picsum.photos/seed/bishop-burger/200',
    color: 'from-orange-500 to-amber-600',
    category: 'Creative',
    tags: ['Cooking', 'Recipes', 'Food', 'Creativity', 'Mindfulness'],
    personality: {
      traits: ['Creative', 'Spiritual', 'Wise', 'Nurturing', 'Innovative'],
      responseStyle: 'Warm and encouraging with spiritual insights about food and nourishment',
      greetingMessage: '🍔 Blessings and burgers, my friend! I\'m Bishop Burger, where culinary arts meet spiritual wisdom! Ready to create something deliciously divine?',
      specialties: ['Creative Cooking', 'Recipe Development', 'Food Philosophy', 'Culinary Techniques'],
      conversationStarters: [
        'Teach me to cook creatively',
        'I need a healthy recipe',
         'What\'s the philosophy of food?',
        'How do I cook with intention?'
      ]
    },
    prompts: {
      systemPrompt: 'You are Bishop Burger, a creative chef with spiritual wisdom about food and cooking. You approach every culinary question with both practical expertise and philosophical insight about nourishment and the sacred act of preparing food.',
      contextPrompt: 'Combine culinary expertise with spiritual insights about nourishment. Think diagonally about food - connecting unexpected flavors, cultures, and cooking techniques while maintaining a mindful, loving approach to food preparation.',
      exampleResponses: [
        {
          input: 'How do I make a simple pasta dish special?',
          output: '✨ Ah, transforming the simple into the sacred! Start with intention - as you boil the water, let it represent life\'s potential. Choose pasta that speaks to you, perhaps a spiral shape to represent life\'s journey. Sauté garlic slowly, letting its aroma become a meditation. Add fresh herbs - they\'re nature\'s blessing to our plate. Remember, cooking is love made visible! 🍝🙏'
        }
      ]
    },
    settings: {
      maxTokens: 400,
      temperature: 0.7,
      enabled: true,
      premium: false
    }
  })

  const handleSaveAgent = (updatedAgent: AgentConfig) => {
    setSampleAgent(updatedAgent)
    console.log('Agent settings saved:', updatedAgent)
    // Here you would typically save to your backend
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Agent Settings Modal Demo</h1>
          <p className="text-lg text-gray-600">
            Experience the refined and visually appealing Agent Settings Modal interface
          </p>
        </div>

        {/* Agent Preview Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <img 
              src={sampleAgent.avatarUrl} 
              alt={sampleAgent.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{sampleAgent.name}</h2>
              <p className="text-gray-600">{sampleAgent.specialty}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sampleAgent.category === 'Creative' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {sampleAgent.category}
                </span>
                {sampleAgent.settings.enabled ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Enabled
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    Disabled
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4">{sampleAgent.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {sampleAgent.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">AI Settings</h4>
              <p className="text-sm text-gray-600">Max Tokens: {sampleAgent.settings.maxTokens}</p>
              <p className="text-sm text-gray-600">Temperature: {sampleAgent.settings.temperature}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Personality</h4>
              <p className="text-sm text-gray-600">{sampleAgent.personality.traits.slice(0, 3).join(', ')}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
              <p className="text-sm text-gray-600">{sampleAgent.personality.specialties.length} areas</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            Open Agent Settings
          </button>
        </div>

        {/* Features Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">✨ Key Features</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Smooth transitions and animations</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Tabbed interface for organized settings</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Auto-expanding textareas</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Custom styled range sliders</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Unsaved changes detection</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🎨 Design Highlights</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Consistent with app theme</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Responsive design for all devices</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Clear visual hierarchy</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Intuitive user experience</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Accessibility focused</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Agent Settings Modal */}
      <AgentSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        agent={sampleAgent}
        onSave={handleSaveAgent}
      />
    </div>
  )
}