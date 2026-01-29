'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap, SplitText, ScrambleTextPlugin, ScrollTrigger, Flip, Observer, CustomWiggle, MotionPathPlugin, Draggable, InertiaPlugin, DrawSVGPlugin } from '@/lib/gsap';


export default function DocsAPIPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const apiEndpoints = [
    { title: 'Authentication', description: 'Secure your API requests with OAuth 2.0 and API keys', category: 'Security', href: '#authentication' },
    { title: 'Agents Endpoints', description: 'Create, retrieve, and manage AI agents through our REST API', category: 'Reference', href: '#agents' },
    { title: 'Conversations API', description: 'Access and manage chat conversations and message history', category: 'Reference', href: '#conversations' },
    { title: 'Rate Limits', description: 'Understand rate limiting and throttling policies', category: 'Policy', href: '#rate-limits' },
    { title: 'Error Handling', description: 'Learn how to handle and debug API errors effectively', category: 'Guide', href: '#errors' },
    { title: 'Webhooks', description: 'Set up real-time notifications for agent events', category: 'Integration', href: '#webhooks' }
  ];

  const codeExamples = [
    { title: 'List All Agents', language: 'JavaScript', code: `const response = await fetch('https://api.maula.ai/v1/agents', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const agents = await response.json();` },
    { title: 'Create an Agent', language: 'Python', code: `import requests

response = requests.post(
  'https://api.maula.ai/v1/agents',
  headers={'Authorization': 'Bearer YOUR_API_KEY'},
  json={'name': 'My Bot', 'personality': 'helpful', 'model': 'gpt-4'}
)
agent = response.json()` },
    { title: 'Send Message', language: 'JavaScript', code: `const response = await fetch('https://api.maula.ai/v1/conversations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ agent_id: 'agent_123', message: 'Hello!' })
});` }
  ];

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. SplitText Hero Animation
      const heroTitle = new SplitText('.hero-title', { type: 'chars,words' });
      const heroSub = new SplitText('.hero-subtitle', { type: 'words' });
      gsap.set(heroTitle.chars, { y: 100, opacity: 0, rotateX: -90 });
      gsap.set(heroSub.words, { y: 40, opacity: 0 });
      gsap.set('.hero-badge', { y: 30, opacity: 0, scale: 0.8 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl
        .to('.hero-badge', { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' })
        .to(heroTitle.chars, { y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.02 }, '-=0.3')
        .to(heroSub.words, { y: 0, opacity: 1, duration: 0.5, stagger: 0.02 }, '-=0.3');

      // 2. ScrambleText on base URL
      ScrollTrigger.create({
        trigger: '.base-url',
        start: 'top 85%',
        onEnter: () => {
          gsap.to('.base-url', { duration: 1.5, scrambleText: { text: 'https://api.maula.ai/v1', chars: 'abcdefghijklmnopqrstuvwxyz./:_', speed: 0.4 } });
        }
      });

      // 3. ScrollTrigger for endpoint cards
      gsap.set('.endpoint-card', { y: 50, opacity: 0, scale: 0.95 });
      ScrollTrigger.batch('.endpoint-card', {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.4)' }),
        onLeaveBack: (batch) => gsap.to(batch, { y: 50, opacity: 0, scale: 0.95, duration: 0.3 })
      });

      // 4. Flip for code examples
      gsap.set('.code-example', { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: '.code-section',
        start: 'top 75%',
        onEnter: () => {
          gsap.utils.toArray<HTMLElement>('.code-example').forEach((el, i) => {
            const state = Flip.getState(el);
            gsap.set(el, { opacity: 1, y: 0 });
            Flip.from(state, { duration: 0.5, delay: i * 0.1, ease: 'power2.out' });
          });
        }
      });

      // 5. Observer for parallax
      Observer.create({
        target: window,
        type: 'scroll',
        onChangeY: (self) => {
          const scrollY = self.scrollY;
          gsap.to('.parallax-orb-1', { y: scrollY * 0.15, duration: 0.4, ease: 'none' });
          gsap.to('.parallax-orb-2', { y: scrollY * -0.1, duration: 0.4, ease: 'none' });
          gsap.to('.parallax-orb-3', { y: scrollY * 0.08, duration: 0.4, ease: 'none' });
        }
      });

      // 6. MotionPath for orbiting element
      gsap.to('.orbit-element', {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: 50, y: -25 }, { x: 100, y: 0 }, { x: 50, y: 25 }, { x: 0, y: 0 }],
          curviness: 2,
        },
        duration: 12,
        repeat: -1,
        ease: 'none'
      });

      // 7. CustomWiggle on copy buttons
      gsap.utils.toArray<HTMLElement>('.copy-btn').forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.1, duration: 0.3, ease: 'apiWiggle' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, duration: 0.3 });
        });
      });

      // 8. DrawSVG for decorative lines
      gsap.set('.draw-line', { drawSVG: '0%' });
      ScrollTrigger.create({
        trigger: '.endpoints-section',
        start: 'top 80%',
        onEnter: () => gsap.to('.draw-line', { drawSVG: '100%', duration: 1.2, ease: 'power2.inOut' })
      });

      // 9. Draggable cards
      if (window.innerWidth > 768) {
        Draggable.create('.draggable-card', {
          type: 'x,y',
          bounds: containerRef.current,
          inertia: true,
          onDragEnd: function() {
            gsap.to(this.target, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
          }
        });
      }

      // 10. Floating particles
      gsap.utils.toArray<HTMLElement>('.float-particle').forEach((p, i) => {
        gsap.to(p, {
          x: `random(-50, 50)`,
          y: `random(-40, 40)`,
          rotation: `random(-90, 90)`,
          duration: `random(5, 8)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.15
        });
      });

      // 11. Info cards reveal
      gsap.set('.info-card', { y: 30, opacity: 0 });
      ScrollTrigger.batch('.info-card', {
        start: 'top 90%',
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)' })
      });

      // 12. Code block typing effect
      gsap.utils.toArray<HTMLElement>('.code-content').forEach((code) => {
        ScrollTrigger.create({
          trigger: code,
          start: 'top 85%',
          onEnter: () => {
            gsap.fromTo(code, { opacity: 0.3, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.8 });
          }
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="parallax-orb-1 absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[150px]" />
        <div className="parallax-orb-2 absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-red-500/15 rounded-full blur-[120px]" />
        <div className="parallax-orb-3 absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="float-particle absolute w-1.5 h-1.5 bg-orange-400/30 rounded-full" style={{ left: `${10 + i * 8}%`, top: `${15 + (i % 4) * 18}%` }} />
        ))}
        <div className="orbit-element absolute top-32 left-1/3 w-2 h-2 bg-amber-400/60 rounded-full" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-full border border-orange-500/30 mb-6">
            <span className="text-xl">📚</span>
            <span className="font-medium">REST API</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="hero-title bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent">API Reference</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-8">
            Build powerful integrations with our comprehensive REST API
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#quick-start" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all">
              Quick Start
            </a>
            <a href="#authentication" className="px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
              View Endpoints
            </a>
          </div>
        </div>
      </section>

      {/* API Overview */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="info-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-xl">📡</div>
              <h3 className="text-xl font-bold">Base URL</h3>
            </div>
            <code className="base-url block bg-gray-900 p-4 rounded-lg text-orange-400 font-mono text-sm">https://api.maula.ai/v1</code>
            <p className="text-gray-400 text-sm mt-3">All API requests should be made to this base URL.</p>
          </div>
          <div className="info-card relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-xl">🔑</div>
              <h3 className="text-xl font-bold">Authentication</h3>
            </div>
            <code className="block bg-gray-900 p-4 rounded-lg text-green-400 font-mono text-sm">Authorization: Bearer YOUR_API_KEY</code>
            <p className="text-gray-400 text-sm mt-3">Include your API key in the Authorization header.</p>
          </div>
        </div>
      </section>

      {/* Endpoints Section */}
      <section className="endpoints-section relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* SVG Decorative Line */}
          <svg className="absolute left-1/2 -translate-x-1/2 -top-4 h-1 w-1/3 opacity-30" preserveAspectRatio="none">
            <line className="draw-line" x1="0" y1="0" x2="100%" y2="0" stroke="url(#apiGrad)" strokeWidth="2" />
            <defs>
              <linearGradient id="apiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
          <h2 className="text-3xl font-bold text-center mb-8">API Endpoints</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apiEndpoints.map((endpoint, idx) => (
              <a key={idx} href={endpoint.href} className="endpoint-card draggable-card group relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm hover:border-orange-500/50 transition-colors block">
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-orange-500/30 rounded-tr-lg" />
                <div className="mb-3">
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {endpoint.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">{endpoint.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{endpoint.description}</p>
                <span className="text-orange-400 text-sm font-medium">Learn more →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="code-section relative z-10 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Code Examples</h2>
          <div className="space-y-6">
            {codeExamples.map((example, idx) => (
              <div key={idx} className="code-example relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-700/50">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">{example.title}</span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">{example.language}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(example.code, `code-${idx}`)}
                    className="copy-btn text-gray-400 hover:text-white transition text-sm flex items-center gap-1"
                  >
                    {copiedCode === `code-${idx}` ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <pre className="code-content p-4 text-sm text-gray-300 overflow-x-auto">
                  <code>{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-10 rounded-3xl bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Build?</h2>
              <p className="text-gray-400 mb-6">Get your API key and start building powerful integrations today.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/api-keys" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all">
                  Get API Key
                </Link>
                <Link href="/docs/sdks" className="px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold hover:bg-gray-700/50 transition-all">
                  View SDKs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
