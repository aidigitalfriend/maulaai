'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ShowcaseImage {
  src: string;
  fallback: string;
  alt: string;
  title: string;
  description: string;
}

const showcaseImages: ShowcaseImage[] = [
  {
    src: '/images/showcase/agent-chat.jpg',
    fallback: '/images/products/ai-agents.jpeg',
    alt: 'AI Agent Chat Interface',
    title: 'Chat with AI Agents',
    description: 'Natural conversations with 18+ unique AI personalities',
  },
  {
    src: '/images/showcase/agent-chat-1.jpg',
    fallback: '/images/products/analytics-dashboard.jpeg',
    alt: 'AI Chat with Neural Config',
    title: 'Smart Neural Configuration',
    description: 'Customize temperature, tokens & AI behavior',
  },
  {
    src: '/images/showcase/neural-config.jpg',
    fallback: '/images/products/ai-agents.jpeg',
    alt: 'Neural Settings Panel',
    title: 'Advanced AI Settings',
    description: 'Fine-tune your AI experience with precision controls',
  },
  {
    src: '/images/showcase/ai-canvas.jpg',
    fallback: '/images/products/canvas.jpeg',
    alt: 'AI Canvas Builder',
    title: 'AI-Powered Canvas',
    description: 'Build complete web apps from simple prompts',
  },
  {
    src: '/images/showcase/canvas-preview.jpg',
    fallback: '/images/products/canvas.jpeg',
    alt: 'Canvas Live Preview',
    title: 'Live Preview & Export',
    description: 'See your creations come to life instantly',
  },
];

const features = [
  {
    icon: '💬',
    title: 'Natural Conversations',
    description: 'Chat naturally with 18 unique AI personalities',
  },
  {
    icon: '🎨',
    title: 'Canvas Builder',
    description: 'Generate complete web apps with AI',
  },
  {
    icon: '💾',
    title: 'Saved History',
    description: 'All your conversations are saved & searchable',
  },
  {
    icon: '🎯',
    title: 'Customizable',
    description: 'Adjust temperature, tokens & AI behavior',
  },
];

export default function AIShowcaseSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageSources, setImageSources] = useState<string[]>(
    showcaseImages.map((img) => img.src)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % showcaseImages.length);
        setIsAnimating(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleImageError = (index: number) => {
    setImageSources((prev) => {
      const newSources = [...prev];
      newSources[index] = showcaseImages[index].fallback;
      return newSources;
    });
  };

  const currentImage = showcaseImages[currentIndex];
  const currentSrc = imageSources[currentIndex];

  return (
    <section className="section-padding bg-gradient-to-br from-neural-900 via-purple-900 to-neural-800 text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-brand-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6 border border-purple-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Experience AI Like Never Before
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Powerful AI Tools at Your
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-brand-400 bg-clip-text text-transparent"> Fingertips</span>
          </h2>
          <p className="text-lg text-neural-300 max-w-3xl mx-auto">
            From intelligent chat companions to code generation, One Last AI provides everything you need to supercharge your productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Animated Image Showcase */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative rounded-2xl shadow-2xl border border-white/10 overflow-hidden bg-neural-800/50 backdrop-blur-sm">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-neural-900/80 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-xs text-gray-400 ml-2">onelastai.co</span>
              </div>
              
              {/* Image Container with Animation */}
              <div className="relative h-[350px] md:h-[450px] overflow-hidden">
                <div 
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                >
                  <Image
                    src={currentSrc}
                    alt={currentImage.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-top"
                    priority
                    onError={() => handleImageError(currentIndex)}
                  />
                </div>
                
                {/* Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neural-900 via-neural-900/80 to-transparent p-6">
                  <h3 className={`text-xl font-bold text-white mb-1 transition-all duration-500 ${
                    isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}>
                    {currentImage.title}
                  </h3>
                  <p className={`text-sm text-neural-300 transition-all duration-500 delay-100 ${
                    isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                  }`}>
                    {currentImage.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Image Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {showcaseImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentIndex(idx);
                      setIsAnimating(false);
                    }, 300);
                  }}
                  className={`transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-8 h-2 bg-purple-500 rounded-full'
                      : 'w-2 h-2 bg-white/30 rounded-full hover:bg-white/50'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>

            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl px-4 py-3 shadow-xl shadow-purple-500/30 hidden lg:block">
              <div className="text-2xl font-bold text-white">AI</div>
              <div className="text-xs text-white/80">Powered</div>
            </div>
          </div>

          {/* Right - Content */}
          <div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 group"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-neural-400">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['🧠', '💚', '🎮', '👔', '🧙‍♂️'].map((emoji, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-2 border-neural-800 text-lg"
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
                <span className="text-neural-300">18 AI Agents Available</span>
              </div>
              
              <p className="text-neural-300 leading-relaxed">
                Whether you need Einstein for scientific discussions, Tech Wizard for coding help, or Julie for friendly conversations - we have the perfect AI companion for you.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/30 group"
              >
                Explore All Agents
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/canvas-app"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
              >
                <span>✨</span>
                Try Canvas Builder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
