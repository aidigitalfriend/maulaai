import { NextRequest, NextResponse } from 'next/server';

interface TTSRequest {
  text: string;
  voice?: string;
  model?: string;
  format?: 'mp3' | 'wav' | 'aac' | 'opus';
  speed?: number;
  provider?: 'openai' | 'elevenlabs' | 'auto';
}

interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  audioBuffer?: ArrayBuffer;
  error?: string;
  code?: string;
  metadata?: {
    provider: string;
    voice?: string;
    model?: string;
    format?: string;
    duration?: number;
    size?: number;
    lastError?: string;
  };
}

// Configuration
const MAX_TEXT_LENGTH = 4000;
const SUPPORTED_FORMATS = ['mp3', 'wav', 'aac', 'opus'];

// Voice mappings
const VOICE_MAPPINGS = {
  openai: {
    'alloy': 'alloy',
    'echo': 'echo', 
    'fable': 'fable',
    'onyx': 'onyx',
    'nova': 'nova',
    'shimmer': 'shimmer'
  },
  elevenlabs: {
    'alloy': 'pNInz6obpgDQGcFmaJgB', // Adam
    'echo': '21m00Tcm4TlvDq8ikWAM',  // Rachel
    'fable': 'AZnzlk1XvdvUeBnXmlld', // Domi
    'onyx': 'EXAVITQu4vr4xnSDxMaL',  // Bella
    'nova': 'MF3mGyEYCl7XYWbV9V6O',  // Elli
    'shimmer': 'TxGEqnHWrfWFTfGW9XjX' // Josh
  }
};

class TTSProvider {
  static async synthesizeWithOpenAI(request: TTSRequest): Promise<TTSResponse> {
    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const voice = VOICE_MAPPINGS.openai[request.voice as keyof typeof VOICE_MAPPINGS.openai] || 'alloy';
      const model = request.model || 'tts-1';
      const format = request.format || 'mp3';
      const speed = Math.max(0.25, Math.min(4.0, request.speed || 1.0));

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          input: request.text,
          voice,
          response_format: format,
          speed
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI TTS API error: ${response.status} - ${errorText}`);
      }

      const audioBuffer = await response.arrayBuffer();

      return {
        success: true,
        audioBuffer,
        metadata: {
          provider: 'openai',
          voice,
          model,
          format,
          size: audioBuffer.byteLength
        }
      };

    } catch (error) {
      console.error('OpenAI TTS error:', error);
      throw error;
    }
  }

  static async synthesizeWithElevenLabs(request: TTSRequest): Promise<TTSResponse> {
    try {
      const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenLabsApiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const voiceId = VOICE_MAPPINGS.elevenlabs[request.voice as keyof typeof VOICE_MAPPINGS.elevenlabs] || 'pNInz6obpgDQGcFmaJgB';
      const model = request.model || 'eleven_monolingual_v1';

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: request.text,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs TTS API error: ${response.status} - ${errorText}`);
      }

      const audioBuffer = await response.arrayBuffer();

      return {
        success: true,
        audioBuffer,
        metadata: {
          provider: 'elevenlabs',
          voice: request.voice || 'alloy',
          model,
          format: 'mp3',
          size: audioBuffer.byteLength
        }
      };

    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw error;
    }
  }

  static async synthesizeWithBrowserTTS(request: TTSRequest): Promise<TTSResponse> {
    // This is a fallback that would require client-side implementation
    // For now, we'll throw an error to indicate it's not available server-side
    throw new Error('Browser TTS requires client-side implementation');
  }
}

function validateTTSRequest(request: TTSRequest): void {
  if (!request.text || typeof request.text !== 'string') {
    throw new Error('Text is required and must be a string');
  }

  if (request.text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  if (request.text.length > MAX_TEXT_LENGTH) {
    throw new Error(`Text too long. Maximum length is ${MAX_TEXT_LENGTH} characters`);
  }

  if (request.format && !SUPPORTED_FORMATS.includes(request.format)) {
    throw new Error(`Unsupported format. Supported: ${SUPPORTED_FORMATS.join(', ')}`);
  }

  if (request.speed && (request.speed < 0.25 || request.speed > 4.0)) {
    throw new Error('Speed must be between 0.25 and 4.0');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    
    // Validate request
    validateTTSRequest(body);

    // Determine provider order based on preference
    const preferredProvider = body.provider || 'auto';
    const providers = [];

    if (preferredProvider === 'openai' || preferredProvider === 'auto') {
      providers.push({
        name: 'openai',
        func: () => TTSProvider.synthesizeWithOpenAI(body)
      });
    }

    if (preferredProvider === 'elevenlabs' || preferredProvider === 'auto') {
      providers.push({
        name: 'elevenlabs', 
        func: () => TTSProvider.synthesizeWithElevenLabs(body)
      });
    }

    // If specific provider requested, put it first
    if (preferredProvider !== 'auto') {
      providers.sort((a, b) => a.name === preferredProvider ? -1 : 1);
    }

    let lastError: Error | null = null;

    // Try providers with fallback
    for (const provider of providers) {
      try {
        console.log(`Trying TTS provider: ${provider.name}`);
        const result = await provider.func();
        
        if (result.success && result.audioBuffer) {
          console.log(`TTS successful with ${provider.name}, size: ${result.audioBuffer.byteLength} bytes`);
          
          // Return audio as binary response
          const audioFormat = result.metadata?.format || 'mp3';
          const mimeType = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav', 
            'aac': 'audio/aac',
            'opus': 'audio/opus'
          }[audioFormat] || 'audio/mpeg';

          return new Response(result.audioBuffer, {
            status: 200,
            headers: {
              'Content-Type': mimeType,
              'Content-Length': result.audioBuffer.byteLength.toString(),
              'X-TTS-Provider': result.metadata?.provider || 'unknown',
              'X-TTS-Voice': result.metadata?.voice || 'unknown',
              'X-TTS-Model': result.metadata?.model || 'unknown',
              'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
          });
        }
      } catch (error) {
        console.warn(`TTS provider ${provider.name} failed:`, error instanceof Error ? error.message : error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    // All providers failed
    return NextResponse.json({
      success: false,
      error: 'All TTS providers failed',
      code: 'TTS_PROVIDERS_FAILED',
      metadata: {
        lastError: lastError?.message,
        provider: 'fallback-failed'
      }
    } as TTSResponse, { status: 502 });

  } catch (error) {
    console.error('TTS API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('too long') || error.message.includes('Maximum length')) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: 'TEXT_TOO_LONG'
        } as TTSResponse, { status: 413 });
      }
      
      if (error.message.includes('required') || error.message.includes('empty')) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: 'INVALID_REQUEST'
        } as TTSResponse, { status: 400 });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error during speech synthesis',
      code: 'INTERNAL_ERROR'
    } as TTSResponse, { status: 500 });
  }
}

// Health check and voice list endpoint
export async function GET() {
  const providers = [];
  
  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.ELEVENLABS_API_KEY) providers.push('elevenlabs');
  
  const availableVoices = Object.keys(VOICE_MAPPINGS.openai);
  
  return NextResponse.json({
    service: 'Text-to-Speech API',
    status: 'online',
    providers,
    voices: availableVoices,
    limits: {
      maxTextLength: MAX_TEXT_LENGTH,
      supportedFormats: SUPPORTED_FORMATS,
      speedRange: '0.25 - 4.0'
    },
    models: {
      openai: ['tts-1', 'tts-1-hd'],
      elevenlabs: ['eleven_monolingual_v1', 'eleven_multilingual_v1', 'eleven_multilingual_v2']
    },
    version: '1.0.0'
  });
}