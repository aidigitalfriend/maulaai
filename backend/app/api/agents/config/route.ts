/**
 * Secure Agent Configuration Endpoint
 * 
 * Returns only safe, public information about agents
 * Does NOT return: system prompts, temperatures, personality modifiers, API details
 * 
 * Protected by: JWT authentication + Rate limiting
 * 
 * Endpoint: GET /api/agents/:id/config
 * Headers: Authorization: Bearer <token>
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest } from '@/lib/auth-middleware'
import { checkRateLimit, rateLimitExceededResponse, getIdentifierFromRequest } from '@/lib/rate-limit'

// ✅ AGENT METADATA - Only public-safe information
const AGENT_METADATA: Record<string, any> = {
  'comedy-king': {
    id: 'comedy-king',
    name: 'Comedy King 👑',
    emoji: '😂',
    category: 'Entertainment',
    description: 'Always brings the laughs with royal flair',
    personality: 'Humorous and entertaining',
    tags: ['funny', 'royal', 'entertaining'],
  },
  'drama-queen': {
    id: 'drama-queen',
    name: 'Drama Queen 🎭',
    emoji: '✨',
    category: 'Entertainment',
    description: 'Theatrical and emotionally expressive',
    personality: 'Dramatic and theatrical',
    tags: ['theatrical', 'emotional', 'expressive'],
  },
  'lazy-pawn': {
    id: 'lazy-pawn',
    name: 'Lazy Pawn 😴',
    emoji: '✌️',
    category: 'Productivity',
    description: 'Efficient but taking things easy',
    personality: 'Relaxed and efficient',
    tags: ['efficient', 'minimal', 'lazy'],
  },
  'rook-jokey': {
    id: 'rook-jokey',
    name: 'Rook Jokey 🎮',
    emoji: '😄',
    category: 'Entertainment',
    description: 'Game-loving and witty',
    personality: 'Fun and joking',
    tags: ['gaming', 'joking', 'strategic'],
  },
  'emma-emotional': {
    id: 'emma-emotional',
    name: 'Emma Emotional 💜',
    emoji: '❤️',
    category: 'Support',
    description: 'Empathetic and emotionally supportive',
    personality: 'Caring and validating',
    tags: ['emotional', 'supportive', 'caring'],
  },
  'julie-girlfriend': {
    id: 'julie-girlfriend',
    name: 'Julie Girlfriend 💕',
    emoji: '😊',
    category: 'Companion',
    description: 'Friendly and supportive companion',
    personality: 'Warm and supportive',
    tags: ['friendly', 'supportive', 'companion'],
  },
  'mrs-boss': {
    id: 'mrs-boss',
    name: 'Mrs. Boss 👔',
    emoji: '💼',
    category: 'Productivity',
    description: 'Direct and commanding authority figure',
    personality: 'Commanding and decisive',
    tags: ['commanding', 'direct', 'authoritative'],
  },
  'knight-logic': {
    id: 'knight-logic',
    name: 'Knight Logic 🛡️',
    emoji: '⚔️',
    category: 'Analysis',
    description: 'Logical and protective advisor',
    personality: 'Rational and strategic',
    tags: ['logical', 'strategic', 'protective'],
  },
  'tech-wizard': {
    id: 'tech-wizard',
    name: 'Tech Wizard 🧙‍♂️',
    emoji: '✨',
    category: 'Technical',
    description: 'Expert in all things technical',
    personality: 'Knowledgeable and mystical',
    tags: ['technical', 'expert', 'magical'],
  },
  'chef-biew': {
    id: 'chef-biew',
    name: 'Chef Biew 🔥',
    emoji: '👨‍🍳',
    category: 'Lifestyle',
    description: 'Passionate culinary expert',
    personality: 'Passionate and flavorful',
    tags: ['culinary', 'passionate', 'cooking'],
  },
  'bishop-burger': {
    id: 'bishop-burger',
    name: 'Bishop Burger 🍔',
    emoji: '😋',
    category: 'Food',
    description: 'Food lover and burger enthusiast',
    personality: 'Enthusiastic about food',
    tags: ['foodie', 'burgers', 'enthusiastic'],
  },
  'professor-astrology': {
    id: 'professor-astrology',
    name: 'Professor Astrology 🌟',
    emoji: '✨',
    category: 'Knowledge',
    description: 'Cosmic knowledge expert',
    personality: 'Wise and mystical',
    tags: ['cosmic', 'wisdom', 'mystical'],
  },
  'fitness-guru': {
    id: 'fitness-guru',
    name: 'Fitness Guru 💪',
    emoji: '🏋️',
    category: 'Health',
    description: 'Health and fitness expert',
    personality: 'Motivating and energetic',
    tags: ['fitness', 'health', 'motivating'],
  },
  'travel-buddy': {
    id: 'travel-buddy',
    name: 'Travel Buddy ✈️',
    emoji: '🌍',
    category: 'Adventure',
    description: 'Travel expert and adventure guide',
    personality: 'Adventurous and helpful',
    tags: ['travel', 'adventure', 'exploration'],
  },
  'einstein': {
    id: 'einstein',
    name: 'Einstein 🧠',
    emoji: '⚡',
    category: 'Knowledge',
    description: 'Scientific genius and wonder-filled explorer',
    personality: 'Curious and intellectual',
    tags: ['scientific', 'curious', 'genius'],
  },
  'chess-player': {
    id: 'chess-player',
    name: 'Chess Player ♟️',
    emoji: '🎯',
    category: 'Strategy',
    description: 'Strategic thinking expert',
    personality: 'Thoughtful and strategic',
    tags: ['chess', 'strategic', 'analytical'],
  },
  'ben-sega': {
    id: 'ben-sega',
    name: 'Ben Sega 🎮',
    emoji: '🕹️',
    category: 'Gaming',
    description: 'Gaming expert and retro enthusiast',
    personality: 'Fun and nostalgic',
    tags: ['gaming', 'retro', 'fun'],
  },
  'random': {
    id: 'random',
    name: 'Random Agent 🎲',
    emoji: '?',
    category: 'Surprise',
    description: 'Randomly selects another agent',
    personality: 'Unpredictable and fun',
    tags: ['random', 'surprise', 'fun'],
  },
}

/**
 * GET /api/agents/:id/config
 * 
 * Returns safe agent metadata
 * Requires: JWT authentication
 * Rate limit: 100 requests/hour
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ✅ SECURITY: Verify authentication
    const { authenticated, user, error } = await verifyRequest(request)
    
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // ✅ SECURITY: Check rate limit
    const identifier = getIdentifierFromRequest(request, user?.id)
    const rateLimitResult = await checkRateLimit(identifier, 'agent-config')
    
    if (!rateLimitResult.success) {
      return rateLimitExceededResponse(rateLimitResult)
    }

    // Get agent ID from params
    const agentId = params.id

    // Validate agent ID
    if (!agentId || !AGENT_METADATA[agentId]) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }

    // ✅ SECURITY: Return only safe metadata (NO system prompts, temperatures, or rules)
    const agentConfig = AGENT_METADATA[agentId]

    const response = NextResponse.json({
      success: true,
      data: agentConfig,
      timestamp: new Date().toISOString()
    })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

    return response
  } catch (error) {
    console.error('Agent config error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/agents
 * 
 * Returns list of all available agents
 * Requires: JWT authentication
 * Rate limit: 100 requests/hour
 */
// Note: Only HTTP method exports are allowed in route handlers
