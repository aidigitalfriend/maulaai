'use client';

import { useState, useEffect } from 'react';

interface ShowcaseSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  badge: string;
  badgeColor: string;
}

const showcaseSlides: ShowcaseSlide[] = [
  {
    id: 1,
    title: 'AI Canvas',
    description: 'Build websites, apps & designs with AI-powered code generation',
    image: '/images/showcase/ai-canvas.jpg',
    badge: 'Code Builder',
    badgeColor: 'from-purple-500 to-pink-500',
  },
  {
    id: 2,
    title: 'Smart Conversations',
    description: 'Natural, human-like chat with personalized AI companions',
    image: '/images/showcase/agent-chat.jpg',
    badge: 'Chat Interface',
    badgeColor: 'from-brand-500 to-accent-500',
  },
  {
    id: 3,
    title: 'Neural Config',
    description: 'Fine-tune AI behavior with advanced customization options',
    image: '/images/showcase/neural-config.jpg',
    badge: 'Settings Panel',
    badgeColor: 'from-cyan-500 to-teal-500',
  },
  {
    id: 4,
    title: 'Canvas Preview',
    description: 'Real-time preview of your AI-generated creations',
    image: '/images/showcase/canvas-preview.jpg',
    badge: 'Live Preview',
    badgeColor: 'from-orange-500 to-red-500',
  },
  {
    id: 5,
    title: 'AI Companion Chat',
    description: 'Engage in meaningful conversations with your AI friend',
    image: '/images/showcase/agent-chat-1.jpg',
    badge: 'Julie AI',
    badgeColor: 'from-pink-500 to-rose-500',
  },
];

export default function AgentShowcaseCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  // Auto-rotate slides every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number) => {
    if (index !== currentSlide) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleImageError = (slideId: number) => {
    setImageError(prev => ({ ...prev, [slideId]: true }));
  };

  const slide = showcaseSlides[currentSlide];
  const hasError = imageError[slide.id];

  return (
    <div className="relative">
      {/* Main Image Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-neural-800">
        {/* Image */}
        <div
          className={`relative w-full aspect-[4/3] transition-all duration-300 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {hasError ? (
            // Fallback gradient with icon
            <div className={`w-full h-full bg-gradient-to-br ${slide.badgeColor} flex items-center justify-center`}>
              <div className="text-center text-white">
                <div className="text-6xl mb-4">
                  {slide.id === 1 && '🎨'}
                  {slide.id === 2 && '💬'}
                  {slide.id === 3 && '⚙️'}
                  {slide.id === 4 && '👁️'}
                </div>
                <div className="text-lg font-semibold">{slide.title}</div>
              </div>
            </div>
          ) : (
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              onError={() => handleImageError(slide.id)}
            />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neural-900/80 via-transparent to-transparent" />
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${slide.badgeColor} shadow-lg`}>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {slide.badge}
          </span>
        </div>

        {/* Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-white mb-2">{slide.title}</h3>
          <p className="text-sm text-neural-300">{slide.description}</p>
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {showcaseSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-brand-500 w-8'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-medium">
        {currentSlide + 1} / {showcaseSlides.length}
      </div>
    </div>
  );
}
