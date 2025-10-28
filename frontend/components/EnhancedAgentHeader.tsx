'use client'

import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { useState } from 'react'

interface EnhancedAgentHeaderProps {
  agentName: string
  agentEmoji: string
  specialty: string
  description: string
  gradientColor: string
  stats?: {
    conversations: number
    rating: number
    responseTime: string
    users: number
  }
  capabilities?: string[]
}

export default function EnhancedAgentHeader({
  agentName,
  agentEmoji,
  specialty,
  description,
  gradientColor,
  stats = {
    conversations: 1250,
    rating: 4.8,
    responseTime: '2s',
    users: 3420
  },
  capabilities = []
}: EnhancedAgentHeaderProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className={`bg-gradient-to-r ${gradientColor} text-white overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, currentColor 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative container-custom py-8 md:py-12 z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
          
          {/* Agent Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              {/* Large Avatar */}
              <div className="w-20 h-20 md:w-28 md:h-28 bg-white/20 rounded-2xl flex items-center justify-center text-5xl md:text-6xl shadow-lg backdrop-blur-sm">
                {agentEmoji}
              </div>
              
              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full hover:scale-110 transition-transform duration-200 shadow-lg"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? (
                  <StarSolid className="w-5 h-5 text-yellow-600" />
                ) : (
                  <StarIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2 bg-green-400 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                ✓ Online
              </div>
            </div>
          </div>

          {/* Agent Info Section */}
          <div className="flex-1">
            {/* Name and Specialty */}
            <div className="mb-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-1">{agentName}</h1>
              <p className="text-lg text-white/90">{specialty}</p>
            </div>

            {/* Description */}
            <p className="text-white/80 mb-5 leading-relaxed max-w-xl">
              {description}
            </p>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-white/70">Conversations</p>
                <p className="text-xl font-bold">{stats.conversations.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-white/70">Rating</p>
                <div className="flex items-center gap-1">
                  <p className="text-xl font-bold">{stats.rating}</p>
                  <StarSolid className="w-4 h-4 text-yellow-300" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-white/70">Response</p>
                <p className="text-xl font-bold">{stats.responseTime}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs text-white/70">Users</p>
                <p className="text-xl font-bold">{(stats.users/1000).toFixed(1)}K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Section */}
        {capabilities.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/20">
            <h3 className="text-base font-semibold mb-3">What I Can Help With</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {capabilities.map((capability, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">✓</span>
                  <span>{capability}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
