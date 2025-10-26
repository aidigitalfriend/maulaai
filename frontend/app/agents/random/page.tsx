'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RandomAgent() {
  const router = useRouter()

  const availableAgents = [
    'ben-sega',
    'bishop-burger', 
    'chef-biew',
    'chess-player',
    'comedy-king',
    'drama-queen',
    'einstein',
    'emma-emotional',
    'fitness-guru',
    'julie-girlfriend',
    'knight-logic',
    'lazy-pawn',
    'mrs-boss',
    'nid-gaming',
    'professor-astrology',
    'rook-jokey',
    'tech-wizard',
    'travel-buddy'
  ]

  useEffect(() => {
    // Get a random agent
    const randomIndex = Math.floor(Math.random() * availableAgents.length)
    const randomAgent = availableAgents[randomIndex]
    
    // Redirect to the random agent
    router.push(`/agents/${randomAgent}`)
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