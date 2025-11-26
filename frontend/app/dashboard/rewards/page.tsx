'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  TrophyIcon,
  StarIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function RewardsCenterPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white">
      {/* Header */}
      <section className="py-12 px-4 border-b border-neural-200 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neural-900 mb-2">
                My Rewards
              </h1>
              <p className="text-neural-600">Track your progress, earn rewards, and unlock achievements</p>
            </div>
            <Link href="/dashboard/overview" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Rewards Content */}
      <section className="py-16 px-4">
        <div className="container-custom max-w-6xl">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <TrophyIcon className="w-8 h-8" />
                <span className="text-2xl font-bold">Lv.7</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Current Level</h3>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white rounded-full h-2 w-3/4 transition-all duration-300"></div>
              </div>
              <p className="text-sm opacity-90">1550 points to next level</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neural-100">
              <div className="flex items-center justify-between mb-4">
                <StarIcon className="w-8 h-8 text-yellow-500" />
                <span className="text-2xl font-bold text-neural-900">12,450</span>
              </div>
              <h3 className="text-lg font-semibold text-neural-900 mb-2">Total Points</h3>
              <p className="text-sm text-neural-600">Lifetime points earned</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neural-100">
              <div className="flex items-center justify-between mb-4">
                <SparklesIcon className="w-8 h-8 text-purple-500" />
                <span className="text-2xl font-bold text-neural-900">3</span>
              </div>
              <h3 className="text-lg font-semibold text-neural-900 mb-2">Badges Earned</h3>
              <p className="text-sm text-neural-600">Out of 5 available</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neural-100">
              <div className="flex items-center justify-between mb-4">
                <ChartBarIcon className="w-8 h-8 text-green-500" />
                <span className="text-2xl font-bold text-neural-900">#4</span>
              </div>
              <h3 className="text-lg font-semibold text-neural-900 mb-2">Leaderboard</h3>
              <p className="text-sm text-neural-600">Current ranking</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 p-1 bg-neural-100 rounded-xl mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-neural-600 hover:text-neural-900'
              }`}
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'badges'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-neural-600 hover:text-neural-900'
              }`}
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              Badges
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
                <h3 className="text-xl font-semibold text-neural-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neural-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mr-4">
                        <SparklesIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-neural-900">AI Enthusiast Badge</h4>
                        <p className="text-sm text-neural-600">Mar 22, 2024</p>
                      </div>
                    </div>
                    <span className="font-semibold text-brand-600">+250</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'overview' && (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-neural-100 max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <SparklesIcon className="w-10 h-10 text-brand-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-neural-900 mb-4">Coming Soon!</h3>
                  <p className="text-neural-600 mb-6">
                    We're working hard to bring you an amazing {activeTab} experience. 
                    Stay tuned for exciting updates!
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}