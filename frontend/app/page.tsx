import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import TestimonialSection from '@/components/TestimonialSection';
import CommunityStats from '@/components/CommunityStats';
import Link from 'next/link';

// Homepage showcasing the fixed design system
export default function HomePage() {
  // Stats for hero section - Fix #4: Visual Hierarchy
  const heroStats = [
    {
      number: '20+',
      label: 'AI Agents',
      description: 'Specialized personalities',
    },
    {
      number: '99.9%',
      label: 'Uptime',
      description: 'Enterprise reliability',
    },
    {
      number: '10K+',
      label: 'Users',
      description: 'Growing community',
    },
    {
      number: '24/7',
      label: 'Support',
      description: 'Always available',
    },
  ];

  // Platform features - Fix #1: Consistent grid layout
  const platformFeatures = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: 'AI-Powered Agents',
      description:
        'Access 20+ specialized AI personalities including Einstein, Shakespeare, Tesla, and more. Each agent brings unique expertise to solve your specific challenges.',
      link: {
        text: 'Explore Agents',
        href: '/agents',
      },
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: 'Real-time Analytics',
      description:
        'Monitor your AI interactions with comprehensive dashboards, usage analytics, and performance insights in real-time.',
      link: {
        text: 'View Dashboard',
        href: '/dashboard',
      },
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: 'Enterprise Security',
      description:
        'Bank-level encryption, SOC 2 compliance, and privacy-first architecture ensure your data stays protected and confidential.',
      link: {
        text: 'Security Details',
        href: '/security',
      },
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      title: 'Environment Configuration',
      description:
        'Set up API keys and configure multilingual AI services with our comprehensive environment variable guide.',
      link: {
        text: 'Configure Setup',
        href: '/config',
      },
    },
  ];

  // AI agent personalities preview - Updated with real agents
  const agentPreviews = [
    {
      icon: <div className="text-2xl">🧠</div>,
      title: 'Einstein',
      description:
        'Theoretical physics, complex problem solving, and scientific research assistance.',
      link: {
        text: 'Chat with Einstein',
        href: '/subscribe?agent=Einstein&slug=einstein',
      },
    },
    {
      icon: <div className="text-2xl">💚</div>,
      title: 'Emma Emotional',
      description:
        'Master of feelings and empathy. Perfect for emotional support and relationship advice.',
      link: {
        text: 'Talk to Emma',
        href: '/subscribe?agent=Emma+Emotional&slug=emma-emotional',
      },
    },
    {
      icon: <div className="text-2xl">🎮</div>,
      title: 'Nid Gaming',
      description:
        'Pro gamer extraordinaire! Master of gaming strategies, reviews, and esports culture.',
      link: {
        text: 'Game with Nid',
        href: '/subscribe?agent=Nid+Gaming&slug=nid-gaming',
      },
    },
    {
      icon: <div className="text-2xl">🥢</div>,
      title: 'Chef Biew',
      description:
        'Asian culinary master! Specializes in authentic recipes and cultural food traditions.',
      link: {
        text: 'Cook with Chef Biew',
        href: '/subscribe?agent=Chef+Biew&slug=chef-biew',
      },
    },
    {
      icon: <div className="text-2xl">🧙‍♂️</div>,
      title: 'Tech Wizard',
      description:
        'Master of all things tech! Expert in coding, troubleshooting, and innovation.',
      link: {
        text: 'Code with Tech Wizard',
        href: '/subscribe?agent=Tech+Wizard&slug=tech-wizard',
      },
    },
    {
      icon: <div className="text-2xl">👔</div>,
      title: 'Mrs Boss',
      description:
        'Take-charge executive! Master of leadership, business management, and results.',
      link: {
        text: 'Lead with Mrs Boss',
        href: '/subscribe?agent=Mrs+Boss&slug=mrs-boss',
      },
    },
    {
      icon: <div className="text-2xl">💪</div>,
      title: 'Fitness Guru',
      description:
        'Your personal fitness coach! Expert in workouts, nutrition, and wellness goals.',
      link: {
        text: 'Train with Fitness Guru',
        href: '/subscribe?agent=Fitness+Guru&slug=fitness-guru',
      },
    },
    {
      icon: <div className="text-2xl">🕹️</div>,
      title: 'Ben Sega',
      description:
        'Retro gaming legend! Expert in classic games, gaming history, and nostalgia.',
      link: {
        text: 'Play with Ben Sega',
        href: '/subscribe?agent=Ben+Sega&slug=ben-sega',
      },
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Fix #3: Proper hero alignment and spacing */}
      <HeroSection
        title={
          <>
            Meet Your
            <br />
            <span className="bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent">
              AI Dream Team
            </span>
          </>
        }
        subtitle="Transform your workflow with 20+ specialized AI personalities. From Einstein's genius to Shakespeare's creativity - unlock the power of history's greatest minds."
        description="Enterprise-grade AI platform with real-time analytics, secure infrastructure, and intelligent automation for modern businesses."
        primaryAction={{
          text: 'View Documentation',
          href: '/docs',
        }}
        secondaryAction={{
          text: 'Explore Agents',
          href: '/agents',
        }}
        stats={heroStats}
        backgroundGradient={true}
      />

      {/* Platform Features - Fix #1: Consistent grid system */}
      <FeatureSection
        title="Why Choose Our AI Platform?"
        subtitle="Built for scale, designed for simplicity, engineered for results"
        features={platformFeatures}
        layout="3-col"
        backgroundStyle="white"
      />

      {/* AI Agents Preview - Fix #4: Visual hierarchy */}
      <FeatureSection
        title="Meet Our AI Personalities"
        subtitle="Each agent specializes in different areas of expertise to help you achieve more"
        features={agentPreviews}
        layout="4-col"
        backgroundStyle="gradient"
      />

      {/* Canvas Builder Section - AI App Generator */}
      <section className="section-padding bg-gradient-to-br from-neural-900 via-indigo-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-full text-indigo-300 text-sm font-medium mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                NEW: Canvas Builder
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Build Apps with
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {' '}
                  AI-Powered{' '}
                </span>
                Canvas
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                Transform your ideas into fully functional web applications in
                seconds. Our Canvas Builder uses advanced AI to generate
                beautiful, responsive HTML applications from simple text
                descriptions.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Generate complete web apps from text prompts',
                  'Multiple AI models including Gemini Pro',
                  'Live preview with code export',
                  'Iterative refinement with AI assistant',
                  'Pre-built templates for quick starts',
                ].map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-neural-200"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/canvas-app"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/30 group"
                >
                  Launch Canvas Builder
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
                >
                  View Documentation
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-[#1e1e2e] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                <div className="flex items-center gap-2 px-4 py-3 bg-[#161622] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">
                    Canvas Builder
                  </span>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      <span className="text-indigo-400 text-sm font-mono">
                        Prompt:
                      </span>
                      <span className="text-gray-300 text-sm">
                        &quot;Create a modern SaaS landing page...&quot;
                      </span>
                    </div>
                    <div className="h-px bg-white/10 my-4"></div>
                    <div className="bg-[#252536] rounded-lg p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-400">
                          Generated Preview
                        </span>
                        <span className="text-xs text-green-400">
                          ✓ Complete
                        </span>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg h-32 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">
                          Live Preview Area
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Data Generator Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
                AI Data Generator
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Generate Test Data in Seconds
              </h2>
              <p className="text-lg text-neural-600 mb-6">
                Create realistic test data for your applications instantly.
                Choose from pre-built templates or customize your own schema.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  '👤 Users',
                  '🛒 Products',
                  '📝 Posts',
                  '📊 Analytics',
                  '💬 Comments',
                  '📧 Emails',
                ].map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 bg-neural-100 rounded-full text-sm text-neural-700"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/tools/data-generator"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Generate Data
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-green-600 text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right - Interactive Preview */}
            <div className="bg-gradient-to-br from-neural-900 to-neural-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-xs text-neural-400">
                  data-generator.json
                </span>
              </div>
              <pre className="text-sm font-mono text-neural-300 overflow-hidden">
                <code>{`{
  "users": [
    {
      "id": "usr_a1b2c3",
      "name": "Sarah Johnson",
      "email": "sarah.j@example.com",
      "role": "admin",
      "created": "2026-01-02"
    },
    {
      "id": "usr_d4e5f6", 
      "name": "Mike Chen",
      "email": "mike.c@example.com",
      "role": "user",
      "created": "2026-01-01"
    }
  ]
}`}</code>
              </pre>
              <div className="mt-4 pt-4 border-t border-neural-700 flex items-center justify-between">
                <span className="text-xs text-neural-400">
                  2 records generated
                </span>
                <span className="text-xs text-green-400">
                  ✓ Ready to export
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore All Agents Button */}
      <section className="bg-gradient-to-br from-white via-brand-50 to-accent-50 py-8">
        <div className="container-custom text-center">
          <a
            href="/agents"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 group"
          >
            <span>Explore All Agents</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* Testimonials Section - Dark Theme Updated */}
      <TestimonialSection />

      {/* Community Stats Section */}
      <CommunityStats />

      {/* FAQ Preview Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-neural-600">
              Get answers to the most common questions about our platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: 'How do I get started with One Last AI?',
                a: 'Getting started is simple! Sign up for an account, choose your preferred AI agents, and begin chatting within minutes. Our onboarding guide walks you through every step.',
              },
              {
                q: 'What AI agents are available?',
                a: 'We offer 20+ specialized AI personalities including Einstein, Shakespeare, Tesla, Da Vinci, and many more. Each agent brings unique expertise to solve different challenges.',
              },
              {
                q: 'Is my data secure?',
                a: 'Yes! We use bank-level encryption, maintain SOC 2 compliance, and follow strict privacy-first architecture. Your data is never shared with third parties.',
              },
              {
                q: "What's included in each pricing plan?",
                a: 'We offer simple per-agent pricing: $1/day, $5/week, or $19/month. Each one-time purchase gives you access to one AI agent for the selected period with unlimited conversations. No auto-renewal.',
              },
            ].map((item, idx) => (
              <div key={idx} className="border-l-4 border-brand-600 pl-6">
                <h3 className="text-lg font-bold mb-2">{item.q}</h3>
                <p className="text-neural-600">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/support/faqs"
              className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-2"
            >
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* Recent News Section */}
      <section className="section-padding bg-gradient-to-br from-neural-50 to-neural-100">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Latest News & Updates
            </h2>
            <p className="text-xl text-neural-600">
              Stay informed about new features and platform improvements
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                date: 'Oct 22, 2025',
                title: 'New Voice-to-Voice Agent Available',
                desc: 'Experience seamless voice conversations with our new voice-to-voice AI agent technology.',
                category: 'Feature',
                link: '/resources/news',
              },
              {
                date: 'Oct 18, 2025',
                title: 'One Last AI Reaches 10K Active Users',
                desc: 'Celebrating a milestone! Join our growing community of professionals using AI to transform their work.',
                category: 'Milestone',
                link: '/community',
              },
              {
                date: 'Oct 15, 2025',
                title: 'Enterprise Security Enhancements',
                desc: 'Enhanced API security and new compliance certifications now available for enterprise customers.',
                category: 'Security',
                link: '/docs',
              },
            ].map((news, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-lg shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-brand-600">
                    {news.category}
                  </span>
                  <span className="text-sm text-neural-500">{news.date}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{news.title}</h3>
                <p className="text-neural-600 mb-4">{news.desc}</p>
                <Link
                  href={news.link}
                  className="text-brand-600 hover:text-brand-700 font-medium text-sm inline-flex items-center gap-1"
                >
                  Read more →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/resources/news" className="btn-primary">
              View All News
            </Link>
          </div>
        </div>
      </section>

      {/* Integration Partners Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Integrations & Partnerships
            </h2>
            <p className="text-xl text-neural-600">
              Connect with your favorite tools and platforms
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            {[
              { name: 'Slack', icon: '💬' },
              { name: 'Microsoft Teams', icon: '🤖' },
              { name: 'Zapier', icon: '⚡' },
              { name: 'Discord', icon: '👾' },
              { name: 'Twilio', icon: '📞' },
              { name: 'OpenAI', icon: '🧠' },
            ].map((partner, idx) => (
              <div
                key={idx}
                className="text-center p-4 rounded-lg bg-neural-50 hover:bg-neural-100 transition-colors"
              >
                <div className="text-4xl mb-2">{partner.icon}</div>
                <p className="font-medium text-sm">{partner.name}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/about/partnerships"
              className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-2"
            >
              Explore all integrations →
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Roadmap Preview Section */}
      <section className="section-padding bg-gradient-to-br from-neural-900 to-neural-800 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What's Coming Next
            </h2>
            <p className="text-xl text-neural-300">
              Our product roadmap for the next quarters
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quarter: 'Q4 2025',
                features: [
                  'Advanced Analytics Dashboard',
                  'Custom Agent Builder',
                  'Team Collaboration Tools',
                ],
                status: 'In Progress',
              },
              {
                quarter: 'Q1 2026',
                features: [
                  'Multi-language Support',
                  'Real-time Translation',
                  'Enterprise SSO Integration',
                ],
                status: 'Planned',
              },
              {
                quarter: 'Q2 2026',
                features: [
                  'AI Agent Marketplace',
                  'White-label Solution',
                  'Advanced API Endpoints',
                ],
                status: 'Planned',
              },
            ].map((roadmap, idx) => (
              <div
                key={idx}
                className="border border-neural-700 rounded-lg p-8 hover:border-brand-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{roadmap.quarter}</h3>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      roadmap.status === 'In Progress'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {roadmap.status}
                  </span>
                </div>
                <ul className="space-y-2">
                  {roadmap.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-neural-300"
                    >
                      <span className="text-brand-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/community/roadmap"
              className="text-white hover:text-brand-300 transition-colors inline-flex items-center gap-2 border border-white px-6 py-3 rounded-lg"
            >
              View Complete Roadmap →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Compliance Badges Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise Trust & Compliance
            </h2>
            <p className="text-xl text-neural-600">
              Meet the highest security and compliance standards
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
            {[
              {
                badge: '🔒',
                title: 'SOC 2 Type II',
                desc: 'Security compliance verified',
              },
              {
                badge: '🌍',
                title: 'GDPR Compliant',
                desc: 'EU data protection',
              },
              { badge: '🛡️', title: 'ISO 27001', desc: 'Information security' },
              {
                badge: '✅',
                title: 'HIPAA Ready',
                desc: 'Healthcare data security',
              },
            ].map((trust, idx) => (
              <div
                key={idx}
                className="text-center p-6 border border-neural-200 rounded-lg hover:border-brand-600 transition-colors"
              >
                <div className="text-4xl mb-2">{trust.badge}</div>
                <h4 className="font-bold mb-1">{trust.title}</h4>
                <p className="text-sm text-neural-600">{trust.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom max-w-2xl">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Get the latest news, features, and tips delivered to your inbox
              every week
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg text-neural-900 placeholder-neural-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-8 py-3 bg-white text-brand-600 font-bold rounded-lg hover:bg-neutral-100 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-sm text-white/75 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="section-padding bg-gradient-to-br from-neural-900 to-neural-800 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-neural-300">
              Choose the plan that works for you
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {[
              {
                name: 'Daily',
                price: '$1',
                period: '/day',
                description: 'Perfect for short-term use',
                features: [
                  'Access to any single agent',
                  'Unlimited conversations',
                  'Real-time responses',
                  'Cancel anytime',
                ],
              },
              {
                name: 'Weekly',
                price: '$5',
                period: '/week',
                description: 'Great value for regular use',
                features: [
                  'Access to any single agent',
                  'Unlimited conversations',
                  'Real-time responses',
                  'Save 29% vs daily',
                  'Cancel anytime',
                ],
                highlighted: true,
              },
              {
                name: 'Monthly',
                price: '$19',
                period: '/month',
                description: 'Best value for long-term use',
                features: [
                  'Access to any single agent',
                  'Unlimited conversations',
                  'Real-time responses',
                  'Save 37% vs daily',
                  'Best value',
                ],
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-lg transition-transform ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-brand-600 to-accent-600 scale-105 shadow-lg'
                    : 'bg-neural-800 border border-neural-700'
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-neural-200 mb-4">
                  {plan.description}
                </p>
                <div className="text-4xl font-bold mb-6">
                  {plan.price}
                  <span className="text-lg text-neural-300">{plan.period}</span>
                </div>
                <p className="text-sm text-neural-300 mb-6">per agent</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing/overview"
                  className={`block text-center py-3 rounded-lg font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-white text-brand-600 hover:bg-neutral-100'
                      : 'border border-white text-white hover:bg-neural-700'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/pricing/overview"
              className="text-white hover:text-brand-300 transition-colors inline-flex items-center gap-2"
            >
              View all pricing details →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Thousands Choose One Last AI
            </h2>
            <p className="text-xl text-neural-600">
              Industry-leading features and support
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🚀',
                title: 'Lightning Fast',
                desc: 'Deploy AI agents in minutes, not months',
              },
              {
                icon: '🔒',
                title: 'Enterprise Security',
                desc: 'Bank-level encryption and compliance',
              },
              {
                icon: '📊',
                title: 'Real-time Analytics',
                desc: 'Monitor performance every second',
              },
              {
                icon: '🌍',
                title: 'Global Scale',
                desc: 'Serve customers in 100+ countries',
              },
              {
                icon: '🤖',
                title: 'AI Expertise',
                desc: 'Built by AI and ML pioneers',
              },
              {
                icon: '💬',
                title: '24/7 Support',
                desc: 'Expert help whenever you need it',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-6">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-neural-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Fix #3: Clear structure and spacing */}
      <section className="section-padding bg-neural-900 text-white">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-neural-300 mb-8 leading-relaxed">
              Join thousands of professionals who trust our AI platform for
              their most important work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact" className="btn-primary">
                Contact Us
              </Link>
              <Link
                href="/demo"
                className="btn-secondary bg-neutral-800 border-neutral-600 text-white hover:bg-neutral-700"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
