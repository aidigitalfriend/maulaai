'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('getting-started')
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to content on mobile when section changes
  useEffect(() => {
    if (contentRef.current && window.innerWidth < 1024) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeSection])

  const agents = [
    { id: 'einstein', name: 'Einstein', description: 'Physics & Mathematics Expert', avatar: '🧠' },
    { id: 'comedy-king', name: 'Comedy King', description: 'Humor & Entertainment', avatar: '🎭' },
    { id: 'tech-wizard', name: 'Tech Wizard', description: 'Technology & Programming', avatar: '💻' },
    { id: 'chef-biew', name: 'Chef Biew', description: 'Cooking & Recipes', avatar: '👨‍🍳' },
    { id: 'fitness-guru', name: 'Fitness Guru', description: 'Fitness & Health', avatar: '💪' },
    { id: 'travel-buddy', name: 'Travel Buddy', description: 'Travel & Exploration', avatar: '✈️' },
    { id: 'professor-astrology', name: 'Professor Astrology', description: 'Astrology & Zodiac', avatar: '🔭' },
    { id: 'julie-girlfriend', name: 'Julie Girlfriend', description: 'Relationship Advice', avatar: '💕' },
    { id: 'emma-emotional', name: 'Emma Emotional', description: 'Emotional Support', avatar: '🤗' },
    { id: 'mrs-boss', name: 'Mrs Boss', description: 'Business & Management', avatar: '📊' },
    { id: 'bishop-burger', name: 'Bishop Burger', description: 'Food & Cuisine', avatar: '🍔' },
    { id: 'ben-sega', name: 'Ben Sega', description: 'Gaming & Retro', avatar: '🎮' },
  ]

  const sections = {
    'getting-started': {
      title: 'Getting Started',
      icon: '🚀',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-3">Welcome to One Last AI</h3>
            <p className="text-neural-300 leading-relaxed">
              One Last AI is a powerful platform that lets you create, customize, and deploy AI agents for various purposes. Whether you're building a chatbot, virtual assistant, or specialized AI expert, One Last AI has you covered.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Getting Your First Agent Running</h4>
            <ol className="space-y-3 list-decimal list-inside text-neural-300">
              <li>Choose an agent from our library that matches your needs</li>
              <li>Customize its personality, knowledge base, and capabilities</li>
              <li>Integrate it with your application using our simple API</li>
              <li>Deploy and start using it immediately</li>
            </ol>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Key Concepts</h4>
            <ul className="space-y-2 text-neural-300">
              <li><strong>Agents:</strong> Pre-built AI personalities with specialized knowledge</li>
              <li><strong>API Keys:</strong> Credentials to authenticate your requests</li>
              <li><strong>Conversations:</strong> Interactions between users and agents</li>
              <li><strong>Webhooks:</strong> Real-time notifications for events</li>
            </ul>
          </div>

          <div className="bg-neural-700 p-4 rounded-lg border border-neural-600">
            <p className="text-neural-300 text-sm">
              💡 <strong>Tip:</strong> Start with the "Integration Guide" section to learn how to connect One Last AI to your platform.
            </p>
          </div>
        </div>
      )
    },
    'api-reference': {
      title: 'API Reference',
      icon: '📚',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-3">API Reference</h3>
            <p className="text-neural-300 leading-relaxed">
              The One Last AI API provides RESTful endpoints for managing agents, conversations, and more.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-3">Base URL</h4>
            <div className="bg-neural-700 p-3 rounded border border-neural-600 font-mono text-sm text-green-400">
              https://api.One Last AI.io/v1
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Core Endpoints</h4>
            <div className="space-y-3">
              <div className="bg-neural-700 p-3 rounded border border-neural-600">
                <p className="font-mono text-blue-400"><strong>GET</strong> /agents</p>
                <p className="text-neural-300 text-sm mt-1">List all available agents</p>
              </div>
              <div className="bg-neural-700 p-3 rounded border border-neural-600">
                <p className="font-mono text-green-400"><strong>POST</strong> /conversations</p>
                <p className="text-neural-300 text-sm mt-1">Create a new conversation with an agent</p>
              </div>
              <div className="bg-neural-700 p-3 rounded border border-neural-600">
                <p className="font-mono text-blue-400"><strong>GET</strong> /conversations/:id</p>
                <p className="text-neural-300 text-sm mt-1">Retrieve conversation history</p>
              </div>
              <div className="bg-neural-700 p-3 rounded border border-neural-600">
                <p className="font-mono text-green-400"><strong>POST</strong> /conversations/:id/messages</p>
                <p className="text-neural-300 text-sm mt-1">Send a message to an agent</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Rate Limits</h4>
            <p className="text-neural-300">API requests are limited to 1000 requests per hour per API key.</p>
          </div>
        </div>
      )
    },
    'authentication': {
      title: 'Authentication',
      icon: '🔐',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-3">Authentication</h3>
            <p className="text-neural-300 leading-relaxed">
              All One Last AI API requests require authentication using an API key.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Getting Your API Key</h4>
            <ol className="space-y-2 list-decimal list-inside text-neural-300">
              <li>Navigate to your dashboard settings</li>
              <li>Go to "API Keys" section</li>
              <li>Click "Generate New Key"</li>
              <li>Copy and store it securely</li>
            </ol>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Using Your API Key</h4>
            <p className="text-neural-300 mb-2">Include your API key in the Authorization header:</p>
            <div className="bg-neural-700 p-3 rounded border border-neutral-600 font-mono text-sm text-green-400 overflow-x-auto">
              Authorization: Bearer YOUR_API_KEY
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Example Request</h4>
            <div className="bg-neural-700 p-3 rounded border border-neural-600 font-mono text-sm text-green-400 overflow-x-auto">
              <pre>{`curl -X GET https://api.One Last AI.io/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
            </div>
          </div>

          <div className="bg-red-900 bg-opacity-30 border border-red-700 p-4 rounded-lg">
            <p className="text-red-300 text-sm">
              🔒 <strong>Security:</strong> Never share your API key in public repositories or client-side code.
            </p>
          </div>
        </div>
      )
    },
    'integration-guide': {
      title: 'Integration Guide',
      icon: '🔗',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-3">Integration Guide</h3>
            <p className="text-neural-300 leading-relaxed">
              Learn how to integrate One Last AI with your applications.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Web Integration</h4>
            <p className="text-neural-300 mb-2">Add a chat widget to your website:</p>
            <div className="bg-neural-700 p-3 rounded border border-neural-600 font-mono text-sm text-blue-400 overflow-x-auto">
              <pre>{`<script src="https://cdn.One Last AI.io/widget.js"></script>
<script>
  One Last AI.init({
    apiKey: 'YOUR_API_KEY',
    agent: 'agent-id'
  })
</script>`}</pre>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Slack Integration</h4>
            <ol className="space-y-2 list-decimal list-inside text-neural-300">
              <li>Go to your workspace settings</li>
              <li>Connect One Last AI to your Slack workspace</li>
              <li>Authorize the required permissions</li>
              <li>Your agent is now available in Slack!</li>
            </ol>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Discord Integration</h4>
            <p className="text-neural-300">Similar to Slack, you can integrate One Last AI with Discord to make your agents available as bots in your servers.</p>
          </div>

          <div className="bg-neural-700 p-4 rounded-lg border border-neural-600">
            <p className="text-neural-300 text-sm">
              💡 <strong>Tip:</strong> Use webhooks to trigger custom actions when agents respond.
            </p>
          </div>
        </div>
      )
    },
    'webhook-troubleshooting': {
      title: 'Webhook Troubleshooting',
      icon: '📡',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-3">Webhook Troubleshooting</h3>
            <p className="text-neural-300 leading-relaxed">
              Webhooks allow you to receive real-time updates about agent activities.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Setting Up Webhooks</h4>
            <div className="space-y-2 text-neural-300">
              <p>1. Configure a webhook URL in your dashboard</p>
              <p>2. Choose which events to subscribe to</p>
              <p>3. One Last AI will POST to your URL when events occur</p>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Common Issues</h4>
            <div className="space-y-3">
              <div>
                <p className="font-bold text-yellow-400">Webhook not triggering?</p>
                <p className="text-neural-300 text-sm">Check that your URL is publicly accessible and returns a 200 status code.</p>
              </div>
              <div>
                <p className="font-bold text-yellow-400">Timeouts occurring?</p>
                <p className="text-neural-300 text-sm">Ensure your webhook endpoint processes requests within 30 seconds.</p>
              </div>
              <div>
                <p className="font-bold text-yellow-400">Missing payload data?</p>
                <p className="text-neural-300 text-sm">Verify you're subscribing to the correct event types in your dashboard.</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Webhook Events</h4>
            <ul className="space-y-2 text-neural-300">
              <li><strong>message.sent:</strong> When an agent sends a message</li>
              <li><strong>message.received:</strong> When an agent receives a message</li>
              <li><strong>conversation.started:</strong> When a conversation begins</li>
              <li><strong>conversation.ended:</strong> When a conversation ends</li>
            </ul>
          </div>

          <div className="bg-green-900 bg-opacity-30 border border-green-700 p-4 rounded-lg">
            <p className="text-green-300 text-sm">
              ✓ <strong>Pro Tip:</strong> Use webhook logs in your dashboard to debug delivery issues.
            </p>
          </div>
        </div>
      )
    }
  }

  const agentContent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) {
      return {
        title: 'Agent Not Found',
        icon: '❓',
        content: <p className="text-neural-300">This agent could not be found.</p>
      }
    }
    return {
      title: agent.name,
      icon: agent.avatar,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-3">{agent.name}</h3>
            <p className="text-neural-300 leading-relaxed">
              {agent.description}
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Overview</h4>
            <p className="text-neural-300">
              {agent.name} is a specialized AI agent designed to provide expert guidance and assistance in {agent.description.toLowerCase()}.
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Capabilities</h4>
            <ul className="space-y-2 text-neural-300">
              <li>✓ Expert knowledge in their field</li>
              <li>✓ Conversational and friendly responses</li>
              <li>✓ Real-time information retrieval</li>
              <li>✓ Personalized recommendations</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">API Integration</h4>
            <div className="bg-neural-700 p-3 rounded border border-neural-600 font-mono text-sm text-blue-400 overflow-x-auto">
              <pre>{`POST /conversations
{
  "agent_id": "${agentId}",
  "message": "Your message here"
}`}</pre>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-2">Use Cases</h4>
            <ul className="space-y-2 text-neural-300">
              <li>• Customer support</li>
              <li>• Content creation</li>
              <li>• Expert consultation</li>
              <li>• Interactive learning</li>
            </ul>
          </div>

          <Link href={`/agents/${agentId}`} className="inline-block mt-4 px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition">
            Try Agent Now →
          </Link>
        </div>
      )
    }
  }

  const currentContent = activeSection.startsWith('agent-')
    ? agentContent(activeSection.replace('agent-', ''))
    : (sections as Record<string, any>)[activeSection] || sections['getting-started']

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white flex flex-col">
      {/* Header */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation & Agents</h1>
          <p className="text-xl opacity-90">Learn everything about One Last AI and explore our AI agents</p>
        </div>
      </section>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 container-custom py-8">
        {/* Mobile: Vertical Stack, Desktop: Side-by-side */}
        <div className="flex flex-col lg:flex-row gap-6 lg:h-screen lg:overflow-hidden">
          
          {/* Left Sidebar / Top Panel - Navigation */}
          <div className="w-full lg:w-64 bg-neural-800 rounded-lg border border-neural-700 p-4 lg:overflow-y-auto lg:flex-shrink-0 lg:h-full">
            {/* Documentation Sections */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-neural-400 uppercase tracking-wider mb-3">Documentation</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                {[
                  { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
                  { id: 'api-reference', label: 'API Reference', icon: '📚' },
                  { id: 'authentication', label: 'Authentication', icon: '🔐' },
                  { id: 'integration-guide', label: 'Integration Guide', icon: '🔗' },
                  { id: 'webhook-troubleshooting', label: 'Webhook Troubleshooting', icon: '📡' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      activeSection === item.id
                        ? 'bg-brand-600 text-white'
                        : 'text-neural-300 hover:bg-neural-700'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    <span className="text-sm lg:text-base">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Agents Section */}
            <div className="border-t border-neural-700 pt-4">
              <h3 className="text-sm font-bold text-neural-400 uppercase tracking-wider mb-3">Agents</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setActiveSection(`agent-${agent.id}`)}
                    className={`w-full text-left px-3 py-2 rounded transition text-sm ${
                      activeSection === `agent-${agent.id}`
                        ? 'bg-brand-600 text-white'
                        : 'text-neural-300 hover:bg-neural-700'
                    }`}
                  >
                    <span className="mr-2">{agent.avatar}</span>
                    <span className="text-xs lg:text-sm">{agent.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel / Bottom Content - Content Display */}
          <div 
            ref={contentRef}
            className="flex-1 bg-neural-800 rounded-lg border border-neural-700 p-4 lg:p-8 lg:overflow-y-auto lg:h-full lg:flex-shrink-0 scroll-mt-4"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neural-700">
              <span className="text-3xl lg:text-4xl">{currentContent.icon}</span>
              <h2 className="text-2xl lg:text-3xl font-bold">{currentContent.title}</h2>
            </div>
            {currentContent.content}
          </div>
        </div>
      </div>
    </div>
  )
}

