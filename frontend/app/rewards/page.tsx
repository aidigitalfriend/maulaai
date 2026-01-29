'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { gsap, ScrollTrigger, SplitText, TextPlugin, Flip, Draggable, MotionPathPlugin, CustomWiggle, CustomEase, ScrollToPlugin, Observer } from '@/lib/gsap';
import { Trophy, Star, Gift, Award, Crown, Zap, TrendingUp, Users, MessageSquare, Share2, Calendar, Check, ChevronRight, Sparkles, Target, Flame, Medal, Diamond, ArrowRight, Rocket, Heart, Clock, Coins, Timer, PartyPopper } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ReactNode;
  category: 'subscription' | 'activity' | 'social' | 'milestone';
  gradient: string;
}

interface Level {
  name: string;
  minPoints: number;
  maxPoints: number;
  gradient: string;
  benefits: string[];
  icon: React.ReactNode;
}

interface AgentReward {
  id: string;
  name: string;
  subscriptionPoints: { daily: number; weekly: number; monthly: number };
  category: string;
  image: string;
}

const levels: Level[] = [
  { name: 'Bronze', minPoints: 0, maxPoints: 999, gradient: 'from-amber-600 to-orange-700', benefits: ['5% bonus points', 'Access to basic agents', 'Weekly rewards'], icon: <Award className="w-6 h-6" /> },
  { name: 'Silver', minPoints: 1000, maxPoints: 2499, gradient: 'from-gray-400 to-gray-500', benefits: ['10% bonus points', 'Access to premium agents', 'Daily rewards', 'Priority support'], icon: <Medal className="w-6 h-6" /> },
  { name: 'Gold', minPoints: 2500, maxPoints: 4999, gradient: 'from-yellow-400 to-amber-500', benefits: ['15% bonus points', 'Access to all agents', 'Daily rewards', 'Priority support', 'Exclusive features'], icon: <Crown className="w-6 h-6" /> },
  { name: 'Platinum', minPoints: 5000, maxPoints: 9999, gradient: 'from-purple-400 to-violet-500', benefits: ['25% bonus points', 'Unlimited agent access', 'Daily rewards', 'VIP support', 'Exclusive features', 'Early access'], icon: <Star className="w-6 h-6" /> },
  { name: 'Diamond', minPoints: 10000, maxPoints: Infinity, gradient: 'from-cyan-400 to-blue-500', benefits: ['50% bonus points', 'Lifetime access', 'Daily rewards', 'VIP support', 'All features', 'Early access', 'Custom agents'], icon: <Diamond className="w-6 h-6" /> },
];

const rewards: Reward[] = [
  { id: '1', title: 'Daily Login', description: 'Login to your account every day', points: 50, icon: <Calendar className="w-6 h-6" />, category: 'activity', gradient: 'from-blue-500 to-cyan-500' },
  { id: '2', title: 'Subscribe to Agent', description: 'Subscribe to any agent for the first time', points: 200, icon: <Star className="w-6 h-6" />, category: 'subscription', gradient: 'from-violet-500 to-purple-500' },
  { id: '3', title: 'Send 10 Messages', description: 'Send 10 messages to any agent', points: 100, icon: <MessageSquare className="w-6 h-6" />, category: 'activity', gradient: 'from-emerald-500 to-teal-500' },
  { id: '4', title: 'Refer a Friend', description: 'Invite friends and earn when they join', points: 500, icon: <Share2 className="w-6 h-6" />, category: 'social', gradient: 'from-pink-500 to-rose-500' },
  { id: '5', title: 'Weekly Streak', description: 'Login 7 days in a row', points: 300, icon: <Flame className="w-6 h-6" />, category: 'activity', gradient: 'from-orange-500 to-red-500' },
  { id: '6', title: 'Monthly Streak', description: 'Login 30 days in a row', points: 1000, icon: <Trophy className="w-6 h-6" />, category: 'milestone', gradient: 'from-yellow-500 to-amber-500' },
  { id: '7', title: 'Complete Profile', description: 'Fill out your profile 100%', points: 150, icon: <Users className="w-6 h-6" />, category: 'activity', gradient: 'from-indigo-500 to-blue-500' },
  { id: '8', title: 'Premium Subscription', description: 'Subscribe to any premium agent', points: 400, icon: <Crown className="w-6 h-6" />, category: 'subscription', gradient: 'from-amber-500 to-yellow-500' },
];

const agentRewards: AgentReward[] = [
  { id: '1', name: 'Einstein AI', subscriptionPoints: { daily: 100, weekly: 600, monthly: 2000 }, category: 'Education', image: '🧠' },
  { id: '2', name: 'Doctor Network', subscriptionPoints: { daily: 120, weekly: 700, monthly: 2400 }, category: 'Healthcare', image: '⚕️' },
  { id: '3', name: 'Tech Wizard', subscriptionPoints: { daily: 100, weekly: 600, monthly: 2000 }, category: 'Technology', image: '🧙‍♂️' },
  { id: '4', name: 'Fitness Guru', subscriptionPoints: { daily: 80, weekly: 500, monthly: 1600 }, category: 'Health', image: '💪' },
  { id: '5', name: 'Travel Buddy', subscriptionPoints: { daily: 90, weekly: 550, monthly: 1800 }, category: 'Travel', image: '✈️' },
  { id: '6', name: 'Chef Biew', subscriptionPoints: { daily: 80, weekly: 500, monthly: 1600 }, category: 'Food', image: '👨‍🍳' },
  { id: '7', name: 'Comedy King', subscriptionPoints: { daily: 70, weekly: 450, monthly: 1400 }, category: 'Fun', image: '🎭' },
  { id: '8', name: 'Bishop Burger', subscriptionPoints: { daily: 110, weekly: 650, monthly: 2200 }, category: 'Business', image: '📊' },
];

const leaderboard = [
  { rank: 1, name: 'Alex Johnson', points: 15420, level: 'Diamond', avatar: '👑' },
  { rank: 2, name: 'Sarah Chen', points: 12850, level: 'Diamond', avatar: '💎' },
  { rank: 3, name: 'Michael Kim', points: 10200, level: 'Diamond', avatar: '⭐' },
  { rank: 4, name: 'Emma Davis', points: 8750, level: 'Platinum', avatar: '🌟' },
  { rank: 5, name: 'You', points: 2450, level: 'Silver', avatar: '😊' },
  { rank: 6, name: 'James Wilson', points: 2100, level: 'Silver', avatar: '🚀' },
  { rank: 7, name: 'Lisa Brown', points: 1850, level: 'Silver', avatar: '💫' },
  { rank: 8, name: 'David Lee', points: 1620, level: 'Silver', avatar: '✨' },
];

const flipWords = ['Rewards', 'Points', 'Badges', 'Levels', 'Perks'];
const tagWords = ['EARN', 'REDEEM', 'LEVEL UP', 'UNLOCK', 'WIN'];

export default function RewardsCenterPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'agents' | 'leaderboard'>('overview');
  const [userPoints] = useState(2450);
  const [displayPoints, setDisplayPoints] = useState(0);
  const [currentFlipWord, setCurrentFlipWord] = useState(0);
  const flipWordRef = useRef<HTMLSpanElement>(null);
  const tagContainerRef = useRef<HTMLDivElement>(null);

  const getCurrentLevel = () => levels.find(l => userPoints >= l.minPoints && userPoints <= l.maxPoints) || levels[0];
  const getNextLevel = () => {
    const idx = levels.findIndex(l => l.name === getCurrentLevel().name);
    return idx < levels.length - 1 ? levels[idx + 1] : null;
  };
  const getProgress = () => {
    const curr = getCurrentLevel();
    const next = getNextLevel();
    if (!next) return 100;
    return Math.min(((userPoints - curr.minPoints) / (next.minPoints - curr.minPoints)) * 100, 100);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Register all plugins
      gsap.registerPlugin(ScrollTrigger, TextPlugin, Flip, MotionPathPlugin, ScrollToPlugin, Observer);
      CustomWiggle.create('rewardWiggle', { wiggles: 6, type: 'uniform' });
      CustomEase.create('bounceOut', 'M0,0 C0.14,0 0.27,0.58 0.32,0.8 0.37,1.02 0.45,1.12 0.5,1.12 0.55,1.12 0.63,1.02 0.68,0.8 0.73,0.58 0.86,0 1,0');

      // ===== HERO SECTION ANIMATIONS =====
      
      // Badge entrance with elastic bounce
      gsap.set('.hero-badge', { scale: 0, rotation: -180 });
      gsap.to('.hero-badge', {
        scale: 1,
        rotation: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.3)',
        delay: 0.2
      });

      // Badge shimmer effect
      gsap.to('.hero-badge', {
        backgroundPosition: '200% center',
        duration: 2,
        repeat: -1,
        ease: 'none',
        delay: 1.5
      });

      // Hero title with SplitText character animation
      const heroTitle = document.querySelector('.hero-main-title');
      if (heroTitle) {
        const split = new SplitText(heroTitle, { type: 'chars, words' });
        gsap.set(split.chars, { opacity: 0, y: 100, rotationX: -90 });
        gsap.to(split.chars, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.03,
          ease: 'back.out(1.7)',
          delay: 0.4
        });

        // Color wave through characters
        gsap.to(split.chars, {
          color: '#fbbf24',
          duration: 0.3,
          stagger: { each: 0.05, repeat: -1, yoyo: true },
          delay: 2
        });
      }

      // Flip word animation
      const flipWordAnimation = () => {
        if (flipWordRef.current) {
          gsap.to(flipWordRef.current, {
            duration: 0.4,
            rotationX: -90,
            opacity: 0,
            ease: 'power2.in',
            onComplete: () => {
              setCurrentFlipWord(prev => (prev + 1) % flipWords.length);
              gsap.fromTo(flipWordRef.current,
                { rotationX: 90, opacity: 0 },
                { rotationX: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
              );
            }
          });
        }
      };
      const flipInterval = setInterval(flipWordAnimation, 2500);

      // Subtitle with scramble text effect
      const subtitle = document.querySelector('.hero-subtitle');
      if (subtitle) {
        gsap.set(subtitle, { opacity: 0 });
        gsap.to(subtitle, {
          opacity: 1,
          duration: 0.1,
          delay: 1,
          onComplete: () => {
            gsap.to(subtitle, {
              duration: 2,
              text: { value: 'Unlock rewards and level up your AI experience with every interaction!', delimiter: '' },
              ease: 'none'
            });
          }
        });
      }

      // Coming soon badge with pulse and wiggle
      gsap.set('.coming-soon-badge', { scale: 0 });
      gsap.to('.coming-soon-badge', {
        scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1.2, 0.4)',
        delay: 1.5
      });
      gsap.to('.coming-soon-badge', {
        scale: 1.05,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2.5
      });
      gsap.to('.coming-soon-badge', {
        rotation: 2,
        duration: 0.15,
        repeat: -1,
        yoyo: true,
        ease: 'rewardWiggle',
        delay: 2.5
      });

      // ===== STAT CARDS ANIMATIONS =====
      
      // Stat cards 3D flip entrance
      gsap.set('.stat-card', { 
        rotationY: -180, 
        opacity: 0,
        transformPerspective: 1000,
        transformOrigin: 'center center'
      });
      gsap.to('.stat-card', {
        rotationY: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: 'back.out(1.5)',
        delay: 1.2
      });

      // Points counter animation
      gsap.to({ val: 0 }, {
        val: userPoints,
        duration: 2.5,
        delay: 1.8,
        ease: 'power2.out',
        onUpdate: function() {
          setDisplayPoints(Math.round(this.targets()[0].val));
        }
      });

      // Stat card hover magnetic effect
      document.querySelectorAll('.stat-card').forEach(card => {
        const cardEl = card as HTMLElement;
        cardEl.addEventListener('mousemove', (e) => {
          const rect = cardEl.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(cardEl, {
            rotationY: x / 10,
            rotationX: -y / 10,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
        cardEl.addEventListener('mouseleave', () => {
          gsap.to(cardEl, {
            rotationY: 0,
            rotationX: 0,
            duration: 0.5,
            ease: 'elastic.out(1, 0.3)'
          });
        });
      });

      // Stat icons continuous rotation/pulse
      gsap.to('.stat-icon', {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: 'none',
        stagger: 0.5
      });

      // ===== PROGRESS BAR ANIMATIONS =====
      
      gsap.set('.progress-container', { opacity: 0, scaleX: 0 });
      gsap.to('.progress-container', {
        opacity: 1,
        scaleX: 1,
        duration: 0.8,
        ease: 'power3.out',
        delay: 2
      });

      gsap.set('.progress-fill', { width: '0%' });
      gsap.to('.progress-fill', {
        width: `${getProgress()}%`,
        duration: 2,
        ease: 'power2.out',
        delay: 2.3
      });

      // Progress bar shimmer
      gsap.to('.progress-shimmer', {
        x: '100%',
        duration: 1.5,
        repeat: -1,
        ease: 'power1.inOut',
        delay: 3
      });

      // ===== ROTATING TAGS MARQUEE =====
      
      if (tagContainerRef.current) {
        const tags = tagContainerRef.current.querySelectorAll('.rotating-tag');
        gsap.set(tags, { opacity: 0, scale: 0 });
        gsap.to(tags, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'back.out(2)',
          delay: 2
        });

        // Continuous marquee scroll
        gsap.to('.tag-track', {
          x: '-50%',
          duration: 20,
          repeat: -1,
          ease: 'none'
        });
      }

      // ===== TAB BUTTONS ANIMATIONS =====
      
      gsap.set('.tab-btn', { y: 50, opacity: 0, scale: 0.8 });
      gsap.to('.tab-btn', {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        delay: 2.2
      });

      // Tab button hover effects
      document.querySelectorAll('.tab-btn').forEach(btn => {
        const btnEl = btn as HTMLElement;
        btnEl.addEventListener('mouseenter', () => {
          gsap.to(btnEl, {
            scale: 1.1,
            y: -5,
            duration: 0.3,
            ease: 'back.out(2)'
          });
          gsap.to(btnEl.querySelector('.tab-icon'), {
            rotation: 360,
            duration: 0.5,
            ease: 'power2.out'
          });
        });
        btnEl.addEventListener('mouseleave', () => {
          gsap.to(btnEl, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });

      // ===== FLOATING ICONS WITH MOTION PATH =====
      
      gsap.set('.floating-icon', { opacity: 0, scale: 0 });
      gsap.to('.floating-icon', {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.5
      });

      // Complex motion paths for floating icons
      document.querySelectorAll('.floating-icon').forEach((icon, i) => {
        const paths = [
          'M0,0 C50,-50 100,50 150,0 C200,-50 250,50 300,0',
          'M0,0 C-30,40 30,80 0,120 C-30,160 30,200 0,240',
          'M0,0 Q50,-30 0,-60 Q-50,-30 0,0'
        ];
        
        gsap.to(icon, {
          motionPath: {
            path: paths[i % paths.length],
            curviness: 1.5,
          },
          duration: 8 + i * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        // Rotation and scale pulse
        gsap.to(icon, {
          rotation: `random(-20, 20)`,
          scale: `random(0.9, 1.1)`,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3
        });
      });

      // ===== GRADIENT ORBS WITH MORPH =====
      
      gsap.set('.gradient-orb', { scale: 0, opacity: 0 });
      gsap.to('.gradient-orb', {
        scale: 1,
        opacity: 1,
        duration: 2,
        stagger: 0.3,
        ease: 'expo.out'
      });

      // Morphing blob animation
      gsap.to('.gradient-orb', {
        borderRadius: '60% 40% 70% 30% / 40% 50% 60% 50%',
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.5
      });

      gsap.to('.gradient-orb-1', {
        x: 100,
        y: -80,
        scale: 1.2,
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.gradient-orb-2', {
        x: -100,
        y: 100,
        scale: 0.8,
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // ===== SCROLL-TRIGGERED ANIMATIONS =====
      
      // Content cards with stagger and flip
      ScrollTrigger.batch('.content-card', {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { y: 80, opacity: 0, rotationX: -15, scale: 0.9 },
            { 
              y: 0, 
              opacity: 1, 
              rotationX: 0, 
              scale: 1, 
              duration: 0.8, 
              stagger: 0.15, 
              ease: 'back.out(1.5)' 
            }
          );
        },
        start: 'top 85%',
        once: true
      });

      // Level cards with drawer effect
      ScrollTrigger.batch('.level-card', {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { x: -100, opacity: 0, scaleX: 0.5 },
            { 
              x: 0, 
              opacity: 1, 
              scaleX: 1, 
              duration: 0.6, 
              stagger: 0.1, 
              ease: 'power3.out' 
            }
          );
        },
        start: 'top 80%',
        once: true
      });

      // Reward cards with bounce
      ScrollTrigger.batch('.reward-card', {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { y: 60, opacity: 0, scale: 0.7, rotation: -5 },
            { 
              y: 0, 
              opacity: 1, 
              scale: 1, 
              rotation: 0, 
              duration: 0.7, 
              stagger: 0.08, 
              ease: 'elastic.out(1, 0.5)' 
            }
          );
        },
        start: 'top 85%',
        once: true
      });

      // Agent cards with spiral entrance
      ScrollTrigger.batch('.agent-card', {
        onEnter: (elements) => {
          elements.forEach((el, i) => {
            gsap.fromTo(el,
              { 
                opacity: 0, 
                scale: 0, 
                rotation: 180 + (i * 45),
                x: (i % 2 === 0 ? -50 : 50)
              },
              { 
                opacity: 1, 
                scale: 1, 
                rotation: 0, 
                x: 0,
                duration: 0.8, 
                delay: i * 0.1,
                ease: 'back.out(1.5)' 
              }
            );
          });
        },
        start: 'top 85%',
        once: true
      });

      // Leaderboard rows with slide and glow
      ScrollTrigger.batch('.leaderboard-row', {
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { x: -200, opacity: 0 },
            { 
              x: 0, 
              opacity: 1, 
              duration: 0.6, 
              stagger: 0.1, 
              ease: 'power3.out' 
            }
          );
        },
        start: 'top 85%',
        once: true
      });

      // Section titles with split text
      document.querySelectorAll('.section-title').forEach(title => {
        ScrollTrigger.create({
          trigger: title,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            const split = new SplitText(title, { type: 'chars' });
            gsap.fromTo(split.chars,
              { opacity: 0, y: 50, rotation: 15 },
              { 
                opacity: 1, 
                y: 0, 
                rotation: 0, 
                duration: 0.5, 
                stagger: 0.02, 
                ease: 'back.out(2)' 
              }
            );
          }
        });
      });

      // Parallax scrolling for orbs
      gsap.to('.gradient-orb-1', {
        y: -200,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1
        }
      });

      gsap.to('.gradient-orb-2', {
        y: 200,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1
        }
      });

      return () => {
        clearInterval(flipInterval);
      };
    }, containerRef);

    return () => ctx.revert();
  }, [userPoints]);

  // Tab change animation with Flip
  const handleTabChange = useCallback((newTab: typeof activeTab) => {
    const state = Flip.getState('.tab-btn');
    setActiveTab(newTab);
    
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.5,
        ease: 'power2.inOut',
        absolute: true
      });

      // Animate content change
      gsap.fromTo('.tab-content',
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
      );
    });
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb gradient-orb-1 absolute top-20 left-1/4 w-[700px] h-[700px] bg-amber-500/20 rounded-full blur-3xl" />
        <div className="gradient-orb gradient-orb-2 absolute bottom-40 right-1/4 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-3xl" />
        <div className="gradient-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Floating Icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-icon absolute top-24 left-[8%]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-md flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/20">
            <Trophy className="w-7 h-7 text-amber-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-32 right-[10%]">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-md flex items-center justify-center border border-violet-500/30 shadow-lg shadow-violet-500/20">
            <Gift className="w-6 h-6 text-violet-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-1/3 left-[5%]">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-md flex items-center justify-center border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
            <Star className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-48 left-[12%]">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-md flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
            <Coins className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div className="floating-icon absolute bottom-32 right-[8%]">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-md flex items-center justify-center border border-pink-500/30 shadow-lg shadow-pink-500/20">
            <Heart className="w-6 h-6 text-pink-400" />
          </div>
        </div>
        <div className="floating-icon absolute top-1/2 right-[6%]">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 backdrop-blur-md flex items-center justify-center border border-yellow-500/30 shadow-lg shadow-yellow-500/20">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* ===== HERO SECTION ===== */}
        <section className="pt-28 pb-8 px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Animated Badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 mb-8 bg-[length:200%_100%]">
              <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
              <span className="text-sm font-bold text-amber-300 tracking-wide">REWARDS CENTER</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>

            {/* Main Title with Animation */}
            <h1 className="hero-main-title text-5xl md:text-7xl font-black mb-4 leading-tight bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
              Earn Amazing
            </h1>
            
            {/* Flip Word */}
            <div className="text-5xl md:text-7xl font-black mb-6 h-20 flex items-center justify-center">
              <span 
                ref={flipWordRef}
                className="inline-block bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent"
                style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
              >
                {flipWords[currentFlipWord]}
              </span>
            </div>

            {/* Subtitle with Typewriter Effect */}
            <p className="hero-subtitle text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-6 h-8">
              &nbsp;
            </p>

            {/* Coming Soon Badge */}
            <div className="coming-soon-badge inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-cyan-500/20 border-2 border-violet-500/40 mb-10 shadow-xl shadow-violet-500/20">
              <PartyPopper className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-black text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text tracking-wide">
                COMING SOON!
              </span>
              <Rocket className="w-6 h-6 text-cyan-400" />
            </div>

            {/* Rotating Tags Marquee */}
            <div ref={tagContainerRef} className="overflow-hidden py-4 mb-8">
              <div className="tag-track flex gap-4 w-max">
                {[...tagWords, ...tagWords, ...tagWords, ...tagWords].map((tag, i) => (
                  <span 
                    key={i} 
                    className="rotating-tag px-4 py-2 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 text-sm font-bold text-gray-300 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8" style={{ perspective: '1000px' }}>
              <div className="stat-card group p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-amber-500/50 transition-all shadow-xl" style={{ transformStyle: 'preserve-3d' }}>
                <div className="stat-icon w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-4xl font-black text-white mb-1 tabular-nums">{displayPoints.toLocaleString()}</div>
                <div className="text-gray-400 font-medium">Total Points</div>
              </div>
              
              <div className={`stat-card group p-6 rounded-2xl bg-gradient-to-br ${getCurrentLevel().gradient} border border-white/20 shadow-xl`} style={{ transformStyle: 'preserve-3d' }}>
                <div className="stat-icon w-12 h-12 mx-auto mb-3 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  {getCurrentLevel().icon}
                </div>
                <div className="text-4xl font-black text-white mb-1">{getCurrentLevel().name}</div>
                <div className="text-white/80 font-medium">Current Level</div>
              </div>
              
              <div className="stat-card group p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 hover:border-emerald-500/50 transition-all shadow-xl" style={{ transformStyle: 'preserve-3d' }}>
                <div className="stat-icon w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-4xl font-black text-white mb-1">{getNextLevel() ? getNextLevel()!.minPoints - userPoints : 0}</div>
                <div className="text-gray-400 font-medium">Points to Next Level</div>
              </div>
            </div>

            {/* Progress Bar */}
            {getNextLevel() && (
              <div className="progress-container max-w-2xl mx-auto origin-left">
                <div className="h-5 rounded-full bg-gray-800/80 overflow-hidden border border-gray-700 relative">
                  <div 
                    className="progress-fill h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full relative overflow-hidden"
                  >
                    <div className="progress-shimmer absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full" />
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-sm font-medium">
                  <span className="text-gray-400">{getCurrentLevel().name}</span>
                  <span className="text-amber-400">{Math.round(getProgress())}%</span>
                  <span className="text-gray-400">{getNextLevel()?.name}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== TAB NAVIGATION ===== */}
        <section className="pb-8 px-6">
          <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center">
            {[
              { id: 'overview', label: 'Overview', icon: Trophy },
              { id: 'rewards', label: 'Earn Rewards', icon: Gift },
              { id: 'agents', label: 'Agent Subscriptions', icon: Star },
              { id: 'leaderboard', label: 'Leaderboard', icon: Award },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as typeof activeTab)}
                className={`tab-btn flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black shadow-lg shadow-amber-500/30'
                    : 'bg-gray-900/80 text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white'
                }`}
              >
                <tab.icon className="tab-icon w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ===== TAB CONTENT ===== */}
        <section className="pb-20 px-6">
          <div className="tab-content max-w-6xl mx-auto">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Levels */}
                <div className="content-card p-8 rounded-3xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 shadow-2xl">
                  <h2 className="section-title text-2xl font-black text-white mb-6 flex items-center gap-3">
                    <Crown className="w-8 h-8 text-yellow-400" />
                    Membership Levels
                  </h2>
                  <div className="space-y-3">
                    {levels.map((level) => (
                      <div
                        key={level.name}
                        className={`level-card p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                          level.name === getCurrentLevel().name
                            ? `bg-gradient-to-r ${level.gradient} border-white/30 shadow-lg`
                            : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={level.name === getCurrentLevel().name ? 'text-white' : 'text-gray-400'}>{level.icon}</div>
                            <div>
                              <div className={`font-bold ${level.name === getCurrentLevel().name ? 'text-white' : 'text-gray-300'}`}>{level.name}</div>
                              <div className={`text-xs ${level.name === getCurrentLevel().name ? 'text-white/70' : 'text-gray-500'}`}>
                                {level.maxPoints === Infinity ? `${level.minPoints.toLocaleString()}+` : `${level.minPoints.toLocaleString()} - ${level.maxPoints.toLocaleString()}`} pts
                              </div>
                            </div>
                          </div>
                          {level.name === getCurrentLevel().name && (
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">Current</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions & Redeem */}
                <div className="space-y-8">
                  <div className="content-card p-8 rounded-3xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 shadow-2xl">
                    <h2 className="section-title text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <Zap className="w-8 h-8 text-yellow-400" />
                      Quick Actions
                    </h2>
                    <div className="space-y-3">
                      {rewards.slice(0, 4).map((reward) => (
                        <div 
                          key={reward.id} 
                          className="reward-card flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-amber-500/50 hover:bg-gray-800 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${reward.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                              {reward.icon}
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-amber-400 transition-colors">{reward.title}</div>
                              <div className="text-sm text-gray-500">{reward.description}</div>
                            </div>
                          </div>
                          <span className="text-amber-400 font-black text-lg">+{reward.points}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="content-card p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 via-gray-900 to-amber-500/10 border border-gray-800 shadow-2xl">
                    <h2 className="section-title text-2xl font-black text-white mb-4 flex items-center gap-3">
                      <Gift className="w-8 h-8 text-violet-400" />
                      Redeem Points
                    </h2>
                    <p className="text-gray-400 mb-6">Exchange your points for amazing rewards!</p>
                    <div className="space-y-3">
                      {['1 Month Free Subscription', 'Exclusive Agent Access', 'Custom Agent Creation'].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-violet-500/50 transition-all group">
                          <span className="text-white font-medium">{item}</span>
                          <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-violet-500/30 hover:scale-105 transition-all">
                            Redeem
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REWARDS TAB */}
            {activeTab === 'rewards' && (
              <div>
                <h2 className="section-title text-4xl font-black text-white mb-10 text-center">Earn Points Every Day</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {rewards.map((reward) => (
                    <div 
                      key={reward.id} 
                      className="reward-card group p-6 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 hover:border-amber-500/50 transition-all cursor-pointer hover:scale-105"
                    >
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${reward.gradient} flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                        {reward.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white text-center mb-2 group-hover:text-amber-400 transition-colors">{reward.title}</h3>
                      <p className="text-gray-500 text-center text-sm mb-4">{reward.description}</p>
                      <div className="text-center">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black">
                          <Star className="w-4 h-4" />
                          +{reward.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AGENTS TAB */}
            {activeTab === 'agents' && (
              <div>
                <h2 className="section-title text-4xl font-black text-white mb-4 text-center">Agent Subscription Rewards</h2>
                <p className="text-gray-400 text-center mb-10 text-lg">Subscribe to your favorite agents and earn points!</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {agentRewards.map((agent) => (
                    <div 
                      key={agent.id} 
                      className="agent-card p-6 rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 hover:border-cyan-500/50 transition-all cursor-pointer group hover:scale-105"
                    >
                      <div className="text-center mb-4">
                        <div className="text-6xl mb-3 group-hover:scale-125 transition-transform">{agent.image}</div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{agent.name}</h3>
                        <span className="text-sm text-gray-500">{agent.category}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                          <span className="text-gray-400">Daily</span>
                          <span className="text-amber-400 font-bold">+{agent.subscriptionPoints.daily}</span>
                        </div>
                        <div className="flex justify-between text-sm p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                          <span className="text-gray-400">Weekly</span>
                          <span className="text-amber-400 font-bold">+{agent.subscriptionPoints.weekly}</span>
                        </div>
                        <div className="flex justify-between text-sm p-3 rounded-lg bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30">
                          <span className="text-gray-300 font-medium">Monthly</span>
                          <span className="text-cyan-400 font-black">+{agent.subscriptionPoints.monthly}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LEADERBOARD TAB */}
            {activeTab === 'leaderboard' && (
              <div>
                <h2 className="section-title text-4xl font-black text-white mb-10 text-center">Top Performers</h2>
                <div className="max-w-3xl mx-auto content-card p-8 rounded-3xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 shadow-2xl">
                  <div className="space-y-3">
                    {leaderboard.map((user) => (
                      <div
                        key={user.rank}
                        className={`leaderboard-row flex items-center justify-between p-5 rounded-xl transition-all cursor-pointer ${
                          user.name === 'You'
                            ? 'bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-cyan-500/20 border-2 border-violet-500/50 shadow-lg shadow-violet-500/20'
                            : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${
                            user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/30' :
                            user.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black shadow-lg shadow-gray-400/30' :
                            user.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-lg shadow-amber-600/30' :
                            'bg-gray-700 text-gray-400'
                          }`}>
                            {user.rank <= 3 ? user.avatar : user.rank}
                          </div>
                          <div>
                            <div className={`font-bold text-lg ${user.name === 'You' ? 'text-cyan-400' : 'text-white'}`}>{user.name}</div>
                            <div className="text-sm text-gray-500">{user.level}</div>
                          </div>
                        </div>
                        <div className="text-amber-400 font-black text-xl">{user.points.toLocaleString()} pts</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== CTA SECTION ===== */}
        <section className="pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="content-card relative p-10 md:p-16 rounded-3xl bg-gradient-to-br from-amber-500/10 via-gray-900 to-violet-500/10 border border-gray-800 text-center overflow-hidden shadow-2xl">
              {/* Animated background particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-amber-500/30"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`
                    }}
                  />
                ))}
              </div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <h2 className="section-title text-4xl md:text-5xl font-black text-white mb-4">Start Earning Today!</h2>
                <p className="text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
                  Join thousands of users already earning rewards. Every interaction counts!
                </p>
                <Link
                  href="/agents"
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black font-black text-xl hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105 transition-all"
                >
                  Explore Agents
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
