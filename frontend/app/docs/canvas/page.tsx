'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, Sparkles, Play, Code, Download, Zap, Shield, Settings, Rocket } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CanvasDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const features = [
    { Icon: Sparkles, title: 'Text to App', description: 'Describe your app in plain English and watch it come to life. Our AI understands your intent and generates functional React components.' },
    { Icon: Play, title: 'Live Preview', description: "See your application running in real-time as it's being generated. Make adjustments and see changes instantly." },
    { Icon: Code, title: 'Clean Code Output', description: 'Generated code follows best practices with proper component structure, TypeScript types, and Tailwind CSS styling.' },
    { Icon: Download, title: 'Export & Deploy', description: 'Download your generated application as a complete project ready for deployment to Vercel, Netlify, or any hosting platform.' }
  ];

  const useCases = [
    { title: 'Landing Pages', description: 'Create beautiful marketing pages with hero sections, features, testimonials, and CTAs', icon: '🎯' },
    { title: 'Dashboards', description: 'Build data visualization dashboards with charts, metrics, and interactive widgets', icon: '📊' },
    { title: 'Forms & Surveys', description: 'Generate complex forms with validation, multi-step wizards, and data collection', icon: '📝' },
    { title: 'E-commerce', description: 'Create product listings, shopping carts, and checkout flows', icon: '🛒' },
    { title: 'Admin Panels', description: 'Build CRUD interfaces, data tables, and management consoles', icon: '⚙️' },
    { title: 'Portfolio Sites', description: 'Design personal portfolios, galleries, and showcase pages', icon: '🎨' }
  ];

  const steps = [
    { step: 1, title: 'Describe Your App', description: 'Type a natural language description of what you want to build. Be specific about features, styling, and functionality.', example: '"Create a modern dashboard with a sidebar navigation, header with user profile, and main content area showing analytics cards with charts"' },
    { step: 2, title: 'AI Generates Code', description: 'Our AI analyzes your request and generates a complete React component with proper structure, styling, and interactivity.', example: 'Watch as the code appears in the editor with syntax highlighting and real-time compilation.' },
    { step: 3, title: 'Preview & Iterate', description: 'See your app running in the live preview panel. Request modifications or enhancements to refine the output.', example: '"Add a dark mode toggle to the header" or "Make the sidebar collapsible"' },
    { step: 4, title: 'Export & Use', description: 'Download the complete project with all dependencies, or copy individual components to integrate into your existing codebase.', example: 'Get a ready-to-run project with package.json, components, and configuration files.' }
  ];

  const techStack = [
    { name: 'React', description: 'Modern component-based architecture', icon: '⚛️' },
    { name: 'TypeScript', description: 'Type-safe code generation', icon: '📘' },
    { name: 'Tailwind CSS', description: 'Utility-first styling', icon: '🎨' },
    { name: 'Lucide Icons', description: 'Beautiful icon library', icon: '✨' },
    { name: 'Recharts', description: 'Data visualization charts', icon: '📈' },
    { name: 'Framer Motion', description: 'Smooth animations', icon: '🎬' }
  ];

  useGSAP(() => {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40, rotateX: 15 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

    gsap.fromTo('.cta-card',
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.cta-card', start: 'top 85%' } }
    );

    gsap.fromTo('.feature-card',
      { opacity: 0, y: 40, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.features-grid', start: 'top 80%' } }
    );

    gsap.fromTo('.step-card',
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.steps-section', start: 'top 80%' } }
    );

    gsap.fromTo('.usecase-card',
      { opacity: 0, y: 30, rotate: 3 },
      { opacity: 1, y: 0, rotate: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(1.2)', scrollTrigger: { trigger: '.usecases-grid', start: 'top 80%' } }
    );

    gsap.fromTo('.tech-card',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.tech-grid', start: 'top 85%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(168,85,247,0.4); transform: translateY(-4px); box-shadow: 0 20px 40px -12px rgba(168,85,247,0.2); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .purple-gradient { background: linear-gradient(to bottom, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d1f3d]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs" className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Documentation
          </Link>
          
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <span className="text-xl">🎨</span>
              <span className="text-gray-300">AI App Builder</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 purple-gradient opacity-0">Canvas Builder</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto opacity-0">
              Build complete web applications with AI-powered code generation
            </p>
          </div>
        </div>
      </section>

      {/* Quick Start CTA */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="cta-card relative rounded-3xl p-10 text-center overflow-hidden opacity-0">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-purple-500/10"></div>
            <div className="absolute inset-0 border border-purple-500/20 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Build?</h2>
              <p className="text-gray-400 mb-6">Jump right in and start creating your first app with Canvas Builder.</p>
              <Link href="/canvas-app" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition-all">
                <Rocket className="w-5 h-5" /> Launch Canvas Builder
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 features-grid">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Key Features</h2>
            <p className="text-gray-400">Everything you need to build apps faster</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.Icon;
              return (
                <div key={i} className="feature-card glass-card rounded-2xl p-6 opacity-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] steps-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">How It Works</h2>
            <p className="text-gray-400">From idea to app in 4 simple steps</p>
          </div>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="step-card glass-card rounded-2xl p-6 opacity-0">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xl">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400 mb-4">{step.description}</p>
                    <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                      <p className="text-sm text-gray-500 italic">{step.example}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6 usecases-grid">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">What You Can Build</h2>
            <p className="text-gray-400">Canvas Builder is perfect for a wide variety of projects</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <div key={i} className="usecase-card glass-card rounded-2xl p-6 opacity-0">
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{useCase.title}</h3>
                <p className="text-gray-400 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] tech-grid">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Technology Stack</h2>
            <p className="text-gray-400">Built with modern, production-ready technologies</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, i) => (
              <div key={i} className="tech-card glass-card rounded-xl p-4 text-center opacity-0">
                <div className="text-3xl mb-2">{tech.icon}</div>
                <div className="font-bold text-white text-sm">{tech.name}</div>
                <div className="text-xs text-gray-500">{tech.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold metallic-text mb-4">Start Building Today</h2>
          <p className="text-gray-400 mb-8">Transform your ideas into working applications in minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/canvas-app" className="px-8 py-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition-all">
              Launch Canvas Builder
            </Link>
            <Link href="/docs/tutorials" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              View Tutorials
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
