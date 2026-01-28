'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
import AgentShowcaseCarousel from '@/components/AgentShowcaseCarousel';

// Register plugins client-side only
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText, ScrambleTextPlugin, TextPlugin);
  CustomEase.create('sectionEase', 'M0,0 C0.25,0.1 0.25,1 1,1');
  CustomEase.create('bounceReveal', 'M0,0 C0.215,0.61 0.355,1 0.75,1 0.885,1 0.865,1 1,1');
  CustomEase.create('smoothSlide', 'M0,0 C0.42,0 0.58,1 1,1');
}

interface SectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

// Wrapper component for each section with GSAP scroll animations
function AnimatedSection({ id, children, className = '' }: SectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Find animatable elements within the section
    const badge = section.querySelector('.section-badge');
    const title = section.querySelector('.section-title');
    const description = section.querySelector('.section-desc');
    const features = section.querySelectorAll('.section-feature');
    const cards = section.querySelectorAll('.section-card');
    const image = section.querySelector('.section-image');
    const imageContainer = section.querySelector('.section-image-container');
    const floatingBadge = section.querySelector('.floating-badge');
    const iconBadge = section.querySelector('.icon-badge');
    const cta = section.querySelectorAll('.section-cta');
    const listItems = section.querySelectorAll('.section-list-item');

    // SplitText for title if exists
    let titleSplit: SplitText | null = null;
    if (title) {
      titleSplit = new SplitText(title, { type: 'words', wordsClass: 'title-word' });
    }

    // Set initial hidden states
    if (badge) gsap.set(badge, { opacity: 0, y: 30, scale: 0.8 });
    if (titleSplit) gsap.set(titleSplit.words, { opacity: 0, y: 60, rotateX: 45 });
    if (description) gsap.set(description, { opacity: 0, y: 40, filter: 'blur(8px)' });
    gsap.set(features, { opacity: 0, y: 50, scale: 0.9 });
    gsap.set(cards, { opacity: 0, y: 60, rotateY: 15, transformOrigin: 'center center' });
    if (imageContainer) gsap.set(imageContainer, { opacity: 0, x: 100, scale: 0.9, rotateY: -10 });
    if (floatingBadge) gsap.set(floatingBadge, { opacity: 0, scale: 0, rotate: -45 });
    if (iconBadge) gsap.set(iconBadge, { opacity: 0, scale: 0, rotate: 45 });
    gsap.set(cta, { opacity: 0, y: 30, scale: 0.9 });
    gsap.set(listItems, { opacity: 0, x: -40 });

    // Animation IN function
    const animateIn = () => {
      const tl = gsap.timeline({ defaults: { ease: 'sectionEase' } });

      // Badge first
      if (badge) {
        tl.to(badge, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' });
      }

      // Title words cascade
      if (titleSplit) {
        tl.to(titleSplit.words, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: { each: 0.05, from: 'start' },
          ease: 'smoothSlide'
        }, badge ? '-=0.3' : 0);
      }

      // Description blurs in
      if (description) {
        tl.to(description, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 }, '-=0.5');
      }

      // Features stagger in
      if (features.length > 0) {
        tl.to(features, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: { each: 0.1, from: 'start' },
          ease: 'back.out(1.3)'
        }, '-=0.4');
      }

      // Cards with 3D rotation
      if (cards.length > 0) {
        tl.to(cards, {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 0.7,
          stagger: { each: 0.08, from: 'center' },
          ease: 'power3.out'
        }, '-=0.4');
      }

      // List items slide in
      if (listItems.length > 0) {
        tl.to(listItems, {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out'
        }, '-=0.3');
      }

      // Image container slides in with 3D effect
      if (imageContainer) {
        tl.to(imageContainer, {
          opacity: 1,
          x: 0,
          scale: 1,
          rotateY: 0,
          duration: 1,
          ease: 'power3.out'
        }, '-=0.6');
      }

      // Floating badges pop in
      if (floatingBadge) {
        tl.to(floatingBadge, {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.6,
          ease: 'back.out(2)'
        }, '-=0.5');
      }

      if (iconBadge) {
        tl.to(iconBadge, {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.6,
          ease: 'back.out(2)'
        }, '-=0.4');
      }

      // CTAs pop in
      if (cta.length > 0) {
        tl.to(cta, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(1.5)'
        }, '-=0.3');
      }

      return tl;
    };

    // Animation OUT function
    const animateOut = () => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.in' } });

      // Reverse order - CTAs first
      if (cta.length > 0) {
        tl.to(cta, { opacity: 0, y: 30, scale: 0.9, duration: 0.3, stagger: 0.05 });
      }

      if (iconBadge) {
        tl.to(iconBadge, { opacity: 0, scale: 0, rotate: 45, duration: 0.3 }, '-=0.2');
      }

      if (floatingBadge) {
        tl.to(floatingBadge, { opacity: 0, scale: 0, rotate: -45, duration: 0.3 }, '-=0.2');
      }

      if (imageContainer) {
        tl.to(imageContainer, { opacity: 0, x: 100, scale: 0.9, rotateY: -10, duration: 0.5 }, '-=0.2');
      }

      if (listItems.length > 0) {
        tl.to(listItems, { opacity: 0, x: -40, duration: 0.3, stagger: 0.03 }, '-=0.3');
      }

      if (cards.length > 0) {
        tl.to(cards, { opacity: 0, y: 60, rotateY: 15, duration: 0.4, stagger: 0.04 }, '-=0.2');
      }

      if (features.length > 0) {
        tl.to(features, { opacity: 0, y: 50, scale: 0.9, duration: 0.3, stagger: 0.05 }, '-=0.2');
      }

      if (description) {
        tl.to(description, { opacity: 0, y: 40, filter: 'blur(8px)', duration: 0.3 }, '-=0.2');
      }

      if (titleSplit) {
        tl.to(titleSplit.words, { opacity: 0, y: 60, rotateX: 45, duration: 0.4, stagger: 0.02 }, '-=0.2');
      }

      if (badge) {
        tl.to(badge, { opacity: 0, y: 30, scale: 0.8, duration: 0.3 }, '-=0.2');
      }

      return tl;
    };

    // Create ScrollTrigger with bidirectional animation
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => animateIn(),
      onLeaveBack: () => animateOut(),
      onEnterBack: () => animateIn(),
      onLeave: () => animateOut()
    });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === section) st.kill();
      });
      if (titleSplit) titleSplit.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id={id} className={className}>
      {children}
    </section>
  );
}

export default function HomepageSectionsGSAP() {
  return (
    <>
      {/* AI-Powered Agents Section */}
      <AnimatedSection id="ai-agents" className="section-padding bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-brand-500/20 rounded-full text-brand-300 text-sm font-medium mb-6 border border-brand-500/30">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI-Powered Agents
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                18 Specialized
                <span className="bg-gradient-to-r from-brand-400 via-accent-400 to-brand-500 bg-clip-text text-transparent"> AI Personalities</span>
              </h2>
              <p className="section-desc text-lg text-neural-300 mb-8 leading-relaxed">
                From intelligent conversations to creative canvas building - experience the future of AI interaction. Each agent brings unique expertise with beautiful, intuitive interfaces.
              </p>
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="section-card bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl mb-2">💬</div>
                  <div className="text-sm font-semibold text-white">Smart Chat</div>
                  <div className="text-xs text-neural-400">Human-like conversations</div>
                </div>
                <div className="section-card bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="text-sm font-semibold text-white">AI Canvas</div>
                  <div className="text-xs text-neural-400">Build websites & apps</div>
                </div>
                <div className="section-card bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="text-sm font-semibold text-white">Neural Config</div>
                  <div className="text-xs text-neural-400">Customize behavior</div>
                </div>
                <div className="section-card bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl mb-2">🎙️</div>
                  <div className="text-sm font-semibold text-white">Voice Chat</div>
                  <div className="text-xs text-neural-400">Talk naturally</div>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {['Einstein - Physics & Science', 'Julie - Your AI Companion', 'Tech Wizard - Coding & Innovation', 'Mrs Boss - Leadership & Strategy'].map((feature, idx) => (
                  <li key={idx} className="section-list-item flex items-center gap-3 text-neural-200 hover:text-white transition-colors">
                    <span className="flex-shrink-0 w-6 h-6 bg-brand-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/agents" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/30 group">
                Explore All Agents
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Right - Rotating Screenshots */}
            <div className="section-image-container relative">
              <AgentShowcaseCarousel />
              <div className="icon-badge absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/30">
                <span className="text-4xl">🤖</span>
              </div>
              <div className="floating-badge absolute -top-4 -left-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg hidden lg:block">
                <div className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">18</div>
                <div className="text-xs text-neural-300">AI Agents</div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Real-time Analytics Section */}
      <AnimatedSection id="analytics" className="section-padding bg-gradient-to-br from-teal-900 via-cyan-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="section-image-container relative order-2 lg:order-1">
              <img
                src="/images/products/analytics-dashboard.jpeg"
                alt="Real-time Analytics"
                className="section-image rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="icon-badge absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">📊</span>
              </div>
              <div className="floating-badge absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-teal-400">Live</div>
                <div className="text-xs text-neural-300">Real-time Data</div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div className="order-1 lg:order-2">
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 rounded-full text-teal-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Real-time Analytics
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Powerful
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"> Analytics</span>
              </h2>
              <p className="section-desc text-lg text-neural-300 mb-8 leading-relaxed">
                Track every interaction, measure performance, and gain deep insights into how your AI agents perform. Real-time dashboards keep you informed.
              </p>
              <ul className="space-y-4 mb-8">
                {['Real-time conversation tracking', 'User sentiment analysis', 'Performance metrics dashboard', 'Custom report generation', 'AI-powered insights'].map((feature, idx) => (
                  <li key={idx} className="section-list-item flex items-center gap-3 text-neural-200">
                    <span className="flex-shrink-0 w-6 h-6 bg-teal-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/analytics" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-teal-500/30 group">
                  View Analytics
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/docs/analytics" className="section-cta inline-flex items-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">
                  Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Enterprise Security Section */}
      <AnimatedSection id="security" className="section-padding bg-gradient-to-br from-purple-900 via-indigo-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Enterprise Security
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Bank-Level
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent"> Security</span>
              </h2>
              <p className="section-desc text-lg text-neural-300 mb-8 leading-relaxed">
                Your data is protected with enterprise-grade security. SOC 2 certified, GDPR compliant, and built with privacy-first architecture.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: '🔐', title: 'End-to-end Encryption', desc: 'AES-256 encryption' },
                  { icon: '🛡️', title: 'SOC 2 Certified', desc: 'Audited security' },
                  { icon: '🌍', title: 'GDPR Compliant', desc: 'Data protection' },
                  { icon: '🔒', title: 'Zero Trust', desc: 'Verify everything' }
                ].map((item, idx) => (
                  <div key={idx} className="section-card bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="text-xs text-neural-400">{item.desc}</div>
                  </div>
                ))}
              </div>
              <Link href="/security" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/30 group">
                Learn About Security
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Right - Image */}
            <div className="section-image-container relative">
              <img
                src="/images/products/security-enterprise.jpeg"
                alt="Enterprise Security"
                className="section-image rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="icon-badge absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">🛡️</span>
              </div>
              <div className="floating-badge absolute -top-4 -left-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-purple-400">100%</div>
                <div className="text-xs text-neural-300">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Canvas Builder Section */}
      <AnimatedSection id="canvas" className="section-padding bg-gradient-to-br from-indigo-900 via-blue-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-full text-indigo-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Canvas Builder
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Build Apps
                <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent"> with AI</span>
              </h2>
              <p className="section-desc text-lg text-neural-300 mb-8 leading-relaxed">
                Describe what you want to build, and watch our AI Canvas Builder bring it to life. Create websites, components, and applications instantly.
              </p>
              <ul className="space-y-4 mb-8">
                {['AI-powered code generation', 'Live preview & editing', 'Export to React, Vue, HTML', 'Component library', 'One-click deploy'].map((feature, idx) => (
                  <li key={idx} className="section-list-item flex items-center gap-3 text-neural-200">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link href="/canvas-app" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/30 group">
                  Try Canvas Builder
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/docs" className="section-cta inline-flex items-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">
                  View Documentation
                </Link>
              </div>
            </div>
            
            {/* Right - Canvas Preview */}
            <div className="section-image-container relative">
              <div className="bg-[#1e1e2e] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                <div className="flex items-center gap-2 px-4 py-3 bg-[#161622] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">Canvas Builder</span>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                      <span className="text-indigo-400 text-sm font-mono">Prompt:</span>
                      <span className="text-gray-300 text-sm">&quot;Create a modern SaaS landing page...&quot;</span>
                    </div>
                    <div className="h-px bg-white/10 my-4"></div>
                    <div className="bg-[#252536] rounded-lg p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-400">Generated Preview</span>
                        <span className="text-xs text-green-400">✓ Complete</span>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg h-32 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Live Preview Area</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="icon-badge absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* AI Data Generator Section */}
      <AnimatedSection id="data-generator" className="section-padding bg-gradient-to-br from-emerald-900 via-green-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Visual/Image */}
            <div className="section-image-container relative order-2 lg:order-1">
              <div className="relative">
                <img
                  src="/images/products/data-generator.jpeg"
                  alt="AI Data Generator"
                  className="section-image rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                  style={{ maxHeight: '450px' }}
                />
                <div className="icon-badge absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
              </div>
              {/* Floating stats */}
              <div className="floating-badge absolute -top-4 -left-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-emerald-400">50+</div>
                <div className="text-xs text-neural-300">Data Templates</div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div className="order-1 lg:order-2">
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full text-emerald-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                AI Data Generator
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Generate Test Data
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent"> in Seconds</span>
              </h2>
              <p className="section-desc text-lg text-neural-300 mb-8 leading-relaxed">
                Create realistic test data for your applications instantly. Choose from pre-built templates or customize your own schema with AI assistance.
              </p>
              <ul className="space-y-4 mb-8">
                {['50+ pre-built data templates', 'Custom schema builder', 'Export to JSON, CSV, SQL', 'AI-powered realistic data', 'Batch generation support'].map((feature, idx) => (
                  <li key={idx} className="section-list-item flex items-center gap-3 text-neural-200">
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
                <Link href="/tools/data-generator" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/30 group">
                  Generate Data
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/docs/data-generator" className="section-cta inline-flex items-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">
                  View Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection id="faq" className="section-padding bg-gradient-to-br from-violet-900 via-purple-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="section-image-container relative">
              <img
                src="/images/products/faq-support.jpeg"
                alt="FAQ & Support"
                className="section-image rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '500px' }}
              />
              <div className="icon-badge absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">❓</span>
              </div>
              {/* Floating badge */}
              <div className="floating-badge absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-violet-400">24/7</div>
                <div className="text-xs text-neural-300">Support Ready</div>
              </div>
            </div>
            
            {/* Right - FAQ Content */}
            <div>
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 rounded-full text-violet-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                FAQ Center
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Frequently Asked
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"> Questions</span>
              </h2>
              <div className="space-y-6">
                {[
                  { q: 'How do I get started?', a: 'Sign up, choose your AI agents, and start chatting within minutes.' },
                  { q: 'What AI agents are available?', a: '20+ specialized personalities including Einstein, Tech Wizard, and more.' },
                  { q: 'Is my data secure?', a: 'Bank-level encryption, SOC 2 compliance, and privacy-first architecture.' },
                  { q: 'What pricing plans exist?', a: 'Simple per-agent pricing: $1/day, $5/week, or $15/month.' },
                ].map((item, idx) => (
                  <div key={idx} className="section-card border-l-4 border-violet-500 pl-6 hover:border-violet-300 transition-colors">
                    <h3 className="text-lg font-bold mb-2 text-white">{item.q}</h3>
                    <p className="text-neural-300">{item.a}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/support/faqs" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-violet-500/30 group">
                  View All FAQs
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* News Section */}
      <AnimatedSection id="news" className="section-padding bg-gradient-to-br from-amber-900 via-orange-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Latest Updates
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                News &
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> Updates</span>
              </h2>
              <p className="section-desc text-lg text-neural-300 mb-8 leading-relaxed">
                Stay informed about new features, platform improvements, and exciting announcements from One Last AI.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { date: 'Jan 19, 2026', title: 'New Voice-to-Voice Agent Available', category: 'Feature' },
                  { date: 'Jan 15, 2026', title: 'One Last AI Reaches 10K Active Users', category: 'Milestone' },
                  { date: 'Jan 10, 2026', title: 'Enterprise Security Enhancements', category: 'Security' },
                ].map((news, idx) => (
                  <div key={idx} className="section-card flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-amber-500/50 transition-colors">
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
              <Link href="/resources/news" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/30 group">
                View All News
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Right - Image */}
            <div className="section-image-container relative">
              <img
                src="/images/products/news-updates.jpeg"
                alt="Latest News & Updates"
                className="section-image rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '500px' }}
              />
              <div className="icon-badge absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">📢</span>
              </div>
              <div className="floating-badge absolute -top-4 -left-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-amber-400">Fresh</div>
                <div className="text-xs text-neural-300">Daily Updates</div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Integration Partners Section */}
      <AnimatedSection id="integrations" className="section-padding bg-gradient-to-br from-cyan-900 via-teal-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="section-image-container relative">
              <img
                src="/images/products/integrations.jpeg"
                alt="Integrations & Partnerships"
                className="section-image rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="icon-badge absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">🔗</span>
              </div>
              <div className="floating-badge absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-cyan-400">20+</div>
                <div className="text-xs text-neural-300">Integrations</div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div>
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 rounded-full text-cyan-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Integrations
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Connect Your
                <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent"> Favorite Tools</span>
              </h2>
              <p className="section-desc text-lg text-neural-300 mb-8 leading-relaxed">
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
                  <div key={idx} className="section-card text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 transition-colors">
                    <div className="text-2xl mb-1">{partner.icon}</div>
                    <p className="font-medium text-sm text-neural-200">{partner.name}</p>
                  </div>
                ))}
              </div>
              <Link href="/about/partnerships" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/30 group">
                Explore Integrations
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Feature Roadmap Section */}
      <AnimatedSection id="roadmap" className="section-padding bg-gradient-to-br from-rose-900 via-pink-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-full text-rose-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Product Roadmap
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                What&apos;s Coming
                <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent"> Next</span>
              </h2>
              <p className="section-desc text-lg text-neural-300 mb-8 leading-relaxed">
                See what we&apos;re building next. Our transparent roadmap keeps you informed about upcoming features.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { quarter: 'Q1 2026', features: ['Multi-language Support', 'Real-time Translation', 'Enterprise SSO'], status: 'In Progress' },
                  { quarter: 'Q2 2026', features: ['AI Agent Marketplace', 'White-label Solution', 'Advanced API'], status: 'Planned' },
                ].map((roadmap, idx) => (
                  <div key={idx} className="section-card p-4 bg-white/5 rounded-xl border border-white/10 hover:border-rose-500/50 transition-colors">
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
              <Link href="/community/roadmap" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-rose-500/30 group">
                View Full Roadmap
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Right - Image */}
            <div className="section-image-container relative">
              <img
                src="/images/products/roadmap.jpeg"
                alt="Product Roadmap"
                className="section-image rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="icon-badge absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">🚀</span>
              </div>
              <div className="floating-badge absolute -top-4 -left-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-rose-400">2026</div>
                <div className="text-xs text-neural-300">Big Plans</div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Trust & Security Section */}
      <AnimatedSection id="trust" className="section-padding bg-gradient-to-br from-slate-900 via-gray-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-slate-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="section-image-container relative">
              <img
                src="/images/products/security-trust.jpeg"
                alt="Enterprise Security"
                className="section-image rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '450px' }}
              />
              <div className="icon-badge absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">🛡️</span>
              </div>
              <div className="floating-badge absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-green-400">100%</div>
                <div className="text-xs text-neural-300">Secure</div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div>
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-slate-500/20 rounded-full text-slate-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Enterprise Trust
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Security &
                <span className="bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent"> Compliance</span>
              </h2>
              <p className="section-desc text-lg text-neural-300 mb-8 leading-relaxed">
                Meet the highest security and compliance standards. Your data is protected with enterprise-grade security.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { badge: '🔒', title: 'SOC 2 Type II', desc: 'Security verified' },
                  { badge: '🌍', title: 'GDPR Compliant', desc: 'EU data protection' },
                  { badge: '🛡️', title: 'ISO 27001', desc: 'Info security' },
                  { badge: '✅', title: 'HIPAA Ready', desc: 'Healthcare ready' },
                ].map((trust, idx) => (
                  <div key={idx} className="section-card text-center p-4 bg-white/5 border border-white/10 rounded-xl hover:border-slate-500/50 transition-colors">
                    <div className="text-2xl mb-1">{trust.badge}</div>
                    <h4 className="font-bold text-sm text-white">{trust.title}</h4>
                    <p className="text-xs text-neural-400">{trust.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/security" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-slate-500/30 group">
                Learn About Security
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Pricing Section */}
      <AnimatedSection id="pricing" className="section-padding bg-gradient-to-br from-blue-900 via-indigo-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="section-image-container relative">
              <img
                src="/images/products/pricing-plans.jpeg"
                alt="Simple Pricing"
                className="section-image rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '500px' }}
              />
              <div className="icon-badge absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">💎</span>
              </div>
              <div className="floating-badge absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-blue-400">Save</div>
                <div className="text-xs text-neural-300">Up to 37%</div>
              </div>
            </div>
            
            {/* Right - Content */}
            <div>
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Simple Pricing
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Transparent
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> Pricing</span>
              </h2>
              <p className="section-desc text-lg text-neural-300 mb-8 leading-relaxed">
                Choose the plan that works for you. Simple per-agent pricing with no hidden fees.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { name: 'Daily', price: '$1/day', desc: 'Perfect for trying out' },
                  { name: 'Weekly', price: '$5/week', desc: 'Save 29% - Popular choice', highlight: true },
                  { name: 'Monthly', price: '$15/month', desc: 'Save 37% - Best value' },
                ].map((plan, idx) => (
                  <div key={idx} className={`section-card flex items-center justify-between p-4 rounded-xl border transition-colors ${plan.highlight ? 'bg-blue-500/20 border-blue-500/50' : 'bg-white/5 border-white/10 hover:border-blue-500/50'}`}>
                    <div>
                      <h4 className="font-bold text-white">{plan.name}</h4>
                      <p className="text-sm text-neural-400">{plan.desc}</p>
                    </div>
                    <div className="text-xl font-bold text-blue-400">{plan.price}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/pricing/overview" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 group">
                  View All Plans
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/agents" className="section-cta inline-flex items-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">
                  Browse Agents
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Why Choose Us Section */}
      <AnimatedSection id="why-us" className="section-padding bg-gradient-to-br from-fuchsia-900 via-purple-900 to-neural-800 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              <span className="section-badge inline-flex items-center gap-2 px-4 py-2 bg-fuchsia-500/20 rounded-full text-fuchsia-300 text-sm font-medium mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Why Choose Us
              </span>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Why Thousands
                <span className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent"> Choose Us</span>
              </h2>
              <p className="section-desc text-lg text-neural-300 mb-8 leading-relaxed">
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
                  <div key={idx} className="section-card flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-fuchsia-500/50 transition-colors">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-xs text-neural-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/about" className="section-cta inline-flex items-center gap-2 px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-fuchsia-500/30 group">
                Learn More About Us
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            {/* Right - Image */}
            <div className="section-image-container relative">
              <img
                src="/images/products/why-choose-us.jpeg"
                alt="Why Choose One Last AI"
                className="section-image rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '500px' }}
              />
              <div className="icon-badge absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">⭐</span>
              </div>
              <div className="floating-badge absolute -top-4 -left-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hidden lg:block">
                <div className="text-2xl font-bold text-fuchsia-400">10K+</div>
                <div className="text-xs text-neural-300">Happy Users</div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection id="cta" className="section-padding bg-gradient-to-br from-neural-900 via-neural-800 to-neural-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="section-image-container relative">
              <img
                src="/images/products/transform-workflow.jpeg"
                alt="Transform Your Workflow"
                className="section-image rounded-2xl shadow-2xl border border-white/10 w-full object-cover"
                style={{ maxHeight: '400px' }}
              />
              <div className="icon-badge absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-brand-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-4xl">✨</span>
              </div>
            </div>
            
            {/* Right - Content */}
            <div>
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Ready to Transform
                <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent"> Your Workflow?</span>
              </h2>
              <p className="section-desc text-xl text-neural-300 mb-8 leading-relaxed">
                Join thousands of professionals who trust our AI platform for their most important work. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="section-cta inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/30 group">
                  Contact Us
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/demo" className="section-cta inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all">
                  Schedule Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
