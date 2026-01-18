'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Product screenshots that will fly around
const productScreenshots = [
  {
    id: 'canvas',
    title: 'Canvas Builder',
    gradient: 'from-indigo-500 to-purple-600',
    icon: '🎨',
    mockContent: 'AI App Generator',
    image: '/images/products/canvas.jpeg',
  },
  {
    id: 'api-tester',
    title: 'API Tester',
    gradient: 'from-green-500 to-emerald-600',
    icon: '🔌',
    mockContent: 'Test Endpoints',
    image: '/images/products/api-tester.jpeg',
  },
  {
    id: 'dns-lookup',
    title: 'DNS Lookup',
    gradient: 'from-blue-500 to-cyan-600',
    icon: '🌐',
    mockContent: 'Domain Analysis',
    image: '/images/products/dns-lookup.jpeg',
  },
  {
    id: 'hash-generator',
    title: 'Hash Generator',
    gradient: 'from-orange-500 to-red-600',
    icon: '🔐',
    mockContent: 'Secure Hashing',
    image: '/images/products/hash-generator.jpeg',
  },
  {
    id: 'dream-interpreter',
    title: 'Dream Interpreter',
    gradient: 'from-violet-500 to-fuchsia-600',
    icon: '🌙',
    mockContent: 'AI Dream Analysis',
    image: '/images/products/dream-interpreter.jpeg',
  },
  {
    id: 'battle-arena',
    title: 'Battle Arena',
    gradient: 'from-red-500 to-orange-600',
    icon: '⚔️',
    mockContent: 'AI vs AI Combat',
    image: '/images/products/battle-arena.jpeg',
  },
  {
    id: 'emotion-visualizer',
    title: 'Emotion Visualizer',
    gradient: 'from-pink-500 to-rose-600',
    icon: '💖',
    mockContent: 'Sentiment Analysis',
    image: '/images/products/emotion-visualizer.jpeg',
  },
  {
    id: 'json-formatter',
    title: 'JSON Formatter',
    gradient: 'from-yellow-500 to-amber-600',
    icon: '📋',
    mockContent: 'Format & Validate',
    image: '/images/products/json-formatter.jpeg',
  },
  {
    id: 'ssl-checker',
    title: 'SSL Checker',
    gradient: 'from-teal-500 to-green-600',
    icon: '🛡️',
    mockContent: 'Security Audit',
    image: '/images/products/ssl-checker.jpeg',
  },
  {
    id: 'port-scanner',
    title: 'Port Scanner',
    gradient: 'from-slate-500 to-gray-600',
    icon: '🔍',
    mockContent: 'Network Analysis',
    image: '/images/products/port-scanner.jpeg',
  },
  {
    id: 'story-weaver',
    title: 'Story Weaver',
    gradient: 'from-amber-500 to-yellow-600',
    icon: '📖',
    mockContent: 'AI Storytelling',
    image: '/images/products/story-weaver.jpeg',
  },
  {
    id: 'neural-art',
    title: 'Neural Art',
    gradient: 'from-fuchsia-500 to-pink-600',
    icon: '🎭',
    mockContent: 'AI Art Generator',
    image: '/images/products/neural-art.jpeg',
  },
];

// Animation configurations for different movement patterns
const animationConfigs = [
  { direction: 'left-to-right', duration: 25, delay: 0, startY: '10%', size: 'large', blur: false },
  { direction: 'right-to-left', duration: 20, delay: 2, startY: '25%', size: 'medium', blur: true },
  { direction: 'top-to-bottom', duration: 30, delay: 4, startX: '15%', size: 'small', blur: false },
  { direction: 'bottom-to-top', duration: 22, delay: 1, startX: '75%', size: 'medium', blur: false },
  { direction: 'zoom-pass', duration: 15, delay: 3, startY: '40%', size: 'large', blur: true },
  { direction: 'left-to-right', duration: 28, delay: 5, startY: '60%', size: 'small', blur: true },
  { direction: 'right-to-left', duration: 18, delay: 0, startY: '75%', size: 'large', blur: false },
  { direction: 'top-to-bottom', duration: 35, delay: 6, startX: '85%', size: 'medium', blur: true },
  { direction: 'bottom-to-top', duration: 24, delay: 2, startX: '25%', size: 'small', blur: false },
  { direction: 'zoom-pass', duration: 12, delay: 8, startY: '55%', size: 'medium', blur: false },
  { direction: 'left-to-right', duration: 32, delay: 4, startY: '85%', size: 'medium', blur: false },
  { direction: 'right-to-left', duration: 26, delay: 7, startY: '15%', size: 'small', blur: true },
];

// Product Card Component - the flying screenshots
function ProductCard({ 
  product, 
  config, 
  index 
}: { 
  product: typeof productScreenshots[0]; 
  config: typeof animationConfigs[0];
  index: number;
}) {
  const sizeClasses = {
    small: 'w-32 h-24 md:w-40 md:h-28',
    medium: 'w-40 h-28 md:w-52 md:h-36',
    large: 'w-48 h-32 md:w-64 md:h-44',
  };

  const getAnimationClass = () => {
    switch (config.direction) {
      case 'left-to-right':
        return 'animate-float-right';
      case 'right-to-left':
        return 'animate-float-left';
      case 'top-to-bottom':
        return 'animate-float-down';
      case 'bottom-to-top':
        return 'animate-float-up';
      case 'zoom-pass':
        return 'animate-zoom-pass';
      default:
        return 'animate-float-right';
    }
  };

  const getPositionStyle = () => {
    const style: React.CSSProperties = {
      animationDuration: `${config.duration}s`,
      animationDelay: `${config.delay}s`,
      zIndex: config.size === 'large' ? 10 : config.size === 'medium' ? 5 : 1,
    };

    if (config.direction === 'left-to-right' || config.direction === 'right-to-left' || config.direction === 'zoom-pass') {
      style.top = config.startY;
    }
    if (config.direction === 'top-to-bottom' || config.direction === 'bottom-to-top') {
      style.left = config.startX;
    }

    return style;
  };

  return (
    <div
      className={`absolute ${sizeClasses[config.size as keyof typeof sizeClasses]} ${getAnimationClass()} ${config.blur ? 'blur-[1px]' : ''}`}
      style={getPositionStyle()}
    >
      <div className={`w-full h-full rounded-xl shadow-2xl overflow-hidden transform hover:scale-110 transition-transform duration-300 border border-white/20 backdrop-blur-sm relative`}>
        {/* Real screenshot image with gradient fallback */}
        <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient}`}></div>
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
          onError={(e) => {
            // Hide image on error, show gradient fallback
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Mini window header overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center gap-1 px-2 py-1.5 bg-black/40 backdrop-blur-sm z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
          <span className="ml-1 text-[8px] md:text-[10px] text-white/90 truncate font-medium">{product.title}</span>
        </div>
        {/* Gradient overlay at bottom for text readability */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
    </div>
  );
}

export default function HeroSectionUltra() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neural-950 via-neural-900 to-neural-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      ></div>

      {/* Flying product cards container */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {productScreenshots.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              config={animationConfigs[index % animationConfigs.length]}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-neural-950/60 via-neural-950/40 to-neural-950/80 pointer-events-none"></div>

      {/* Main content - centered */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm text-white/80 font-medium">AI-Powered Tools & Experiments</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 animate-fade-in-up tracking-tight">
            <span className="text-white">Build.</span>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Create.</span>
            <span className="text-white"> Explore.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/60 mb-4 max-w-3xl mx-auto animate-fade-in-up font-light" style={{ animationDelay: '0.2s' }}>
            The future of development is here.
          </p>
          <p className="text-base sm:text-lg text-white/40 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            AI-powered tools, experimental labs, and canvas builder — all in one platform.
            <br className="hidden md:block" />
            No coding required. Just describe and watch magic happen.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/canvas-app"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-neural-900 font-bold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:scale-105"
            >
              <span className="relative z-10">Start Building</span>
              <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-bold">
                Start Building
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            
            <Link
              href="/lab"
              className="group inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            >
              <span>Explore Labs</span>
              <span className="text-lg group-hover:animate-bounce">🧪</span>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/40 text-sm animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>20+ AI Tools</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Enterprise Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neural-950 to-transparent pointer-events-none"></div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
