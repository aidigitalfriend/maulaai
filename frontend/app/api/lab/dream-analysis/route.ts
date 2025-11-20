import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

interface DreamAnalysisRequest {
  dream: string
}

export async function POST(req: NextRequest) {
  try {
    const { dream }: DreamAnalysisRequest = await req.json()

    if (!dream) {
      return NextResponse.json(
        { error: 'Dream description is required' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert dream interpreter and psychologist. Analyze dreams and provide insights in JSON format with these fields:
          {
            "mainTheme": "brief theme description",
            "emotions": ["emotion1", "emotion2", "emotion3"],
            "symbols": [
              {"name": "symbol name", "meaning": "detailed interpretation"}
            ],
            "interpretation": "comprehensive dream interpretation"
          }`
        },
        {
          role: 'user',
          content: `Analyze this dream: ${dream}`
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: "json_object" }
    })

    const analysis = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json({
      success: true,
      analysis,
      tokens: completion.usage?.total_tokens || 0
    })
  } catch (error: any) {
    console.error('Dream Analysis Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze dream' },
      { status: 500 }
    )
  }
}
