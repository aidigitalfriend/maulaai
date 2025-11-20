import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!
})

interface MusicGenerationRequest {
  prompt: string
  genre?: string
  mood?: string
  duration?: number
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, genre, mood, duration = 30 }: MusicGenerationRequest = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Enhance prompt with genre and mood
    let enhancedPrompt = prompt
    if (genre) enhancedPrompt += `, ${genre} genre`
    if (mood) enhancedPrompt += `, ${mood} mood`

    // Using Replicate's MusicGen model
    const output = await replicate.run(
      "meta/musicgen:7be0f12c54a8d033a0fbd14418c9af98962da9a86f5ff7811f9b3423a1f0b7d7",
      {
        input: {
          prompt: enhancedPrompt,
          duration: duration,
          model_version: "stereo-large",
          output_format: "mp3",
          normalization_strategy: "peak"
        }
      }
    )

    return NextResponse.json({
      success: true,
      audio: output,
      prompt: enhancedPrompt,
      duration
    })
  } catch (error: any) {
    console.error('Music Generation Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate music' },
      { status: 500 }
    )
  }
}
