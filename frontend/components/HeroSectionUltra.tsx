'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Product screenshots that will fly around
const productScreenshots = [
  { id: 'canvas', image: '/images/products/canvas.jpeg' },
  { id: 'api-tester', image: '/images/products/api-tester.jpeg' },
  { id: 'dns-lookup', image: '/images/products/dns-lookup.jpeg' },
  { id: 'hash-generator', image: '/images/products/hash-generator.jpeg' },
  { id: 'dream-interpreter', image: '/images/products/dream-interpreter.jpeg' },
  { id: 'battle-arena', image: '/images/products/battle-arena.jpeg' },
  { id: 'emotion-visualizer', image: '/images/products/emotion-visualizer.jpeg' },
  { id: 'json-formatter', image: '/images/products/json-formatter.jpeg' },
  { id: 'ssl-checker', image: '/images/products/ssl-checker.jpeg' },
  { id: 'port-scanner', image: '/images/products/port-scanner.jpeg' },
  { id: 'story-weaver', image: '/images/products/story-weaver.jpeg' },
  { id: 'neural-art', image: '/images/products/neural-art.jpeg' },
];

// Duplicate for 30 cards
const expandedProducts = [
  ...productScreenshots,
  ...productScreenshots.map((p, i) => ({ ...p, id: `${p.id}-alt1` })),
  ...productScreenshots.slice(0, 6).map((p, i) => ({ ...p, id: `${p.id}-alt2` })),
];

// 30 animation configurations - mix of directions with ENHANCED zoom pass
const animationConfigs = [
  { direction: 'zoom-pass', duration: 12, delay: 0, startY: '15%', size: 'large' },
  { direction: 'left-to-right', duration: 22, delay: 1, startY: '8%', size: 'medium' },
  { direction: 'zoom-pass', duration: 14, delay: 2, startY: '35%', size: 'large' },
  { direction: 'right-to-left', duration: 18, delay: 0.5, startY: '20%', size: 'medium' },
  { direction: 'zoom-pass', duration: 11, delay: 3, startY: '55%', size: 'large' },
  { direction: 'top-to-bottom', duration: 26, delay: 1.5, startX: '12%', size: 'small' },
  { direction: 'zoom-pass', duration: 13, delay: 4, startY: '75%', size: 'large' },
  { direction: 'bottom-to-top', duration: 20, delay: 2, startX: '85%', size: 'medium' },
  { direction: 'zoom-pass', duration: 15, delay: 5, startY: '45%', size: 'large' },
  { direction: 'left-to-right', duration: 24, delay: 3, startY: '65%', size: 'small' },
  { direction: 'zoom-pass', duration: 10, delay: 6, startY: '25%', size: 'large' },
  { direction: 'right-to-left', duration: 16, delay: 4, startY: '88%', size: 'medium' },
  { direction: 'zoom-pass', duration: 12, delay: 7, startY: '5%', size: 'large' },
  { direction: 'top-to-bottom', duration: 30, delay: 5, startX: '72%', size: 'small' },
  { direction: 'zoom-pass', duration: 14, delay: 8, startY: '60%', size: 'large' },
  { direction: 'bottom-to-top', duration: 21, delay: 6, startX: '28%', size: 'medium' },
  { direction: 'zoom-pass', duration: 11, delay: 9, startY: '80%', size: 'large' },
  { direction: 'left-to-right', duration: 28, delay: 7, startY: '40%', size: 'small' },
  { direction: 'zoom-pass', duration: 13, delay: 10, startY: '10%', size: 'large' },
  { direction: 'right-to-left', duration: 23, delay: 8, startY: '50%', size: 'medium' },
  { direction: 'zoom-pass', duration: 15, delay: 11, startY: '70%', size: 'large' },
  { direction: 'top-to-bottom', duration: 19, delay: 9, startX: '45%', size: 'small' },
  { direction: 'zoom-pass', duration: 12, delay: 12, startY: '30%', size: 'large' },
  { direction: 'bottom-to-top', duration: 25, delay: 10, startX: '62%', size: 'medium' },
  { direction: 'zoom-pass', duration: 14, delay: 13, startY: '85%', size: 'large' },
  { direction: 'left-to-right', duration: 17, delay: 11, startY: '18%', size: 'small' },
  { direction: 'zoom-pass', duration: 11, delay: 14, startY: '48%', size: 'large' },
  { direction: 'right-to-left', duration: 27, delay: 12, startY: '72%', size: 'medium' },
  { direction: 'zoom-pass', duration: 13, delay: 15, startY: '92%', size: 'large' },
  { direction: 'top-to-bottom', duration: 22, delay: 13, startX: '35%', size: 'small' },
];

// Product Card Component - flying screenshots (no terminal header overlay)
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
    small: 'w-32 h-24 md:w-44 md:h-32',
    medium: 'w-44 h-32 md:w-56 md:h-40',
    large: 'w-56 h-40 md:w-72 md:h-52',
  };

  const getAnimationClass = () => {
    switch (config.direction) {
      case 'left-to-right': return 'animate-float-right';
      case 'right-to-left': return 'animate-float-left';
      case 'top-to-bottom': return 'animate-float-down';
      case 'bottom-to-top': return 'animate-float-up';
      case 'zoom-pass': return 'animate-zoom-pass-close';
      default: return 'animate-float-right';
    }
  };

  const getPositionStyle = () => {
    const style: React.CSSProperties = {
      animationDuration: `${config.duration}s`,
      animationDelay: `${config.delay}s`,
      zIndex: config.direction === 'zoom-pass' ? 20 : config.size === 'large' ? 10 : config.size === 'medium' ? 5 : 1,
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
      <div className="w-full h-full rounded-xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm relative">
        <Image
          src={product.image}
          alt={`Product ${index + 1}`}
          fill
          className="object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
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

export default function HeroSectionUltra() {
  const [mounted, setMounted] = useState(false);
  
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
      <div className="absolute inset-0 pointer-events-none z-30">
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
      <div className="absolute top-0 left-0 w-96 h-64 pointer-events-none overflow-hidden z-40">
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

      {/* Snowfall effect */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
          {snowflakes.map(flake => (
            <Snowflake key={flake.id} style={flake.style} />
          ))}
        </div>
      )}

      {/* Flying product cards - 30 cards with zoom-pass effect coming CLOSE to screen */}
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

      {/* Center content - just buttons, no text */}
      <div className="relative z-40 flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          {/* CTA Buttons - centered, no text above */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neural-950 to-transparent pointer-events-none z-30"></div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-40">
        <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
