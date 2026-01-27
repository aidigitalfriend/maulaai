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

  // GSAP Animations - Creative & Modern
  useGSAP(() => {
    // Hero entrance animation with 3D effect
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    heroTl
      .fromTo(heroTitleRef.current, 
        { opacity: 0, y: 100, scale: 0.9, rotateX: 20 }, 
        { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1.2 }
      )
      .fromTo(heroSubtitleRef.current, 
        { opacity: 0, y: 50, filter: 'blur(10px)' }, 
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, 
        '-=0.6'
      )
      .fromTo(heroCTARef.current, 
        { opacity: 0, y: 30, scale: 0.8 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, 
        '-=0.4'
      )
      .fromTo(dashboardRef.current, 
        { opacity: 0, y: 80, scale: 0.9, rotateX: 10 }, 
        { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1.2, ease: 'power4.out' }, 
        '-=0.3'
      );

    // Parallax effect on dashboard
    gsap.to(dashboardRef.current, {
      y: 100,
      rotateX: -5,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    // Bento cards - EXPLOSIVE STAGGER from center
    const bentoCards = gsap.utils.toArray('.bento-card');
    bentoCards.forEach((card: any, i) => {
      const directions = [
        { x: -100, y: -50, rotate: -10 },
        { x: 100, y: -50, rotate: 10 },
        { x: -80, y: 50, rotate: -5 },
        { x: 80, y: 50, rotate: 5 },
        { x: 0, y: 80, rotate: 0 },
      ];
      const dir = directions[i % directions.length];
      
      gsap.fromTo(card, 
        { opacity: 0, x: dir.x, y: dir.y, rotate: dir.rotate, scale: 0.7, filter: 'blur(8px)' },
        {
          opacity: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1,
          delay: i * 0.1,
          ease: 'elastic.out(1, 0.8)',
          scrollTrigger: {
            trigger: bentoRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Feature cards - WAVE effect from left with 3D rotation
    const featureCards = gsap.utils.toArray('.feature-card');
    featureCards.forEach((card: any, i) => {
      gsap.fromTo(card, 
        { opacity: 0, x: -60, rotateY: -30, scale: 0.9 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.8,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Split section - SLIDE with parallax layers
    gsap.fromTo('.split-left', 
      { opacity: 0, x: -100, scale: 0.95 },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: splitRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    gsap.fromTo('.split-right', 
      { opacity: 0, x: 100, scale: 0.95 },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: splitRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Stats counter animation with bounce
    gsap.fromTo('.stat-number', 
      { textContent: 0 },
      {
        textContent: (i, el) => el.getAttribute('data-value'),
        duration: 2.5,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: splitRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reset',
        },
      }
    );

    // Video section - DRAMATIC zoom with glow
    gsap.fromTo(videoRef.current, 
      { opacity: 0, scale: 0.6, filter: 'blur(20px) brightness(2)' },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px) brightness(1)',
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: videoRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Use cases - DIAGONAL slide with rotation
    const useCaseCards = gsap.utils.toArray('.usecase-card');
    useCaseCards.forEach((card: any, i) => {
      gsap.fromTo(card, 
        { opacity: 0, x: 50, y: 50, rotate: 5, scale: 0.9 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 0.7,
          delay: i * 0.12,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: useCasesRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Customer stories - FLIP IN 3D
    const storyCards = gsap.utils.toArray('.story-card');
    storyCards.forEach((card: any, i) => {
      gsap.fromTo(card, 
        { opacity: 0, rotateY: 90, scale: 0.8, transformOrigin: 'left center' },
        {
          opacity: 1,
          rotateY: 0,
          scale: 1,
          duration: 1,
          delay: i * 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: storiesRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Blog cards - STAGGERED POP with different heights
    const blogCards = gsap.utils.toArray('.blog-card');
    blogCards.forEach((card: any, i) => {
      const yOffsets = [80, 60, 100];
      gsap.fromTo(card, 
        { opacity: 0, y: yOffsets[i % 3], scale: 0.85, filter: 'blur(5px)' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.9,
          delay: i * 0.15,
          ease: 'elastic.out(1, 0.9)',
          scrollTrigger: {
            trigger: blogRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // FAQ accordion - ACCORDION SLIDE with bounce
    const faqItems = gsap.utils.toArray('.faq-item');
    faqItems.forEach((item: any, i) => {
      gsap.fromTo(item, 
        { opacity: 0, x: i % 2 === 0 ? -50 : 50, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: faqRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // CTA section - GRAND REVEAL
    gsap.fromTo(ctaRef.current, 
      { opacity: 0, y: 100, scale: 0.9, filter: 'blur(10px)' },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.2,
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

  // 3D Tilt effect for cards
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      
      {/* Custom CSS for creative card effects */}
      <style jsx global>{`
        /* Glowing border effect */
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
        
        /* Shimmer effect */
        .shimmer-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(0, 212, 255, 0.1),
            transparent
          );
          transition: left 0.6s ease;
        }
        .shimmer-card:hover::before {
          left: 100%;
        }
        
        /* Floating card effect */
        .float-card {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
        }
        .float-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 212, 255, 0.25);
        }
        
        /* Magnetic card */
        .magnetic-card {
          transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);
        }
        
        /* Pulse glow */
        .pulse-glow {
          position: relative;
        }
        .pulse-glow::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(45deg, #00d4ff, #00ff88);
          opacity: 0;
          z-index: -1;
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.02); }
        }
        
        /* Gradient border animation */
        .gradient-border {
          position: relative;
          background: linear-gradient(#0f0f0f, #0f0f0f) padding-box,
                      linear-gradient(135deg, #00d4ff, #00ff88, #0066ff) border-box;
          border: 2px solid transparent;
        }
        
        /* Neon glow text */
        .neon-text {
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
        }
        
        /* Glass morphism */
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(0, 212, 255, 0.3);
        }
        
        /* Spotlight effect */
        .spotlight-card {
          position: relative;
          overflow: hidden;
        }
        .spotlight-card::before {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .spotlight-card:hover::before {
          opacity: 1;
        }
        
        /* Cyber grid background */
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        /* Animated icon */
        .icon-bounce {
          transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .group:hover .icon-bounce {
          transform: scale(1.2) rotate(-5deg);
        }
        
        /* Floating animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        /* Testimonial card hover */
        .testimonial-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .testimonial-card:hover {
          transform: translateY(-4px) scale(1.02);
        }
      `}</style>

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
            <div 
              className="bento-card glow-card shimmer-card md:col-span-2 md:row-span-2 group relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/5 p-8 overflow-hidden transition-all duration-500 cursor-pointer cyber-grid" 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-[#00d4ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-[#00ff88]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-[#00d4ff] transition-colors duration-300">Streamline Your Workflow</h3>
              <p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors">AI-powered automation for maximum efficiency</p>
              {/* Mock Dashboard Preview */}
              <div className="relative rounded-xl bg-[#0a0a0a] border border-white/5 p-4 overflow-hidden group-hover:border-[#00d4ff]/20 transition-colors">
                <div className="flex items-end justify-around h-32 gap-2">
                  {[45, 70, 55, 85, 60, 90, 75, 80, 95, 65, 88, 72].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-gradient-to-t from-[#00d4ff] to-[#00d4ff]/20 rounded-t transition-all duration-500 group-hover:from-[#00ff88] hover:!from-[#fff]" 
                      style={{ height: `${h}%`, transitionDelay: `${i * 30}ms` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-500">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                </div>
              </div>
            </div>
            
            {/* Product Efficiency - with circular progress */}
            <div 
              className="bento-card float-card glass-card group relative rounded-2xl p-6 overflow-hidden cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#00d4ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#00d4ff]/10 rounded-full blur-2xl group-hover:bg-[#00d4ff]/30 transition-colors"></div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[#00d4ff] transition-colors">Product Efficiency</h3>
              <p className="text-sm text-gray-400 mb-4">Optimize every step</p>
              <div className="relative w-20 h-20 mx-auto group-hover:scale-110 transition-transform duration-500">
                <svg className="w-20 h-20 -rotate-90 group-hover:rotate-[270deg] transition-transform duration-1000" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#1a1a1a" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="url(#gradient1)" strokeWidth="3" strokeDasharray="94" strokeDashoffset="6" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]"/>
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00d4ff"/>
                      <stop offset="100%" stopColor="#00ff88"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[#00d4ff] group-hover:scale-110 transition-transform">94%</span>
              </div>
            </div>
            
            {/* Income Insights - with trend line */}
            <div 
              className="bento-card float-card glass-card group relative rounded-2xl p-6 overflow-hidden cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#00ff88]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#00ff88]/10 rounded-full blur-2xl group-hover:bg-[#00ff88]/30 transition-colors"></div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[#00ff88] transition-colors">Income Insights</h3>
              <p className="text-sm text-gray-400 mb-2">Real-time revenue</p>
              <div className="text-2xl font-bold text-[#00ff88] group-hover:scale-105 transition-transform origin-left">$47.2K</div>
              <div className="text-xs text-[#00ff88] mb-3 flex items-center gap-1">
                <span className="inline-block group-hover:animate-bounce">↑</span> 12.5% this month
              </div>
              <svg className="w-full h-10 group-hover:drop-shadow-[0_0_15px_rgba(0,255,136,0.4)] transition-all" viewBox="0 0 100 30">
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
            <div 
              className="bento-card float-card glass-card group relative rounded-2xl p-6 overflow-hidden cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#00d4ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[#00d4ff] transition-colors">Events Scheduling</h3>
              <p className="text-sm text-gray-400 mb-3">Smart calendar</p>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }, (_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center transition-all duration-300 hover:scale-125 ${
                      [3, 7, 12, 18, 24].includes(i) 
                        ? 'bg-[#00d4ff] text-black font-bold shadow-[0_0_10px_rgba(0,212,255,0.5)] hover:shadow-[0_0_20px_rgba(0,212,255,0.8)]' 
                        : 'bg-white/5 text-gray-500 hover:bg-white/20'
                    }`}
                    style={{ transitionDelay: `${i * 15}ms` }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Visitor Analytics - with mini bars */}
            <div 
              className="bento-card float-card glass-card group relative rounded-2xl p-6 overflow-hidden cursor-pointer"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#0066ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#0066ff]/10 rounded-full blur-2xl group-hover:bg-[#0066ff]/30 transition-colors"></div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-[#0066ff] transition-colors">Visitor Analytics</h3>
              <p className="text-sm text-gray-400 mb-3">Track behavior</p>
              <div className="flex items-end justify-around h-16 gap-1">
                {[60, 80, 45, 90, 55, 75, 85].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 rounded-t transition-all duration-500 hover:!h-full group-hover:shadow-[0_0_10px_rgba(0,102,255,0.3)]" 
                    style={{ 
                      height: `${h}%`, 
                      background: `linear-gradient(to top, #0066ff, #00d4ff)`,
                      transitionDelay: `${i * 50}ms`
                    }}
                  ></div>
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
            {features.map((feature, i) => {
              const colors = ['#00d4ff', '#00ff88', '#0066ff', '#ff00ff', '#ff6600', '#00ffff'];
              const color = colors[i % colors.length];
              return (
                <a 
                  key={i} 
                  href="#" 
                  className="feature-card group relative p-6 rounded-xl glass-card shimmer-card overflow-hidden transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Spotlight effect */}
                  <div 
                    className="absolute w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl -z-10"
                    style={{ background: `radial-gradient(circle, ${color}30, transparent 70%)`, top: '-20%', right: '-20%' }}
                  ></div>
                  
                  {/* Animated border on hover */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `inset 0 0 0 1px ${color}40` }}></div>
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 icon-bounce transition-all duration-500 group-hover:shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${color}30, transparent)`,
                        boxShadow: `0 0 0 1px ${color}20`
                      }}
                    >
                      <span className="group-hover:scale-110 transition-transform duration-300">{feature.icon}</span>
                    </div>
                    <div>
                      <h3 
                        className="font-semibold mb-1 transition-colors duration-300"
                        style={{ color: 'white' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = color}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">{feature.desc}</p>
                    </div>
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" style={{ background: `${color}20` }}>
                    <span style={{ color }}>→</span>
                  </div>
                </a>
              );
            })}
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
              {useCases.map((useCase, i) => {
                const colors = ['#00d4ff', '#00ff88', '#0066ff', '#ff6600'];
                const color = colors[i % colors.length];
                return (
                  <a 
                    key={i} 
                    href="#" 
                    className="usecase-card group relative block p-6 rounded-xl glass-card overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Left border glow */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to bottom, transparent, ${color}, transparent)` }}></div>
                    
                    {/* Background glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 20% 50%, ${color}10, transparent 50%)` }}></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-500 group-hover:rotate-12"
                        style={{ 
                          background: `linear-gradient(135deg, ${color}30, transparent)`,
                          boxShadow: `0 0 0 1px ${color}20`
                        }}
                      >
                        <span className="group-hover:scale-125 transition-transform duration-500">{useCase.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold transition-colors duration-300" style={{ color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.color = color} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>{useCase.title}</h3>
                        <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">{useCase.desc}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-2" style={{ background: `${color}10` }}>
                        <span className="transition-colors" style={{ color }}>→</span>
                      </div>
                    </div>
                  </a>
                );
              })}
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
            {customerStories.map((story, i) => {
              const colors = ['#00d4ff', '#00ff88', '#0066ff'];
              const color = colors[i % colors.length];
              return (
                <a 
                  key={i} 
                  href="#" 
                  className="story-card group relative block rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03] cursor-pointer"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 rounded-2xl glow-card" style={{ zIndex: -1 }}></div>
                  
                  {/* Card content */}
                  <div className="relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 overflow-hidden group-hover:border-transparent transition-all duration-500">
                    
                    {/* Icon area with gradient */}
                    <div 
                      className="h-44 relative flex items-center justify-center overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${color}10, transparent)` }}
                    >
                      {/* Floating particles */}
                      <div className="absolute inset-0">
                        {[...Array(5)].map((_, j) => (
                          <div 
                            key={j}
                            className="absolute w-2 h-2 rounded-full opacity-20 group-hover:opacity-60 transition-opacity duration-1000"
                            style={{ 
                              background: color,
                              left: `${20 + j * 15}%`,
                              top: `${30 + (j % 3) * 20}%`,
                              animation: `float ${2 + j * 0.5}s ease-in-out infinite`,
                              animationDelay: `${j * 0.2}s`
                            }}
                          ></div>
                        ))}
                      </div>
                      
                      {/* Icon with glow */}
                      <span 
                        className="text-7xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 relative z-10"
                        style={{ filter: `drop-shadow(0 0 30px ${color}50)` }}
                      >
                        {story.logo}
                      </span>
                      
                      {/* Bottom gradient fade */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                    </div>
                    
                    <div className="p-6 relative">
                      {/* Glow line */}
                      <div 
                        className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }}
                      ></div>
                      
                      <p className="text-sm font-medium mb-2 transition-colors duration-300" style={{ color }}>{story.company}</p>
                      <h3 className="font-semibold text-white group-hover:text-gray-100 transition-colors leading-snug">{story.title}</h3>
                      
                      {/* Read more indicator */}
                      <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-0 translate-y-2">
                        <span className="text-sm" style={{ color }}>Read Story</span>
                        <span style={{ color }}>→</span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
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
                <div key={i} className="testimonial-card group flex-shrink-0 w-[400px] mx-3 p-6 rounded-2xl glass-card relative overflow-hidden cursor-pointer">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ boxShadow: 'inset 0 0 0 1px rgba(0, 212, 255, 0.3)' }}></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#00d4ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                  
                  {/* Quote icon */}
                  <div className="absolute top-4 right-4 text-4xl opacity-10 group-hover:opacity-30 transition-opacity text-[#00d4ff]">"</div>
                  
                  <p className="text-gray-300 mb-6 italic relative z-10 group-hover:text-gray-200 transition-colors">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00d4ff]/30 to-[#0066ff]/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 ring-2 ring-white/10 group-hover:ring-[#00d4ff]/30">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold group-hover:text-[#00d4ff] transition-colors">{t.name}</div>
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
                <div key={i} className="testimonial-card group flex-shrink-0 w-[400px] mx-3 p-6 rounded-2xl glass-card relative overflow-hidden cursor-pointer">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ boxShadow: 'inset 0 0 0 1px rgba(0, 255, 136, 0.3)' }}></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#00ff88]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                  
                  {/* Quote icon */}
                  <div className="absolute top-4 right-4 text-4xl opacity-10 group-hover:opacity-30 transition-opacity text-[#00ff88]">"</div>
                  
                  <p className="text-gray-300 mb-6 italic relative z-10 group-hover:text-gray-200 transition-colors">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00ff88]/30 to-[#00d4ff]/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 ring-2 ring-white/10 group-hover:ring-[#00ff88]/30">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold group-hover:text-[#00ff88] transition-colors">{t.name}</div>
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
            {blogPosts.map((post, i) => {
              const colors = ['#00d4ff', '#00ff88', '#0066ff'];
              const color = colors[i % colors.length];
              return (
                <a 
                  key={i} 
                  href="#" 
                  className="blog-card group relative block rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="relative rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 overflow-hidden group-hover:border-transparent transition-all duration-500">
                    {/* Animated gradient border on hover */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: `inset 0 0 0 1px ${color}40` }}></div>
                    
                    {/* Image area with gradient pattern */}
                    <div 
                      className="h-52 relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${color}10, ${color}05)` }}
                    >
                      {/* Animated grid pattern */}
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500 cyber-grid"></div>
                      
                      {/* Floating decorative elements */}
                      <div 
                        className="absolute w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-all duration-700"
                        style={{ background: color, top: '20%', right: '10%' }}
                      ></div>
                      <div 
                        className="absolute w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-all duration-700"
                        style={{ background: color, bottom: '20%', left: '15%' }}
                      ></div>
                      
                      {/* Category badge - positioned in image */}
                      <div className="absolute top-4 left-4">
                        <span 
                          className="text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300 group-hover:scale-105"
                          style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
                        >
                          {post.category}
                        </span>
                      </div>
                      
                      {/* Bottom gradient fade */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
                    </div>
                    
                    <div className="p-6 relative">
                      <h3 className="font-semibold text-lg mb-2 transition-colors duration-300 leading-snug" style={{ color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.color = color} onMouseLeave={(e) => e.currentTarget.style.color = 'white'}>
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors line-clamp-2">{post.excerpt}</p>
                      
                      {/* Read more with animated arrow */}
                      <div className="mt-4 flex items-center gap-2 transition-all duration-300 group-hover:translate-x-1">
                        <span className="text-sm font-medium" style={{ color }}>Read Article</span>
                        <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ color }}>→</span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
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
              <div key={i} className="faq-item group rounded-xl overflow-hidden glass-card relative transition-all duration-300 hover:scale-[1.01]">
                {/* Left accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${openFaq === i ? 'bg-gradient-to-b from-[#00d4ff] to-[#00ff88]' : 'bg-transparent group-hover:bg-[#00d4ff]/50'}`}></div>
                
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors relative"
                >
                  <span className={`font-medium pr-4 transition-colors duration-300 ${openFaq === i ? 'text-[#00d4ff]' : 'group-hover:text-gray-200'}`}>{faq.q}</span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-all duration-500 ${openFaq === i ? 'rotate-45 bg-[#00d4ff] text-black' : 'bg-white/5 text-gray-400 group-hover:bg-white/10'}`}>
                    +
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-out ${openFaq === i ? 'max-h-48' : 'max-h-0'}`}>
                  <p className="px-6 pb-6 text-gray-400 border-t border-white/5 pt-4 ml-1">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center p-8 rounded-2xl glass-card relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-radial from-[#00d4ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <h3 className="text-xl font-bold mb-2 relative z-10">Still have questions?</h3>
            <p className="text-gray-400 mb-6 relative z-10">Our team is here to help you get started.</p>
            <button className="relative z-10 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]">
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
