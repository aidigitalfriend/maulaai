'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, BookOpen, Zap, Rocket, Settings, Code, HelpCircle } from 'lucide-react';

export default function GettingStartedContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container-custom section-padding-lg">
        {/* Back Button */}
        <Link href="/docs/agents" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Documentation
        </Link>

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-2xl mb-6">
            <Rocket className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-4">
            Getting Started with Agents
          </h1>
          <p className="text-xl text-gray-600">
            Learn the fundamentals of creating, deploying, and managing AI agents on One Last AI.
          </p>
          <div className="flex items-center gap-4 mt-6 text-gray-500">
            <span>📖 Reading time: 8 minutes</span>
            <span>•</span>
            <span>Updated: October 2025</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* What are Agents Section */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-brand-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What Are AI Agents?</h2>
            </div>
            <p className="text-gray-600 mb-6">
              AI agents are intelligent digital assistants powered by advanced language models and machine learning. 
              They can understand natural language, process complex information, and provide meaningful responses tailored 
              to specific tasks or domains.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Task Automation</h4>
                  <p className="text-gray-600 text-sm">Automate repetitive tasks and workflows with intelligent agents.</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">24/7 Availability</h4>
                  <p className="text-gray-600 text-sm">Access your agents anytime, anywhere without downtime.</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Personalization</h4>
                  <p className="text-gray-600 text-sm">Customize agents to match your specific needs and preferences.</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-accent-50 rounded-xl border border-accent-100">
                <CheckCircle className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Scalability</h4>
                  <p className="text-gray-600 text-sm">Deploy agents across multiple platforms and use cases.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started Steps */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Start Guide</h2>
            </div>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-brand-500 pl-6 py-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  <h3 className="text-xl font-bold text-gray-900">Create an Account</h3>
                </div>
                <p className="text-gray-600">
                  Visit One Last AI and sign up for a free account. You'll get immediate access to all available agents and the ability to create custom ones.
                </p>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-brand-500 pl-6 py-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <h3 className="text-xl font-bold text-gray-900">Explore Available Agents</h3>
                </div>
                <p className="text-gray-600 mb-3">
                  Browse our collection of pre-built agents, each specialized for different tasks:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">🔬 <strong>Einstein</strong> - Science & Research</div>
                  <div className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">💻 <strong>Tech Wizard</strong> - Tech & Coding</div>
                  <div className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">✈️ <strong>Travel Buddy</strong> - Travel Planning</div>
                  <div className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">👨‍🍳 <strong>Chef Biew</strong> - Culinary Arts</div>
                  <div className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">💪 <strong>Fitness Guru</strong> - Health & Fitness</div>
                  <div className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">🎮 <strong>Ben Sega</strong> - Gaming & Entertainment</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-brand-500 pl-6 py-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <h3 className="text-xl font-bold text-gray-900">Start a Conversation</h3>
                </div>
                <p className="text-gray-600">
                  Select any agent and begin chatting. Simply type your questions or requests, and the agent will respond intelligently based on its specialized training.
                </p>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-brand-500 pl-6 py-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                  <h3 className="text-xl font-bold text-gray-900">Configure Settings (Optional)</h3>
                </div>
                <p className="text-gray-600">
                  Customize agent behavior, response style, and preferences to match your needs. Learn more in our Configuration guide.
                </p>
              </div>

              {/* Step 5 */}
              <div className="border-l-4 border-brand-500 pl-6 py-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold text-sm">5</div>
                  <h3 className="text-xl font-bold text-gray-900">Integrate with Your Workflow</h3>
                </div>
                <p className="text-gray-600">
                  Use the Agent API to integrate agents into your applications, websites, or business processes for seamless automation.
                </p>
              </div>
            </div>
          </section>

          {/* Core Concepts */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Concepts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                <h3 className="text-lg font-semibold text-brand-700 mb-2">Agent Personality</h3>
                <p className="text-gray-600 text-sm">
                  Each agent has a unique personality that influences how it communicates and responds, shaped by its training data and specialized knowledge domain.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h3 className="text-lg font-semibold text-purple-700 mb-2">Conversation Context</h3>
                <p className="text-gray-600 text-sm">
                  Agents maintain conversation context to provide coherent, relevant responses. Your entire chat history is preserved for continuity.
                </p>
              </div>

              <div className="p-4 bg-accent-50 rounded-xl border border-accent-100">
                <h3 className="text-lg font-semibold text-accent-700 mb-2">Response Customization</h3>
                <p className="text-gray-600 text-sm">
                  Through settings, you can customize how agents respond—including tone, detail level, language, and focus areas.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <h3 className="text-lg font-semibold text-green-700 mb-2">Knowledge Domains</h3>
                <p className="text-gray-600 text-sm">
                  Agents are trained on specific domains of knowledge, allowing them to provide expert-level insights in their respective fields.
                </p>
              </div>
            </div>
          </section>

          {/* Quick Tips */}
          <section className="bg-green-50 border border-green-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Tips</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start">
                <span className="text-green-600 font-bold text-lg">•</span>
                <span className="text-gray-700">Be specific in your questions for more accurate and relevant responses</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-green-600 font-bold text-lg">•</span>
                <span className="text-gray-700">Use natural language—agents understand casual, conversational language</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-green-600 font-bold text-lg">•</span>
                <span className="text-gray-700">Provide context when needed—explain your situation for better recommendations</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-green-600 font-bold text-lg">•</span>
                <span className="text-gray-700">Explore agent settings to fine-tune responses to your preferences</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-green-600 font-bold text-lg">•</span>
                <span className="text-gray-700">Check the Best Practices guide for advanced tips and tricks</span>
              </li>
            </ul>
          </section>

          {/* Next Steps */}
          <section className="bg-brand-50 border border-brand-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/docs/agents/configuration"
                className="group block p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="w-5 h-5 text-brand-600" />
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600">Learn Configuration</h3>
                </div>
                <p className="text-gray-600 text-sm">Customize agent behavior and settings for optimal performance.</p>
              </Link>
              <Link 
                href="/docs/agents/best-practices"
                className="group block p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-brand-600" />
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600">Best Practices</h3>
                </div>
                <p className="text-gray-600 text-sm">Learn expert tips for getting the most out of your agents.</p>
              </Link>
              <Link 
                href="/docs/agents/api-reference"
                className="group block p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Code className="w-5 h-5 text-brand-600" />
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600">API Reference</h3>
                </div>
                <p className="text-gray-600 text-sm">Integrate agents into your applications and workflows.</p>
              </Link>
              <Link 
                href="/docs/agents/troubleshooting"
                className="group block p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <HelpCircle className="w-5 h-5 text-brand-600" />
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600">Troubleshooting</h3>
                </div>
                <p className="text-gray-600 text-sm">Find solutions to common issues and problems.</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
