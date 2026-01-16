import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Demo audio samples (royalty-free music URLs) for fallback
const DEMO_AUDIO_SAMPLES: Record<string, string[]> = {
  electronic: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  ],
  rock: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  ],
  jazz: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  ],
  classical: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  ],
  'hip hop': [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  ],
  ambient: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
  ],
  pop: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
  ],
  cinematic: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
  ],
  default: [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  ],
};

function getDemoAudio(genre?: string): string {
  const genreLower = genre?.toLowerCase() || 'default';
  const samples = DEMO_AUDIO_SAMPLES[genreLower] || DEMO_AUDIO_SAMPLES.default;
  return samples[Math.floor(Math.random() * samples.length)];
}

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

    let output: string;
    let isDemo = false;

    try {
      // Using Replicate's MusicGen model
      output = (await replicate.run(
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
      )) as string;
    } catch (replicateError: any) {
      // Check if it's a payment/credit error (402) or auth error
      if (
        replicateError.message?.includes('402') ||
        replicateError.message?.includes('Payment') ||
        replicateError.message?.includes('credit') ||
        replicateError.message?.includes('Insufficient')
      ) {
        console.log('Replicate credits exhausted, using demo audio');
        output = getDemoAudio(genre);
        isDemo = true;
      } else {
        throw replicateError;
      }
    }

    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await LabExperiment.findOneAndUpdate(
      { experimentId },
      {
        output: {
          result: output,
          fileUrl: output,
          metadata: { prompt: enhancedPrompt, duration, processingTime, isDemo },
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
      isDemo,
      ...(isDemo && { 
        notice: 'Demo mode: Using sample audio. AI generation temporarily unavailable.' 
      }),
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
