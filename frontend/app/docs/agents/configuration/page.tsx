'use client';

import Link from 'next/link';
import { ArrowLeft, Settings, Sliders, Palette, Volume2, Zap } from 'lucide-react';

export default function ConfigurationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link href="/docs/agents" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Agent Docs
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <span className="text-xl">⚙️</span>
              Configuration Guide
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Agent Configuration</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Master the settings and customization options to tailor agents to your specific needs</p>
            <div className="flex items-center justify-center gap-4 mt-6 text-white/70 text-sm">
              <span>📖 10 min read</span>
              <span>•</span>
              <span>Updated: January 2026</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Overview */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-brand-100 rounded-xl p-2"><Settings className="w-6 h-6 text-brand-600" /></div>
              <h2 className="text-2xl font-bold text-neural-900">Configuration Overview</h2>
            </div>
            <p className="text-neural-600 mb-4">
              Each agent can be configured to match your preferences and use case. Configuration options include response style, 
              behavior, language, and specialized parameters based on the agent's domain. These settings persist across sessions.
            </p>
          </section>

          {/* Core Settings */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 rounded-xl p-2"><Sliders className="w-6 h-6 text-purple-600" /></div>
              <h2 className="text-2xl font-bold text-neural-900">Core Configuration Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Setting 1 */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-neural-900 mb-2">Response Tone</h3>
                <p className="text-neural-600 mb-3">Control how the agent communicates with you:</p>
                <ul className="list-disc list-inside text-neural-600 space-y-1 ml-2">
                  <li><strong>Professional</strong> - Formal, business-appropriate language</li>
                  <li><strong>Casual</strong> - Friendly, conversational tone</li>
                  <li><strong>Technical</strong> - Detailed, specification-focused responses</li>
                  <li><strong>Balanced</strong> - Mix of professional and approachable tone</li>
                </ul>
              </div>

              {/* Setting 2 */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-neural-900 mb-2">Response Length</h3>
                <p className="text-neural-600 mb-3">Adjust the detail level of responses:</p>
                <ul className="list-disc list-inside text-neural-600 space-y-1 ml-2">
                  <li><strong>Brief</strong> - Short, concise answers (1-2 sentences)</li>
                  <li><strong>Standard</strong> - Balanced information (2-4 paragraphs)</li>
                  <li><strong>Detailed</strong> - Comprehensive responses with examples</li>
                  <li><strong>Comprehensive</strong> - In-depth analysis with all relevant details</li>
                </ul>
              </div>

              {/* Setting 3 */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-neural-900 mb-2">Language</h3>
                <p className="text-neural-600">
                  Choose your preferred language for all agent responses. Supported languages include English, Spanish, French, German, Chinese, Japanese, and more.
                </p>
              </div>

              {/* Setting 4 */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-neural-900 mb-2">Creativity Level</h3>
                <p className="text-neural-600 mb-3">Control how creative or conservative the agent's responses are:</p>
                <ul className="list-disc list-inside text-neural-600 space-y-1 ml-2">
                  <li><strong>Conservative</strong> - Stick to facts and proven information</li>
                  <li><strong>Balanced</strong> - Mix of facts with thoughtful insights</li>
                  <li><strong>Creative</strong> - More imaginative and exploratory responses</li>
                </ul>
              </div>

              {/* Setting 5 */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-lg font-semibold text-neural-900 mb-2">Context Awareness</h3>
                <p className="text-neural-600 mb-3">Manage how the agent uses your conversation history:</p>
                <ul className="list-disc list-inside text-neural-600 space-y-1 ml-2">
                  <li><strong>Enabled</strong> - Agent remembers all previous messages in the conversation</li>
                  <li><strong>Limited</strong> - Agent only remembers the last 5-10 messages</li>
                  <li><strong>Disabled</strong> - Each message is treated independently (fresh start)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Advanced Settings */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
            <h2 className="text-2xl font-bold text-neural-900 mb-6">Advanced Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-brand-600 mb-3">Domain Focus</h3>
                <p className="text-neural-600 mb-3">
                  Specify particular areas or subtopics where you want the agent to concentrate. For example, with Tech Wizard, you could focus on Web Development, Data Science, or DevOps. This narrows the expertise area for more targeted assistance.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-brand-600 mb-3">Citation Mode</h3>
                <p className="text-neural-600 mb-3">
                  Control whether the agent includes sources and references in responses. Options include:
                </p>
                <ul className="list-disc list-inside text-neural-600 space-y-1 ml-4">
                  <li>No Citations - Clean responses without reference markers</li>
                  <li>Inline Citations - References embedded within the text</li>
                  <li>Full Citations - Detailed source list at the end of responses</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-brand-600 mb-3">Output Format</h3>
                <p className="text-neural-600 mb-3">
                  Choose how responses are structured:
                </p>
                <ul className="list-disc list-inside text-neural-600 space-y-1 ml-4">
                  <li>Narrative - Flowing paragraph text</li>
                  <li>Bullet Points - Key information as a list</li>
                  <li>Structured - Organized with headers and sections</li>
                  <li>Code Format - For technical agents, formatted with syntax highlighting</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-brand-600 mb-3">Safety & Moderation</h3>
                <p className="text-neural-600">
                  Agents include built-in safety measures. You can adjust the moderation level from strict (filters most potentially sensitive content) to lenient (minimal filtering) based on your needs.
                </p>
              </div>
            </div>
          </section>

          {/* Agent-Specific Settings */}
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
            <h2 className="text-2xl font-bold text-neural-900 mb-6">Agent-Specific Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-brand-600 mb-2">Einstein (Scientific Research)</h3>
                <p className="text-neural-600 text-sm">
                  Configure focus areas (Physics, Chemistry, Biology, etc.), citation style (APA, MLA, Chicago), and depth of technical explanation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-brand-600 mb-2">Tech Wizard (Technology Support)</h3>
                <p className="text-neural-600 text-sm">
                  Set programming language preferences, framework focus, difficulty level, and whether to include code examples.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-brand-600 mb-2">Travel Buddy (Travel Planning)</h3>
                <p className="text-neural-600 text-sm">
                  Specify budget range, travel style preferences, climate preferences, and time constraints for personalized recommendations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-brand-600 mb-2">Chef Biew (Culinary Arts)</h3>
                <p className="text-neural-600 text-sm">
                  Configure dietary restrictions, cuisine preferences, skill level, cooking equipment availability, and serving size defaults.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-brand-600 mb-2">Fitness Guru (Health & Fitness)</h3>
                <p className="text-neural-600 text-sm">
                  Set fitness goals, current fitness level, available equipment, dietary preferences, and any physical limitations.
                </p>
              </div>
            </div>
          </section>

          {/* Configuration Best Practices */}
          <section className="bg-green-50 border border-green-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-neural-900 mb-6">Configuration Best Practices</h2>
            <div className="space-y-3 text-neural-700">
              <div className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Start with defaults</strong> - Try standard settings first, then adjust based on your experience</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Test before committing</strong> - Try different settings in a few conversations to find what works</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Save presets</strong> - Store your favorite configurations for different use cases</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Adjust incrementally</strong> - Change one setting at a time to see its impact</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-600 font-bold">✓</span>
                <span><strong>Document your preferences</strong> - Keep notes on which settings work best for your goals</span>
              </div>
            </div>
          </section>

          {/* Accessing Configuration */}
          <section className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-neural-900 mb-6">How to Access Settings</h2>
            <ol className="list-decimal list-inside space-y-4 text-neural-700">
              <li>Open any agent conversation</li>
              <li>Click the Settings icon (gear icon) in the top-right corner</li>
              <li>A settings panel will appear on the right side of the screen</li>
              <li>Adjust any configuration options as desired</li>
              <li>Changes are saved automatically and applied immediately</li>
            </ol>
          </section>

          {/* Related Links */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Link 
              href="/docs/agents/getting-started"
              className="p-4 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-neural-100 transition-colors"
            >
              <h3 className="font-semibold text-brand-600 mb-2">← Getting Started</h3>
              <p className="text-neural-600 text-sm">New to agents? Start here.</p>
            </Link>
            <Link 
              href="/docs/agents/best-practices"
              className="p-4 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-neural-100 transition-colors"
            >
              <h3 className="font-semibold text-brand-600 mb-2">Best Practices →</h3>
              <p className="text-neural-600 text-sm">Learn advanced tips and techniques.</p>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
