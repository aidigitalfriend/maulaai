'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, CustomWiggle } from '@/lib/gsap';
import { GraduationCap, Play, Clock, Star, ArrowRight, BookOpen, Code, ChefHat, Dumbbell, Plane, Brain, Heart, Briefcase, Gamepad2, Sparkles, CheckCircle, ChevronRight } from 'lucide-react';

const tutorials = [
  {
    id: 'einstein',
    name: 'Einstein',
    avatar: '🧠',
    description: 'Physics & Mathematics Expert',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    difficulty: 'Intermediate',
    duration: '15 min',
    topics: ['Scientific Reasoning', 'Complex Math', 'Physics Concepts'],
    steps: [
      'Start with a clear question about physics or math',
      'Einstein will break down complex concepts step by step',
      'Ask follow-up questions to deepen understanding',
      'Use the Canvas feature for visual explanations'
    ]
  },
  {
    id: 'tech-wizard',
    name: 'Tech Wizard',
    avatar: '💻',
    description: 'Technology & Programming',
    color: 'emerald',
    gradient: 'from-emerald-500 to-cyan-500',
    difficulty: 'All Levels',
    duration: '20 min',
    topics: ['Code Review', 'Debugging', 'Best Practices'],
    steps: [
      'Share your code or describe the problem',
      'Tech Wizard will analyze and provide solutions',
      'Request code examples in any language',
      'Use Canvas for interactive code generation'
    ]
  },
  {
    id: 'chef-biew',
    name: 'Chef Biew',
    avatar: '👨‍🍳',
    description: 'Cooking & Recipes',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    difficulty: 'Beginner',
    duration: '10 min',
    topics: ['Recipes', 'Cooking Techniques', 'Meal Planning'],
    steps: [
      'Tell Chef Biew what ingredients you have',
      'Get personalized recipe suggestions',
      'Ask for cooking tips and substitutions',
      'Request step-by-step cooking instructions'
    ]
  },
  {
    id: 'fitness-guru',
    name: 'Fitness Guru',
    avatar: '💪',
    description: 'Fitness & Health',
    color: 'red',
    gradient: 'from-red-500 to-rose-500',
    difficulty: 'All Levels',
    duration: '15 min',
    topics: ['Workout Plans', 'Nutrition', 'Form Guidance'],
    steps: [
      'Share your fitness goals and experience level',
      'Get a personalized workout plan',
      'Ask about proper exercise form',
      'Request nutrition and recovery advice'
    ]
  },
  {
    id: 'travel-buddy',
    name: 'Travel Buddy',
    avatar: '✈️',
    description: 'Travel & Exploration',
    color: 'sky',
    gradient: 'from-sky-500 to-indigo-500',
    difficulty: 'Beginner',
    duration: '12 min',
    topics: ['Destination Planning', 'Itineraries', 'Travel Tips'],
    steps: [
      'Tell Travel Buddy your destination or interests',
      'Get personalized travel recommendations',
      'Request a detailed itinerary',
      'Ask about local customs and tips'
    ]
  },
  {
    id: 'julie-girlfriend',
    name: 'Julie Girlfriend',
    avatar: '💕',
    description: 'Relationship Advice',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    difficulty: 'Beginner',
    duration: '10 min',
    topics: ['Relationships', 'Communication', 'Dating Tips'],
    steps: [
      'Share your relationship question or situation',
      'Get thoughtful, empathetic advice',
      'Discuss communication strategies',
      'Explore different perspectives'
    ]
  },
  {
    id: 'mrs-boss',
    name: 'Mrs Boss',
    avatar: '📊',
    description: 'Business & Management',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    difficulty: 'Intermediate',
    duration: '18 min',
    topics: ['Leadership', 'Strategy', 'Career Growth'],
    steps: [
      'Describe your business challenge or goal',
      'Get strategic advice and frameworks',
      'Discuss team management techniques',
      'Plan your career development path'
    ]
  },
  {
    id: 'ben-sega',
    name: 'Ben Sega',
    avatar: '🎮',
    description: 'Gaming & Retro Entertainment',
    color: 'indigo',
    gradient: 'from-indigo-500 to-blue-500',
    difficulty: 'All Levels',
    duration: '10 min',
    topics: ['Game Recommendations', 'Retro Gaming', 'Gaming Culture'],
    steps: [
      'Tell Ben Sega your gaming preferences',
      'Get personalized game recommendations',
      'Discuss gaming strategies and tips',
      'Explore retro gaming history'
    ]
  }
];

export default function TutorialsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTutorial, setSelectedTutorial] = useState(tutorials[0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        CustomWiggle.create('tutorialWiggle', { wiggles: 5, type: 'uniform' });

        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.fromTo('.gradient-orb', 
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'expo.out' }
        )
        .fromTo('.floating-icon',
          { y: 30, opacity: 0, scale: 0 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(2)' },
          '-=0.8'
        )
        .fromTo('.agent-btn',
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.05 },
          '-=0.3'
        )
        .fromTo('.tutorial-content',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.3'
        );

        // Floating icons animation
        document.querySelectorAll('.floating-icon').forEach((icon, i) => {
          gsap.to(icon, {
            y: `random(-15, 15)`,
            x: `random(-10, 10)`,
            rotation: `random(-10, 10)`,
            duration: `random(3, 5)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2
          });
        });

        // Gradient orbs animation
        gsap.to('.gradient-orb-1', {
          x: 80,
          y: -60,
          duration: 15,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        gsap.to('.gradient-orb-2', {
          x: -70,
          y: 80,
          duration: 18,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

      }, containerRef);

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSelectTutorial = (tutorial: typeof tutorials[0]) => {
    setSelectedTutorial(tutorial);
    gsap.fromTo('.tutorial-content', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-pink-500/15 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-icon absolute top-24 left-[10%]">
          <div className="relative w-12 h-12 rounded-xl bg-pink-500/10 backdrop-blur-sm flex items-center justify-center border border-pink-500/30">
            <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-pink-500/40 rounded-tr-md" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-pink-500/40 rounded-bl-md" />
            <GraduationCap className="w-6 h-6 text-pink-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-40 right-[12%]">
          <div className="relative w-10 h-10 rounded-lg bg-purple-500/10 backdrop-blur-sm flex items-center justify-center border border-purple-500/30">
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-purple-500/40 rounded-tr-md" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-purple-500/40 rounded-bl-md" />
            <Play className="w-5 h-5 text-purple-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-48 left-[12%]">
          <div className="relative w-11 h-11 rounded-xl bg-cyan-500/10 backdrop-blur-sm flex items-center justify-center border border-cyan-500/30">
            <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-cyan-500/40 rounded-tr-md" />
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-cyan-500/40 rounded-bl-md" />
            <BookOpen className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Hero Section */}
        <section className="pt-32 pb-12 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/30 mb-8">
              <GraduationCap className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-300">Step-by-Step Guides</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
              Tutorials
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Learn how to get the most out of each agent with our
              <span className="text-pink-400"> interactive tutorials.</span>
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Agent Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-24 space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                  Select an Agent
                </h3>
                {tutorials.map((tutorial) => (
                  <button
                    key={tutorial.id}
                    onClick={() => handleSelectTutorial(tutorial)}
                    className={`agent-btn group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all overflow-hidden ${
                      selectedTutorial.id === tutorial.id
                        ? `bg-gradient-to-r ${tutorial.gradient} text-white`
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-2xl">{tutorial.avatar}</span>
                    <div>
                      <div className="font-medium">{tutorial.name}</div>
                      <div className={`text-xs ${selectedTutorial.id === tutorial.id ? 'text-white/70' : 'text-gray-500'}`}>
                        {tutorial.duration}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tutorial Content */}
            <div className="flex-1 min-w-0">
              <div className="tutorial-content">
                <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 overflow-hidden">
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedTutorial.gradient} flex items-center justify-center text-3xl`}>
                        {selectedTutorial.avatar}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedTutorial.name}</h2>
                        <p className="text-gray-400">{selectedTutorial.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {selectedTutorial.duration}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-${selectedTutorial.color}-500/10 text-${selectedTutorial.color}-400`}>
                        {selectedTutorial.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Topics */}
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">What You'll Learn</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTutorial.topics.map((topic, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 text-sm border border-gray-700">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Tutorial Steps</h3>
                    <div className="space-y-4">
                      {selectedTutorial.steps.map((step, i) => (
                        <div key={i} className="group relative flex items-start gap-4 p-4 rounded-xl bg-gray-950/50 border border-gray-800 overflow-hidden">
                          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedTutorial.gradient} flex items-center justify-center flex-shrink-0 text-white font-bold text-sm`}>
                            {i + 1}
                          </div>
                          <p className="text-gray-300 pt-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href={`/agents/${selectedTutorial.id}`}
                      className={`flex-1 inline-flex items-center justify-center px-6 py-4 rounded-xl bg-gradient-to-r ${selectedTutorial.gradient} text-white font-bold hover:shadow-lg transition-all`}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Try {selectedTutorial.name}
                    </Link>
                    <Link
                      href="/resources/documentation"
                      className="flex-1 inline-flex items-center justify-center px-6 py-4 rounded-xl bg-gray-800 border border-gray-700 text-white font-medium hover:bg-gray-700 transition-colors"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      View Documentation
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Explore All Agents?
            </h2>
            <p className="text-gray-400 mb-8">
              Browse our full collection of 18+ specialized AI agents.
            </p>
            <Link
              href="/agents"
              className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-pink-500/25 transition-all hover:scale-105"
            >
              Browse All Agents
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
