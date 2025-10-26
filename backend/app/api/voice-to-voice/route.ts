import { NextRequest, NextResponse } from 'next/server';

interface VoiceToVoiceRequest {
  // Audio input (multipart form data)
  audio?: File;
  
  // Optional overrides
  agent?: string;
  voice?: string;
  model?: string;
  language?: string;
  
  // Context
  conversationId?: string;
  userId?: string;
}

interface VoiceToVoiceResponse {
  success: boolean;
  transcription?: string;
  response?: string;
  audioBuffer?: ArrayBuffer;
  error?: string;
  code?: string;
  metadata?: {
    stt: {
      provider: string;
      confidence?: number;
      duration?: number;
    };
    llm: {
      provider: string;
      model: string;
      tokens?: number;
    };
    tts: {
      provider: string;
      voice: string;
      size: number;
    };
    totalDuration: number;
    quotaUsed: number;
    quotaRemaining: number;
  };
}

// Agent configurations
const AGENT_CONFIGS = {
  'doctor-network': {
    systemPrompt: `You are Doctor Network, an expert AI assistant specialized in networking, cybersecurity, and IT infrastructure. 
    
    Provide clear, accurate, and helpful responses about:
    - Network troubleshooting and diagnostics
    - Security analysis and recommendations  
    - Infrastructure planning and optimization
    - Protocol explanations and configurations
    
    Keep responses conversational and concise for voice interaction. Focus on practical, actionable advice.`,
    defaultVoice: 'alloy',
    maxTokens: 500
  },
  'ip-info': {
    systemPrompt: `You are an IP Information Assistant, specialized in explaining IP address details, geolocation data, and network security insights.
    
    Help users understand:
    - IP address information and geolocation
    - Network ownership and ISP details
    - Security flags and potential threats
    - Network routing and infrastructure
    
    Keep responses brief and informative for voice interaction.`,
    defaultVoice: 'nova',
    maxTokens: 400
  },
  'general': {
    systemPrompt: `You are a helpful AI assistant. Provide clear, concise, and accurate responses to user questions.
    
    Keep responses conversational and appropriate for voice interaction - brief but complete.`,
    defaultVoice: 'shimmer',
    maxTokens: 300
  }
};

// Quota management (simple in-memory store - in production use Redis/database)
const userQuotas = new Map<string, {
  [agent: string]: {
    dailyUsage: number;
    lastReset: string;
  };
}>();

const DAILY_QUOTA_MINUTES = {
  'doctor-network': 15,
  'ip-info': 10,
  'general': 10
};

class VoiceToVoiceProcessor {
  static async checkQuota(userId: string, agent: string, estimatedDuration: number): Promise<{ allowed: boolean; remaining: number }> {
    const today = new Date().toISOString().split('T')[0];
    const userQuota = userQuotas.get(userId) || {};
    const agentQuota = userQuota[agent] || { dailyUsage: 0, lastReset: today };
    
    // Reset quota if new day
    if (agentQuota.lastReset !== today) {
      agentQuota.dailyUsage = 0;
      agentQuota.lastReset = today;
    }
    
    const dailyLimitMinutes = DAILY_QUOTA_MINUTES[agent as keyof typeof DAILY_QUOTA_MINUTES] || 10;
    const dailyLimitSeconds = dailyLimitMinutes * 60;
    const remaining = dailyLimitSeconds - agentQuota.dailyUsage;
    
    // Update user quota
    userQuota[agent] = agentQuota;
    userQuotas.set(userId, userQuota);
    
    return {
      allowed: remaining >= estimatedDuration,
      remaining: Math.max(0, remaining)
    };
  }
  
  static async updateQuotaUsage(userId: string, agent: string, usedSeconds: number): Promise<void> {
    const userQuota = userQuotas.get(userId) || {};
    const agentQuota = userQuota[agent] || { dailyUsage: 0, lastReset: new Date().toISOString().split('T')[0] };
    
    agentQuota.dailyUsage += usedSeconds;
    userQuota[agent] = agentQuota;
    userQuotas.set(userId, userQuota);
  }

  static async processSTT(audioBuffer: Buffer, filename: string): Promise<{ text: string; metadata: any }> {
    try {
      // Call our STT endpoint internally
      const formData = new FormData();
      const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/webm' });
      formData.append('audio', audioBlob, filename);

      const sttResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stt`, {
        method: 'POST',
        body: formData,
      });

      if (!sttResponse.ok) {
        throw new Error(`STT failed: ${sttResponse.status}`);
      }

      const sttResult = await sttResponse.json();
      
      if (!sttResult.success) {
        throw new Error(sttResult.error || 'STT failed');
      }

      return {
        text: sttResult.text || '',
        metadata: sttResult.metadata || {}
      };
    } catch (error) {
      console.error('STT processing error:', error);
      throw error;
    }
  }

  static async processLLM(text: string, agent: string, conversationId?: string): Promise<{ response: string; metadata: any }> {
    try {
      const config = AGENT_CONFIGS[agent as keyof typeof AGENT_CONFIGS] || AGENT_CONFIGS.general;
      
      // Use existing agent endpoints when available
      let apiEndpoint = '/api/chat'; // Default
      
      if (agent === 'doctor-network') {
        apiEndpoint = '/api/doctor-network';
      }

      const llmResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversationId,
          systemPrompt: config.systemPrompt,
          maxTokens: config.maxTokens,
          voiceOptimized: true // Flag for shorter responses
        }),
      });

      if (!llmResponse.ok) {
        throw new Error(`LLM failed: ${llmResponse.status}`);
      }

      const llmResult = await llmResponse.json();
      
      if (!llmResult.success && !llmResult.response) {
        throw new Error(llmResult.error || 'LLM failed');
      }

      return {
        response: llmResult.response || llmResult.message || '',
        metadata: {
          provider: llmResult.provider || 'unknown',
          model: llmResult.model || 'unknown',
          tokens: llmResult.tokens || 0
        }
      };
    } catch (error) {
      console.error('LLM processing error:', error);
      throw error;
    }
  }

  static async processTTS(text: string, voice: string): Promise<{ audioBuffer: ArrayBuffer; metadata: any }> {
    try {
      const ttsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          format: 'mp3'
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS failed: ${ttsResponse.status}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      
      return {
        audioBuffer,
        metadata: {
          provider: ttsResponse.headers.get('X-TTS-Provider') || 'unknown',
          voice: ttsResponse.headers.get('X-TTS-Voice') || voice,
          size: audioBuffer.byteLength
        }
      };
    } catch (error) {
      console.error('TTS processing error:', error);
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const agent = (formData.get('agent') as string) || 'general';
    const voice = (formData.get('voice') as string) || AGENT_CONFIGS[agent as keyof typeof AGENT_CONFIGS]?.defaultVoice || 'alloy';
    const userId = (formData.get('userId') as string) || 'anonymous';
    const conversationId = formData.get('conversationId') as string;

    if (!audioFile) {
      return NextResponse.json({
        success: false,
        error: 'No audio file provided',
        code: 'MISSING_AUDIO_FILE'
      } as VoiceToVoiceResponse, { status: 400 });
    }

    // Estimate duration (rough approximation: 1MB ≈ 10 seconds)
    const estimatedDuration = Math.max(5, (audioFile.size / 1024 / 1024) * 10);
    
    // Check quota
    const quotaCheck = await VoiceToVoiceProcessor.checkQuota(userId, agent, estimatedDuration);
    if (!quotaCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: `Daily quota exceeded for ${agent}. Remaining: ${Math.floor(quotaCheck.remaining / 60)} minutes`,
        code: 'QUOTA_EXCEEDED',
        metadata: {
          quotaRemaining: quotaCheck.remaining
        }
      } as VoiceToVoiceResponse, { status: 429 });
    }

    // Convert audio file to buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    // Step 1: Speech-to-Text
    console.log('Processing STT...');
    const sttResult = await VoiceToVoiceProcessor.processSTT(audioBuffer, audioFile.name);
    
    if (!sttResult.text || sttResult.text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No speech detected in audio',
        code: 'NO_SPEECH_DETECTED'
      } as VoiceToVoiceResponse, { status: 400 });
    }

    // Step 2: LLM Processing
    console.log('Processing LLM...');
    const llmResult = await VoiceToVoiceProcessor.processLLM(sttResult.text, agent, conversationId);

    // Step 3: Text-to-Speech
    console.log('Processing TTS...');
    const ttsResult = await VoiceToVoiceProcessor.processTTS(llmResult.response, voice);

    // Calculate total duration and update quota
    const totalDuration = (Date.now() - startTime) / 1000;
    await VoiceToVoiceProcessor.updateQuotaUsage(userId, agent, totalDuration);

    // Get updated quota
    const finalQuotaCheck = await VoiceToVoiceProcessor.checkQuota(userId, agent, 0);

    console.log(`Voice-to-voice completed in ${totalDuration.toFixed(2)}s`);

    // Return audio response with metadata headers
    return new Response(ttsResult.audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': ttsResult.audioBuffer.byteLength.toString(),
        'X-Transcription': encodeURIComponent(sttResult.text),
        'X-Response': encodeURIComponent(llmResult.response),
        'X-Agent': agent,
        'X-Voice': voice,
        'X-Duration': totalDuration.toString(),
        'X-Quota-Used': totalDuration.toString(),
        'X-Quota-Remaining': finalQuotaCheck.remaining.toString(),
        'X-STT-Provider': sttResult.metadata.provider || 'unknown',
        'X-LLM-Provider': llmResult.metadata.provider || 'unknown',
        'X-TTS-Provider': ttsResult.metadata.provider || 'unknown',
        'Cache-Control': 'no-cache' // Don't cache voice responses
      }
    });

  } catch (error) {
    console.error('Voice-to-voice processing error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return NextResponse.json({
          success: false,
          error: error.message,
          code: 'QUOTA_ERROR'
        } as VoiceToVoiceResponse, { status: 429 });
      }
      
      if (error.message.includes('STT failed')) {
        return NextResponse.json({
          success: false,
          error: 'Speech recognition failed',
          code: 'STT_FAILED'
        } as VoiceToVoiceResponse, { status: 502 });
      }
      
      if (error.message.includes('LLM failed')) {
        return NextResponse.json({
          success: false,
          error: 'AI response generation failed',
          code: 'LLM_FAILED'
        } as VoiceToVoiceResponse, { status: 502 });
      }
      
      if (error.message.includes('TTS failed')) {
        return NextResponse.json({
          success: false,
          error: 'Speech synthesis failed',
          code: 'TTS_FAILED'
        } as VoiceToVoiceResponse, { status: 502 });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error during voice processing',
      code: 'INTERNAL_ERROR'
    } as VoiceToVoiceResponse, { status: 500 });
  }
}

// Health check and quota status endpoint
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId') || 'anonymous';
  
  // Get quota status for all agents
  const quotaStatus: Record<string, any> = {};
  
  for (const agent of Object.keys(AGENT_CONFIGS)) {
    const quota = await VoiceToVoiceProcessor.checkQuota(userId, agent, 0);
    quotaStatus[agent] = {
      remaining: quota.remaining,
      dailyLimit: DAILY_QUOTA_MINUTES[agent as keyof typeof DAILY_QUOTA_MINUTES] * 60,
      remainingMinutes: Math.floor(quota.remaining / 60)
    };
  }
  
  return NextResponse.json({
    service: 'Voice-to-Voice API',
    status: 'online',
    agents: Object.keys(AGENT_CONFIGS),
    quotaStatus,
    pipeline: ['STT', 'LLM', 'TTS'],
    supportedVoices: Object.keys(AGENT_CONFIGS).reduce((acc, agent) => {
      acc[agent] = AGENT_CONFIGS[agent as keyof typeof AGENT_CONFIGS].defaultVoice;
      return acc;
    }, {} as Record<string, string>),
    version: '1.0.0'
  });
}