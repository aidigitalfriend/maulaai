import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

interface MusicGenerationRequest {
  prompt: string;
  genre?: string;
  mood?: string;
  duration?: number;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let experimentId = `exp_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    await dbConnect();

    const {
      prompt,
      genre,
      mood,
      duration = 30,
    }: MusicGenerationRequest = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Enhance prompt with genre and mood
    let enhancedPrompt = prompt;
    if (genre) enhancedPrompt += `, ${genre} genre`;
    if (mood) enhancedPrompt += `, ${mood} mood`;

    // Create experiment record with initial status
    const experiment = new LabExperiment({
      experimentId,
      experimentType: 'music-generator',
      input: {
        prompt: enhancedPrompt,
        settings: { genre, mood, duration },
      },
      status: 'processing',
      startedAt: new Date(),
    });
    await experiment.save();

    // Using Replicate's MusicGen model
    const output = await replicate.run(
      'meta/musicgen:7be0f12c54a8d033a0fbd14418c9af98962da9a86f5ff7811f9b3423a1f0b7d7',
      {
        input: {
          prompt: enhancedPrompt,
          duration: duration,
          model_version: 'stereo-large',
          output_format: 'mp3',
          normalization_strategy: 'peak',
        },
      }
    );

    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await LabExperiment.findOneAndUpdate(
      { experimentId },
      {
        output: {
          result: output,
          fileUrl: output,
          metadata: { prompt: enhancedPrompt, duration, processingTime },
        },
        status: 'completed',
        processingTime,
        completedAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      audio: output,
      prompt: enhancedPrompt,
      duration,
      experimentId,
    });
  } catch (error: any) {
    console.error('Music Generation Error:', error);

    // Update experiment with error status
    try {
      await LabExperiment.findOneAndUpdate(
        { experimentId },
        {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        }
      );
    } catch (updateError) {
      console.error('Failed to update experiment error status:', updateError);
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate music' },
      { status: 500 }
    );
  }
}
