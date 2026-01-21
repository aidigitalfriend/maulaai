'use client'

import { useState, useEffect } from 'react'
import { Plus, Sparkles, Brain, Zap, Settings, Save, ArrowLeft, Upload } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'

interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  avatar: string
  capabilities: string[]
  pricing: string
}

function AgentCreator() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    personality: '',
    expertise: '',
    avatar: '🤖',
    category: 'general',
    capabilities: [] as string[],
    instructions: '',
    voiceEnabled: false,
    imageEnabled: false
  })

  const [templates] = useState<AgentTemplate[]>([
    {
      id: 'business-assistant',
      name: 'Business Assistant',
      description: 'Helps with business strategy, analysis, and decision making',
      category: 'Business',
      avatar: '💼',
      capabilities: ['Strategic Planning', 'Market Analysis', 'Financial Modeling'],
      pricing: '$15/month'
    },
    {
      id: 'creative-writer',
      name: 'Creative Writer',
      description: 'Assists with creative writing, storytelling, and content creation',
      category: 'Creative',
      avatar: '✍️',
      capabilities: ['Story Writing', 'Content Creation', 'Copywriting'],
      pricing: '$15/month'
    },
    {
      id: 'technical-expert',
      name: 'Technical Expert',
      description: 'Provides technical guidance and programming assistance',
      category: 'Technology',
      avatar: '👨‍💻',
      capabilities: ['Code Review', 'Architecture Design', 'Debugging'],
      pricing: '$15/month'
    },
    {
      id: 'custom-agent',
      name: 'Custom Agent',
      description: 'Build your own unique AI agent from scratch',
      category: 'Custom',
      avatar: '🎨',
      capabilities: ['Fully Customizable'],
      pricing: '$15/month'
    }
  ])

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template.id)
    setAgentData({
      ...agentData,
      name: template.name,
      description: template.description,
      avatar: template.avatar,
      category: template.category.toLowerCase(),
      capabilities: template.capabilities
    })
    setStep(2)
  }

  const handleCustomize = () => {
    if (!selectedTemplate) return
    setStep(3)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call to save agent
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real implementation, make API call to create agent
      console.log('Creating agent:', agentData)
      
      // Redirect to agents page or show success
      // router.push('/agents')
      alert('Agent created successfully! (Demo)')
    } catch (error) {
      console.error('Failed to create agent:', error)
      alert('Failed to create agent. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const availableAvatars = ['🤖', '👨‍💻', '👩‍🔬', '🧠', '⚡', '🎨', '📚', '💡', '🔬', '🎭', '🎯', '💼']
  const categories = ['general', 'business', 'creative', 'technical', 'education', 'entertainment']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/agents" className="p-2 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Agent</h1>
            <p className="text-gray-600">Build your own AI personality with custom capabilities</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= stepNum
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-12 h-1 transition-colors ${
                      step > stepNum ? 'bg-brand-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose a Template</h2>
              <p className="text-gray-600">Start with a pre-built template or create from scratch</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{template.avatar}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-gray-600 mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {template.capabilities.map((capability) => (
                          <span
                            key={capability}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-brand-600">{template.pricing}</span>
                        <span className="text-xs text-gray-500">{template.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedTemplate && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Template</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{agentData.avatar}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{agentData.name}</h3>
                    <p className="text-gray-600">{agentData.description}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {agentData.capabilities.map((capability) => (
                      <span
                        key={capability}
                        className="px-3 py-1 bg-brand-100 text-brand-700 text-sm rounded-full"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Category</h4>
                  <p className="text-gray-600 capitalize">{agentData.category}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCustomize}
                  className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Customize
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Agent</h2>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={agentData.name}
                    onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Enter agent name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    value={agentData.description}
                    onChange={(e) => setAgentData({ ...agentData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    rows={3}
                    placeholder="Describe what your agent does"
                  />
                </div>

                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Avatar</label>
                  <div className="grid grid-cols-6 gap-2">
                    {availableAvatars.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => setAgentData({ ...agentData, avatar })}
                        className={`p-2 text-2xl rounded-lg border-2 transition-colors ${
                          agentData.avatar === avatar
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
                  <select
                    value={agentData.category}
                    onChange={(e) => setAgentData({ ...agentData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personality */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Personality Traits</label>
                  <input
                    type="text"
                    value={agentData.personality}
                    onChange={(e) => setAgentData({ ...agentData, personality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g., Friendly, professional, humorous"
                  />
                </div>

                {/* Expertise */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Area of Expertise</label>
                  <input
                    type="text"
                    value={agentData.expertise}
                    onChange={(e) => setAgentData({ ...agentData, expertise: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g., Marketing strategy, Creative writing, Data analysis"
                  />
                </div>

                {/* Advanced Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Advanced Features</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={agentData.voiceEnabled}
                        onChange={(e) => setAgentData({ ...agentData, voiceEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">Voice Conversations</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={agentData.imageEnabled}
                        onChange={(e) => setAgentData({ ...agentData, imageEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="ml-2 text-sm text-gray-900">Image Generation</span>
                    </label>
                  </div>
                </div>

                {/* Custom Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Custom Instructions</label>
                  <textarea
                    value={agentData.instructions}
                    onChange={(e) => setAgentData({ ...agentData, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    rows={4}
                    placeholder="Provide specific instructions for how your agent should behave..."
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !agentData.name || !agentData.description}
                  className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Agent
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Features */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 text-center">
            <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600 text-sm">
              Advanced training, custom datasets, API integrations, and more powerful customization options.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreateAgentPage() {
  return (
    <ProtectedRoute>
      <AgentCreator />
    </ProtectedRoute>
  )
}