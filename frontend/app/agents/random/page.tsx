'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RandomAgent() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

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
    const checkSubscriptionAndRedirect = async () => {
      try {
        // Get a random agent
        const randomIndex = Math.floor(Math.random() * availableAgents.length)
        const randomAgent = availableAgents[randomIndex]
        
        // Get current user
        const user = getCurrentUser()
        
        if (!user) {
          // Not logged in, go to subscribe page
          router.push(`/subscribe?agent=${encodeURIComponent(randomAgent.name)}&slug=${randomAgent.slug}`)
          return
        }

        // Check if user has subscription for this agent via API
        const response = await fetch('/api/subscriptions/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            agentId: randomAgent.slug,
          }),
        })

        const data = await response.json()
        
        if (data.hasAccess) {
          // User has subscription, go to agent chat
          router.push(`/agents/${randomAgent.slug}`)
        } else {
          // No subscription, go to subscribe page
          router.push(`/subscribe?agent=${encodeURIComponent(randomAgent.name)}&slug=${randomAgent.slug}`)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
        // On error, fallback to subscribe page
        const randomIndex = Math.floor(Math.random() * availableAgents.length)
        const randomAgent = availableAgents[randomIndex]
        router.push(`/subscribe?agent=${encodeURIComponent(randomAgent.name)}&slug=${randomAgent.slug}`)
      } finally {
        setChecking(false)
      }
    }

    checkSubscriptionAndRedirect()
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