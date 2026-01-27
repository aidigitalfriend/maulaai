"use client";

import React, { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { 
  Shield, 
  Database, 
  Users, 
  Lock, 
  Globe, 
  Baby, 
  Cookie, 
  Bell, 
  Mail,
  X,
  ExternalLink,
  Eye,
  Server,
  Trash2,
  Download,
  Ban,
  MessageSquare,
  Check
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Article popup for legal references
const articles: Record<string, { title: string; content: string }> = {
  GDPR: {
    title: "General Data Protection Regulation (GDPR)",
    content:
      "The GDPR is a regulation in EU law on data protection and privacy for all individuals within the European Union and the European Economic Area. It addresses the transfer of personal data outside the EU and EEA areas. The GDPR aims primarily to give control to individuals over their personal data and to simplify the regulatory environment for international business.",
  },
  CCPA: {
    title: "California Consumer Privacy Act (CCPA)",
    content:
      "The CCPA is a state statute intended to enhance privacy rights and consumer protection for residents of California, United States. It grants California residents rights including knowing what personal data is being collected, knowing whether their personal data is sold or disclosed, saying no to the sale of personal data, accessing their personal data, requesting deletion of their personal data, and not being discriminated against for exercising their privacy rights.",
  },
  COPPA: {
    title: "Children's Online Privacy Protection Act (COPPA)",
    content:
      "COPPA is a United States federal law that imposes certain requirements on operators of websites or online services directed to children under 13 years of age, and on operators of other websites or online services that have actual knowledge that they are collecting personal information online from a child under 13 years of age.",
  },
};

function ArticlePopup({
  articleKey,
  onClose,
}: {
  articleKey: string;
  onClose: () => void;
}) {
  const article = articles[articleKey];
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close popup"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <h3 className="text-xl font-bold text-white mb-4 pr-10">{article.title}</h3>
        <p className="text-gray-300 leading-relaxed">{article.content}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-[#00d4ff] hover:bg-[#00d4ff]/80 text-black font-semibold rounded-xl transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function ArticleRef({
  article,
  onClick,
}: {
  article: string;
  onClick: (key: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(article)}
      className="inline-flex items-center gap-1 text-[#00d4ff] hover:text-[#00d4ff]/80 underline underline-offset-2 transition-colors"
    >
      {article}
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}

// Creative Card Styles CSS
const creativeStyles = `
  .glow-card {
    position: relative;
    overflow: hidden;
  }
  .glow-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(90deg, #00d4ff, #00ff88, #0066ff, #00d4ff);
    background-size: 400% 100%;
    animation: glow-rotate 4s linear infinite;
    border-radius: inherit;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .glow-card:hover::before {
    opacity: 1;
  }
  .glow-card::after {
    content: '';
    position: absolute;
    inset: 1px;
    background: #0f0f0f;
    border-radius: inherit;
    z-index: -1;
  }
  
  @keyframes glow-rotate {
    0% { background-position: 0% 50%; }
    100% { background-position: 400% 50%; }
  }
  
  .shimmer-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(0, 212, 255, 0.1), transparent);
    transition: left 0.6s ease;
  }
  .shimmer-card:hover::before {
    left: 100%;
  }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .glass-card:hover {
    background: rgba(255, 255, 255, 0.06);
  }
  
  .float-card {
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
  }
  .float-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px -12px rgba(0, 212, 255, 0.25);
  }
  
  .cyber-grid {
    background-image: 
      linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
  }
`;

export default function PrivacyPolicyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeArticle, setActiveArticle] = useState<string | null>(null);

  // 3D Tilt effect for cards
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  useGSAP(() => {
    // Hero entrance animation with 3D effect
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' })
      .fromTo('.hero-title', { opacity: 0, y: 40, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.hero-meta', { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.2');

    // Bento cards - explosive stagger from different directions
    const bentoCards = gsap.utils.toArray('.bento-card');
    bentoCards.forEach((card: any, i) => {
      const directions = [
        { x: -60, y: -30, rotate: -5 },
        { x: 60, y: -30, rotate: 5 },
        { x: -40, y: 40, rotate: -3 },
        { x: 40, y: 40, rotate: 3 },
      ];
      const dir = directions[i % directions.length];
      
      gsap.fromTo(card, 
        { opacity: 0, x: dir.x, y: dir.y, rotate: dir.rotate, scale: 0.8, filter: 'blur(5px)' },
        {
          opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: 'blur(0px)',
          duration: 0.9, delay: i * 0.1,
          ease: 'elastic.out(1, 0.8)',
          scrollTrigger: { trigger: '.bento-grid', start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
    });

    // Section animations with blur
    gsap.utils.toArray<HTMLElement>('.section-animate').forEach((section) => {
      gsap.fromTo(section, 
        { opacity: 0, y: 50, filter: 'blur(5px)' }, 
        {
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
    });

    // Feature cards - wave effect with 3D
    const featureCards = gsap.utils.toArray('.feature-card');
    featureCards.forEach((card: any, i) => {
      gsap.fromTo(card, 
        { opacity: 0, x: -40, rotateY: -15, scale: 0.9 }, 
        {
          opacity: 1, x: 0, rotateY: 0, scale: 1,
          duration: 0.7, delay: i * 0.08,
          ease: 'back.out(1.5)',
          scrollTrigger: { trigger: '.features-grid', start: 'top 80%', toggleActions: 'play none none reverse' },
        }
      );
    });

  }, { scope: containerRef });

  const dataCollected = [
    { icon: Users, title: "Account Information", desc: "Name, email, phone, billing info", color: "#00d4ff" },
    { icon: MessageSquare, title: "Chat Data", desc: "Conversations with AI assistants", color: "#00ff88" },
    { icon: Eye, title: "Usage Data", desc: "Device info, IP address, browsing", color: "#0066ff" },
    { icon: Cookie, title: "Cookie Data", desc: "Preferences and analytics", color: "#f59e0b" },
  ];

  const dataUsage = [
    { title: "Service Delivery", desc: "Providing and improving AI chat services" },
    { title: "Personalization", desc: "Customizing your experience" },
    { title: "Communication", desc: "Updates, alerts, and support" },
    { title: "Analytics", desc: "Understanding usage patterns" },
    { title: "AI Training", desc: "Improving models (anonymized)" },
    { title: "Legal Compliance", desc: "Meeting regulatory requirements" },
  ];

  const userRights = [
    { icon: Eye, title: "Access", desc: "Request a copy of your data", color: "#00d4ff" },
    { icon: Database, title: "Rectification", desc: "Correct inaccurate information", color: "#00ff88" },
    { icon: Trash2, title: "Erasure", desc: "Request deletion of your data", color: "#ef4444" },
    { icon: Download, title: "Portability", desc: "Receive data in structured format", color: "#a855f7" },
    { icon: Ban, title: "Object", desc: "Opt-out of certain processing", color: "#f59e0b" },
    { icon: Lock, title: "Restrict", desc: "Limit how we process your data", color: "#0066ff" },
  ];

  const retentionData = [
    { type: "Account Information", period: "Until account deletion + 30 days" },
    { type: "Chat History", period: "90 days (or until manually deleted)" },
    { type: "Payment Records", period: "7 years (legal requirement)" },
    { type: "Analytics Data", period: "26 months (anonymized)" },
    { type: "Support Tickets", period: "2 years after resolution" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-6">
            <Shield className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-sm text-[#00d4ff] font-medium">Privacy Policy</span>
          </div>
          
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            Your Privacy Matters
          </h1>
          
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-6">
            We are committed to protecting your personal information and being transparent about how we collect, use, and share it.
          </p>
          
          <p className="hero-meta text-sm text-gray-500">
            Last updated: December 28, 2024
          </p>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 md:p-12 relative overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-[#00d4ff]/10 to-transparent opacity-50"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#00d4ff]" />
                </div>
                <h2 className="text-3xl font-bold">Introduction</h2>
              </div>
              
              <p className="text-gray-300 text-lg mb-4 max-w-3xl">
                Welcome to One Last AI. We are committed to protecting your personal information and your right to privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>
              <p className="text-gray-400">
                This policy is designed to comply with various privacy regulations, including the{" "}
                <ArticleRef article="GDPR" onClick={setActiveArticle} />,{" "}
                <ArticleRef article="CCPA" onClick={setActiveArticle} />, and other applicable laws.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMATION WE COLLECT - BENTO GRID */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 section-animate">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-4">
              <Database className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-sm text-[#00d4ff] font-medium">Data Collection</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Information We Collect</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">We collect information to provide and improve our AI services</p>
          </div>
          
          <div className="bento-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dataCollected.map((item, i) => (
              <div 
                key={i} 
                className="bento-card float-card glass-card shimmer-card group relative rounded-2xl p-6 overflow-hidden cursor-pointer cyber-grid"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${item.color}20, transparent 60%)` }}
                ></div>
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                  style={{ background: `linear-gradient(135deg, ${item.color}30, transparent)` }}
                >
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2 transition-colors duration-300" style={{ color: 'white' }}>{item.title}</h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE USE YOUR INFORMATION */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="section-animate">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-4">
                <Users className="w-4 h-4 text-[#00d4ff]" />
                <span className="text-sm text-[#00d4ff] font-medium">Data Usage</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">How We Use Your Information</h2>
              <p className="text-gray-400 mb-8">
                We use the information we collect for various purposes to provide, maintain, and improve our services.
              </p>
              
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl hover:border-green-500/40 transition-colors">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-400 mb-1">We do NOT sell your data</p>
                    <p className="text-sm text-gray-400">Your personal information is never sold to third parties for marketing purposes.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="section-animate grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dataUsage.map((item, i) => {
                const colors = ['#00d4ff', '#00ff88', '#0066ff', '#a855f7', '#f59e0b', '#ef4444'];
                const color = colors[i % colors.length];
                return (
                  <div 
                    key={i} 
                    className="glass-card float-card group p-5 rounded-2xl overflow-hidden relative cursor-pointer"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }}></div>
                    <h4 className="font-semibold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">{item.title}</h4>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* INFORMATION SHARING */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center">
                <Globe className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h2 className="text-3xl font-bold">Information Sharing</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { title: "Service Providers", desc: "Third-party vendors for payment processing, analytics, and hosting" },
                { title: "AI Model Providers", desc: "OpenAI, Anthropic, Google for processing conversations" },
                { title: "Legal Requirements", desc: "When required by law, court order, or government regulation" },
                { title: "Business Transfers", desc: "In the event of merger, acquisition, or sale of assets" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[#00d4ff] mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* YOUR RIGHTS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 section-animate">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Rights</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Depending on your location, you have certain rights regarding your personal information</p>
          </div>
          
          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userRights.map((right, i) => {
              const colors = ['#00d4ff', '#00ff88', '#0066ff', '#a855f7', '#f59e0b', '#ef4444'];
              const color = colors[i % colors.length];
              return (
                <div 
                  key={i} 
                  className="feature-card glow-card glass-card float-card group p-6 rounded-2xl overflow-hidden relative cursor-pointer cyber-grid"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }}></div>
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                    style={{ background: `linear-gradient(135deg, ${color}30, transparent)` }}
                  >
                    <right.icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 transition-colors duration-300" style={{ color: 'white' }}>Right to {right.title}</h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{right.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DATA RETENTION */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center">
                <Server className="w-6 h-6 text-[#00d4ff]" />
              </div>
              <h2 className="text-3xl font-bold">Data Retention</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Data Type</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Retention Period</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionData.map((item, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-4 px-4 text-white">{item.type}</td>
                      <td className="py-4 px-4 text-gray-400">{item.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY & CHILDREN */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Security */}
            <div className="section-animate rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-8 hover:border-[#00d4ff]/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-8 h-8 text-[#00d4ff]" />
                <h3 className="text-2xl font-bold">Security</h3>
              </div>
              <p className="text-gray-400 mb-4">We implement industry-standard security measures:</p>
              <ul className="space-y-3">
                {["256-bit SSL encryption", "PCI DSS compliance", "Regular security audits", "Access controls and monitoring"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-[#00d4ff]" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Children's Privacy */}
            <div className="section-animate rounded-2xl bg-red-500/10 border border-red-500/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Baby className="w-8 h-8 text-red-400" />
                <h3 className="text-2xl font-bold text-red-400">Children&apos;s Privacy</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Our services are not intended for users under 18 years of age. We comply with{" "}
                <ArticleRef article="COPPA" onClick={setActiveArticle} /> requirements.
              </p>
              <p className="text-gray-400">
                If we learn we have collected personal information from a child under 13, we will delete it immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="section-animate rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] border border-white/10 p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-[#00d4ff]/20 via-transparent to-transparent blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-[#00d4ff]" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h2>
              <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
                Questions about this Privacy Policy? Reach out to our privacy team.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#00d4ff]/30 transition-colors">
                  <p className="text-sm text-gray-500 mb-1">Privacy Team</p>
                  <a href="mailto:privacy@onelastai.com" className="text-[#00d4ff] hover:underline">privacy@onelastai.com</a>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-[#00d4ff]/30 transition-colors">
                  <p className="text-sm text-gray-500 mb-1">Data Requests</p>
                  <a href="mailto:data@onelastai.com" className="text-[#00d4ff] hover:underline">data@onelastai.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Popup */}
      {activeArticle && (
        <ArticlePopup articleKey={activeArticle} onClose={() => setActiveArticle(null)} />
      )}

      {/* CSS for gradient-radial */}
      <style jsx>{`
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
