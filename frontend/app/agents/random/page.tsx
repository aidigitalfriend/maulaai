'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '../../../lib/auth-utils'

export default function RandomAgent() {
  const router = useRouter()

  const availableAgents = [
    { slug: 'ben-sega', name: 'Ben Sega' },
    { slug: 'bishop-burger', name: 'Bishop Burger' },
    { slug: 'chef-biew', name: 'Chef Biew' },
    { slug: 'chess-player', name: 'Chess Player' },
    { slug: 'comedy-king', name: 'Comedy King' },
    { slug: 'drama-queen', name: 'Drama Queen' },
    { slug: 'einstein', name: 'Einstein' },
    { slug: 'emma-emotional', name: 'Emma Emotional' },
    { slug: 'fitness-guru', name: 'Fitness Guru' },
    { slug: 'julie-girlfriend', name: 'Julie Girlfriend' },
    { slug: 'knight-logic', name: 'Knight Logic' },
    { slug: 'lazy-pawn', name: 'Lazy Pawn' },
    { slug: 'mrs-boss', name: 'Mrs Boss' },
    { slug: 'nid-gaming', name: 'Nid Gaming' },
    { slug: 'professor-astrology', name: 'Professor Astrology' },
    { slug: 'rook-jokey', name: 'Rook Jokey' },
    { slug: 'tech-wizard', name: 'Tech Wizard' },
    { slug: 'travel-buddy', name: 'Travel Buddy' }
  ]

  useEffect(() => {
    // Get a random agent
    const randomIndex = Math.floor(Math.random() * availableAgents.length)
    const randomAgent = availableAgents[randomIndex]
    
    // Check if user has subscription for this agent (in production, check via API)
    const hasSubscription = localStorage.getItem(`subscription-${randomAgent.slug}`) === 'active'
    
    // If no subscription and not authenticated, go to subscribe page
    if (!hasSubscription) {
      router.push(`/subscribe?agent=${encodeURIComponent(randomAgent.name)}&slug=${randomAgent.slug}`)
    } else {
      // If subscribed, go directly to agent chat
      router.push(`/agents/${randomAgent.slug}`)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">🎲</div>
        <h1 className="text-2xl font-bold mb-2">Selecting a Random Agent...</h1>
        <p className="text-neutral-400">You'll be redirected shortly</p>
      </div>
    </div>
  )
}