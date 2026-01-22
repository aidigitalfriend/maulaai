import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface VoiceGenerationRequest {
  text: string;
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const {
      text,
      voiceId = '21m00Tcm4TlvDq8ikWAM', // Default voice (Rachel)
      stability = 0.5,
      similarityBoost = 0.75,
    }: VoiceGenerationRequest = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Create experiment record
    await prisma.labExperiment.create({
      data: {
        experimentId,
        experimentType: 'voice-cloning',
        input: { prompt: text, settings: { voiceId, stability, similarityBoost } },
        status: 'processing',
        startedAt: new Date(),
      },
    });

    let audioDataUrl: string | null = null;

    // Try ElevenLabs
    if (process.env.ELEVENLABS_API_KEY) {
      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              Accept: 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': process.env.ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
              text,
              model_id: 'eleven_monolingual_v1',
              voice_settings: { stability, similarity_boost: similarityBoost },
            }),
          }
        );

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Audio = buffer.toString('base64');
          audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;
        }
      } catch (e) {
        console.log('ElevenLabs failed:', e);
      }
    }

    // Try OpenAI TTS as fallback
    if (!audioDataUrl && process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const response = await openai.audio.speech.create({
          model: 'tts-1',
          voice: 'alloy',
          input: text,
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        const base64Audio = buffer.toString('base64');
        audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;
      } catch (e) {
        console.log('OpenAI TTS failed:', e);
      }
    }

    if (!audioDataUrl) {
      return NextResponse.json({ error: 'Voice generation service unavailable' }, { status: 503 });
    }

    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await prisma.labExperiment.update({
      where: { experimentId },
      data: {
        output: { audioUrl: audioDataUrl, text, voiceId },
        status: 'completed',
        processingTime,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      audioUrl: audioDataUrl,
      text,
      voiceId,
      processingTime,
      experimentId,
    });
  } catch (error: any) {
    console.error('Voice Generation Error:', error);

    try {
      await prisma.labExperiment.update({
        where: { experimentId },
        data: { status: 'failed', errorMessage: error.message, completedAt: new Date() },
      });
    } catch (updateError) {
      console.error('Failed to update experiment error status:', updateError);
    }

    return NextResponse.json({ error: error.message || 'Failed to generate voice' }, { status: 500 });
  }
}
