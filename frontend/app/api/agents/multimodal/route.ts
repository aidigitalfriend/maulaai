import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Backup OpenAI client for failover
const getBackupOpenAI = () => {
  if (process.env.OPENAI_API_KEY_BACKUP) {
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY_BACKUP,
    });
  }
  return null;
};

interface MultimodalRequest {
  action: 'chat' | 'image' | 'transcribe' | 'tts' | 'embedding';
  agentId?: string;
  message?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  imagePrompt?: string;
  audioData?: string;
  text?: string;
  model?: string;
  options?: {
    // Chat options
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    systemPrompt?: string;
    imageUrl?: string;
    // Image options
    imageModel?: 'dall-e-3' | 'dall-e-2';
    numberOfImages?: number;
    size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
    // TTS options
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    speed?: number;
    // Transcription options
    language?: string;
    prompt?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: MultimodalRequest = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'chat':
        return handleChat(body);
      case 'image':
        return handleImageGeneration(body);
      case 'transcribe':
        return handleTranscription(body);
      case 'tts':
        return handleTextToSpeech(body);
      case 'embedding':
        return handleEmbedding(body);
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Multimodal API Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Handle chat completion
async function handleChat(body: MultimodalRequest) {
  const { message, conversationHistory = [], model, options = {} } = body;

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const messages: OpenAI.ChatCompletionMessageParam[] = [];

  // Add system prompt if provided
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    });
  }

  // Add current message (with image if provided)
  if (options.imageUrl) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: message },
        { type: 'image_url', image_url: { url: options.imageUrl } },
      ],
    });
  } else {
    messages.push({ role: 'user', content: message });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4o-mini',
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      top_p: options.topP ?? 1,
    });

    return NextResponse.json({
      response: completion.choices[0]?.message?.content || '',
      usage: completion.usage,
    });
  } catch (error: any) {
    // Try backup key on failure
    const backupClient = getBackupOpenAI();
    if (backupClient && error.status === 429) {
      console.log('[Multimodal] Primary key rate limited, trying backup...');
      const completion = await backupClient.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
        top_p: options.topP ?? 1,
      });

      return NextResponse.json({
        response: completion.choices[0]?.message?.content || '',
        usage: completion.usage,
      });
    }
    throw error;
  }
}

// Handle image generation with DALL-E
async function handleImageGeneration(body: MultimodalRequest) {
  const { imagePrompt, options = {} } = body;

  if (!imagePrompt) {
    return NextResponse.json(
      { error: 'Image prompt is required' },
      { status: 400 }
    );
  }

  try {
    const imageModel = options.imageModel || 'dall-e-3';
    const numberOfImages = options.numberOfImages || 1;
    const size = options.size || '1024x1024';
    const quality = options.quality || 'standard';
    const style = options.style || 'vivid';

    const response = await openai.images.generate({
      model: imageModel,
      prompt: imagePrompt,
      n: imageModel === 'dall-e-3' ? 1 : numberOfImages, // DALL-E 3 only supports n=1
      size: size as any,
      quality: imageModel === 'dall-e-3' ? quality : undefined,
      style: imageModel === 'dall-e-3' ? style : undefined,
      response_format: 'url',
    });

    const images = response.data.map((img) => ({
      url: img.url,
      revisedPrompt: img.revised_prompt,
    }));

    return NextResponse.json({ images });
  } catch (error: any) {
    // Try backup key on failure
    const backupClient = getBackupOpenAI();
    if (backupClient && (error.status === 429 || error.status === 401)) {
      console.log('[Multimodal] Primary key failed for images, trying backup...');
      const response = await backupClient.images.generate({
        model: options.imageModel || 'dall-e-3',
        prompt: imagePrompt,
        n: 1,
        size: (options.size || '1024x1024') as any,
        quality: options.quality || 'standard',
        style: options.style || 'vivid',
        response_format: 'url',
      });

      const images = response.data.map((img) => ({
        url: img.url,
        revisedPrompt: img.revised_prompt,
      }));

      return NextResponse.json({ images });
    }
    throw error;
  }
}

// Handle audio transcription with Whisper
async function handleTranscription(body: MultimodalRequest) {
  const { audioData, options = {} } = body;

  if (!audioData) {
    return NextResponse.json(
      { error: 'Audio data is required' },
      { status: 400 }
    );
  }

  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(audioData, 'base64');
    
    // Create a File-like object for OpenAI
    const audioFile = new File([buffer], 'audio.webm', { type: 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: options.language,
      prompt: options.prompt,
    });

    return NextResponse.json({
      text: transcription.text,
      model: 'whisper-1',
    });
  } catch (error) {
    console.error('[Transcription Error]:', error);
    throw error;
  }
}

// Handle text-to-speech
async function handleTextToSpeech(body: MultimodalRequest) {
  const { text, options = {} } = body;

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    const voice = options.voice || 'alloy';
    const speed = options.speed || 1.0;

    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
      speed: speed,
    });

    const audioBuffer = await mp3Response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('[TTS Error]:', error);
    throw error;
  }
}

// Handle embeddings generation
async function handleEmbedding(body: MultimodalRequest) {
  const { text, options = {} } = body;

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return NextResponse.json({
      embedding: response.data[0].embedding,
      model: response.model,
      usage: response.usage,
    });
  } catch (error) {
    console.error('[Embedding Error]:', error);
    throw error;
  }
}

// GET endpoint to check capabilities
export async function GET() {
  return NextResponse.json({
    capabilities: [
      'chat',
      'image',
      'transcribe',
      'tts',
      'embedding',
    ],
    models: {
      chat: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
      image: ['dall-e-3', 'dall-e-2'],
      transcription: ['whisper-1'],
      tts: ['tts-1', 'tts-1-hd'],
      embedding: ['text-embedding-3-small', 'text-embedding-3-large'],
    },
  });
}
