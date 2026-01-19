import HeroSectionGSAP from '@/components/HeroSectionGSAP';
import FeatureSection from '@/components/FeatureSection';
import TestimonialSection from '@/components/TestimonialSection';
import CommunityStats from '@/components/CommunityStats';
import NewsletterSection from '@/components/NewsletterSection';
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
        'Access 18 specialized AI personalities including Einstein, Shakespeare, Tesla, and more. Each agent brings unique expertise to solve your specific challenges.',
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
      {/* GSAP Hero Section - Clean, professional animation */}
      <HeroSectionGSAP />

      {/* AI-Powered Agents Section - Image Right */}
      <section className="section-padding bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 rounded-full text-brand-300 text-sm font-medium mb-6 border border-brand-500/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI-Powered Agents
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                18 Specialized
                <span className="bg-gradient-to-r from-brand-400 via-accent-400 to-brand-500 bg-clip-text text-transparent"> AI Personalities</span>
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                Access Einstein, Shakespeare, Tesla, and more. Each agent brings unique expertise to solve your specific challenges with human-like conversation.
              </p>
              <ul className="space-y-4 mb-8">
                {['Einstein - Physics & Science', 'Tech Wizard - Coding & Innovation', 'Mrs Boss - Leadership & Strategy', 'Chef Biew - Culinary Expertise', 'Emma Emotional - Empathy & Support'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-neural-200 hover:text-white transition-colors">
                    <span className="flex-shrink-0 w-6 h-6 bg-brand-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/agents" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/30 group">
                Explore All Agents
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Right - Image */}
            <div className="relative">
              <img
                src="/images/products/ai-agents.jpeg"
                alt="AI-Powered Agents"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/30">
                <span className="text-4xl">🤖</span>
              </div>
              <div className="absolute -top-4 -left-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg hidden lg:block">
                <div className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">18</div>
                <div className="text-xs text-neural-300">AI Agents</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Analytics Section - Image Left */}
      <section className="section-padding bg-gradient-to-br from-teal-900 via-cyan-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="relative order-2 lg:order-1">
              <img
                src="/images/products/analytics-dashboard.jpeg"
                alt="Real-time Analytics"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">📊</span>
              </div>
              <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-teal-400">Live</div>
                <div className="text-xs text-neural-300">Real-time Data</div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 rounded-full text-teal-300 text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Real-time Analytics
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Monitor Your AI
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"> In Real-time</span>
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                Comprehensive dashboards, usage analytics, and performance insights. Track conversations, measure engagement, and optimize your AI interactions.
              </p>
              <ul className="space-y-4 mb-8">
                {['Live conversation tracking', 'Usage & engagement metrics', 'Performance insights', 'Custom reporting dashboards', 'Export data anytime'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-neural-200">
                    <span className="flex-shrink-0 w-6 h-6 bg-teal-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-teal-500/30 group">
                View Dashboard
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Security Section - Image Right */}
      <section className="section-padding bg-gradient-to-br from-slate-900 via-zinc-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-slate-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-zinc-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/20 rounded-full text-slate-300 text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Enterprise Security
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Bank-Level
                <span className="bg-gradient-to-r from-slate-400 to-zinc-400 bg-clip-text text-transparent"> Protection</span>
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                SOC 2 compliance, end-to-end encryption, and privacy-first architecture. Your data stays protected and confidential at all times.
              </p>
              <ul className="space-y-4 mb-8">
                {['End-to-end encryption', 'SOC 2 Type II certified', 'GDPR & HIPAA compliant', 'Privacy-first architecture', 'Regular security audits'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-neural-200">
                    <span className="flex-shrink-0 w-6 h-6 bg-slate-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/security" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-slate-500/30 group">
                Security Details
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Right - Image */}
            <div className="relative">
              <img
                src="/images/products/enterprise-security.jpeg"
                alt="Enterprise Security"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-slate-500 to-zinc-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">🔒</span>
              </div>
              <div className="absolute -top-4 -left-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-green-400">100%</div>
                <div className="text-xs text-neural-300">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Environment Configuration Section - Image Left */}
      <section className="section-padding bg-gradient-to-br from-orange-900 via-amber-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="relative order-2 lg:order-1">
              <img
                src="/images/products/environment-config.jpeg"
                alt="Environment Configuration"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">⚙️</span>
              </div>
              <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-orange-400">Easy</div>
                <div className="text-xs text-neural-300">Setup</div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full text-orange-300 text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Environment Setup
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Configure Your
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"> AI Services</span>
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                Set up API keys and configure multilingual AI services with our comprehensive environment variable guide. Quick setup, powerful results.
              </p>
              <ul className="space-y-4 mb-8">
                {['Simple API key setup', 'Multi-provider support', 'Environment variables guide', 'Multilingual AI services', 'Detailed documentation'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-neural-200">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/config" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/30 group">
                Configure Setup
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Preview - Fix #4: Visual hierarchy */}
      <FeatureSection
        title="Meet Our AI Personalities"
        subtitle="Each agent specializes in different areas of expertise to help you achieve more"
        features={agentPreviews}
        layout="4-col"
        backgroundStyle="gradient"
      />

      {/* Explore All Agents Button */}
      <section className="bg-gradient-to-br from-neural-800 via-neural-900 to-neural-800 py-8">
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

      {/* AI Data Generator Section - Mirror layout of Canvas */}
      <section className="section-padding bg-gradient-to-br from-emerald-900 via-green-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Visual/Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative">
                <img
                  src="/images/products/data-generator.jpeg"
                  alt="AI Data Generator"
                  className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                  style={{ maxHeight: '450px' }}
                />
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
              </div>
              {/* Floating stats */}
              <div className="absolute -top-4 -left-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-emerald-400">50+</div>
                <div className="text-xs text-neural-300">Data Templates</div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full text-emerald-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                AI Data Generator
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Generate Test Data
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent"> in Seconds</span>
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                Create realistic test data for your applications instantly. Choose from pre-built templates or customize your own schema with AI assistance.
              </p>
              <ul className="space-y-4 mb-8">
                {['50+ pre-built data templates', 'Custom schema builder', 'Export to JSON, CSV, SQL', 'AI-powered realistic data', 'Batch generation support'].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-neural-200">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/tools/data-generator" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/30 group">
                  Generate Data
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/docs/data-generator" className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">
                  View Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Dark Theme Updated */}
      <TestimonialSection />

      {/* Community Stats Section */}
      <CommunityStats />

      {/* FAQ Section - Image Left, Content Right */}
      <section className="section-padding bg-gradient-to-br from-violet-900 via-purple-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="relative">
              <img
                src="/images/products/faq-support.jpeg"
                alt="FAQ & Support"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '500px' }}
              />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">❓</span>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-violet-400">24/7</div>
                <div className="text-xs text-neural-300">Support Ready</div>
              </div>
            </div>
            
            {/* Right - FAQ Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 rounded-full text-violet-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                FAQ Center
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Frequently Asked
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"> Questions</span>
              </h2>
              <div className="space-y-6">
                {[
                  { q: 'How do I get started?', a: 'Sign up, choose your AI agents, and start chatting within minutes.' },
                  { q: 'What AI agents are available?', a: '20+ specialized personalities including Einstein, Tech Wizard, and more.' },
                  { q: 'Is my data secure?', a: 'Bank-level encryption, SOC 2 compliance, and privacy-first architecture.' },
                  { q: 'What pricing plans exist?', a: 'Simple per-agent pricing: $1/day, $5/week, or $19/month.' },
                ].map((item, idx) => (
                  <div key={idx} className="border-l-4 border-violet-500 pl-6 hover:border-violet-300 transition-colors">
                    <h3 className="text-lg font-bold mb-2 text-white">{item.q}</h3>
                    <p className="text-neural-300">{item.a}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/support/faqs" className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-violet-500/30 group">
                  View All FAQs
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section - Content Left, Image Right */}
      <section className="section-padding bg-gradient-to-br from-amber-900 via-orange-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Latest Updates
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                News &
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> Updates</span>
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                Stay informed about new features, platform improvements, and exciting announcements from One Last AI.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { date: 'Jan 19, 2026', title: 'New Voice-to-Voice Agent Available', category: 'Feature' },
                  { date: 'Jan 15, 2026', title: 'One Last AI Reaches 10K Active Users', category: 'Milestone' },
                  { date: 'Jan 10, 2026', title: 'Enterprise Security Enhancements', category: 'Security' },
                ].map((news, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-amber-500/50 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-amber-400 text-lg">📰</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{news.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-amber-400">{news.category}</span>
                        <span className="text-xs text-neural-400">•</span>
                        <span className="text-xs text-neural-400">{news.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/resources/news" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/30 group">
                View All News
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Right - Image */}
            <div className="relative">
              <img
                src="/images/products/news-updates.jpeg"
                alt="Latest News & Updates"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '500px' }}
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">📢</span>
              </div>
              <div className="absolute -top-4 -left-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-amber-400">Fresh</div>
                <div className="text-xs text-neural-300">Daily Updates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Partners Section - Image Left, Content Right */}
      <section className="section-padding bg-gradient-to-br from-cyan-900 via-teal-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="relative">
              <img
                src="/images/products/integrations.jpeg"
                alt="Integrations & Partnerships"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">🔗</span>
              </div>
              <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-cyan-400">20+</div>
                <div className="text-xs text-neural-300">Integrations</div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 rounded-full text-cyan-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Integrations
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Connect Your
                <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent"> Favorite Tools</span>
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                Seamlessly integrate with the tools and platforms you already use. Our API and webhooks make it easy to connect.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { name: 'Slack', icon: '💬' },
                  { name: 'Teams', icon: '🤖' },
                  { name: 'Zapier', icon: '⚡' },
                  { name: 'Discord', icon: '👾' },
                  { name: 'Twilio', icon: '📞' },
                  { name: 'OpenAI', icon: '🧠' },
                ].map((partner, idx) => (
                  <div key={idx} className="text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-colors">
                    <div className="text-2xl mb-1">{partner.icon}</div>
                    <p className="font-medium text-sm text-neural-200">{partner.name}</p>
                  </div>
                ))}
              </div>
              <Link href="/about/partnerships" className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/30 group">
                Explore Integrations
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Roadmap Section - Content Left, Image Right */}
      <section className="section-padding bg-gradient-to-br from-rose-900 via-pink-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-full text-rose-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Product Roadmap
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                What's Coming
                <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent"> Next</span>
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                See what we're building next. Our transparent roadmap keeps you informed about upcoming features.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { quarter: 'Q1 2026', features: ['Multi-language Support', 'Real-time Translation', 'Enterprise SSO'], status: 'In Progress' },
                  { quarter: 'Q2 2026', features: ['AI Agent Marketplace', 'White-label Solution', 'Advanced API'], status: 'Planned' },
                ].map((roadmap, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-rose-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">{roadmap.quarter}</h3>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${roadmap.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                        {roadmap.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.features.map((f, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded text-neural-200">{f}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/community/roadmap" className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-rose-500/30 group">
                View Full Roadmap
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Right - Image */}
            <div className="relative">
              <img
                src="/images/products/roadmap.jpeg"
                alt="Product Roadmap"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">🚀</span>
              </div>
              <div className="absolute -top-4 -left-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-rose-400">2026</div>
                <div className="text-xs text-neural-300">Big Plans</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section - Image Left, Content Right */}
      <section className="section-padding bg-gradient-to-br from-slate-900 via-gray-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-slate-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="relative">
              <img
                src="/images/products/security-trust.jpeg"
                alt="Enterprise Security"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">🛡️</span>
              </div>
              <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-green-400">100%</div>
                <div className="text-xs text-neural-300">Secure</div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/20 rounded-full text-slate-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Enterprise Trust
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Security &
                <span className="bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent"> Compliance</span>
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                Meet the highest security and compliance standards. Your data is protected with enterprise-grade security.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { badge: '🔒', title: 'SOC 2 Type II', desc: 'Security verified' },
                  { badge: '🌍', title: 'GDPR Compliant', desc: 'EU data protection' },
                  { badge: '🛡️', title: 'ISO 27001', desc: 'Info security' },
                  { badge: '✅', title: 'HIPAA Ready', desc: 'Healthcare ready' },
                ].map((trust, idx) => (
                  <div key={idx} className="text-center p-4 bg-white/5 border border-white/10 rounded-xl hover:border-slate-500/50 transition-colors">
                    <div className="text-2xl mb-1">{trust.badge}</div>
                    <h4 className="font-bold text-sm text-white">{trust.title}</h4>
                    <p className="text-xs text-neural-400">{trust.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/security" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-slate-500/30 group">
                Learn About Security
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section - Content Left, Image Right */}
      <NewsletterSection />

      {/* Pricing Section - Image Left, Content Right */}
      <section className="section-padding bg-gradient-to-br from-blue-900 via-indigo-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="relative">
              <img
                src="/images/products/pricing-plans.jpeg"
                alt="Simple Pricing"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '500px' }}
              />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">💎</span>
              </div>
              <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-blue-400">Save</div>
                <div className="text-xs text-neural-300">Up to 37%</div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Simple Pricing
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Transparent
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> Pricing</span>
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                Choose the plan that works for you. Simple per-agent pricing with no hidden fees.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { name: 'Daily', price: '$1/day', desc: 'Perfect for trying out' },
                  { name: 'Weekly', price: '$5/week', desc: 'Save 29% - Popular choice', highlight: true },
                  { name: 'Monthly', price: '$19/month', desc: 'Save 37% - Best value' },
                ].map((plan, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${plan.highlight ? 'bg-blue-500/20 border-blue-500/50' : 'bg-white/5 border-white/10 hover:border-blue-500/50'}`}>
                    <div>
                      <h4 className="font-bold text-white">{plan.name}</h4>
                      <p className="text-sm text-neural-400">{plan.desc}</p>
                    </div>
                    <div className="text-xl font-bold text-blue-400">{plan.price}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/pricing/overview" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 group">
                  View All Plans
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/agents" className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">
                  Browse Agents
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - Content Left, Image Right */}
      <section className="section-padding bg-gradient-to-br from-fuchsia-900 via-purple-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-fuchsia-500/20 rounded-full text-fuchsia-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Why Thousands
                <span className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent"> Choose Us</span>
              </h2>
              <p className="text-lg text-neural-300 mb-8 leading-relaxed">
                Industry-leading features, exceptional support, and a platform built for your success.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: '🚀', title: 'Lightning Fast', desc: 'Deploy in minutes' },
                  { icon: '🔒', title: 'Enterprise Security', desc: 'Bank-level encryption' },
                  { icon: '📊', title: 'Real-time Analytics', desc: 'Monitor everything' },
                  { icon: '🌍', title: 'Global Scale', desc: '100+ countries' },
                  { icon: '🤖', title: 'AI Expertise', desc: 'Built by pioneers' },
                  { icon: '💬', title: '24/7 Support', desc: 'Always available' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-fuchsia-500/50 transition-colors">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-xs text-neural-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/about" className="inline-flex items-center gap-2 px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-fuchsia-500/30 group">
                Learn More About Us
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Right - Image */}
            <div className="relative">
              <img
                src="/images/products/why-choose-us.jpeg"
                alt="Why Choose One Last AI"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '500px' }}
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">⭐</span>
              </div>
              <div className="absolute -top-4 -left-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-fuchsia-400">10K+</div>
                <div className="text-xs text-neural-300">Happy Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Image Left, Content Right */}
      <section className="section-padding bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="relative">
              <img
                src="/images/products/transform-workflow.jpeg"
                alt="Transform Your Workflow"
                className="rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '400px' }}
              />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-brand-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">✨</span>
              </div>
            </div>
            
            {/* Right - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Ready to Transform
                <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent"> Your Workflow?</span>
              </h2>
              <p className="text-xl text-neural-300 mb-8 leading-relaxed">
                Join thousands of professionals who trust our AI platform for their most important work. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/30 group">
                  Contact Us
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/demo" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
