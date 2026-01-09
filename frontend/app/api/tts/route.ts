import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // "Sarah" - clear female voice

export async function POST(request: NextRequest) {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { message: 'ElevenLabs TTS is not configured' },
      { status: 500 }
    );
  }

  try {
    const { text, voiceId } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { message: 'text is required' },
        { status: 400 }
      );
    }

    // Limit text length to prevent abuse
    const trimmedText = text.slice(0, 5000);
    const selectedVoice = voiceId || DEFAULT_VOICE_ID;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: trimmedText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return NextResponse.json(
        { message: 'TTS generation failed', error: errorText },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to list available voices
// Using hardcoded list since API key may not have voices_read permission
export async function GET() {
  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { message: 'ElevenLabs TTS is not configured' },
      { status: 500 }
    );
  }

  // Common ElevenLabs voices (works without voices_read permission)
  const fallbackVoices = [
    {
      id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Sarah',
      labels: { gender: 'female', accent: 'american' },
    },
    {
      id: '21m00Tcm4TlvDq8ikWAM',
      name: 'Rachel',
      labels: { gender: 'female', accent: 'american' },
    },
    {
      id: 'AZnzlk1XvdvUeBnXmlld',
      name: 'Domi',
      labels: { gender: 'female', accent: 'american' },
    },
    {
      id: 'ErXwobaYiN019PkySvjV',
      name: 'Antoni',
      labels: { gender: 'male', accent: 'american' },
    },
    {
      id: 'MF3mGyEYCl7XYWbV9V6O',
      name: 'Elli',
      labels: { gender: 'female', accent: 'american' },
    },
    {
      id: 'TxGEqnHWrfWFTfGW9XjX',
      name: 'Josh',
      labels: { gender: 'male', accent: 'american' },
    },
    {
      id: 'VR6AewLTigWG4xSOukaG',
      name: 'Arnold',
      labels: { gender: 'male', accent: 'american' },
    },
    {
      id: 'pNInz6obpgDQGcFmaJgB',
      name: 'Adam',
      labels: { gender: 'male', accent: 'american' },
    },
    {
      id: 'yoZ06aMxZJJ28mfd3POQ',
      name: 'Sam',
      labels: { gender: 'male', accent: 'american' },
    },
  ];

  try {
    // Try to fetch from API first
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Return API voices if available
      const voices =
        data.voices?.map(
          (v: {
            voice_id: string;
            name: string;
            labels?: Record<string, string>;
          }) => ({
            id: v.voice_id,
            name: v.name,
            labels: v.labels,
          })
        ) || fallbackVoices;

      return NextResponse.json({ voices, source: 'api' });
    }

    // Fallback to hardcoded list if API fails or lacks permission
    return NextResponse.json({ voices: fallbackVoices, source: 'fallback' });
  } catch (error) {
    console.error('Voice list error, using fallback:', error);
    return NextResponse.json({ voices: fallbackVoices, source: 'fallback' });
  }
}
