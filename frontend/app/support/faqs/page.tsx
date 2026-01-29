'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';

export default function FAQsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [animationsReady, setAnimationsReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Getting Started');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Getting Started',
      icon: '🚀',
      color: 'from-blue-500 to-cyan-500',
      questions: [
        { q: 'What is Maula AI?', a: 'Maula AI is a comprehensive AI platform featuring 20+ specialized AI agents, an AI Studio for interactive conversations, Canvas for real-time code and content generation, and developer tools including APIs and SDKs. Each agent specializes in different areas like physics, programming, cooking, fitness, and entertainment.' },
        { q: 'How do I get started?', a: 'Create your account, browse our AI agents at /agents, and choose the one that fits your needs. Purchase access for $1/day, $5/week, or $15/month. Once purchased, access your agent through the Studio at /studio for interactive conversations or use Canvas for code generation.' },
        { q: 'What is the AI Studio?', a: 'The AI Studio (/studio) is your central hub for interacting with AI agents. It features a modern chat interface, conversation history, real-time streaming responses, and integration with Canvas for generating live code, applications, and content.' },
        { q: 'What is Canvas?', a: 'Canvas is our real-time code and content generation tool. When chatting with agents in Studio, you can open Canvas to generate live React applications, HTML pages, and interactive content. Canvas renders your creations instantly in a preview panel alongside your conversation.' },
        { q: 'Do I need technical skills?', a: 'No! Maula AI is designed for everyone. Non-technical users can chat with agents naturally, while developers can leverage our APIs, SDKs, and Canvas for advanced integrations. We provide tutorials for all skill levels.' },
        { q: 'What agents are available?', a: 'We offer 20+ AI agents including Einstein (Physics & Math), Tech Wizard (Programming), Chef Biew (Cooking), Fitness Guru (Health), Travel Buddy (Travel), Comedy King (Entertainment), Emma (Emotional Support), and specialized agents for business, education, and creativity.' }
      ]
    },
    {
      category: 'Studio & Canvas',
      icon: '🎨',
      color: 'from-purple-500 to-pink-500',
      questions: [
        { q: 'How do I access the Studio?', a: 'Visit /studio after logging in. Select any agent you have access to and start chatting. The Studio provides a clean interface with your conversation on the left and optional Canvas panel on the right for code generation.' },
        { q: 'How does Canvas code generation work?', a: 'When chatting in Studio, ask an agent to create an app, webpage, or code snippet. Click the Canvas button to open the preview panel. The agent generates React/HTML code that renders live in Canvas, allowing you to see and interact with creations in real-time.' },
        { q: 'What can Canvas generate?', a: 'Canvas can generate React applications, HTML/CSS pages, interactive components, data visualizations, forms, dashboards, games, and more. The generated code is fully functional and can be exported for use in your projects.' },
        { q: 'Can I export code from Canvas?', a: 'Yes! You can copy the generated code directly from the Canvas panel. The code is production-ready React or HTML that you can use in your own projects. Premium users get additional export options and file downloads.' },
        { q: 'Is conversation history saved?', a: 'Yes. All your conversations are automatically saved and synced across devices. You can access previous conversations, continue where you left off, or start new chats at any time from the Studio.' },
        { q: 'Can I use multiple agents in one session?', a: 'Yes! You can switch between any agents you have access to within the Studio. Each agent maintains its own conversation context, and you can have multiple chat sessions open simultaneously.' }
      ]
    },
    {
      category: 'Billing & Pricing',
      icon: '💳',
      color: 'from-green-500 to-emerald-500',
      questions: [
        { q: 'What are the pricing plans?', a: 'We offer simple per-agent pricing: $1/day, $5/week, or $15/month. Each one-time purchase gives you unlimited access to one AI agent including Studio chat, Canvas generation, and API access. No auto-renewal—pay only when you want access.' },
        { q: 'What does "per agent" pricing mean?', a: 'Each purchase gives you full access to one AI agent. If you want multiple agents, purchase them separately. This lets you choose exactly what you need—pay for Einstein for a day of math help, or get monthly access to Tech Wizard for ongoing coding projects.' },
        { q: 'What\'s included in each purchase?', a: 'Every purchase includes: unlimited Studio chat sessions, Canvas code generation, conversation history sync, API access with generous rate limits, and all future updates to that agent during your access period.' },
        { q: 'Can I cancel anytime?', a: 'Yes! There\'s no auto-renewal. Your access simply expires at the end of the period. You keep access until expiration and can repurchase whenever you want. No cancellation needed—just don\'t renew.' },
        { q: 'Do you offer refunds?', a: 'Yes. Full refunds within 30 days, 50% refunds between 30-60 days. After 60 days, no refunds but you can always let your access expire naturally. Contact support for refund requests.' },
        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express) via Stripe, plus PayPal and bank transfers for enterprise customers. All payments are securely processed.' }
      ]
    },
    {
      category: 'Account & Security',
      icon: '🔒',
      color: 'from-orange-500 to-red-500',
      questions: [
        { q: 'Is my data secure?', a: 'Yes. We use enterprise-grade encryption (AES-256), SOC 2 Type II compliance, and regular security audits. All communications use HTTPS. Conversations are encrypted at rest and in transit.' },
        { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page. You\'ll receive a secure reset link via email (expires in 24 hours). For account security, we recommend enabling two-factor authentication.' },
        { q: 'How do I enable two-factor authentication?', a: 'Go to Account Settings → Security → Enable 2FA. We support authenticator apps (Google Authenticator, Authy, Microsoft Authenticator) for secure verification.' },
        { q: 'Can I export my conversation data?', a: 'Yes. Export your conversation history in JSON or CSV format from Account Settings → Data → Export. This includes all chats, Canvas creations, and metadata.' },
        { q: 'What happens to my data if I delete my account?', a: 'All personal data and conversations are permanently deleted within 30 days. You can request immediate deletion of specific data. We retain minimal anonymized metadata for legal compliance only.' },
        { q: 'How do I delete specific conversations?', a: 'In Studio, hover over any conversation in your history and click the delete icon. You can also bulk delete from Account Settings. Deleted conversations cannot be recovered.' }
      ]
    },
    {
      category: 'API & Developer Tools',
      icon: '⚡',
      color: 'from-indigo-500 to-violet-500',
      questions: [
        { q: 'Do you have an API?', a: 'Yes! We provide a comprehensive REST API at /docs/api. All agent purchases include API access. You get chat endpoints, streaming support, Canvas generation APIs, and webhooks for integrations.' },
        { q: 'What SDKs are available?', a: 'We offer official SDKs for JavaScript/Node.js, Python, Go, PHP, Ruby, and Java. Each SDK includes type definitions, async support, and examples. See /docs/sdks for installation and usage.' },
        { q: 'What\'s the API rate limit?', a: 'Default: 1000 requests/hour per agent. Daily purchases: 500 calls/day. Weekly: 2,500/week. Monthly: 15,000/month. Enterprise users can request higher limits. Limits are generous for typical usage.' },
        { q: 'Do you support streaming responses?', a: 'Yes! Our API supports Server-Sent Events (SSE) for real-time streaming. Get responses token-by-token as they generate, just like in the Studio interface. See our streaming documentation for examples.' },
        { q: 'Can I use webhooks?', a: 'Yes. Configure webhooks to receive real-time notifications for events like message completion, canvas generation, or conversation updates. Available for all paid plans.' },
        { q: 'How do I get my API key?', a: 'Go to Account Settings → Developer → API Keys. Generate a new key and keep it secure. You can create multiple keys with different permissions and rotate them as needed.' }
      ]
    },
    {
      category: 'Features & Usage',
      icon: '✨',
      color: 'from-teal-500 to-cyan-500',
      questions: [
        { q: 'How many conversations can I have?', a: 'Unlimited! Create as many chat sessions as you want with any agent you have access to. All conversations are saved automatically and searchable from your Studio dashboard.' },
        { q: 'Can I customize an agent\'s behavior?', a: 'Yes. You can set custom system prompts, adjust response styles, and configure context preferences. Monthly subscribers get advanced customization including personality fine-tuning and saved prompt templates.' },
        { q: 'What integrations are available?', a: 'We support Slack, Microsoft Teams, Discord, Zapier, Make.com, and direct API integration. Connect agents to your existing workflows or build custom integrations with our APIs.' },
        { q: 'Can I use Maula AI offline?', a: 'Maula AI requires an internet connection as AI processing happens on our servers. However, you can export conversations for offline reference, and our mobile experience is optimized for varying connectivity.' },
        { q: 'Are there mobile apps?', a: 'Our web app is fully responsive and works great on mobile browsers. Native iOS and Android apps are coming soon. You can also add the site to your home screen for an app-like experience.' },
        { q: 'Can I use Maula AI for commercial purposes?', a: 'Yes! All paid plans include commercial usage rights. Use agent outputs in your products, services, or business operations. Enterprise plans include additional SLAs and licensing options.' }
      ]
    }
  ];

  const handleCategoryChange = (category: string) => {
    // Use Flip for smooth category transition
    const state = Flip.getState('.faq-list');
    setActiveCategory(category);
    setOpenFAQ(null);
    
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.05
      });
    });
  };

  const toggleFAQ = (question: string) => {
    const newOpen = openFAQ === question ? null : question;
    setOpenFAQ(newOpen);

    // Animate answer expansion
    const answerEl = document.querySelector(`[data-question="${question}"]`);
    if (answerEl) {
      if (newOpen) {
        gsap.from(answerEl, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  };

  const filteredFAQs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q => searchQuery === '' || 
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  useEffect(() => {
    setAnimationsReady(true);
  }, []);

  useEffect(() => {
    if (!animationsReady || !containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Custom effects
        CustomWiggle.create('faqWiggle', { wiggles: 4, type: 'easeOut' });

        // Hero orbs
        gsap.fromTo('.hero-orb', 
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 0.4,
            duration: 2,
            ease: 'elastic.out(1, 0.5)',
            stagger: 0.3
          }
        );

        gsap.to('.hero-orb', {
          borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%',
          duration: 10,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        // Question mark particles
        const questionMarks = document.querySelectorAll('.question-particle');
        questionMarks.forEach((mark) => {
          gsap.set(mark, {
            x: Math.random() * 300 - 150,
            y: Math.random() * 200 - 100,
            rotation: Math.random() * 40 - 20
          });

          gsap.to(mark, {
            y: `-=${Math.random() * 80 + 40}`,
            rotation: `+=${Math.random() * 30 - 15}`,
            duration: Math.random() * 5 + 4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        });

        // Search bar entrance
        gsap.fromTo('.search-bar', 
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.7)',
            delay: 0.3
          }
        );

        // Category tabs
        gsap.utils.toArray('.category-tab').forEach((tab: any, i) => {
          gsap.fromTo(tab, 
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.4,
              ease: 'power2.out',
              scrollTrigger: { trigger: '.categories-container', start: 'top 85%' },
              delay: i * 0.1
            }
          );

          tab.addEventListener('mouseenter', () => {
            gsap.to(tab, { scale: 1.05, x: 10, duration: 0.2 });
            gsap.to(tab.querySelector('.tab-icon'), {
              rotation: 15,
              scale: 1.2,
              duration: 0.3,
              ease: 'faqWiggle'
            });
          });

          tab.addEventListener('mouseleave', () => {
            gsap.to(tab, { scale: 1, x: 0, duration: 0.2 });
            gsap.to(tab.querySelector('.tab-icon'), { rotation: 0, scale: 1, duration: 0.2 });
          });
        });

        // FAQ items entrance
        gsap.utils.toArray('.faq-item').forEach((item: any, i) => {
          gsap.fromTo(item, 
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out',
              scrollTrigger: { trigger: item, start: 'top 90%' },
              delay: i * 0.05
            }
          );
        });

        // Stat counters
        gsap.utils.toArray('.stat-counter').forEach((counter: any) => {
          gsap.from(counter, {
            textContent: 0,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: { trigger: counter, start: 'top 85%' }
          });
        });

        ScrollTrigger.refresh();
      }, containerRef);

      return () => ctx.revert();
    }, 50);

    return () => clearTimeout(timer);
  }, [animationsReady]);

  const currentCategory = faqs.find(f => f.category === activeCategory) || faqs[0];

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Question Mark Particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="question-particle fixed text-3xl opacity-15 pointer-events-none z-0"
          style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 60}%` }}
        >
          ❓
        </div>
      ))}

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[50vh] flex items-center justify-center py-20 px-4">
        {/* Gradient Orbs */}
        <div className="hero-orb absolute top-10 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-3xl" />
        <div className="hero-orb absolute bottom-10 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl" />

        {/* Floating Question */}
        <div className="floating-question absolute top-24 right-20 text-7xl opacity-60">
          ❓
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Find answers to common questions about Maula AI, our agents, and features.
          </p>

          {/* Search Bar */}
          <div className="search-bar relative max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full px-6 py-4 pl-14 bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-6">
            <div className="relative text-center p-4 bg-gradient-to-br from-gray-900/90 to-gray-950 rounded-xl border border-gray-800 overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                <span className="stat-counter" data-target="50">50</span>+
              </div>
              <p className="text-gray-400 text-sm mt-1">Questions Answered</p>
            </div>
            <div className="relative text-center p-4 bg-gradient-to-br from-gray-900/90 to-gray-950 rounded-xl border border-gray-800 overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                <span className="stat-counter" data-target="6">6</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Categories</p>
            </div>
            <div className="relative text-center p-4 bg-gradient-to-br from-gray-900/90 to-gray-950 rounded-xl border border-gray-800 overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                24/7
              </div>
              <p className="text-gray-400 text-sm mt-1">Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Category Sidebar */}
            <div className="categories-container lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-2">
                {faqs.map((cat) => (
                  <button
                    key={cat.category}
                    onClick={() => handleCategoryChange(cat.category)}
                    className={`category-tab w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeCategory === cat.category
                        ? 'bg-gradient-to-r ' + cat.color + ' text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="tab-icon text-xl">{cat.icon}</span>
                    <span className="font-medium">{cat.category}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            <div className="flex-1">
              <div className="faq-list space-y-4">
                {(searchQuery ? filteredFAQs : [currentCategory]).map((cat) => (
                  <div key={cat.category}>
                    {searchQuery && (
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.category}</span>
                      </h3>
                    )}
                    {cat.questions.map((faq, i) => (
                      <div
                        key={faq.q}
                        className="faq-item relative bg-gradient-to-br from-gray-900/90 to-gray-950 rounded-xl border border-gray-800 overflow-hidden mb-4"
                      >
                        {/* Corner accents */}
                        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg" />
                        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
                        <button
                          onClick={() => toggleFAQ(faq.q)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                        >
                          <span className="font-medium text-white pr-4">{faq.q}</span>
                          <span
                            className={`text-xl transition-transform duration-300 ${
                              openFAQ === faq.q ? 'rotate-180' : ''
                            }`}
                          >
                            ⌄
                          </span>
                        </button>
                        {openFAQ === faq.q && (
                          <div
                            data-question={faq.q}
                            className="px-5 pb-5 text-gray-400 leading-relaxed border-t border-white/5"
                          >
                            <p className="pt-4">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {searchQuery && filteredFAQs.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                    <p className="text-gray-400">Try a different search term or browse categories</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 bg-gradient-to-r from-violet-900/30 to-purple-900/30 rounded-2xl border border-violet-500/30 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-white mb-3">Still have questions?</h2>
            <p className="text-gray-400 mb-6">Can't find what you're looking for? Our support team is here to help.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/support/live-support"
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-semibold transition-colors"
              >
                Chat with Luna
              </Link>
              <Link
                href="/support/create-ticket"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors"
              >
                Create Ticket
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
