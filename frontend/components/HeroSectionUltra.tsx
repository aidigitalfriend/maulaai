'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Product screenshots that will fly around - expanded for more coverage
const productScreenshots = [
  { id: 'canvas', title: 'Canvas Builder', gradient: 'from-indigo-500 to-purple-600', image: '/images/products/canvas.jpeg' },
  { id: 'api-tester', title: 'API Tester', gradient: 'from-green-500 to-emerald-600', image: '/images/products/api-tester.jpeg' },
  { id: 'dns-lookup', title: 'DNS Lookup', gradient: 'from-blue-500 to-cyan-600', image: '/images/products/dns-lookup.jpeg' },
  { id: 'hash-generator', title: 'Hash Generator', gradient: 'from-orange-500 to-red-600', image: '/images/products/hash-generator.jpeg' },
  { id: 'dream-interpreter', title: 'Dream Interpreter', gradient: 'from-violet-500 to-fuchsia-600', image: '/images/products/dream-interpreter.jpeg' },
  { id: 'battle-arena', title: 'Battle Arena', gradient: 'from-red-500 to-orange-600', image: '/images/products/battle-arena.jpeg' },
  { id: 'emotion-visualizer', title: 'Emotion Visualizer', gradient: 'from-pink-500 to-rose-600', image: '/images/products/emotion-visualizer.jpeg' },
  { id: 'json-formatter', title: 'JSON Formatter', gradient: 'from-yellow-500 to-amber-600', image: '/images/products/json-formatter.jpeg' },
  { id: 'ssl-checker', title: 'SSL Checker', gradient: 'from-teal-500 to-green-600', image: '/images/products/ssl-checker.jpeg' },
  { id: 'port-scanner', title: 'Port Scanner', gradient: 'from-slate-500 to-gray-600', image: '/images/products/port-scanner.jpeg' },
  { id: 'story-weaver', title: 'Story Weaver', gradient: 'from-amber-500 to-yellow-600', image: '/images/products/story-weaver.jpeg' },
  { id: 'neural-art', title: 'Neural Art', gradient: 'from-fuchsia-500 to-pink-600', image: '/images/products/neural-art.jpeg' },
];

// Duplicate and remix images for 30 cards with different styles
const expandedProducts = [
  ...productScreenshots,
  ...productScreenshots.map((p, i) => ({ ...p, id: `${p.id}-alt1`, gradient: ['from-cyan-500 to-blue-600', 'from-rose-500 to-pink-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-purple-500 to-indigo-600', 'from-lime-500 to-green-600'][i % 6] })),
  ...productScreenshots.slice(0, 6).map((p, i) => ({ ...p, id: `${p.id}-alt2`, gradient: ['from-sky-500 to-indigo-600', 'from-fuchsia-500 to-purple-600', 'from-red-500 to-rose-600', 'from-teal-500 to-cyan-600', 'from-orange-500 to-amber-600', 'from-violet-500 to-purple-600'][i % 6] })),
];

// 30 animation configurations for variety
const animationConfigs = [
  { direction: 'left-to-right', duration: 22, delay: 0, startY: '5%', size: 'large' },
  { direction: 'right-to-left', duration: 18, delay: 1, startY: '12%', size: 'medium' },
  { direction: 'top-to-bottom', duration: 26, delay: 2, startX: '8%', size: 'small' },
  { direction: 'bottom-to-top', duration: 20, delay: 0.5, startX: '88%', size: 'medium' },
  { direction: 'zoom-pass', duration: 14, delay: 3, startY: '30%', size: 'large' },
  { direction: 'left-to-right', duration: 24, delay: 4, startY: '45%', size: 'small' },
  { direction: 'right-to-left', duration: 16, delay: 2.5, startY: '58%', size: 'large' },
  { direction: 'top-to-bottom', duration: 30, delay: 5, startX: '72%', size: 'medium' },
  { direction: 'bottom-to-top', duration: 21, delay: 1.5, startX: '22%', size: 'small' },
  { direction: 'zoom-pass', duration: 11, delay: 6, startY: '75%', size: 'medium' },
  { direction: 'left-to-right', duration: 28, delay: 3.5, startY: '82%', size: 'medium' },
  { direction: 'right-to-left', duration: 23, delay: 7, startY: '20%', size: 'small' },
  { direction: 'top-to-bottom', duration: 19, delay: 0, startX: '35%', size: 'large' },
  { direction: 'bottom-to-top', duration: 25, delay: 4.5, startX: '55%', size: 'medium' },
  { direction: 'zoom-pass', duration: 13, delay: 8, startY: '65%', size: 'small' },
  { direction: 'left-to-right', duration: 17, delay: 2, startY: '38%', size: 'large' },
  { direction: 'right-to-left', duration: 27, delay: 5.5, startY: '92%', size: 'medium' },
  { direction: 'top-to-bottom', duration: 22, delay: 1, startX: '48%', size: 'small' },
  { direction: 'bottom-to-top', duration: 29, delay: 6.5, startX: '65%', size: 'large' },
  { direction: 'zoom-pass', duration: 15, delay: 9, startY: '48%', size: 'medium' },
  { direction: 'left-to-right', duration: 20, delay: 3, startY: '72%', size: 'small' },
  { direction: 'right-to-left', duration: 26, delay: 7.5, startY: '8%', size: 'large' },
  { direction: 'top-to-bottom', duration: 18, delay: 0.5, startX: '15%', size: 'medium' },
  { direction: 'bottom-to-top', duration: 24, delay: 4, startX: '78%', size: 'small' },
  { direction: 'zoom-pass', duration: 12, delay: 10, startY: '55%', size: 'large' },
  { direction: 'left-to-right', duration: 31, delay: 5, startY: '25%', size: 'medium' },
  { direction: 'right-to-left', duration: 19, delay: 8.5, startY: '68%', size: 'small' },
  { direction: 'top-to-bottom', duration: 23, delay: 2, startX: '92%', size: 'large' },
  { direction: 'bottom-to-top', duration: 21, delay: 6, startX: '42%', size: 'medium' },
  { direction: 'zoom-pass', duration: 16, delay: 11, startY: '85%', size: 'small' },
];

// Product Card Component - the flying screenshots
function ProductCard({ 
  product, 
  config, 
  index 
}: { 
  product: typeof expandedProducts[0]; 
  config: typeof animationConfigs[0];
  index: number;
}) {
  const sizeClasses = {
    small: 'w-28 h-20 md:w-36 md:h-24',
    medium: 'w-36 h-24 md:w-48 md:h-32',
    large: 'w-44 h-28 md:w-56 md:h-38',
  };

  const getAnimationClass = () => {
    switch (config.direction) {
      case 'left-to-right': return 'animate-float-right';
      case 'right-to-left': return 'animate-float-left';
      case 'top-to-bottom': return 'animate-float-down';
      case 'bottom-to-top': return 'animate-float-up';
      case 'zoom-pass': return 'animate-zoom-pass';
      default: return 'animate-float-right';
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
      className={`absolute ${sizeClasses[config.size as keyof typeof sizeClasses]} ${getAnimationClass()}`}
      style={getPositionStyle()}
    >
      <div className={`w-full h-full rounded-xl shadow-2xl overflow-hidden transform hover:scale-110 transition-transform duration-300 border border-white/20 backdrop-blur-sm relative`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient}`}></div>
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute top-0 left-0 right-0 flex items-center gap-1 px-2 py-1.5 bg-black/40 backdrop-blur-sm z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
          <span className="ml-1 text-[8px] md:text-[10px] text-white/90 truncate font-medium">{product.title}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
    </div>
  );
}

// Snowflake component
function Snowflake({ style }: { style: React.CSSProperties }) {
  return (
    <div 
      className="absolute w-1 h-1 bg-white/30 rounded-full animate-snowfall pointer-events-none"
      style={style}
    />
  );
}

// Animated word component
function AnimatedWord({ 
  word, 
  delay, 
  className,
  flyOut,
  flyOutDelay
}: { 
  word: string; 
  delay: number; 
  className?: string;
  flyOut?: boolean;
  flyOutDelay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [flying, setFlying] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(showTimer);
  }, [delay]);

  useEffect(() => {
    if (flyOut && flyOutDelay) {
      const flyTimer = setTimeout(() => setFlying(true), flyOutDelay);
      return () => clearTimeout(flyTimer);
    }
  }, [flyOut, flyOutDelay]);

  return (
    <span
      className={`inline-block transition-all duration-700 ${className} ${
        visible 
          ? flying 
            ? 'opacity-0 translate-y-[-50px] scale-50' 
            : 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-[50px] scale-50'
      }`}
    >
      {word}
    </span>
  );
}

export default function HeroSectionUltra() {
  const [mounted, setMounted] = useState(false);
  const [showSecondHeadline, setShowSecondHeadline] = useState(false);
  
  // Generate snowflakes
  const snowflakes = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        animationDuration: `${8 + Math.random() * 12}s`,
        animationDelay: `${Math.random() * 8}s`,
        opacity: 0.2 + Math.random() * 0.3,
        transform: `scale(${0.5 + Math.random() * 1})`,
      }
    }));
  }, []);

  // Generate stars for aurora effect
  const stars = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      style: {
        left: `${5 + Math.random() * 20}%`,
        top: `${10 + Math.random() * 15}%`,
        animationDelay: `${Math.random() * 3}s`,
      }
    }));
  }, []);

  useEffect(() => {
    setMounted(true);
    // Switch to second headline after first animation completes
    const timer = setTimeout(() => setShowSecondHeadline(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-neural-950 via-neural-900 to-neural-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      </div>

      {/* Corner darkness vignette - all 4 corners */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left corner */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-black/80 via-black/40 to-transparent"></div>
        {/* Top-right corner */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-black/80 via-black/40 to-transparent"></div>
        {/* Bottom-left corner */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-black/80 via-black/40 to-transparent"></div>
        {/* Bottom-right corner */}
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-black/80 via-black/40 to-transparent"></div>
      </div>

      {/* Aurora/cosmic rays effect near logo (top-left) */}
      <div className="absolute top-0 left-0 w-96 h-64 pointer-events-none overflow-hidden">
        {/* Curved aurora beams */}
        <div className="absolute top-8 left-4 w-48 h-1 bg-gradient-to-r from-indigo-500/40 via-purple-400/30 to-transparent rounded-full blur-sm animate-aurora-pulse"></div>
        <div className="absolute top-12 left-8 w-40 h-0.5 bg-gradient-to-r from-cyan-400/30 via-blue-400/20 to-transparent rounded-full blur-sm animate-aurora-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-16 left-2 w-52 h-0.5 bg-gradient-to-r from-purple-500/35 via-pink-400/25 to-transparent rounded-full blur-sm animate-aurora-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-20 left-12 w-36 h-1 bg-gradient-to-r from-blue-400/30 via-indigo-300/20 to-transparent rounded-full blur-sm animate-aurora-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Twinkling stars */}
        {mounted && stars.map(star => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={star.style}
          />
        ))}
        
        {/* Soft glow near logo area */}
        <div className="absolute top-4 left-16 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      ></div>

      {/* Snowfall effect */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {snowflakes.map(flake => (
            <Snowflake key={flake.id} style={flake.style} />
          ))}
        </div>
      )}

      {/* Flying product cards container - 30 cards */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {expandedProducts.map((product, index) => (
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
      <div className="absolute inset-0 bg-gradient-to-b from-neural-950/50 via-neural-950/30 to-neural-950/70 pointer-events-none"></div>

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

          {/* Main headline - animated words flying in */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 tracking-tight min-h-[1.2em]">
            {!showSecondHeadline ? (
              <span className="flex flex-wrap justify-center gap-x-4">
                <AnimatedWord word="Build." delay={200} className="text-white" flyOut flyOutDelay={3500} />
                <AnimatedWord word="Create." delay={600} className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent" flyOut flyOutDelay={3500} />
                <AnimatedWord word="Explore." delay={1000} className="text-white" flyOut flyOutDelay={3500} />
              </span>
            ) : (
              <span className="flex flex-wrap justify-center gap-x-3 md:gap-x-4">
                <AnimatedWord word="The" delay={0} className="text-white/90" />
                <AnimatedWord word="future" delay={200} className="text-white/90" />
                <AnimatedWord word="of" delay={400} className="text-white/90" />
                <AnimatedWord word="development" delay={600} className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent" />
                <AnimatedWord word="is" delay={900} className="text-white/90" />
                <AnimatedWord word="here." delay={1100} className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent" />
              </span>
            )}
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '1.5s' }}>
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
