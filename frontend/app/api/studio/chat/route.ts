import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Initialize API keys from environment (NEVER expose these to frontend)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 30 * 60 * 1000; // 30 minutes
const RATE_LIMIT_MAX_MESSAGES = 100; // 100 messages per 30 min window for better UX

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0]
    : req.headers.get('x-real-ip') || 'unknown';
  return `studio-${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(key);

  if (!userLimit || now > userLimit.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW;
    rateLimitMap.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: RATE_LIMIT_MAX_MESSAGES - 1 };
  }

  if (userLimit.count >= RATE_LIMIT_MAX_MESSAGES) {
    return { allowed: false, remaining: 0 };
  }

  userLimit.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_MESSAGES - userLimit.count,
  };
}

// Provider interface
interface AIProvider {
  name: string;
  callAPI: (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string
  ) => Promise<string>;
}

// OpenAI Provider
const openaiProvider: AIProvider = {
  name: 'openai',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string
  ) => {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

    const messages = systemPrompt
      ? [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ]
      : [
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1',
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API returned ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response right now."
    );
  },
};

// Anthropic Provider
const anthropicProvider: AIProvider = {
  name: 'anthropic',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string
  ) => {
    if (!ANTHROPIC_API_KEY) throw new Error('Anthropic API key not configured');

    const userMessages = conversationHistory
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({ role: msg.role, content: msg.content }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        system: systemPrompt || 'You are a helpful AI assistant.',
        messages: [...userMessages, { role: 'user', content: message }],
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Anthropic API returned ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return (
      data.content?.[0]?.text ||
      "I apologize, but I couldn't generate a response right now."
    );
  },
};

// xAI Provider
const xaiProvider: AIProvider = {
  name: 'xai',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string
  ) => {
    if (!XAI_API_KEY) throw new Error('xAI API key not configured');

    const messages = systemPrompt
      ? [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ]
      : [
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ];

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3',
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `xAI API returned ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response right now."
    );
  },
};

// Mistral Provider
const mistralProvider: AIProvider = {
  name: 'mistral',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string
  ) => {
    if (!MISTRAL_API_KEY) throw new Error('Mistral API key not configured');

    const messages = systemPrompt
      ? [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ]
      : [
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ];

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-2411',
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Mistral API returned ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content || 'meh... brain not working rn 🧠💤'
    );
  },
};

// Gemini Provider
const geminiProvider: AIProvider = {
  name: 'gemini',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string
  ) => {
    if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');

    const conversationText =
      conversationHistory.length > 0
        ? conversationHistory
            .map(
              (m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
            )
            .join('\n')
        : '';

    const fullPrompt = conversationText
      ? `${systemPrompt || 'You are a helpful AI assistant.'}\n\nPrevious conversation:\n${conversationText}\n\nUser: ${message}\nAssistant:`
      : `${systemPrompt || 'You are a helpful AI assistant.'}\n\nUser: ${message}\nAssistant:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            topK: 40,
            topP: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I couldn't generate a response right now."
    );
  },
};

// Cerebras Provider
const cerebrasProvider: AIProvider = {
  name: 'cerebras',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string
  ) => {
    if (!CEREBRAS_API_KEY) throw new Error('Cerebras API key not configured');

    const messages = systemPrompt
      ? [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ]
      : [
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ];

    const response = await fetch(
      'https://api.cerebras.ai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CEREBRAS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b',
          messages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Cerebras API returned ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response right now."
    );
  },
};

// Groq Provider
const groqProvider: AIProvider = {
  name: 'groq',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string
  ) => {
    if (!GROQ_API_KEY) throw new Error('Groq API key not configured');

    const messages = systemPrompt
      ? [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ]
      : [
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ];

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          max_tokens: 4096,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Groq API returned ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response right now."
    );
  },
};

// Provider map
const providers: Record<string, AIProvider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  xai: xaiProvider,
  mistral: mistralProvider,
  gemini: geminiProvider,
  cerebras: cerebrasProvider,
  groq: groqProvider,
};

// Get available provider
function getAvailableProvider(preferred?: string): AIProvider | null {
  if (preferred && providers[preferred]) {
    return providers[preferred];
  }

  // Try providers in order of preference
  const preferenceOrder = [
    'cerebras',
    'groq',
    'openai',
    'anthropic',
    'mistral',
    'gemini',
    'xai',
  ];
  for (const name of preferenceOrder) {
    const provider = providers[name];
    try {
      // Check if API key exists
      if (name === 'openai' && OPENAI_API_KEY) return provider;
      if (name === 'anthropic' && ANTHROPIC_API_KEY) return provider;
      if (name === 'xai' && XAI_API_KEY) return provider;
      if (name === 'mistral' && MISTRAL_API_KEY) return provider;
      if (name === 'gemini' && GEMINI_API_KEY) return provider;
      if (name === 'cerebras' && CEREBRAS_API_KEY) return provider;
      if (name === 'groq' && GROQ_API_KEY) return provider;
    } catch {
      continue;
    }
  }
  return null;
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const rateLimitKey = getRateLimitKey(request);
    const { allowed, remaining } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message:
            'You have reached the maximum number of messages. Please wait 30 minutes.',
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      message,
      conversationHistory = [],
      provider: preferredProvider,
      systemPrompt,
      sessionId,
      userId,
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get provider
    const provider = getAvailableProvider(preferredProvider);
    if (!provider) {
      return NextResponse.json(
        { error: 'No AI provider available' },
        { status: 503 }
      );
    }

    // Call AI
    const startTime = Date.now();
    const response = await provider.callAPI(
      message,
      conversationHistory,
      systemPrompt
    );
    const durationMs = Date.now() - startTime;

    // Save to database if sessionId provided
    if (sessionId && userId) {
      try {
        // Check if session exists
        const existingSession = await prisma.chatSession.findUnique({
          where: { sessionId },
        });

        if (existingSession) {
          // Add messages to existing session
          await prisma.chatMessage.createMany({
            data: [
              {
                sessionId,
                role: 'user',
                content: message,
              },
              {
                sessionId,
                role: 'assistant',
                content: response,
                latencyMs: durationMs,
              },
            ],
          });

          // Update session stats
          const stats = (existingSession.stats as any) || {};
          await prisma.chatSession.update({
            where: { sessionId },
            data: {
              stats: {
                ...stats,
                messageCount: (stats.messageCount || 0) + 2,
                durationMs: (stats.durationMs || 0) + durationMs,
              },
              updatedAt: new Date(),
            },
          });
        }
      } catch (dbError) {
        console.error('Failed to save chat to database:', dbError);
        // Don't fail the request if database save fails
      }
    }

    return NextResponse.json({
      success: true,
      response,
      provider: provider.name,
      remaining,
      durationMs,
    });
  } catch (error: any) {
    console.error('Studio chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET handler - Get chat sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (sessionId) {
      // Get specific session with messages
      const session = await prisma.chatSession.findFirst({
        where: {
          sessionId,
          userId,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, session });
    }

    // Get all sessions for user
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        sessionId: true,
        name: true,
        description: true,
        isActive: true,
        stats: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    );
  }
}
