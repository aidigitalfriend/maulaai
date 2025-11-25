import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

interface STTResponse {
  success: boolean;
  text?: string;
  error?: string;
  code?: string;
  metadata?: {
    duration?: number;
    language?: string;
    confidence?: number;
    provider: string;
  };
}

// Maximum audio file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Maximum recording duration (60 seconds)
const MAX_DURATION = 60;

// Supported audio formats
const SUPPORTED_FORMATS = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/m4a'];

class STTProvider {
  static async transcribeWithWhisper(audioBuffer: Buffer, filename: string): Promise<STTResponse> {
    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Create form data for Whisper API
      const formData = new FormData();
      const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/webm' });
      formData.append('file', audioBlob, filename);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en'); // Can be made dynamic
      formData.append('response_format', 'verbose_json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Whisper API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();

      return {
        success: true,
        text: result.text?.trim() || '',
        metadata: {
          duration: result.duration,
          language: result.language,
          provider: 'openai-whisper'
        }
      };

    } catch (error) {
      console.error('Whisper STT error:', error);
      throw error;
    }
  }

  static async transcribeWithGoogleSTT(audioBuffer: Buffer): Promise<STTResponse> {
    try {
      const googleApiKey = process.env.GOOGLE_CLOUD_API_KEY;
      if (!googleApiKey) {
        throw new Error('Google Cloud API key not configured');
      }

      // Convert audio to base64
      const audioContent = audioBuffer.toString('base64');

      const requestBody = {
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          maxAlternatives: 1,
          enableAutomaticPunctuation: true,
        },
        audio: {
          content: audioContent,
        },
      };

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${googleApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Google STT API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();

      if (!result.results || result.results.length === 0) {
        return {
          success: true,
          text: '',
          metadata: {
            provider: 'google-stt',
            confidence: 0
          }
        };
      }

      const transcript = result.results[0].alternatives[0].transcript;
      const confidence = result.results[0].alternatives[0].confidence;

      return {
        success: true,
        text: transcript?.trim() || '',
        metadata: {
          confidence,
          provider: 'google-stt'
        }
      };

    } catch (error) {
      console.error('Google STT error:', error);
      throw error;
    }
  }
}

async function validateAudioFile(buffer: Buffer, contentType: string): Promise<void> {
  // Check file size
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check content type
  if (!SUPPORTED_FORMATS.includes(contentType)) {
    throw new Error(`Unsupported audio format. Supported: ${SUPPORTED_FORMATS.join(', ')}`);
  }

  // Basic audio file validation (check for common audio headers)
  const audioSignatures = [
    [0x52, 0x49, 0x46, 0x46], // RIFF (WAV)
    [0x49, 0x44, 0x33],       // ID3 (MP3)
    [0x4F, 0x67, 0x67, 0x53], // OggS (OGG)
    [0x1A, 0x45, 0xDF, 0xA3], // WebM
  ];

  const hasValidSignature = audioSignatures.some(signature => {
    return signature.every((byte, index) => buffer[index] === byte);
  });

  if (!hasValidSignature && buffer.length > 4) {
    console.warn('Audio file signature not recognized, proceeding anyway');
  }
}

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // Check content type
    const contentType = request.headers.get('content-type');
    
    if (!contentType?.startsWith('multipart/form-data') && !contentType?.startsWith('audio/')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid content type. Expected audio file or multipart/form-data',
        code: 'INVALID_CONTENT_TYPE'
      } as STTResponse, { status: 400 });
    }

    let audioBuffer: Buffer;
    let audioContentType: string;
    let filename = 'audio.webm';

    if (contentType.startsWith('multipart/form-data')) {
      // Handle multipart form data
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;
      
      if (!audioFile) {
        return NextResponse.json({
          success: false,
          error: 'No audio file provided',
          code: 'MISSING_AUDIO_FILE'
        } as STTResponse, { status: 400 });
      }

      audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      audioContentType = audioFile.type;
      filename = audioFile.name || filename;
    } else {
      // Handle direct audio upload
      audioBuffer = Buffer.from(await request.arrayBuffer());
      audioContentType = contentType;
    }

    // Validate audio file
    await validateAudioFile(audioBuffer, audioContentType);

    // Try STT providers with fallback
    const providers = [
      { name: 'whisper', func: () => STTProvider.transcribeWithWhisper(audioBuffer, filename) },
      { name: 'google', func: () => STTProvider.transcribeWithGoogleSTT(audioBuffer) }
    ];

    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        console.log(`Trying STT provider: ${provider.name}`);
        const result = await provider.func();
        
        if (result.success) {
          console.log(`STT successful with ${provider.name}: "${result.text?.substring(0, 50)}..."`);
          return NextResponse.json(result);
        }
      } catch (error) {
        console.warn(`STT provider ${provider.name} failed:`, error instanceof Error ? error.message : error);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    // All providers failed
    return NextResponse.json({
      success: false,
      error: 'All STT providers failed',
      code: 'STT_PROVIDERS_FAILED',
      metadata: {
        lastError: lastError?.message,
        provider: 'fallback-failed'
      }
    } as STTResponse, { status: 502 });

  } catch (error) {
    console.error('STT API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('too large') || error.message.includes('Maximum size')) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: 'FILE_TOO_LARGE'
        } as STTResponse, { status: 413 });
      }
      
      if (error.message.includes('Unsupported')) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: 'UNSUPPORTED_FORMAT'
        } as STTResponse, { status: 400 });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error during speech recognition',
      code: 'INTERNAL_ERROR'
    } as STTResponse, { status: 500 });
  } finally {
    // Clean up temp file if created
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file:', cleanupError);
      }
    }
  }
}

// Health check endpoint
export async function GET() {
  const providers = [];
  
  if (process.env.OPENAI_API_KEY) providers.push('openai-whisper');
  if (process.env.GOOGLE_CLOUD_API_KEY) providers.push('google-stt');
  
  return NextResponse.json({
    service: 'Speech-to-Text API',
    status: 'online',
    providers,
    limits: {
      maxFileSize: `${MAX_FILE_SIZE / 1024 / 1024}MB`,
      maxDuration: `${MAX_DURATION}s`,
      supportedFormats: SUPPORTED_FORMATS
    },
    version: '1.0.0'
  });
}