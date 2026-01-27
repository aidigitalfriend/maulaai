'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// Register GSAP plugins
gsap.registerPlugin(useGSAP, ScrollTrigger, TextPlugin);

export default function MetallicDemoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  
  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroCTARef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const useCasesRef = useRef<HTMLDivElement>(null);
  const storiesRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Logo marquee data
  const logos = [
    'Segment', 'Sisyphus', 'Polymath', 'Luminous', 'Alt+Shift', 'FeatherDev', 'Lightbox', 'Capsule'
  ];

  // Bento grid items
  const bentoItems = [
    { title: 'Streamline Your Workflow', desc: 'AI-powered automation for maximum efficiency', size: 'large', image: '🚀' },
    { title: 'Product Efficiency', desc: 'Optimize every step of your process', size: 'medium', image: '⚡' },
    { title: 'Income Insights', desc: 'Real-time revenue analytics', size: 'medium', image: '💰' },
    { title: 'Events Scheduling', desc: 'Smart calendar management', size: 'medium', image: '📅' },
    { title: 'Visitor Analytics', desc: 'Track and analyze user behavior', size: 'medium', image: '📊' },
  ];

  // Features data
  const features = [
    { icon: '🌍', title: 'Localization', desc: 'Multi-language support for global reach' },
    { icon: '📊', title: 'Monitoring', desc: 'Real-time analytics and performance tracking' },
    { icon: '💾', title: 'Data Backup', desc: 'Automatic secure cloud backups' },
    { icon: '🔒', title: 'Data Security', desc: 'Enterprise-grade encryption' },
    { icon: '📈', title: 'Scalability', desc: 'Grow without limits' },
    { icon: '🔗', title: 'Integration', desc: 'Connect with 100+ tools' },
  ];

  // Testimonials data - Row 1
  const testimonialsRow1 = [
    { name: 'Mark Roberts', role: 'Freelancer', avatar: '👨‍💻', text: 'This platform transformed how I manage my AI workflows. The automation features saved me countless hours.' },
    { name: 'Jenny Walker', role: 'CEO, TechStart', avatar: '👩‍💼', text: 'We saw a 40% increase in productivity after implementing this solution. The AI capabilities are truly next-level.' },
    { name: 'Michael Chen', role: 'Developer, HIL', avatar: '👨‍🔬', text: 'The API is incredibly well-designed. Integration took just hours instead of the weeks we anticipated.' },
    { name: 'Emily Davis', role: 'CTO, RevUp', avatar: '👩‍🚀', text: 'Security and performance exceeded our expectations. This is enterprise-ready out of the box.' },
    { name: 'David Thomson', role: 'Founder, Agency', avatar: '👨‍🎨', text: 'The customer support is phenomenal. They helped us customize everything to our exact needs.' },
  ];

  // Testimonials data - Row 2 (different people)
  const testimonialsRow2 = [
    { name: 'Sarah Kim', role: 'Product Manager', avatar: '👩‍💻', text: 'The intuitive dashboard makes it easy to track everything. Our team adopted it within days.' },
    { name: 'James Wilson', role: 'CTO, Fintech', avatar: '👨‍💼', text: 'We integrated this with our existing stack seamlessly. The API documentation is excellent.' },
    { name: 'Lisa Chen', role: 'Director, Marketing', avatar: '👩‍🎨', text: 'The AI insights helped us understand our customers better than any tool we have used before.' },
    { name: 'Robert Taylor', role: 'Startup Founder', avatar: '👨‍🚀', text: 'From day one, this platform has been a game-changer. We could not imagine working without it now.' },
    { name: 'Amanda Lee', role: 'VP Engineering', avatar: '👩‍🔬', text: 'The scalability is impressive. We went from 100 to 10,000 users without any performance issues.' },
  ];

  // FAQ data
  const faqs = [
    { q: 'How can your platform benefit my business?', a: 'Our AI-powered platform streamlines workflows, automates repetitive tasks, and provides intelligent insights that help you make better decisions faster. Businesses typically see 30-50% productivity improvements.' },
    { q: 'How secure is your platform?', a: 'We use enterprise-grade encryption (AES-256), SOC 2 Type II compliance, and regular security audits. Your data is protected with the same standards used by major financial institutions.' },
    { q: 'Can I integrate with other tools we use?', a: 'Absolutely! We offer 100+ native integrations including Slack, Notion, Salesforce, HubSpot, and more. Our API also allows custom integrations with any tool.' },
    { q: 'Which languages are supported?', a: 'Our AI supports 50+ languages for both input and output, including English, Spanish, French, German, Chinese, Japanese, and many more.' },
    { q: 'How does your pricing model work?', a: 'We offer flexible plans starting with a free tier. Paid plans are based on usage and team size, with significant discounts for annual billing. Enterprise custom pricing is available.' },
  ];

  // Use cases data
  const useCases = [
    { title: 'Workflow Automation', desc: 'Automate repetitive tasks and focus on what matters', icon: '⚡' },
    { title: 'Data-Driven Decisions', desc: 'AI-powered insights for smarter business choices', icon: '📊' },
    { title: 'Customer Engagement', desc: 'Personalized AI interactions at scale', icon: '💬' },
    { title: 'Project Management', desc: 'Streamlined planning and execution', icon: '📋' },
  ];

  // Customer stories
  const customerStories = [
    { company: 'Galileo', title: 'Why Businesses Rely on Galileo for Exceptional Results', logo: '🔭' },
    { company: 'Capsule', title: 'Transforming Visions into Reality with Capsule', logo: '💊' },
    { company: 'Polymath', title: 'Partnering with Polymath to Achieve Unparalleled Growth', logo: '🧠' },
  ];

  // Blog posts
  const blogPosts = [
    { category: 'Ideas', title: 'The Ultimate Guide to Choosing the Right AI Solution', excerpt: 'Learn how to evaluate and select the perfect AI platform for your business needs.' },
    { category: 'Business', title: 'Top 10 AI Trends to Watch in 2026', excerpt: 'Stay ahead of the curve with these emerging AI technologies and strategies.' },
    { category: 'Security', title: 'Best Practices for Data Security in AI Applications', excerpt: 'Protect your data with enterprise-grade security measures and compliance.' },
  ];

  // GSAP Animations
  useGSAP(() => {
    // Hero entrance animation
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    heroTl
      .fromTo(heroTitleRef.current, 
        { opacity: 0, y: 100, scale: 0.9 }, 
        { opacity: 1, y: 0, scale: 1, duration: 1.2 }
      )
      .fromTo(heroSubtitleRef.current, 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 0.8 }, 
        '-=0.6'
      )
      .fromTo(heroCTARef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.6 }, 
        '-=0.4'
      )
      .fromTo(dashboardRef.current, 
        { opacity: 0, y: 80, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 1 }, 
        '-=0.3'
      );

    // Parallax effect on dashboard
    gsap.to(dashboardRef.current, {
      y: 100,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    // Bento cards stagger animation
    gsap.fromTo('.bento-card', 
      { opacity: 0, y: 60, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: bentoRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Feature cards slide in
    gsap.fromTo('.feature-card', 
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Split section animation
    gsap.fromTo('.split-left', 
      { opacity: 0, x: -80 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: splitRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    gsap.fromTo('.split-right', 
      { opacity: 0, x: 80 },
      {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: splitRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Stats counter animation
    gsap.fromTo('.stat-number', 
      { textContent: 0 },
      {
        textContent: (i, el) => el.getAttribute('data-value'),
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: splitRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reset',
        },
      }
    );

    // Video section zoom
    gsap.fromTo(videoRef.current, 
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: videoRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Use cases slide up
    gsap.fromTo('.usecase-card', 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: useCasesRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Customer stories
    gsap.fromTo('.story-card', 
      { opacity: 0, y: 50, rotateY: 15 },
      {
        opacity: 1,
        y: 0,
        rotateY: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: storiesRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Blog cards
    gsap.fromTo('.blog-card', 
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: blogRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // FAQ accordion
    gsap.fromTo('.faq-item', 
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: faqRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // CTA section
    gsap.fromTo(ctaRef.current, 
      { opacity: 0, y: 60, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Section titles reveal
    gsap.utils.toArray('.section-title').forEach((title: any) => {
      gsap.fromTo(title, 
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center font-bold text-sm">
              OL
            </div>
            <span className="font-semibold text-lg">One Last AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#usecases" className="hover:text-white transition-colors">Use Cases</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="text-sm text-gray-400 hover:text-white transition-colors">Log In</button>
            <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Metallic gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 ref={heroTitleRef} className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight opacity-0">
            Transforming Your Business With Cutting-Edge AI Solutions
          </h1>
          <p ref={heroSubtitleRef} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 opacity-0">
            Harness the power of artificial intelligence to automate workflows, gain insights, and accelerate growth like never before.
          </p>
          <div ref={heroCTARef} className="flex flex-wrap items-center justify-center gap-4 opacity-0">
            <button className="group px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]">
              Get Started Free
            </button>
            <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all flex items-center gap-2 hover:border-[#00d4ff]/30">
              <span>Learn More</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div ref={dashboardRef} className="max-w-6xl mx-auto mt-16 relative opacity-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none"></div>
          <div className="absolute -inset-4 bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl opacity-50"></div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] p-2 shadow-2xl hover:border-[#00d4ff]/20 transition-colors duration-500 relative">
            <div className="rounded-xl bg-[#0a0a0a] border border-white/5 overflow-hidden">
              {/* Mock dashboard header */}
              <div className="h-10 bg-[#1a1a1a] flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                </div>
                <div className="text-xs text-gray-500">dashboard.onelastai.com</div>
                <div className="w-16"></div>
              </div>
              {/* Dashboard content */}
              <div className="p-6 grid grid-cols-4 gap-4">
                {/* Main chart area */}
                <div className="col-span-3 h-56 rounded-xl bg-gradient-to-br from-[#00d4ff]/5 to-transparent border border-white/5 p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Revenue Overview</div>
                      <div className="text-3xl font-bold text-white">$124,500</div>
                      <div className="text-xs text-[#00ff88] mt-1">↑ 24.5% from last month</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] text-xs">Weekly</div>
                      <div className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-xs">Monthly</div>
                    </div>
                  </div>
                  <div className="h-28 flex items-end gap-1 mt-4">
                    {[40, 65, 45, 80, 55, 90, 75, 85, 95, 70, 88, 92].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-[#00d4ff] to-[#00d4ff]/30 rounded-t transition-all duration-300 hover:from-[#00ff88]" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
                {/* Right stats */}
                <div className="space-y-4">
                  <div className="h-[68px] rounded-xl bg-white/5 border border-white/5 p-4 hover:bg-white/10 transition-colors">
                    <div className="text-xs text-gray-500">Active Users</div>
                    <div className="text-xl font-bold text-[#00d4ff]">2,847</div>
                  </div>
                  <div className="h-[68px] rounded-xl bg-white/5 border border-white/5 p-4 hover:bg-white/10 transition-colors">
                    <div className="text-xs text-gray-500">AI Tasks</div>
                    <div className="text-xl font-bold text-[#00ff88]">12,459</div>
                  </div>
                  <div className="h-[68px] rounded-xl bg-white/5 border border-white/5 p-4 hover:bg-white/10 transition-colors">
                    <div className="text-xs text-gray-500">Uptime</div>
                    <div className="text-xl font-bold text-white">99.9%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          LOGO MARQUEE
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 border-y border-white/5 bg-[#0a0a0a]">
        <p className="text-center text-sm text-gray-500 mb-8">Trusted by innovative companies worldwide</p>
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10"></div>
          <div className="flex animate-marquee">
            {[...logos, ...logos, ...logos].map((logo, i) => (
              <div key={i} className="flex-shrink-0 mx-12 text-2xl font-bold text-gray-600 hover:text-white transition-colors cursor-default">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          BENTO GRID - POWERING EXPERIENCE
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section ref={bentoRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 section-title">
            <p className="text-[#00d4ff] text-sm font-medium mb-3 tracking-wider uppercase">Powering Experience</p>
            <h2 className="text-4xl md:text-5xl font-bold">Everything You Need to Succeed</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Large card - Workflow */}
            <div className="bento-card md:col-span-2 md:row-span-2 group relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-8 overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-[#00d4ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-2xl font-bold mb-3">Streamline Your Workflow</h3>
              <p className="text-gray-400 mb-6">AI-powered automation for maximum efficiency</p>
              {/* Mock Dashboard Preview */}
              <div className="relative rounded-xl bg-[#0a0a0a] border border-white/5 p-4 overflow-hidden">
                <div className="flex items-end justify-around h-32 gap-2">
                  {[45, 70, 55, 85, 60, 90, 75, 80, 95, 65, 88, 72].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-[#00d4ff] to-[#00d4ff]/20 rounded-t transition-all duration-500 group-hover:from-[#00ff88]" 
                      style={{ height: `${h}%` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-500">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                </div>
              </div>
            </div>
            
            {/* Product Efficiency - with circular progress */}
            <div className="bento-card group relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#00d4ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-lg font-bold mb-2">Product Efficiency</h3>
              <p className="text-sm text-gray-400 mb-4">Optimize every step</p>
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#1a1a1a" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="url(#gradient1)" strokeWidth="3" strokeDasharray="94" strokeDashoffset="6" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00d4ff"/>
                      <stop offset="100%" stopColor="#00ff88"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[#00d4ff]">94%</span>
              </div>
            </div>
            
            {/* Income Insights - with trend line */}
            <div className="bento-card group relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#00ff88]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-lg font-bold mb-2">Income Insights</h3>
              <p className="text-sm text-gray-400 mb-2">Real-time revenue</p>
              <div className="text-2xl font-bold text-[#00ff88]">$47.2K</div>
              <div className="text-xs text-[#00ff88] mb-3">↑ 12.5% this month</div>
              <svg className="w-full h-10" viewBox="0 0 100 30">
                <path d="M0,25 Q10,20 20,22 T40,15 T60,18 T80,8 T100,5" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round"/>
                <path d="M0,25 Q10,20 20,22 T40,15 T60,18 T80,8 T100,5 L100,30 L0,30 Z" fill="url(#gradient2)" opacity="0.2"/>
                <defs>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00ff88"/>
                    <stop offset="100%" stopColor="transparent"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Events Scheduling - with calendar dots */}
            <div className="bento-card group relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#00d4ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-lg font-bold mb-2">Events Scheduling</h3>
              <p className="text-sm text-gray-400 mb-3">Smart calendar</p>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }, (_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${
                      [3, 7, 12, 18, 24].includes(i) 
                        ? 'bg-[#00d4ff] text-black font-bold' 
                        : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Visitor Analytics - with mini bars */}
            <div className="bento-card group relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-6 overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#0066ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-lg font-bold mb-2">Visitor Analytics</h3>
              <p className="text-sm text-gray-400 mb-3">Track behavior</p>
              <div className="flex items-end justify-around h-16 gap-1">
                {[60, 80, 45, 90, 55, 75, 85].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t transition-all duration-300" style={{ height: `${h}%`, background: `linear-gradient(to top, #0066ff, #00d4ff)` }}></div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Mon</span><span>Sun</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          FEATURES LIST
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section id="features" ref={featuresRef} className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 section-title">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Stunning Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Get better results with our comprehensive suite of AI-powered tools designed for modern businesses.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <a key={i} href="#" className="feature-card group p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00d4ff]/30 hover:bg-white/[0.04] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 group-hover:text-[#00d4ff] transition-colors">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SPLIT SECTION - TRACK & MANAGE
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section ref={splitRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="split-left">
              <p className="text-[#00d4ff] text-sm font-medium mb-3 tracking-wider uppercase">Expense Management</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Track, Manage, and Optimize Expenses Easily</h2>
              <p className="text-gray-400 mb-8">Leverage intelligent automation to streamline your operations and maximize efficiency across all departments.</p>
              
              <div className="space-y-6">
                {[
                  { icon: '⚡', text: 'Real-time analytics and insights' },
                  { icon: '🔄', text: 'Automated workflow optimization' },
                  { icon: '📈', text: 'Predictive performance metrics' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="split-right relative">
              <div className="absolute inset-0 bg-gradient-radial from-[#00d4ff]/20 via-transparent to-transparent blur-3xl"></div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-6 h-48 hover:border-[#00d4ff]/30 transition-colors">
                  <div className="text-sm text-gray-500 mb-2">Efficiency</div>
                  <div className="text-4xl font-bold text-[#00d4ff]">
                    <span className="stat-number" data-value="94">0</span>%
                  </div>
                  <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-gradient-to-r from-[#00d4ff] to-[#00ff88] rounded-full"></div>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-6 h-48 mt-8 hover:border-[#00d4ff]/30 transition-colors">
                  <div className="text-sm text-gray-500 mb-2">Time Saved</div>
                  <div className="text-4xl font-bold text-[#00ff88]">
                    <span className="stat-number" data-value="12">0</span>hrs
                  </div>
                  <div className="text-sm text-gray-500 mt-2">per week on average</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 overflow-hidden col-span-2 hover:border-[#00d4ff]/30 transition-colors">
                  <div className="h-32 bg-gradient-to-br from-[#00d4ff]/10 to-transparent flex items-center justify-center">
                    <div className="w-full px-6 flex items-end justify-around h-20">
                      {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                        <div key={i} className="w-6 bg-gradient-to-t from-[#00d4ff] to-[#00d4ff]/30 rounded-t transition-all duration-300 hover:from-[#00ff88]" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SPLIT SECTION 2 - PLAN & ORGANIZE (Reverse Layout)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Images on LEFT this time */}
            <div className="split-right relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-radial from-[#00ff88]/15 via-transparent to-transparent blur-3xl"></div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-6 hover:border-[#00ff88]/30 transition-colors">
                  <div className="text-4xl mb-3">📅</div>
                  <div className="text-sm text-gray-500 mb-1">Today&apos;s Tasks</div>
                  <div className="text-2xl font-bold text-white">8 / 12</div>
                  <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[67%] bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-full"></div>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-6 mt-8 hover:border-[#00ff88]/30 transition-colors">
                  <div className="text-4xl mb-3">🎯</div>
                  <div className="text-sm text-gray-500 mb-1">Goals Met</div>
                  <div className="text-2xl font-bold text-[#00ff88]">96%</div>
                </div>
                <div className="col-span-2 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 p-6 hover:border-[#00ff88]/30 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Upcoming</span>
                    <span className="text-xs text-[#00ff88]">View All</span>
                  </div>
                  <div className="space-y-3">
                    {['Team Standup', 'Design Review', 'Client Call'].map((task, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                        <div className="w-2 h-2 rounded-full bg-[#00ff88]"></div>
                        <span className="text-sm text-gray-300">{task}</span>
                        <span className="ml-auto text-xs text-gray-500">{9 + i}:00 AM</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Text on RIGHT this time */}
            <div className="split-left order-1 lg:order-2">
              <p className="text-[#00ff88] text-sm font-medium mb-3 tracking-wider uppercase">Task Management</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Plan, Organize, and Streamline Your Day</h2>
              <p className="text-gray-400 mb-8">AI-powered scheduling that learns your preferences and optimizes your calendar for maximum productivity.</p>
              
              <div className="space-y-6">
                {[
                  { icon: '🗓️', text: 'Smart calendar scheduling' },
                  { icon: '🔔', text: 'Intelligent reminders & priorities' },
                  { icon: '✅', text: 'Automated task categorization' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-[#00ff88]/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          VIDEO TOUR SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto text-center">
          <div className="section-title mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Take a Quick Tour</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">See how our platform can transform your business in just a few minutes.</p>
          </div>
          
          <div ref={videoRef} className="relative group cursor-pointer" onClick={() => setShowVideo(true)}>
            <div className="absolute inset-0 bg-gradient-radial from-[#00d4ff]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 aspect-video flex items-center justify-center group-hover:border-[#00d4ff]/30 transition-all">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#00d4ff] transition-all duration-300">
                <span className="text-3xl ml-1">▶</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-all hover:scale-105">
              Sign Up Free
            </button>
            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          USE CASES
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section id="usecases" ref={useCasesRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="section-title">
              <p className="text-[#00d4ff] text-sm font-medium mb-3 tracking-wider uppercase">Use Cases</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Practical Solutions That Drive Results</h2>
              <p className="text-gray-400">Discover how businesses like yours are leveraging our AI platform to achieve remarkable outcomes.</p>
            </div>
            
            <div className="space-y-3">
              {useCases.map((useCase, i) => (
                <a key={i} href="#" className="usecase-card group block p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00d4ff]/30 hover:bg-white/[0.04] transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff]/20 to-transparent flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      {useCase.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-[#00d4ff] transition-colors">{useCase.title}</h3>
                      <p className="text-sm text-gray-500">{useCase.desc}</p>
                    </div>
                    <span className="text-gray-600 group-hover:text-[#00d4ff] group-hover:translate-x-1 transition-all">→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          CUSTOMER STORIES
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section ref={storiesRef} className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 section-title">
            <div>
              <h2 className="text-4xl font-bold">Empowering Businesses</h2>
              <p className="text-gray-400 mt-2">See how companies succeed with our platform</p>
            </div>
            <a href="#" className="text-[#00d4ff] hover:underline flex items-center gap-2 group">
              View All <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerStories.map((story, i) => (
              <a key={i} href="#" className="story-card group block rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-300">
                <div className="h-40 bg-gradient-to-br from-[#00d4ff]/5 to-transparent flex items-center justify-center">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{story.logo}</span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-[#00d4ff] mb-2">{story.company}</p>
                  <h3 className="font-semibold group-hover:text-[#00d4ff] transition-colors">{story.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TESTIMONIALS MARQUEE - TWO ROWS
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" ref={testimonialsRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 section-title">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">You&apos;re in Good Company</h2>
            <p className="text-gray-400">See what our customers have to say</p>
          </div>
          
          {/* Row 1 - Scroll Left */}
          <div className="relative overflow-hidden mb-6">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10"></div>
            
            <div className="flex animate-marquee-slow">
              {[...testimonialsRow1, ...testimonialsRow1].map((t, i) => (
                <div key={i} className="flex-shrink-0 w-[400px] mx-3 p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 hover:border-[#00d4ff]/30 transition-colors">
                  <p className="text-gray-300 mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20 flex items-center justify-center text-2xl">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Row 2 - Scroll Right (Reverse Direction) */}
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10"></div>
            
            <div className="flex animate-marquee-reverse">
              {[...testimonialsRow2, ...testimonialsRow2].map((t, i) => (
                <div key={i} className="flex-shrink-0 w-[400px] mx-3 p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 hover:border-[#00ff88]/30 transition-colors">
                  <p className="text-gray-300 mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 flex items-center justify-center text-2xl">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          BLOG SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section ref={blogRef} className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 section-title">
            <div>
              <h2 className="text-4xl font-bold">Featured Blog</h2>
              <p className="text-gray-400 mt-2">Insights and resources for AI-driven businesses</p>
            </div>
            <a href="#" className="text-[#00d4ff] hover:underline flex items-center gap-2 group">
              View All <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
              <a key={i} href="#" className="blog-card group block rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 overflow-hidden hover:border-[#00d4ff]/30 transition-all duration-300">
                <div className="h-48 bg-gradient-to-br from-[#00d4ff]/10 to-[#0066ff]/5 group-hover:from-[#00d4ff]/20 transition-colors"></div>
                <div className="p-6">
                  <span className="text-xs text-[#00d4ff] font-medium px-3 py-1 rounded-full bg-[#00d4ff]/10">{post.category}</span>
                  <h3 className="font-semibold mt-4 mb-2 group-hover:text-[#00d4ff] transition-colors">{post.title}</h3>
                  <p className="text-sm text-gray-500">{post.excerpt}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          FAQ ACCORDION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section id="faq" ref={faqRef} className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 section-title">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">FAQs</h2>
            <p className="text-gray-400">Common questions about our AI platform</p>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item rounded-xl border border-white/5 overflow-hidden bg-white/[0.02] hover:border-[#00d4ff]/20 transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-medium pr-4">{faq.q}</span>
                  <span className={`text-2xl text-gray-400 transition-transform duration-300 ${openFaq === i ? 'rotate-45 text-[#00d4ff]' : ''}`}>
                    +
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-out ${openFaq === i ? 'max-h-48' : 'max-h-0'}`}>
                  <p className="px-6 pb-6 text-gray-400">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5">
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-gray-400 mb-6">Our team is here to help you get started.</p>
            <button className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-all hover:scale-105">
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          CTA + NEWSLETTER
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div ref={ctaRef} className="rounded-3xl bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a] border border-white/10 p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-[#00d4ff]/20 via-transparent to-transparent blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Supercharge Your Success</h2>
              <p className="text-gray-400 mb-10 max-w-2xl mx-auto">Get started with a free trial and discover how AI can transform your business today.</p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-16">
                <button className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]">
                  Get Started Free
                </button>
                <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-[#00d4ff]/30 transition-all">
                  Contact Sales
                </button>
              </div>
              
              <div className="max-w-md mx-auto">
                <p className="text-sm text-gray-500 mb-4">Join our newsletter for updates</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50 transition-colors"
                  />
                  <button className="px-6 py-3 bg-[#00d4ff] text-black font-medium rounded-full hover:bg-[#00d4ff]/80 transition-all hover:scale-105">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-3">By subscribing you agree to our Privacy Policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════════ */}
      <footer className="py-16 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center font-bold text-sm">
                  OL
                </div>
                <span className="font-semibold text-lg">One Last AI</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs">
                Transforming businesses with cutting-edge AI solutions. Automate, analyze, and accelerate your growth.
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Use Cases</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© 2026 One Last AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {['𝕏', 'in', 'f', '▶'].map((icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 hover:scale-110 transition-all">
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════════════
          VIDEO MODAL
      ═══════════════════════════════════════════════════════════════════════════ */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setShowVideo(false)}>
          <div className="max-w-4xl w-full mx-6 aspect-video bg-[#1a1a1a] rounded-2xl flex items-center justify-center">
            <p className="text-gray-500">Video Player Placeholder</p>
          </div>
          <button className="absolute top-6 right-6 text-white text-2xl hover:text-[#00d4ff] transition-colors hover:rotate-90 duration-300">✕</button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          CSS ANIMATIONS
      ═══════════════════════════════════════════════════════════════════════════ */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        
        @keyframes marquee-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        
        .animate-marquee-slow {
          animation: marquee-slow 40s linear infinite;
        }
        
        .animate-marquee-reverse {
          animation: marquee-reverse 45s linear infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
