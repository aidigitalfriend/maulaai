import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Agent from '@/models/Agent'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const {
      agentId,
      name,
      description,
      category = 'assistant',
      avatar = '🤖',
      prompt,
      aiModel = 'gpt-4',
      temperature = 0.7,
      maxTokens = 1000,
      isPublic = true,
      isPremium = false,
      features = [],
      tags = [],
      capabilities = [],
      creator
    } = await request.json()

    // Validation
    if (!agentId || !name || !description || !prompt || !creator) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if agentId already exists
    const existingAgent = await Agent.findOne({ agentId })
    if (existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent ID already exists' },
        { status: 400 }
      )
    }

    // Create agent
    const agent = new Agent({
      agentId,
      name,
      description,
      category,
      avatar,
      prompt,
      aiModel,
      temperature,
      maxTokens,
      isActive: true,
      isPublic,
      isPremium,
      features,
      tags,
      capabilities,
      creator,
    })

    const savedAgent = await agent.save()

    return NextResponse.json({
      success: true,
      data: savedAgent
    })

  } catch (error) {
    console.error('Agent Creation Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    const isPublic = searchParams.get('isPublic')
    const isPremium = searchParams.get('isPremium')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build query
    const query: any = {}
    if (category) query.category = category
    if (isActive !== null) query.isActive = isActive === 'true'
    if (isPublic !== null) query.isPublic = isPublic === 'true'
    if (isPremium !== null) query.isPremium = isPremium === 'true'

    // Get agents
    const agents = await Agent.find(query)
      .sort({ 'stats.averageRating': -1, 'stats.totalInteractions': -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Agent.countDocuments(query)

    // Get category stats
    const categoryStats = await Agent.aggregate([
      { $match: { isActive: true, isPublic: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$stats.averageRating' }
        }
      }
    ])

    return NextResponse.json({
      success: true,
      data: agents,
      pagination: {
        page,
        limit,
        total,
      },
      stats: {
        categories: categoryStats,
        totalActive: await Agent.countDocuments({ isActive: true }),
        totalPublic: await Agent.countDocuments({ isActive: true, isPublic: true }),
        totalPremium: await Agent.countDocuments({ isActive: true, isPremium: true }),
      }
    })

  } catch (error) {
    console.error('Agents GET Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}