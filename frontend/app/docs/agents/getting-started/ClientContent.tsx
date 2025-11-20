'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle, BookOpen, Zap } from 'lucide-react';

export default function GettingStartedContent() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neural-900 via-neural-800 to-neural-900">
      <div className="container-custom section-padding-lg">
        {/* Back Button */}
        <Link href="/docs/agents" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Documentation
        </Link>

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Getting Started with Agents
          </h1>
          <p className="text-xl text-neutral-300">
            Learn the fundamentals of creating, deploying, and managing AI agents on One Last AI.
          </p>
          <div className="flex items-center gap-4 mt-6 text-neutral-400">
            <span>📖 Reading time: 8 minutes</span>
            <span>•</span>
            <span>Updated: October 2025</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* What are Agents Section */}
          <section className="bg-neural-800/50 border border-neural-700 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">What Are AI Agents?</h2>
            </div>
            <p className="text-neutral-300 mb-4">
              AI agents are intelligent digital assistants powered by advanced language models and machine learning. 
              They can understand natural language, process complex information, and provide meaningful responses tailored 
              to specific tasks or domains.
            </p>
            <div className="space-y-3 ml-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Task Automation</h4>
                  <p className="text-neutral-300 text-sm">Automate repetitive tasks and workflows with intelligent agents.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">24/7 Availability</h4>
                  <p className="text-neutral-300 text-sm">Access your agents anytime, anywhere without downtime.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Personalization</h4>
                  <p className="text-neutral-300 text-sm">Customize agents to match your specific needs and preferences.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Scalability</h4>
                  <p className="text-neutral-300 text-sm">Deploy agents across multiple platforms and use cases.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started Steps */}
          <section className="bg-neural-800/50 border border-neural-700 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Quick Start Guide</h2>
            </div>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-blue-400 pl-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-400 text-neural-900 rounded-full flex items-center justify-center font-bold">1</div>
                  <h3 className="text-xl font-bold text-white">Create an Account</h3>
                </div>
                <p className="text-neutral-300">
                  Visit One Last AI and sign up for a free account. You'll get immediate access to all available agents and the ability to create custom ones.
                </p>
              </div>

              {/* Step 2 */}
              <div className="border-l-4 border-blue-400 pl-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-400 text-neural-900 rounded-full flex items-center justify-center font-bold">2</div>
                  <h3 className="text-xl font-bold text-white">Explore Available Agents</h3>
                </div>
                <p className="text-neutral-300 mb-3">
                  Browse our collection of pre-built agents, each specialized for different tasks:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-2">
                  <li><strong>Einstein</strong> - Scientific research and analysis</li>
                  <li><strong>Tech Wizard</strong> - Technology support and coding help</li>
                  <li><strong>Travel Buddy</strong> - Travel planning and recommendations</li>
                  <li><strong>Chef Biew</strong> - Culinary advice and recipe creation</li>
                  <li><strong>Fitness Guru</strong> - Health and fitness guidance</li>
                  <li><strong>Ben Sega</strong> - Gaming and entertainment insights</li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="border-l-4 border-blue-400 pl-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-400 text-neural-900 rounded-full flex items-center justify-center font-bold">3</div>
                  <h3 className="text-xl font-bold text-white">Start a Conversation</h3>
                </div>
                <p className="text-neutral-300">
                  Select any agent and begin chatting. Simply type your questions or requests, and the agent will respond intelligently based on its specialized training.
                </p>
              </div>

              {/* Step 4 */}
              <div className="border-l-4 border-blue-400 pl-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-400 text-neural-900 rounded-full flex items-center justify-center font-bold">4</div>
                  <h3 className="text-xl font-bold text-white">Configure Settings (Optional)</h3>
                </div>
                <p className="text-neutral-300">
                  Customize agent behavior, response style, and preferences to match your needs. Learn more in our Configuration guide.
                </p>
              </div>

              {/* Step 5 */}
              <div className="border-l-4 border-blue-400 pl-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-400 text-neural-900 rounded-full flex items-center justify-center font-bold">5</div>
                  <h3 className="text-xl font-bold text-white">Integrate with Your Workflow</h3>
                </div>
                <p className="text-neutral-300">
                  Use the Agent API to integrate agents into your applications, websites, or business processes for seamless automation.
                </p>
              </div>
            </div>
          </section>

          {/* Core Concepts */}
          <section className="bg-neural-800/50 border border-neural-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Core Concepts</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Agent Personality</h3>
                <p className="text-neutral-300">
                  Each agent has a unique personality that influences how it communicates and responds. This personality is shaped by its training data and specialized knowledge domain.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Conversation Context</h3>
                <p className="text-neutral-300">
                  Agents maintain conversation context to provide coherent, relevant responses. Your entire chat history is preserved so the agent understands the flow of your discussion.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Response Customization</h3>
                <p className="text-neutral-300">
                  Through the settings panel, you can customize how agents respond—including tone, detail level, language, and focus areas relevant to your needs.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Knowledge Domains</h3>
                <p className="text-neutral-300">
                  Agents are trained on specific domains of knowledge. This specialization allows them to provide expert-level insights in their respective fields.
                </p>
              </div>
            </div>
          </section>

          {/* Best Practices Tips */}
          <section className="bg-green-900/20 border border-green-600/30 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Quick Tips</h2>
            </div>
            <ul className="space-y-3 text-neutral-200">
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">•</span>
                <span>Be specific in your questions for more accurate and relevant responses</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">•</span>
                <span>Use natural language—agents understand casual, conversational language</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">•</span>
                <span>Provide context when needed—explain your situation for better recommendations</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">•</span>
                <span>Explore agent settings to fine-tune responses to your preferences</span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-400 font-bold">•</span>
                <span>Check the Best Practices guide for advanced tips and tricks</span>
              </li>
            </ul>
          </section>

          {/* Next Steps */}
          <section className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/docs/agents/configuration"
                className="block p-4 bg-neural-700 hover:bg-neural-600 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-blue-400 mb-2">Learn Configuration</h3>
                <p className="text-neutral-300 text-sm">Customize agent behavior and settings for optimal performance.</p>
              </Link>
              <Link 
                href="/docs/agents/best-practices"
                className="block p-4 bg-neural-700 hover:bg-neural-600 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-blue-400 mb-2">Best Practices</h3>
                <p className="text-neutral-300 text-sm">Learn expert tips for getting the most out of your agents.</p>
              </Link>
              <Link 
                href="/docs/agents/api-reference"
                className="block p-4 bg-neural-700 hover:bg-neural-600 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-blue-400 mb-2">API Reference</h3>
                <p className="text-neutral-300 text-sm">Integrate agents into your applications and workflows.</p>
              </Link>
              <Link 
                href="/docs/agents/troubleshooting"
                className="block p-4 bg-neural-700 hover:bg-neural-600 rounded-lg transition-colors"
              >
                <h3 className="font-semibold text-blue-400 mb-2">Troubleshooting</h3>
                <p className="text-neutral-300 text-sm">Find solutions to common issues and problems.</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
