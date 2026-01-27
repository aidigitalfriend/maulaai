'use client';

import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, MessageSquare, Gamepad2, Briefcase, Webhook, Mail, Settings, Zap, RefreshCw, Shield } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function IntegrationsDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const integrations = [
    { title: "Slack Integration", description: "Connect your agents to Slack and respond to messages directly", category: "Communication", href: "#slack", icon: "💬", Icon: MessageSquare },
    { title: "Discord Integration", description: "Build Discord bots powered by your AI agents", category: "Gaming & Community", href: "#discord", icon: "🎮", Icon: Gamepad2 },
    { title: "Teams Integration", description: "Deploy agents to Microsoft Teams for enterprise collaboration", category: "Enterprise", href: "#teams", icon: "💼", Icon: Briefcase },
    { title: "Webhooks", description: "Send real-time data and trigger actions with webhooks", category: "Integration", href: "#webhooks", icon: "🔗", Icon: Webhook },
    { title: "Email Integration", description: "Connect your agents to handle incoming emails automatically", category: "Communication", href: "#email", icon: "📧", Icon: Mail },
    { title: "Custom APIs", description: "Build custom integrations with any third-party service", category: "Advanced", href: "#custom", icon: "⚙️", Icon: Settings }
  ];

  const benefits = [
    { Icon: Zap, title: "Easy Setup", description: "Most integrations can be set up in minutes with step-by-step guides" },
    { Icon: RefreshCw, title: "Real-time Sync", description: "Keep your data synchronized across all platforms instantly" },
    { Icon: Shield, title: "Secure", description: "Enterprise-grade security with encrypted credentials and tokens" }
  ];

  const slackSteps = [
    "Go to Slack App Directory and search for One Last AI",
    "Click 'Add to Slack' and authorize the permissions",
    "Copy your Slack Bot Token from the API settings",
    "Paste the token in One Last AI Settings → Integrations → Slack",
    "Test the connection with a message"
  ];

  const discordSteps = [
    "Create a new application in Discord Developer Portal",
    "Add a Bot User to your application",
    "Copy the Bot Token",
    "In One Last AI, go to Settings → Integrations → Discord",
    "Paste your token and configure the command prefix"
  ];

  useGSAP(() => {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.hero-buttons', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');

    gsap.fromTo('.benefit-card',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.benefits-grid', start: 'top 85%' } }
    );

    gsap.fromTo('.integration-card',
      { opacity: 0, y: 40, rotate: 2 },
      { opacity: 1, y: 0, rotate: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.integrations-grid', start: 'top 80%' } }
    );

    gsap.fromTo('.setup-step',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.setup-section', start: 'top 80%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,255,136,0.3); transform: translateY(-4px); box-shadow: 0 20px 40px -12px rgba(0,255,136,0.15); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2e1a]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,255,136,0.12)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/docs" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00ff88] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Documentation
          </Link>
          
          <div className="text-center">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 text-sm mb-6 opacity-0">
              <span className="text-xl">🔗</span>
              <span className="text-gray-300">Connect Everything</span>
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">Integrations</h1>
            <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 opacity-0">
              Connect your AI agents to the tools and platforms you already use
            </p>
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center opacity-0">
              <a href="#setup" className="px-8 py-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-xl font-semibold text-black hover:opacity-90 transition-all">Get Started</a>
              <a href="#available" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">Browse Integrations</a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 border-y border-white/5 benefits-grid">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => {
            const Icon = benefit.Icon;
            return (
              <div key={i} className="benefit-card glass-card rounded-2xl p-6 text-center opacity-0">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#00ff88]/30">
                  <Icon className="w-6 h-6 text-[#00ff88]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Available Integrations */}
      <section id="available" className="py-24 px-6 integrations-grid">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Available Integrations</h2>
            <p className="text-gray-400">Connect with your favorite platforms</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, i) => (
              <a key={i} href={integration.href} className="integration-card glass-card rounded-2xl p-6 group block opacity-0">
                <div className="text-4xl mb-4">{integration.icon}</div>
                <span className="text-xs font-medium px-3 py-1 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88]">{integration.category}</span>
                <h3 className="text-lg font-bold text-white mt-4 mb-2 group-hover:text-[#00ff88] transition-colors">{integration.title}</h3>
                <p className="text-gray-400 text-sm">{integration.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Setup Guides */}
      <section id="setup" className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] setup-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold metallic-text mb-4">Setup Guides</h2>
            <p className="text-gray-400">Step-by-step instructions for popular integrations</p>
          </div>

          {/* Slack Setup */}
          <div id="slack" className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">💬</div>
              <h3 className="text-2xl font-bold text-white">Slack Integration</h3>
            </div>
            <div className="space-y-4">
              {slackSteps.map((step, i) => (
                <div key={i} className="setup-step flex gap-4 opacity-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-full flex items-center justify-center flex-shrink-0 font-bold text-black text-sm">{i + 1}</div>
                  <p className="text-gray-300 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Discord Setup */}
          <div id="discord" className="glass-card rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">🎮</div>
              <h3 className="text-2xl font-bold text-white">Discord Integration</h3>
            </div>
            <div className="space-y-4">
              {discordSteps.map((step, i) => (
                <div key={i} className="setup-step flex gap-4 opacity-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-full flex items-center justify-center flex-shrink-0 font-bold text-black text-sm">{i + 1}</div>
                  <p className="text-gray-300 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold metallic-text mb-4">Need a Custom Integration?</h2>
          <p className="text-gray-400 mb-8">Our API makes it easy to connect with any platform or service.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs/api" className="px-8 py-4 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-xl font-semibold text-black hover:opacity-90 transition-all">
              View API Docs
            </Link>
            <Link href="/support/contact-us" className="px-8 py-4 border border-white/20 rounded-xl font-semibold hover:bg-white/5 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
