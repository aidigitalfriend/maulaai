'use client'

import React, { useState } from 'react'
import { Trophy, Star, Gift, Zap, Users, Calendar, MessageSquare, Share2, Crown, Award, TrendingUp, Lock, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Reward {
  id: string
  title: string
  description: string
  points: number
  icon: React.ReactNode
  category: 'subscription' | 'activity' | 'social' | 'milestone'
  isActive: boolean
}

interface Level {
  name: string
  minPoints: number
  maxPoints: number
  color: string
  benefits: string[]
  icon: React.ReactNode
}

interface AgentReward {
  id: string
  name: string
  subscriptionPoints: {
    daily: number
    weekly: number
    monthly: number
  }
  category: string
  image: string
}

export default function RewardsCenterPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'agents' | 'leaderboard'>('overview')
  const [userPoints, setUserPoints] = useState(2450)
  const [userLevel, setUserLevel] = useState('Gold')

  const levels: Level[] = [
    {
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 999,
      color: 'from-amber-500 to-amber-600',
      benefits: ['5% bonus points', 'Access to basic agents', 'Weekly rewards'],
      icon: <Award className="w-8 h-8 text-amber-600" />
    },
    {
      name: 'Silver',
      minPoints: 1000,
      maxPoints: 2499,
      color: 'from-neural-400 to-neural-500',
      benefits: ['10% bonus points', 'Access to premium agents', 'Daily rewards', 'Priority support'],
      icon: <Award className="w-8 h-8 text-neural-500" />
    },
    {
      name: 'Gold',
      minPoints: 2500,
      maxPoints: 4999,
      color: 'from-yellow-400 to-yellow-500',
      benefits: ['15% bonus points', 'Access to all agents', 'Daily rewards', 'Priority support', 'Exclusive features'],
      icon: <Crown className="w-8 h-8 text-yellow-500" />
    },
    {
      name: 'Platinum',
      minPoints: 5000,
      maxPoints: 9999,
      color: 'from-purple-400 to-purple-500',
      benefits: ['25% bonus points', 'Unlimited agent access', 'Daily rewards', 'VIP support', 'Exclusive features', 'Early access'],
      icon: <Crown className="w-8 h-8 text-purple-500" />
    },
    {
      name: 'Diamond',
      minPoints: 10000,
      maxPoints: Infinity,
      color: 'from-brand-400 to-brand-600',
      benefits: ['50% bonus points', 'Lifetime access', 'Daily rewards', 'VIP support', 'All features', 'Early access', 'Custom agents'],
      icon: <Crown className="w-8 h-8 text-brand-500" />
    }
  ]

  const rewards: Reward[] = [
    {
      id: '1',
      title: 'Daily Login',
      description: 'Login to your account every day',
      points: 50,
      icon: <Calendar className="w-6 h-6" />,
      category: 'activity',
      isActive: true
    },
    {
      id: '2',
      title: 'Subscribe to Agent',
      description: 'Subscribe to any agent for the first time',
      points: 200,
      icon: <Star className="w-6 h-6" />,
      category: 'subscription',
      isActive: true
    },
    {
      id: '3',
      title: 'Send 10 Messages',
      description: 'Send 10 messages to any agent',
      points: 100,
      icon: <MessageSquare className="w-6 h-6" />,
      category: 'activity',
      isActive: true
    },
    {
      id: '4',
      title: 'Refer a Friend',
      description: 'Invite friends and earn when they join',
      points: 500,
      icon: <Share2 className="w-6 h-6" />,
      category: 'social',
      isActive: true
    },
    {
      id: '5',
      title: 'Weekly Streak',
      description: 'Login 7 days in a row',
      points: 300,
      icon: <Zap className="w-6 h-6" />,
      category: 'activity',
      isActive: true
    },
    {
      id: '6',
      title: 'Monthly Streak',
      description: 'Login 30 days in a row',
      points: 1000,
      icon: <Trophy className="w-6 h-6" />,
      category: 'milestone',
      isActive: true
    },
    {
      id: '7',
      title: 'Complete Profile',
      description: 'Fill out your profile 100%',
      points: 150,
      icon: <Users className="w-6 h-6" />,
      category: 'activity',
      isActive: true
    },
    {
      id: '8',
      title: 'Premium Subscription',
      description: 'Subscribe to any premium agent',
      points: 400,
      icon: <Crown className="w-6 h-6" />,
      category: 'subscription',
      isActive: true
    }
  ]

  const agentRewards: AgentReward[] = [
    {
      id: '1',
      name: 'Einstein AI',
      subscriptionPoints: { daily: 100, weekly: 600, monthly: 2000 },
      category: 'Education',
      image: '🧠'
    },
    {
      id: '2',
      name: 'Doctor Network',
      subscriptionPoints: { daily: 120, weekly: 700, monthly: 2400 },
      category: 'Healthcare',
      image: '⚕️'
    },
    {
      id: '3',
      name: 'Tech Wizard',
      subscriptionPoints: { daily: 100, weekly: 600, monthly: 2000 },
      category: 'Technology',
      image: '🧙‍♂️'
    },
    {
      id: '4',
      name: 'Fitness Guru',
      subscriptionPoints: { daily: 80, weekly: 500, monthly: 1600 },
      category: 'Health & Fitness',
      image: '💪'
    },
    {
      id: '5',
      name: 'Travel Buddy',
      subscriptionPoints: { daily: 90, weekly: 550, monthly: 1800 },
      category: 'Travel',
      image: '✈️'
    },
    {
      id: '6',
      name: 'Chef Biew',
      subscriptionPoints: { daily: 80, weekly: 500, monthly: 1600 },
      category: 'Food & Cooking',
      image: '👨‍🍳'
    },
    {
      id: '7',
      name: 'Comedy King',
      subscriptionPoints: { daily: 70, weekly: 450, monthly: 1400 },
      category: 'Entertainment',
      image: '🎭'
    },
    {
      id: '8',
      name: 'Bishop Burger',
      subscriptionPoints: { daily: 110, weekly: 650, monthly: 2200 },
      category: 'Business',
      image: '📊'
    }
  ]

  const getCurrentLevel = () => {
    return levels.find(level => userPoints >= level.minPoints && userPoints <= level.maxPoints) || levels[0]
  }

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel()
    const currentIndex = levels.findIndex(l => l.name === currentLevel.name)
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
  }

  const getProgressToNextLevel = () => {
    const currentLevel = getCurrentLevel()
    const nextLevel = getNextLevel()
    if (!nextLevel) return 100
    
    const progress = ((userPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    return Math.min(progress, 100)
  }

  const redeemPoints = (points: number, rewardName: string) => {
    // Mock redemption - will be implemented later
    console.log(`Redeeming ${points} points for ${rewardName}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Trophy className="w-20 h-20 text-yellow-300 animate-bounce" />
                <div className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-brand-600" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Rewards Center
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Earn points, unlock rewards, and level up your AI Agent experience
            </p>
            
            {/* Coming Soon Banner */}
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Gift className="w-6 h-6 text-yellow-300 animate-pulse" />
                <h3 className="text-2xl font-bold text-yellow-300">Coming Soon!</h3>
                <Gift className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-white text-lg">
                We're working hard on this exciting Rewards Center! Get ready for amazing benefits, exclusive rewards, and gamified experiences.
              </p>
            </div>

            {/* User Stats */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30"
              >
                <Star className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{userPoints.toLocaleString()}</div>
                <div className="text-white/80">Total Points</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`bg-gradient-to-br ${getCurrentLevel().color} backdrop-blur-md rounded-2xl p-6 border border-white/30`}
              >
                {getCurrentLevel().icon}
                <div className="text-3xl font-bold text-white mb-1 mt-3">{getCurrentLevel().name}</div>
                <div className="text-white/90">Current Level</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30"
              >
                <TrendingUp className="w-8 h-8 text-green-300 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {getNextLevel() ? getNextLevel()!.minPoints - userPoints : 0}
                </div>
                <div className="text-white/80">Points to Next Level</div>
              </motion.div>
            </div>

            {/* Progress Bar */}
            {getNextLevel() && (
              <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-white/20 backdrop-blur-md rounded-full h-6 overflow-hidden border border-white/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressToNextLevel()}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-end px-2"
                  >
                    <span className="text-xs text-white font-semibold">
                      {Math.round(getProgressToNextLevel())}%
                    </span>
                  </motion.div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-white/80">
                  <span>{getCurrentLevel().name}</span>
                  <span>{getNextLevel()?.name}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {[
            { id: 'overview', label: 'Overview', icon: <Trophy className="w-5 h-5" /> },
            { id: 'rewards', label: 'Earn Rewards', icon: <Gift className="w-5 h-5" /> },
            { id: 'agents', label: 'Agent Subscriptions', icon: <Star className="w-5 h-5" /> },
            { id: 'leaderboard', label: 'Leaderboard', icon: <Award className="w-5 h-5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-lg scale-105'
                  : 'bg-white text-neural-600 hover:bg-neural-50 hover:text-neural-900 border border-neural-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Levels Section */}
              <div className="bg-white rounded-2xl p-8 border border-neural-200 shadow-sm">
                <h2 className="text-2xl font-bold text-neural-900 mb-6 flex items-center gap-3">
                  <Crown className="w-7 h-7 text-yellow-500" />
                  Membership Levels
                </h2>
                <div className="space-y-4">
                  {levels.map((level, index) => (
                    <div
                      key={level.name}
                      className={`p-4 rounded-xl border ${
                        level.name === getCurrentLevel().name
                          ? 'bg-gradient-to-r ' + level.color + ' border-white/40 text-white'
                          : 'bg-neural-50 border-neural-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {level.icon}
                          <div>
                            <h3 className={`text-lg font-bold ${level.name === getCurrentLevel().name ? 'text-white' : 'text-neural-900'}`}>{level.name}</h3>
                            <p className={`text-sm ${level.name === getCurrentLevel().name ? 'text-white/80' : 'text-neural-600'}`}>
                              {level.minPoints.toLocaleString()} - {level.maxPoints === Infinity ? '∞' : level.maxPoints.toLocaleString()} pts
                            </p>
                          </div>
                        </div>
                        {level.name === getCurrentLevel().name && (
                          <CheckCircle className="w-6 h-6 text-green-300" />
                        )}
                      </div>
                      <div className="mt-3 space-y-1">
                        {level.benefits.map((benefit, i) => (
                          <div key={i} className={`flex items-center gap-2 text-sm ${level.name === getCurrentLevel().name ? 'text-white/90' : 'text-neural-600'}`}>
                            <CheckCircle className={`w-4 h-4 ${level.name === getCurrentLevel().name ? 'text-green-300' : 'text-green-500'}`} />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-8 border border-neural-200 shadow-sm">
                  <h2 className="text-2xl font-bold text-neural-900 mb-6 flex items-center gap-3">
                    <Zap className="w-7 h-7 text-yellow-500" />
                    Quick Actions
                  </h2>
                  <div className="space-y-4">
                    {rewards.slice(0, 4).map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between p-4 bg-neural-50 rounded-xl border border-neural-200 hover:bg-neural-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600">
                            {reward.icon}
                          </div>
                          <div>
                            <h3 className="text-neural-900 font-semibold">{reward.title}</h3>
                            <p className="text-sm text-neural-600">{reward.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-brand-600">+{reward.points}</div>
                          <div className="text-xs text-neural-500">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Redeem Section */}
                <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-2xl p-8 border border-brand-200">
                  <h2 className="text-2xl font-bold text-neural-900 mb-4 flex items-center gap-3">
                    <Gift className="w-7 h-7 text-brand-600" />
                    Redeem Points
                  </h2>
                  <p className="text-neural-600 mb-6">
                    Exchange your points for amazing rewards!
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-neural-200">
                      <span className="text-neural-900 font-semibold">1 Day Agent Access</span>
                      <span className="text-brand-600 font-bold">1000 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-neural-200">
                      <span className="text-neural-900 font-semibold">1 Week Agent Access</span>
                      <span className="text-brand-600 font-bold">5000 pts</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-neural-200">
                      <span className="text-neural-900 font-semibold">1 Month Premium</span>
                      <span className="text-brand-600 font-bold">15000 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Earn Rewards Tab */}
        {activeTab === 'rewards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-neural-900 mb-8 text-center">Earn Points Every Day</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl p-6 border border-neural-200 hover:border-brand-300 hover:shadow-lg transition-all"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    reward.category === 'subscription' ? 'bg-gradient-to-br from-brand-500 to-accent-500' :
                    reward.category === 'activity' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                    reward.category === 'social' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                    'bg-gradient-to-br from-yellow-500 to-orange-500'
                  } text-white`}>
                    {reward.icon}
                  </div>
                  <h3 className="text-xl font-bold text-neural-900 text-center mb-2">{reward.title}</h3>
                  <p className="text-neural-600 text-center text-sm mb-4">{reward.description}</p>
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-brand-50 px-4 py-2 rounded-full border border-brand-200">
                      <Star className="w-5 h-5 text-brand-600" />
                      <span className="text-xl font-bold text-brand-600">+{reward.points}</span>
                      <span className="text-neural-600 text-sm">points</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      reward.category === 'subscription' ? 'bg-brand-100 text-brand-700' :
                      reward.category === 'activity' ? 'bg-blue-100 text-blue-700' :
                      reward.category === 'social' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Agent Subscriptions Tab */}
        {activeTab === 'agents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-neural-900 mb-4 text-center">Agent Subscription Rewards</h2>
            <p className="text-neural-600 text-center mb-8 max-w-2xl mx-auto">
              Subscribe to your favorite agents and earn points! Longer subscriptions = more points
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agentRewards.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl p-6 border border-neural-200 hover:border-brand-300 hover:shadow-lg transition-all"
                >
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-3">{agent.image}</div>
                    <h3 className="text-xl font-bold text-neural-900 mb-1">{agent.name}</h3>
                    <p className="text-sm text-brand-600">{agent.category}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-neural-50 rounded-xl p-3 border border-neural-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-neural-700 text-sm">Daily</span>
                        <span className="text-brand-600 font-bold">+{agent.subscriptionPoints.daily} pts</span>
                      </div>
                      <div className="text-xs text-neural-500">Subscribe for 1 day</div>
                    </div>
                    <div className="bg-neural-50 rounded-xl p-3 border border-brand-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-neural-700 text-sm">Weekly</span>
                        <span className="text-brand-600 font-bold">+{agent.subscriptionPoints.weekly} pts</span>
                      </div>
                      <div className="text-xs text-neural-500">Subscribe for 1 week</div>
                    </div>
                    <div className="bg-gradient-to-r from-brand-50 to-accent-50 rounded-xl p-3 border border-accent-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-neural-900 font-semibold text-sm flex items-center gap-1">
                          Monthly <Crown className="w-3 h-3 text-yellow-500" />
                        </span>
                        <span className="text-brand-600 font-bold">+{agent.subscriptionPoints.monthly} pts</span>
                      </div>
                      <div className="text-xs text-neural-500">Subscribe for 1 month</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-neural-900 mb-8 text-center">Top Performers</h2>
            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 border border-neural-200 shadow-sm">
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'Alex Johnson', points: 15420, level: 'Diamond', avatar: '👑' },
                  { rank: 2, name: 'Sarah Chen', points: 12850, level: 'Diamond', avatar: '💎' },
                  { rank: 3, name: 'Michael Kim', points: 10200, level: 'Diamond', avatar: '⭐' },
                  { rank: 4, name: 'Emma Davis', points: 8750, level: 'Platinum', avatar: '🌟' },
                  { rank: 5, name: 'You', points: userPoints, level: getCurrentLevel().name, avatar: '😊' },
                  { rank: 6, name: 'James Wilson', points: 2100, level: 'Silver', avatar: '🚀' },
                  { rank: 7, name: 'Lisa Brown', points: 1850, level: 'Silver', avatar: '💫' },
                  { rank: 8, name: 'David Lee', points: 1620, level: 'Silver', avatar: '✨' }
                ].map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      user.name === 'You'
                        ? 'bg-gradient-to-r from-brand-50 to-accent-50 border-2 border-brand-400'
                        : 'bg-neural-50 border border-neural-200'
                    } hover:bg-neural-100 transition-all`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                        user.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                        user.rank === 2 ? 'bg-gradient-to-br from-neural-300 to-neural-400' :
                        user.rank === 3 ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                        'bg-neural-200'
                      } text-white`}>
                        {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-neural-900">{user.name}</span>
                          {user.name === 'You' && (
                            <span className="text-xs bg-brand-600 text-white px-2 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-sm text-neural-600">{user.level} Member</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-brand-600">{user.points.toLocaleString()}</div>
                      <div className="text-xs text-neural-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
