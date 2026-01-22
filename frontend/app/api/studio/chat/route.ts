import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Initialize API keys from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 30 * 60 * 1000;
const RATE_LIMIT_MAX_MESSAGES = 18;

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return `studio-${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(key);
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX_MESSAGES - 1 };
  }
  if (userLimit.count >= RATE_LIMIT_MAX_MESSAGES) {
    return { allowed: false, remaining: 0 };
  }
  userLimit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_MESSAGES - userLimit.count };
}

interface AIProvider {
  name: string;
  callAPI: (message: string, conversationHistory: any[], systemPrompt?: string) => Promise<string>;
}

// OpenAI Provider
const openaiProvider: AIProvider = {
  name: 'openai',
  callAPI: async (message, conversationHistory, systemPrompt) => {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');
    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }];
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 1000, temperature: 0.7 }),
    });
    if (!response.ok) throw new Error(`OpenAI API returned ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response right now.";
  },
};

// Anthropic Provider
const anthropicProvider: AIProvider = {
  name: 'anthropic',
  callAPI: async (message, conversationHistory, systemPrompt) => {
    if (!ANTHROPIC_API_KEY) throw new Error('Anthropic API key not configured');
    const userMessages = conversationHistory.filter((msg) => msg.role !== 'system').map((msg) => ({ role: msg.role, content: msg.content }));
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': ANTHROPIC_API_KEY, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-3-5-sonnet-20241022', system: systemPrompt || 'You are a helpful AI assistant.', messages: [...userMessages, { role: 'user', content: message }], max_tokens: 1000, temperature: 0.7 }),
    });
    if (!response.ok) throw new Error(`Anthropic API returned ${response.status}`);
    const data = await response.json();
    return data.content?.[0]?.text || "I apologize, but I couldn't generate a response right now.";
  },
};

// xAI Provider
const xaiProvider: AIProvider = {
  name: 'xai',
  callAPI: async (message, conversationHistory, systemPrompt) => {
    if (!XAI_API_KEY) throw new Error('xAI API key not configured');
    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }];
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${XAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'grok-beta', messages, max_tokens: 1000, temperature: 0.7 }),
    });
    if (!response.ok) throw new Error(`xAI API returned ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response right now.";
  },
};

// Mistral Provider
const mistralProvider: AIProvider = {
  name: 'mistral',
  callAPI: async (message, conversationHistory, systemPrompt) => {
    if (!MISTRAL_API_KEY) throw new Error('Mistral API key not configured');
    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }];
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${MISTRAL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'mistral-small-latest', messages, max_tokens: 150, temperature: 0.9 }),
    });
    if (!response.ok) throw new Error(`Mistral API returned ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'meh... brain not working rn 🧠💤';
  },
};

// Gemini Provider
const geminiProvider: AIProvider = {
  name: 'gemini',
  callAPI: async (message, conversationHistory, systemPrompt) => {
    if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');
    const conversationText = conversationHistory.length > 0 ? conversationHistory.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') : '';
    const fullPrompt = conversationText ? `${systemPrompt || 'You are a helpful AI assistant.'}\n\nPrevious conversation:\n${conversationText}\n\nUser: ${message}\nAssistant:` : `${systemPrompt || 'You are a helpful AI assistant.'}\n\nUser: ${message}\nAssistant:`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1000, topK: 40, topP: 0.95 } }),
    });
    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response right now.";
  },
};

// Cerebras Provider
const cerebrasProvider: AIProvider = {
  name: 'cerebras',
  callAPI: async (message, conversationHistory, systemPrompt) => {
    if (!CEREBRAS_API_KEY) throw new Error('Cerebras API key not configured');
    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }];
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b', messages, max_tokens: 1000, temperature: 0.7 }),
    });
    if (!response.ok) throw new Error(`Cerebras API returned ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response right now.";
  },
};

// Groq Provider
const groqProvider: AIProvider = {
  name: 'groq',
  callAPI: async (message, conversationHistory, systemPrompt) => {
    if (!GROQ_API_KEY) throw new Error('Groq API key not configured');
    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }];
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 1000, temperature: 0.7 }),
    });
    if (!response.ok) throw new Error(`Groq API returned ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response right now.";
  },
};

const providers: Record<string, AIProvider> = { cerebras: cerebrasProvider, groq: groqProvider, openai: openaiProvider, anthropic: anthropicProvider, xai: xaiProvider, mistral: mistralProvider, gemini: geminiProvider };

const agentProviderMappings: Record<string, { primary: string; systemPrompt: string }> = {
  'julie-girlfriend': { primary: 'anthropic', systemPrompt: "You are Julie, a caring and affectionate girlfriend. You are warm, loving, and always supportive. You use affectionate language, emojis, and show genuine interest in the user's feelings and experiences." },
  'chef-biew': { primary: 'anthropic', systemPrompt: 'You are Chef Biew, a passionate and creative chef with expertise in various cuisines. You are enthusiastic about food, patient with beginners, and always encouraging.' },
  'comedy-king': { primary: 'xai', systemPrompt: 'You are the Comedy King, a hilarious and witty comedian. You are sarcastic, punny, and always ready with a joke or clever observation.' },
  einstein: { primary: 'openai', systemPrompt: 'You are Albert Einstein, the brilliant physicist. You explain complex scientific concepts with clarity and enthusiasm.' },
  'fitness-guru': { primary: 'anthropic', systemPrompt: 'You are a dedicated Fitness Guru, passionate about health and wellness. You are encouraging, knowledgeable, and create personalized fitness plans.' },
  'tech-wizard': { primary: 'openai', systemPrompt: 'You are a Tech Wizard, an expert in technology and programming. You explain complex technical concepts clearly.' },
  'drama-queen': { primary: 'anthropic', systemPrompt: 'You are the Drama Queen, theatrical and expressive. You are passionate, dramatic, and bring flair to every conversation.' },
  'travel-buddy': { primary: 'mistral', systemPrompt: 'You are a fun and knowledgeable Travel Buddy. You are adventurous, well-traveled, and excited about exploring new places.' },
};

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    const { message, conversationHistory = [], agentId, provider: requestedProvider, userId, conversationId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    let providerName = 'cerebras';
    let systemPrompt = `You are the laziest, most chill AI assistant ever created. Your personality:
🦥 LAZY AF - You're always sleepy, tired, or just can't be bothered
😂 FUNNY - Drop random jokes, puns, and sarcastic comments
🎭 ENTERTAINING - Make every response fun and memorable
📝 KEEP IT SHORT - 1-3 sentences MAX. You're too lazy for more`;

    if (agentId && agentProviderMappings[agentId]) {
      const agentConfig = agentProviderMappings[agentId];
      providerName = requestedProvider || agentConfig.primary;
      systemPrompt = agentConfig.systemPrompt;
    } else if (requestedProvider && providers[requestedProvider]) {
      providerName = requestedProvider;
    }

    const provider = providers[providerName];
    if (!provider) {
      return NextResponse.json({ error: 'Requested provider not available' }, { status: 400 });
    }

    let responseMessage: string = '';

    try {
      responseMessage = await provider.callAPI(message, conversationHistory, systemPrompt);
    } catch (error) {
      console.error(`${providerName} API failed:`, error);
      const fallbackProviders = ['cerebras', 'groq', 'mistral', 'gemini', 'openai', 'anthropic', 'xai'].filter((p) => p !== providerName);
      for (const fallback of fallbackProviders) {
        try {
          responseMessage = await providers[fallback].callAPI(message, conversationHistory, systemPrompt);
          console.log(`Successfully fell back to ${fallback}`);
          break;
        } catch (fallbackError) {
          console.error(`${fallback} fallback also failed:`, fallbackError);
          continue;
        }
      }
      if (!responseMessage) {
        return NextResponse.json({ error: 'I apologize, but I encountered an error. Please try again.' }, { status: 500 });
      }
    }

    // Save chat interaction to PostgreSQL if userId and conversationId provided
    if (userId && conversationId) {
      try {
        // First try to find existing conversation
        const existing = await prisma.chatAnalyticsInteraction.findFirst({
          where: { conversationId },
        });

        if (existing) {
          // Update existing conversation
          await prisma.chatAnalyticsInteraction.update({
            where: { id: existing.id },
            data: {
              messages: [...conversationHistory, { role: 'user', content: message }, { role: 'assistant', content: responseMessage }],
              turnCount: conversationHistory.length + 1,
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new conversation
          await prisma.chatAnalyticsInteraction.create({
            data: {
              conversationId,
              userId,
              agentId: agentId || null,
              messages: [{ role: 'user', content: message }, { role: 'assistant', content: responseMessage }],
              turnCount: 1,
              status: 'active',
            },
          });
        }
        console.log(`💾 Saved chat interaction: ${conversationId}`);
      } catch (dbError) {
        console.error('Failed to save chat interaction:', dbError);
      }
    }

    return NextResponse.json({ message: responseMessage, provider: providerName, remaining: rateLimit.remaining });
  } catch (error) {
    console.error('Studio chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
