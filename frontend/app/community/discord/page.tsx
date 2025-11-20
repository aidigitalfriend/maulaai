'use client'

import Link from 'next/link'
import { MessageCircle, Users, Zap, Award, TrendingUp, Share2, Heart, Flame } from 'lucide-react'

export default function DiscordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neural-900 via-neural-800 to-neural-900">
      {/* Header */}
      <section className="section-padding-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MessageCircle className="w-10 h-10" />
            <h1 className="text-5xl md:text-6xl font-bold">Join Our Discord</h1>
          </div>
          <p className="text-xl opacity-90 mb-2">Connect with the One Last AI community</p>
          <p className="text-lg opacity-75">10,000+ members sharing knowledge and building together</p>
        </div>
      </section>

      {/* Main CTA */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-2 border-purple-600/50 rounded-lg p-12 text-center mb-12">
            <div className="text-7xl mb-6 animate-bounce">💜</div>
            <h2 className="text-4xl font-bold text-white mb-4">Our Active Discord Community</h2>
            <p className="text-xl text-neutral-300 mb-8">
              Join thousands of AI enthusiasts, developers, and innovators sharing tips, asking questions, and connecting with fellow One Last AI users worldwide.
            </p>
            <a
              href="https://discord.gg/onelastai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              Join Discord Community
              <span className="text-lg">→</span>
            </a>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 hover:border-purple-500 transition-all">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-white mb-2">Share Ideas</h3>
              <p className="text-neutral-300">Discuss new features, improvements, and innovative use cases with the community</p>
            </div>

            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 hover:border-indigo-500 transition-all">
              <div className="text-5xl mb-4">❓</div>
              <h3 className="text-xl font-bold text-white mb-2">Get Help</h3>
              <p className="text-neutral-300">Connect with experts, get quick answers, and learn from experienced community members</p>
            </div>

            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 hover:border-pink-500 transition-all">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">Events & Updates</h3>
              <p className="text-neutral-300">Participate in live events, competitions, and stay updated with latest platform news</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Join Our Discord?</h2>

          <div className="space-y-4">
            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 flex gap-4 hover:border-purple-500 transition-all">
              <Zap className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Real-Time Support</h3>
                <p className="text-neutral-300">Get instant help from community members and One Last AI team members</p>
              </div>
            </div>

            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 flex gap-4 hover:border-indigo-500 transition-all">
              <Users className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Network & Collaborate</h3>
                <p className="text-neutral-300">Build connections with fellow developers, entrepreneurs, and AI enthusiasts</p>
              </div>
            </div>

            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 flex gap-4 hover:border-pink-500 transition-all">
              <TrendingUp className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Learn & Grow</h3>
                <p className="text-neutral-300">Access tutorials, case studies, and best practices shared by experts</p>
              </div>
            </div>

            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 flex gap-4 hover:border-green-500 transition-all">
              <Award className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Exclusive Opportunities</h3>
                <p className="text-neutral-300">Get early access to features, special events, and community recognition programs</p>
              </div>
            </div>

            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 flex gap-4 hover:border-yellow-500 transition-all">
              <Flame className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Active Channels</h3>
                <p className="text-neutral-300">Dedicated channels for different topics, agent types, and use cases</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="section-padding bg-neural-800/50">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Community Stats</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
              <p className="text-neutral-300">Active Members</p>
            </div>

            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-indigo-400 mb-2">50+</div>
              <p className="text-neutral-300">Active Channels</p>
            </div>

            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">1K+</div>
              <p className="text-neutral-300">Daily Messages</p>
            </div>

            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <p className="text-neutral-300">Community Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Community Guidelines</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-300 mb-4 flex items-center gap-2">
                <span className="text-2xl">✓</span> Do's
              </h3>
              <ul className="space-y-3 text-neutral-200">
                <li className="flex gap-2">
                  <span className="text-green-400 font-bold">•</span>
                  <span>Be respectful and inclusive to all members</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400 font-bold">•</span>
                  <span>Share knowledge and help others learn</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400 font-bold">•</span>
                  <span>Keep conversations relevant and focused</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400 font-bold">•</span>
                  <span>Use threads for extended discussions</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-red-300 mb-4 flex items-center gap-2">
                <span className="text-2xl">✗</span> Don'ts
              </h3>
              <ul className="space-y-3 text-neutral-200">
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Spam or post promotional content</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Engage in harassment or bullying</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Share personal or sensitive information</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Violate Discord's community guidelines</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Discord Channels Preview */}
      <section className="section-padding bg-neural-800/50">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Popular Channels</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">💬 #general</h3>
              <p className="text-neutral-300 text-sm">General discussion about One Last AI and the community</p>
            </div>

            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">❓ #help</h3>
              <p className="text-neutral-300 text-sm">Ask questions and get support from the community</p>
            </div>

            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">🤖 #agents</h3>
              <p className="text-neutral-300 text-sm">Discuss agents, features, and agent-specific topics</p>
            </div>

            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">💡 #ideas</h3>
              <p className="text-neutral-300 text-sm">Share ideas and vote on feature requests</p>
            </div>

            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">📰 #announcements</h3>
              <p className="text-neutral-300 text-sm">Official updates and important announcements</p>
            </div>

            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">🎉 #events</h3>
              <p className="text-neutral-300 text-sm">Community events, competitions, and activities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join the Community?</h2>
          <p className="text-neutral-300 mb-8 text-lg">
            Don't miss out! Join our Discord server now and connect with thousands of AI enthusiasts and developers.
          </p>
          <a
            href="https://discord.gg/onelastai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            Join Discord Server
            <span className="text-lg">→</span>
          </a>
          <p className="text-neutral-400 mt-6 text-sm">
            By joining, you agree to follow our community guidelines and Discord's terms of service.
          </p>
        </div>
      </section>
    </div>
  )
}
