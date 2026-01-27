'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Trophy, Star, Gift, Zap, Users, Calendar, MessageSquare, Share2, Crown, Award, TrendingUp, CheckCircle } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ReactNode;
  category: 'subscription' | 'activity' | 'social' | 'milestone';
}

interface Level {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  benefits: string[];
}

interface AgentReward {
  id: string;
  name: string;
  subscriptionPoints: { daily: number; weekly: number; monthly: number };
  category: string;
  image: string;
}

export default function RewardsCenterPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'agents' | 'leaderboard'>('overview');
  const [userPoints] = useState(2450);

  const levels: Level[] = [
    { name: 'Bronze', minPoints: 0, maxPoints: 999, color: '#cd7f32', benefits: ['5% bonus points', 'Access to basic agents', 'Weekly rewards'] },
    { name: 'Silver', minPoints: 1000, maxPoints: 2499, color: '#9ca3af', benefits: ['10% bonus points', 'Access to premium agents', 'Daily rewards', 'Priority support'] },
    { name: 'Gold', minPoints: 2500, maxPoints: 4999, color: '#f59e0b', benefits: ['15% bonus points', 'Access to all agents', 'Daily rewards', 'Priority support', 'Exclusive features'] },
    { name: 'Platinum', minPoints: 5000, maxPoints: 9999, color: '#a855f7', benefits: ['25% bonus points', 'Unlimited agent access', 'Daily rewards', 'VIP support', 'Exclusive features', 'Early access'] },
    { name: 'Diamond', minPoints: 10000, maxPoints: Infinity, color: '#00d4ff', benefits: ['50% bonus points', 'Lifetime access', 'Daily rewards', 'VIP support', 'All features', 'Early access', 'Custom agents'] }
  ];

  const rewards: Reward[] = [
    { id: '1', title: 'Daily Login', description: 'Login to your account every day', points: 50, icon: <Calendar className="w-6 h-6" />, category: 'activity' },
    { id: '2', title: 'Subscribe to Agent', description: 'Subscribe to any agent for the first time', points: 200, icon: <Star className="w-6 h-6" />, category: 'subscription' },
    { id: '3', title: 'Send 10 Messages', description: 'Send 10 messages to any agent', points: 100, icon: <MessageSquare className="w-6 h-6" />, category: 'activity' },
    { id: '4', title: 'Refer a Friend', description: 'Invite friends and earn when they join', points: 500, icon: <Share2 className="w-6 h-6" />, category: 'social' },
    { id: '5', title: 'Weekly Streak', description: 'Login 7 days in a row', points: 300, icon: <Zap className="w-6 h-6" />, category: 'activity' },
    { id: '6', title: 'Monthly Streak', description: 'Login 30 days in a row', points: 1000, icon: <Trophy className="w-6 h-6" />, category: 'milestone' },
    { id: '7', title: 'Complete Profile', description: 'Fill out your profile 100%', points: 150, icon: <Users className="w-6 h-6" />, category: 'activity' },
    { id: '8', title: 'Premium Subscription', description: 'Subscribe to any premium agent', points: 400, icon: <Crown className="w-6 h-6" />, category: 'subscription' }
  ];

  const agentRewards: AgentReward[] = [
    { id: '1', name: 'Einstein AI', subscriptionPoints: { daily: 100, weekly: 600, monthly: 2000 }, category: 'Education', image: '🧠' },
    { id: '2', name: 'Doctor Network', subscriptionPoints: { daily: 120, weekly: 700, monthly: 2400 }, category: 'Healthcare', image: '⚕️' },
    { id: '3', name: 'Tech Wizard', subscriptionPoints: { daily: 100, weekly: 600, monthly: 2000 }, category: 'Technology', image: '🧙‍♂️' },
    { id: '4', name: 'Fitness Guru', subscriptionPoints: { daily: 80, weekly: 500, monthly: 1600 }, category: 'Health & Fitness', image: '💪' },
    { id: '5', name: 'Travel Buddy', subscriptionPoints: { daily: 90, weekly: 550, monthly: 1800 }, category: 'Travel', image: '✈️' },
    { id: '6', name: 'Chef Biew', subscriptionPoints: { daily: 80, weekly: 500, monthly: 1600 }, category: 'Food & Cooking', image: '👨‍🍳' },
    { id: '7', name: 'Comedy King', subscriptionPoints: { daily: 70, weekly: 450, monthly: 1400 }, category: 'Entertainment', image: '🎭' },
    { id: '8', name: 'Bishop Burger', subscriptionPoints: { daily: 110, weekly: 650, monthly: 2200 }, category: 'Business', image: '📊' }
  ];

  const leaderboard = [
    { rank: 1, name: 'Alex Johnson', points: 15420, level: 'Diamond', avatar: '👑' },
    { rank: 2, name: 'Sarah Chen', points: 12850, level: 'Diamond', avatar: '💎' },
    { rank: 3, name: 'Michael Kim', points: 10200, level: 'Diamond', avatar: '⭐' },
    { rank: 4, name: 'Emma Davis', points: 8750, level: 'Platinum', avatar: '🌟' },
    { rank: 5, name: 'You', points: userPoints, level: 'Gold', avatar: '😊' },
    { rank: 6, name: 'James Wilson', points: 2100, level: 'Silver', avatar: '🚀' },
    { rank: 7, name: 'Lisa Brown', points: 1850, level: 'Silver', avatar: '💫' },
    { rank: 8, name: 'David Lee', points: 1620, level: 'Silver', avatar: '✨' }
  ];

  const getCurrentLevel = () => levels.find(level => userPoints >= level.minPoints && userPoints <= level.maxPoints) || levels[0];
  const getNextLevel = () => {
    const currentIndex = levels.findIndex(l => l.name === getCurrentLevel().name);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };
  const getProgressToNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    if (!nextLevel) return 100;
    return Math.min(((userPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100, 100);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'subscription': return '#a855f7';
      case 'activity': return '#00d4ff';
      case 'social': return '#00ff88';
      case 'milestone': return '#f59e0b';
      default: return '#00d4ff';
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl
      .fromTo('.hero-badge', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.coming-soon-banner', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.6 }, '-=0.2');

    gsap.fromTo('.stat-card',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.stats-row', start: 'top 85%' } }
    );

    gsap.fromTo('.tab-btn',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.tabs-container', start: 'top 90%' } }
    );

    gsap.fromTo('.content-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.content-section', start: 'top 85%' } }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <style jsx global>{`
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.08); transition: all 0.3s ease; }
        .glass-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(0,212,255,0.3); }
        .metallic-text { background: linear-gradient(to bottom, #fff, #fff, #9ca3af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.15)_0%,_transparent_70%)] blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm mb-6 opacity-0">
            <Trophy className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-gray-300">Earn & Redeem</span>
          </div>
          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 metallic-text opacity-0">
            Rewards Center
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 opacity-0">
            Earn points, unlock rewards, and level up your AI Agent experience
          </p>
          
          {/* Coming Soon Banner */}
          <div className="coming-soon-banner glass-card rounded-2xl p-6 max-w-2xl mx-auto mb-12 border-[#f59e0b]/30 opacity-0">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Gift className="w-6 h-6 text-[#f59e0b] animate-pulse" />
              <h3 className="text-2xl font-bold text-[#f59e0b]">Coming Soon!</h3>
              <Gift className="w-6 h-6 text-[#f59e0b] animate-pulse" />
            </div>
            <p className="text-gray-400">
              We're working hard on this exciting Rewards Center! Get ready for amazing benefits, exclusive rewards, and gamified experiences.
            </p>
          </div>

          {/* User Stats */}
          <div className="stats-row grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="stat-card glass-card rounded-2xl p-6 opacity-0">
              <Star className="w-8 h-8 text-[#f59e0b] mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{userPoints.toLocaleString()}</div>
              <div className="text-gray-500">Total Points</div>
            </div>
            <div className="stat-card glass-card rounded-2xl p-6 opacity-0" style={{ borderColor: `${getCurrentLevel().color}40` }}>
              <Crown className="w-8 h-8 mx-auto mb-3" style={{ color: getCurrentLevel().color }} />
              <div className="text-3xl font-bold text-white mb-1">{getCurrentLevel().name}</div>
              <div className="text-gray-500">Current Level</div>
            </div>
            <div className="stat-card glass-card rounded-2xl p-6 opacity-0">
              <TrendingUp className="w-8 h-8 text-[#00ff88] mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">
                {getNextLevel() ? (getNextLevel()!.minPoints - userPoints).toLocaleString() : 'MAX'}
              </div>
              <div className="text-gray-500">Points to Next Level</div>
            </div>
          </div>

          {/* Progress Bar */}
          {getNextLevel() && (
            <div className="max-w-2xl mx-auto mt-8">
              <div className="glass-card rounded-full h-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#f59e0b] to-[#00d4ff] flex items-center justify-end px-3 transition-all duration-1000"
                  style={{ width: `${getProgressToNextLevel()}%` }}
                >
                  <span className="text-xs text-white font-semibold">{Math.round(getProgressToNextLevel())}%</span>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>{getCurrentLevel().name}</span>
                <span>{getNextLevel()?.name}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 px-6 tabs-container">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { id: 'overview', label: 'Overview', icon: <Trophy className="w-5 h-5" /> },
              { id: 'rewards', label: 'Earn Rewards', icon: <Gift className="w-5 h-5" /> },
              { id: 'agents', label: 'Agent Subscriptions', icon: <Star className="w-5 h-5" /> },
              { id: 'leaderboard', label: 'Leaderboard', icon: <Award className="w-5 h-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`tab-btn flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all opacity-0 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#f59e0b] to-[#00d4ff] text-white'
                    : 'glass-card text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-6 content-section">
        <div className="max-w-6xl mx-auto">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Levels */}
              <div className="content-card glass-card rounded-2xl p-8 opacity-0">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Crown className="w-7 h-7 text-[#f59e0b]" />
                  Membership Levels
                </h2>
                <div className="space-y-4">
                  {levels.map((level) => (
                    <div
                      key={level.name}
                      className={`p-4 rounded-xl border transition-all ${
                        level.name === getCurrentLevel().name
                          ? 'bg-white/10 border-white/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                      style={level.name === getCurrentLevel().name ? { borderColor: `${level.color}60` } : {}}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Crown className="w-6 h-6" style={{ color: level.color }} />
                          <div>
                            <h3 className="text-lg font-bold text-white">{level.name}</h3>
                            <p className="text-sm text-gray-500">
                              {level.minPoints.toLocaleString()} - {level.maxPoints === Infinity ? '∞' : level.maxPoints.toLocaleString()} pts
                            </p>
                          </div>
                        </div>
                        {level.name === getCurrentLevel().name && (
                          <CheckCircle className="w-6 h-6 text-[#00ff88]" />
                        )}
                      </div>
                      <div className="mt-3 space-y-1">
                        {level.benefits.slice(0, 3).map((benefit, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                            <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions & Redeem */}
              <div className="space-y-8">
                <div className="content-card glass-card rounded-2xl p-8 opacity-0">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Zap className="w-7 h-7 text-[#00d4ff]" />
                    Quick Actions
                  </h2>
                  <div className="space-y-4">
                    {rewards.slice(0, 4).map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${getCategoryColor(reward.category)}20`, color: getCategoryColor(reward.category) }}>
                            {reward.icon}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{reward.title}</h3>
                            <p className="text-sm text-gray-500">{reward.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-[#f59e0b]">+{reward.points}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="content-card glass-card rounded-2xl p-8 border-[#f59e0b]/30 opacity-0">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Gift className="w-7 h-7 text-[#f59e0b]" />
                    Redeem Points
                  </h2>
                  <p className="text-gray-400 mb-6">Exchange your points for amazing rewards!</p>
                  <div className="space-y-3">
                    {[
                      { name: '1 Day Agent Access', points: 1000 },
                      { name: '1 Week Agent Access', points: 5000 },
                      { name: '1 Month Premium', points: 15000 }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-white font-semibold">{item.name}</span>
                        <span className="text-[#f59e0b] font-bold">{item.points.toLocaleString()} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <div>
              <h2 className="text-3xl font-bold metallic-text mb-8 text-center">Earn Points Every Day</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rewards.map((reward) => (
                  <div key={reward.id} className="glass-card rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${getCategoryColor(reward.category)}, ${getCategoryColor(reward.category)}80)` }}>
                      {reward.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{reward.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{reward.description}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border" style={{ background: `${getCategoryColor(reward.category)}20`, borderColor: `${getCategoryColor(reward.category)}40` }}>
                      <Star className="w-5 h-5 text-[#f59e0b]" />
                      <span className="text-xl font-bold text-[#f59e0b]">+{reward.points}</span>
                      <span className="text-gray-400 text-sm">pts</span>
                    </div>
                    <div className="mt-4">
                      <span className="text-xs px-3 py-1 rounded-full" style={{ background: `${getCategoryColor(reward.category)}20`, color: getCategoryColor(reward.category) }}>
                        {reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Subscriptions Tab */}
          {activeTab === 'agents' && (
            <div>
              <h2 className="text-3xl font-bold metallic-text mb-4 text-center">Agent Subscription Rewards</h2>
              <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
                Subscribe to your favorite agents and earn points! Longer subscriptions = more points
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {agentRewards.map((agent) => (
                  <div key={agent.id} className="glass-card rounded-2xl p-6 hover:scale-[1.02] transition-transform">
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-3">{agent.image}</div>
                      <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                      <p className="text-sm text-gray-500">{agent.category}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-sm">Daily</span>
                          <span className="text-[#f59e0b] font-bold">+{agent.subscriptionPoints.daily} pts</span>
                        </div>
                        <div className="text-xs text-gray-600">Subscribe for 1 day</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-[#a855f7]/30">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-sm">Weekly</span>
                          <span className="text-[#f59e0b] font-bold">+{agent.subscriptionPoints.weekly} pts</span>
                        </div>
                        <div className="text-xs text-gray-600">Subscribe for 1 week</div>
                      </div>
                      <div className="rounded-xl p-3 border border-[#00d4ff]/30" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(0,212,255,0.1))' }}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-semibold text-sm flex items-center gap-1">
                            Monthly <Crown className="w-3 h-3 text-[#f59e0b]" />
                          </span>
                          <span className="text-[#f59e0b] font-bold">+{agent.subscriptionPoints.monthly} pts</span>
                        </div>
                        <div className="text-xs text-gray-600">Subscribe for 1 month</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div>
              <h2 className="text-3xl font-bold metallic-text mb-8 text-center">Top Performers</h2>
              <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8">
                <div className="space-y-4">
                  {leaderboard.map((user) => (
                    <div
                      key={user.rank}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        user.name === 'You'
                          ? 'bg-gradient-to-r from-[#a855f7]/20 to-[#00d4ff]/20 border-2 border-[#a855f7]'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                          user.rank === 1 ? 'bg-gradient-to-br from-[#f59e0b] to-[#ea580c]' :
                          user.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                          user.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                          'bg-white/10'
                        } text-white`}>
                          {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-white">{user.name}</span>
                            {user.name === 'You' && (
                              <span className="text-xs bg-[#a855f7] text-white px-2 py-0.5 rounded-full">You</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.level} Member</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#f59e0b]">{user.points.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
