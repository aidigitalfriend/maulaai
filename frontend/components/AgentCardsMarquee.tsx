'use client';

import { useRef, useState, useMemo } from 'react';

interface Agent {
  id: string;
  name: string;
  specialty: string;
  description: string;
  color: string;
  emoji: string;
  hoverBadge: string;
}

const agents: Agent[] = [
  {
    id: '1',
    name: 'Einstein',
    specialty: 'Physics & Science',
    description: 'Explore the mysteries of the universe',
    color: 'from-blue-500 to-indigo-600',
    emoji: '🔬',
    hoverBadge: 'E=mc²',
  },
  {
    id: '2',
    name: 'Tech Wizard',
    specialty: 'Coding & Innovation',
    description: 'Master the art of technology',
    color: 'from-purple-500 to-pink-600',
    emoji: '💻',
    hoverBadge: 'Full Stack',
  },
  {
    id: '3',
    name: 'Mrs Boss',
    specialty: 'Leadership & Strategy',
    description: 'Lead with confidence and clarity',
    color: 'from-rose-500 to-red-600',
    emoji: '👔',
    hoverBadge: 'CEO Mindset',
  },
  {
    id: '4',
    name: 'Chef Biew',
    specialty: 'Culinary Expertise',
    description: 'Create culinary masterpieces',
    color: 'from-orange-500 to-amber-600',
    emoji: '👨‍🍳',
    hoverBadge: '5-Star Chef',
  },
  {
    id: '5',
    name: 'Julie',
    specialty: 'Companionship',
    description: 'Your caring AI companion',
    color: 'from-pink-500 to-rose-600',
    emoji: '💕',
    hoverBadge: 'Always Here',
  },
  {
    id: '6',
    name: 'Emma Emotional',
    specialty: 'Empathy & Support',
    description: 'Emotional intelligence expert',
    color: 'from-teal-500 to-cyan-600',
    emoji: '💝',
    hoverBadge: 'Empathy Pro',
  },
  {
    id: '7',
    name: 'Travel Buddy',
    specialty: 'Travel Planning',
    description: 'Your ultimate travel companion',
    color: 'from-green-500 to-emerald-600',
    emoji: '✈️',
    hoverBadge: 'World Explorer',
  },
  {
    id: '8',
    name: 'Fitness Guru',
    specialty: 'Health & Fitness',
    description: 'Transform your body and mind',
    color: 'from-red-500 to-orange-600',
    emoji: '💪',
    hoverBadge: 'Get Fit',
  },
  {
    id: '9',
    name: 'Comedy King',
    specialty: 'Entertainment',
    description: 'Laughter is the best medicine',
    color: 'from-yellow-500 to-orange-600',
    emoji: '😂',
    hoverBadge: 'LOL Master',
  },
  {
    id: '10',
    name: 'Drama Queen',
    specialty: 'Creative Writing',
    description: 'Dramatic storytelling expert',
    color: 'from-violet-500 to-purple-600',
    emoji: '🎭',
    hoverBadge: 'Storyteller',
  },
  {
    id: '11',
    name: 'Professor Astrology',
    specialty: 'Astrology & Spirituality',
    description: 'Decode the stars and beyond',
    color: 'from-indigo-500 to-blue-600',
    emoji: '🔮',
    hoverBadge: 'Star Reader',
  },
  {
    id: '12',
    name: 'Nid Gaming',
    specialty: 'Gaming & Esports',
    description: 'Level up your gaming skills',
    color: 'from-cyan-500 to-blue-600',
    emoji: '🎮',
    hoverBadge: 'Pro Gamer',
  },
  {
    id: '13',
    name: 'Ben Sega',
    specialty: 'Retro Gaming',
    description: 'Classic gaming nostalgia expert',
    color: 'from-blue-500 to-purple-600',
    emoji: '🕹️',
    hoverBadge: 'Retro Master',
  },
  {
    id: '14',
    name: 'Bishop Burger',
    specialty: 'Fast Food & Recipes',
    description: 'Master of comfort food',
    color: 'from-amber-500 to-red-600',
    emoji: '🍔',
    hoverBadge: 'Burger King',
  },
  {
    id: '15',
    name: 'Knight Logic',
    specialty: 'Logic & Strategy',
    description: 'Strategic thinking expert',
    color: 'from-slate-500 to-gray-600',
    emoji: '♞',
    hoverBadge: 'Strategist',
  },
  {
    id: '16',
    name: 'Lazy Pawn',
    specialty: 'Relaxation & Chill',
    description: 'Master of taking it easy',
    color: 'from-green-400 to-teal-500',
    emoji: '😴',
    hoverBadge: 'Chill Mode',
  },
  {
    id: '17',
    name: 'Rook Jokey',
    specialty: 'Comedy & Jokes',
    description: 'Never-ending humor and fun',
    color: 'from-yellow-400 to-amber-500',
    emoji: '🃏',
    hoverBadge: 'Joke Master',
  },
  {
    id: '18',
    name: 'Chess Player',
    specialty: 'Chess & Mind Games',
    description: 'Grandmaster level chess AI',
    color: 'from-gray-600 to-black',
    emoji: '♟️',
    hoverBadge: 'Grandmaster',
  },
];

const N = agents.length;

export default function AgentCardsMarquee() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Calculate the radius based on card width and number of cards
  const cardWidth = 120; // Small card width
  const cardHeight = 150; // Small card height
  const baseAngle = 360 / N;
  // Calculate radius: R = (cardWidth + gap) / (2 * tan(baseAngle/2))
  const radius = useMemo(() => {
    const gap = 25; // Gap between cards
    const angleRad = (baseAngle / 2) * (Math.PI / 180);
    return (cardWidth + gap) / (2 * Math.tan(angleRad));
  }, []);

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-[#0a0a10] via-[#0c0c18] to-[#0a0a10] overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full filter blur-[150px]"></div>
      </div>

      {/* Header */}
      <div className="container-custom relative z-10 mb-16 md:mb-20">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-4 border border-purple-500/30">
            <span className="text-lg">🤖</span>
            Meet Our AI Agents
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            18 Unique AI
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent"> Personalities</span>
          </h2>
          <p className="text-lg text-gray-400">
            Each agent brings specialized expertise and a unique personality. Find your perfect AI companion.
          </p>
        </div>
      </div>

      {/* 3D Carousel Scene - Large section, small cards */}
      <div 
        className="scene relative"
        style={{ 
          perspective: '1000px',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maskImage: 'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 5%, black 95%, transparent)',
        }}

      >
        {/* 3D Rotating Container */}
        <div 
          ref={carouselRef}
          className="a3d"
          style={{
            transformStyle: 'preserve-3d',
            animation: isPaused ? 'none' : 'carouselSpin 40s linear infinite',
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
          }}
        >
          {agents.map((agent, index) => (
            <div
              key={agent.id}
              className="card-3d group cursor-pointer"
              style={{
                position: 'absolute',
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                backfaceVisibility: 'hidden',
                transform: `rotateY(${index * baseAngle}deg) translateZ(${radius}px)`,
              }}
              onMouseEnter={() => setHoveredId(agent.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className={`relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/20 backdrop-blur-sm transition-all duration-500 ${
                hoveredId === agent.id ? 'scale-110 border-white/40 shadow-2xl' : ''
              }`}>
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-10 group-hover:opacity-25 transition-opacity duration-500`}></div>
                
                {/* Avatar Area */}
                <div className="relative h-[60px] overflow-hidden flex items-center justify-center">
                  <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br from-white/20 to-white/5 border flex items-center justify-center transition-all duration-500 ${
                    hoveredId === agent.id 
                      ? 'scale-110 border-white/50' 
                      : 'border-white/30'
                  }`}>
                    <span className="text-base">{agent.emoji}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-2">
                  <h3 className="text-[11px] font-bold text-white mb-0.5 group-hover:text-cyan-300 transition-colors truncate">
                    {agent.name}
                  </h3>
                  <p className="text-[8px] text-gray-400 mb-1 line-clamp-2 group-hover:text-gray-300 transition-colors leading-tight">
                    {agent.description}
                  </p>
                  
                  {/* Specialty Tag */}
                  <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${agent.color}`}></div>
                    <span className="text-[7px] text-gray-500 truncate">{agent.specialty}</span>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}>
                  <div className={`absolute -inset-1 bg-gradient-to-r ${agent.color} opacity-20 blur-xl`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floor Reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a10] via-[#0a0a10]/80 to-transparent pointer-events-none"></div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes carouselSpin {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-360deg);
          }
        }
        
        .card-3d {
          transition: transform 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}
