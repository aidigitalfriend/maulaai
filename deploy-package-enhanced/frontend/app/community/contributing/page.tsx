'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Heart, MessageCircle, Users, TrendingUp, Award, Zap, BookOpen, Share2, CheckCircle, ArrowRight } from 'lucide-react'

export default function ContributingPage() {
  const [likedContributions, setLikedContributions] = useState<Set<string>>(new Set())

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedContributions)
    if (newLiked.has(id)) {
      newLiked.delete(id)
    } else {
      newLiked.add(id)
    }
    setLikedContributions(newLiked)
  }

  const contributionTypes = [
    {
      id: 'ideas',
      title: '💡 Share Ideas & Feedback',
      description: 'Have suggestions for new features or improvements? Share your ideas in the Ideas & Suggestions category.',
      details: [
        'Propose new agent features',
        'Suggest platform improvements',
        'Vote on community ideas',
        'Discuss feasibility and impact'
      ],
      category: 'ideas',
      impact: 'High'
    },
    {
      id: 'help',
      title: '🤝 Help Other Community Members',
      description: 'Answer questions and help fellow users in the Help & Support category.',
      details: [
        'Share solutions to common problems',
        'Provide tips and workarounds',
        'Share your best practices',
        'Mentor newer members'
      ],
      category: 'help',
      impact: 'High'
    },
    {
      id: 'success',
      title: '🎯 Share Success Stories',
      description: 'Post about your successful agent implementations and use cases in the Agents & Features category.',
      details: [
        'Share project outcomes',
        'Discuss integration experiences',
        'Showcase innovative applications',
        'Inspire other community members'
      ],
      category: 'agents',
      impact: 'Medium'
    },
    {
      id: 'engage',
      title: '💬 Engage in Discussions',
      description: 'Participate in General discussions about AI, agents, and technology trends.',
      details: [
        'Share industry insights',
        'Discuss emerging technologies',
        'Network with other members',
        'Contribute to knowledge sharing'
      ],
      category: 'general',
      impact: 'Medium'
    },
    {
      id: 'create',
      title: '✍️ Create Content',
      description: 'Write guides, tutorials, or case studies based on your experience with One Last AI.',
      details: [
        'Write how-to guides',
        'Document best practices',
        'Create case studies',
        'Share learning experiences'
      ],
      category: 'general',
      impact: 'Very High'
    },
    {
      id: 'report',
      title: '🐛 Report Issues & Bugs',
      description: 'Help improve the platform by reporting bugs and technical issues you encounter.',
      details: [
        'Document bugs clearly',
        'Provide reproduction steps',
        'Suggest improvements',
        'Help with troubleshooting'
      ],
      category: 'help',
      impact: 'High'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-neural-900 via-neural-800 to-neural-900">
      {/* Header Section */}
      <section className="section-padding-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contributing to One Last AI</h1>
          <p className="text-xl opacity-90 mb-4">Help us build a thriving community of AI enthusiasts and innovators</p>
          <p className="text-lg opacity-75">Every contribution matters. Help shape the future of One Last AI.</p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">15K+</div>
              <p className="text-neural-300">Active Contributors</p>
            </div>
            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">2.5K+</div>
              <p className="text-neutral-300">Discussions</p>
            </div>
            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">5.2K+</div>
              <p className="text-neutral-300">Posts This Month</p>
            </div>
            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">89%</div>
              <p className="text-neutral-300">Community Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contribution Types */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <h2 className="text-3xl font-bold text-white mb-2">Ways to Contribute</h2>
          <p className="text-neutral-300 mb-10">Choose how you'd like to contribute to One Last AI</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contributionTypes.map((contribution) => (
              <div
                key={contribution.id}
                className="bg-neural-800/50 border border-neural-700 rounded-lg p-6 hover:border-neural-600 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{contribution.title}</h3>
                    <p className="text-neutral-300 text-sm">{contribution.description}</p>
                  </div>
                  <button
                    onClick={() => toggleLike(contribution.id)}
                    className="text-neutral-400 hover:text-pink-400 transition-colors"
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={likedContributions.has(contribution.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {contribution.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-neutral-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neural-700">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-neural-700/50 rounded-full text-xs text-neutral-300">
                    <Zap className="w-3 h-3" />
                    Impact: {contribution.impact}
                  </span>
                  <Link
                    href="/community"
                    className="text-blue-400 hover:text-blue-300 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    Go to Community <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guidelines */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8">Community Contribution Guidelines</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Do's
              </h3>
              <ul className="space-y-3 text-neutral-200">
                <li className="flex gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Be respectful and constructive in all interactions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Search existing discussions before posting</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Provide clear, detailed information</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Give credit and link to original sources</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Use appropriate category for your post</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Engage positively with different viewpoints</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Don'ts
              </h3>
              <ul className="space-y-3 text-neutral-200">
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>Post spam or promotional content</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>Share personal information or credentials</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>Engage in harassment or bullying</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>Cross-post the same content multiple times</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>Use offensive language or hate speech</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">✗</span>
                  <span>Violate intellectual property rights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contributor Recognition */}
      <section className="section-padding bg-neural-800/50">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Contributor Recognition</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6 text-center">
              <div className="text-5xl mb-3">🌟</div>
              <h3 className="text-xl font-bold text-white mb-2">Featured Contributor</h3>
              <p className="text-neutral-300 text-sm mb-4">
                Top contributors are featured on our community page and recognized monthly.
              </p>
              <div className="text-xs text-neutral-400">Awarded after 10+ impactful contributions</div>
            </div>

            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6 text-center">
              <div className="text-5xl mb-3">🎖️</div>
              <h3 className="text-xl font-bold text-white mb-2">Community Badge</h3>
              <p className="text-neutral-300 text-sm mb-4">
                Earn special badges in your profile for contributions to specific areas.
              </p>
              <div className="text-xs text-neutral-400">Badges include Helper, Innovator, Mentor</div>
            </div>

            <div className="bg-neural-700/50 border border-neural-600 rounded-lg p-6 text-center">
              <div className="text-5xl mb-3">🏆</div>
              <h3 className="text-xl font-bold text-white mb-2">Top Contributors</h3>
              <p className="text-neutral-300 text-sm mb-4">
                Top community members get perks like early access and special features.
              </p>
              <div className="text-xs text-neutral-400">Exclusive to top 1% of contributors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8">Where to Contribute</h2>

          <div className="space-y-4">
            <Link
              href="/community?category=ideas"
              className="block bg-neural-800/50 border border-neural-700 hover:border-blue-500 rounded-lg p-6 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">💡 Ideas & Suggestions</h3>
                  <p className="text-neutral-300">Share feature ideas and vote on platform improvements</p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/community?category=help"
              className="block bg-neural-800/50 border border-neural-700 hover:border-green-500 rounded-lg p-6 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">❓ Help & Support</h3>
                  <p className="text-neutral-300">Answer questions and help community members solve problems</p>
                </div>
                <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/community?category=agents"
              className="block bg-neural-800/50 border border-neural-700 hover:border-purple-500 rounded-lg p-6 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">🤖 Agents & Features</h3>
                  <p className="text-neutral-300">Share success stories and discuss agent implementations</p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/community"
              className="block bg-neural-800/50 border border-neural-700 hover:border-pink-500 rounded-lg p-6 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">🌍 General Discussion</h3>
                  <p className="text-neutral-300">Chat about AI, technology trends, and industry insights</p>
                </div>
                <ArrowRight className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="section-padding bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-t border-neural-700">
        <div className="container-custom max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-neutral-300 mb-8 text-lg">
            Join our community and start making an impact today. Your contributions help everyone in the One Last AI ecosystem.
          </p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
          >
            <Users className="w-5 h-5" />
            Visit Community Page
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container-custom max-w-3xl">
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">Q: Do I need special skills to contribute?</h3>
              <p className="text-neutral-300">
                No! Everyone can contribute. Whether you're a beginner or expert, there are ways to help. Share your experiences,
                ask questions, or help others learn.
              </p>
            </div>

            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">Q: How often should I post?</h3>
              <p className="text-neutral-300">
                Contribute at your own pace. Quality matters more than quantity. Post meaningful contributions whenever you have
                something valuable to share.
              </p>
            </div>

            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">Q: Can I get rewarded for contributions?</h3>
              <p className="text-neutral-300">
                Yes! Active contributors earn badges, get featured on our page, and may qualify for perks like early access to new
                features or premium benefits.
              </p>
            </div>

            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">Q: What if I disagree with someone?</h3>
              <p className="text-neutral-300">
                Respectful disagreement is encouraged! We value diverse perspectives. Engage constructively, focus on ideas rather
                than people, and maintain professionalism.
              </p>
            </div>

            <div className="bg-neural-800/50 border border-neural-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-2">Q: How do I report inappropriate content?</h3>
              <p className="text-neutral-300">
                Use the report feature on any post or contact our moderation team through the Support page. We take community
                safety seriously and respond to reports quickly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
