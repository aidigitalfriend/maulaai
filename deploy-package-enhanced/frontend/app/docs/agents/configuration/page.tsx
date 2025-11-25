'use client';

import Link from 'next/link';
import { ArrowLeft, Settings, Sliders, Palette, Volume2, Zap } from 'lucide-react';

export default function ConfigurationPage() {
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
            Agent Configuration
          </h1>
          <p className="text-xl text-neutral-300">
            Master the settings and customization options to tailor agents to your specific needs.
          </p>
          <div className="flex items-center gap-4 mt-6 text-neutral-400">
            <span>📖 Reading time: 10 minutes</span>
            <span>•</span>
            <span>Updated: October 2025</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Overview */}
          <section className="bg-neural-800/50 border border-neural-700 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Configuration Overview</h2>
            </div>
            <p className="text-neutral-300 mb-4">
              Each agent can be configured to match your preferences and use case. Configuration options include response style, 
              behavior, language, and specialized parameters based on the agent's domain. These settings persist across sessions.
            </p>
          </section>

          {/* Core Settings */}
          <section className="bg-neural-800/50 border border-neural-700 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <Sliders className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Core Configuration Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Setting 1 */}
              <div className="border-l-4 border-purple-400 pl-6">
                <h3 className="text-lg font-semibold text-white mb-2">Response Tone</h3>
                <p className="text-neutral-300 mb-3">Control how the agent communicates with you:</p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-2">
                  <li><strong>Professional</strong> - Formal, business-appropriate language</li>
                  <li><strong>Casual</strong> - Friendly, conversational tone</li>
                  <li><strong>Technical</strong> - Detailed, specification-focused responses</li>
                  <li><strong>Balanced</strong> - Mix of professional and approachable tone</li>
                </ul>
              </div>

              {/* Setting 2 */}
              <div className="border-l-4 border-purple-400 pl-6">
                <h3 className="text-lg font-semibold text-white mb-2">Response Length</h3>
                <p className="text-neutral-300 mb-3">Adjust the detail level of responses:</p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-2">
                  <li><strong>Brief</strong> - Short, concise answers (1-2 sentences)</li>
                  <li><strong>Standard</strong> - Balanced information (2-4 paragraphs)</li>
                  <li><strong>Detailed</strong> - Comprehensive responses with examples</li>
                  <li><strong>Comprehensive</strong> - In-depth analysis with all relevant details</li>
                </ul>
              </div>

              {/* Setting 3 */}
              <div className="border-l-4 border-purple-400 pl-6">
                <h3 className="text-lg font-semibold text-white mb-2">Language</h3>
                <p className="text-neutral-300">
                  Choose your preferred language for all agent responses. Supported languages include English, Spanish, French, German, Chinese, Japanese, and more.
                </p>
              </div>

              {/* Setting 4 */}
              <div className="border-l-4 border-purple-400 pl-6">
                <h3 className="text-lg font-semibold text-white mb-2">Creativity Level</h3>
                <p className="text-neutral-300 mb-3">Control how creative or conservative the agent's responses are:</p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-2">
                  <li><strong>Conservative</strong> - Stick to facts and proven information</li>
                  <li><strong>Balanced</strong> - Mix of facts with thoughtful insights</li>
                  <li><strong>Creative</strong> - More imaginative and exploratory responses</li>
                </ul>
              </div>

              {/* Setting 5 */}
              <div className="border-l-4 border-purple-400 pl-6">
                <h3 className="text-lg font-semibold text-white mb-2">Context Awareness</h3>
                <p className="text-neutral-300 mb-3">Manage how the agent uses your conversation history:</p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-2">
                  <li><strong>Enabled</strong> - Agent remembers all previous messages in the conversation</li>
                  <li><strong>Limited</strong> - Agent only remembers the last 5-10 messages</li>
                  <li><strong>Disabled</strong> - Each message is treated independently (fresh start)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Advanced Settings */}
          <section className="bg-neural-800/50 border border-neural-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Advanced Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Domain Focus</h3>
                <p className="text-neutral-300 mb-3">
                  Specify particular areas or subtopics where you want the agent to concentrate. For example, with Tech Wizard, you could focus on Web Development, Data Science, or DevOps. This narrows the expertise area for more targeted assistance.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Citation Mode</h3>
                <p className="text-neutral-300 mb-3">
                  Control whether the agent includes sources and references in responses. Options include:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                  <li>No Citations - Clean responses without reference markers</li>
                  <li>Inline Citations - References embedded within the text</li>
                  <li>Full Citations - Detailed source list at the end of responses</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Output Format</h3>
                <p className="text-neutral-300 mb-3">
                  Choose how responses are structured:
                </p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                  <li>Narrative - Flowing paragraph text</li>
                  <li>Bullet Points - Key information as a list</li>
                  <li>Structured - Organized with headers and sections</li>
                  <li>Code Format - For technical agents, formatted with syntax highlighting</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Safety & Moderation</h3>
                <p className="text-neutral-300">
                  Agents include built-in safety measures. You can adjust the moderation level from strict (filters most potentially sensitive content) to lenient (minimal filtering) based on your needs.
                </p>
              </div>
            </div>
          </section>

          {/* Agent-Specific Settings */}
          <section className="bg-neural-800/50 border border-neural-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Agent-Specific Settings</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Einstein (Scientific Research)</h3>
                <p className="text-neutral-300 text-sm">
                  Configure focus areas (Physics, Chemistry, Biology, etc.), citation style (APA, MLA, Chicago), and depth of technical explanation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Tech Wizard (Technology Support)</h3>
                <p className="text-neutral-300 text-sm">
                  Set programming language preferences, framework focus, difficulty level, and whether to include code examples.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Travel Buddy (Travel Planning)</h3>
                <p className="text-neutral-300 text-sm">
                  Specify budget range, travel style preferences, climate preferences, and time constraints for personalized recommendations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Chef Biew (Culinary Arts)</h3>
                <p className="text-neutral-300 text-sm">
                  Configure dietary restrictions, cuisine preferences, skill level, cooking equipment availability, and serving size defaults.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Fitness Guru (Health & Fitness)</h3>
                <p className="text-neutral-300 text-sm">
                  Set fitness goals, current fitness level, available equipment, dietary preferences, and any physical limitations.
                </p>
              </div>
            </div>
          </section>

          {/* Configuration Best Practices */}
          <section className="bg-green-900/20 border border-green-600/30 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Configuration Best Practices</h2>
            <div className="space-y-3 text-neutral-200">
              <div className="flex gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span><strong>Start with defaults</strong> - Try standard settings first, then adjust based on your experience</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span><strong>Test before committing</strong> - Try different settings in a few conversations to find what works</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span><strong>Save presets</strong> - Store your favorite configurations for different use cases</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span><strong>Adjust incrementally</strong> - Change one setting at a time to see its impact</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span><strong>Document your preferences</strong> - Keep notes on which settings work best for your goals</span>
              </div>
            </div>
          </section>

          {/* Accessing Configuration */}
          <section className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">How to Access Settings</h2>
            <ol className="list-decimal list-inside space-y-4 text-neutral-200">
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
              className="p-4 bg-neural-700 hover:bg-neural-600 rounded-lg transition-colors"
            >
              <h3 className="font-semibold text-blue-400 mb-2">← Getting Started</h3>
              <p className="text-neutral-300 text-sm">New to agents? Start here.</p>
            </Link>
            <Link 
              href="/docs/agents/best-practices"
              className="p-4 bg-neural-700 hover:bg-neural-600 rounded-lg transition-colors"
            >
              <h3 className="font-semibold text-blue-400 mb-2">Best Practices →</h3>
              <p className="text-neutral-300 text-sm">Learn advanced tips and techniques.</p>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
