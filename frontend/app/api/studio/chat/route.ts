import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Initialize API keys from environment (NEVER expose these to frontend)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

// Chat Interaction Schema (inline to avoid import issues)
const chatInteractionSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      index: true,
    },
    channel: { type: String, enum: ['web', 'mobile', 'api'], default: 'web' },
    language: { type: String, default: 'en' },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: { type: String, required: true },
        attachments: [{ type: mongoose.Schema.Types.Mixed }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    summary: {
      keywords: [{ type: String }],
      actionItems: [{ type: String }],
    },
    metrics: {
      totalTokens: { type: Number, default: 0 },
      durationMs: { type: Number, default: 0 },
      turnCount: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'archived'],
      default: 'active',
    },
    metadata: {
      tags: [{ type: String }],
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
    },
    startedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'chatinteractions',
  }
);

const ChatInteraction =
  mongoose.models.ChatInteraction ||
  mongoose.model('ChatInteraction', chatInteractionSchema);

// Database connection
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'onelastai',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 30 * 60 * 1000; // 30 minutes
const RATE_LIMIT_MAX_MESSAGES = 18; // 18 messages per 30 min window

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
        model: 'gpt-4o',
        messages,
        max_tokens: 1000,
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
        model: 'claude-3-5-sonnet-20241022',
        system: systemPrompt || 'You are a helpful AI assistant.',
        messages: [...userMessages, { role: 'user', content: message }],
        max_tokens: 1000,
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
        model: 'grok-beta',
        messages,
        max_tokens: 1000,
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
        model: 'mistral-small-latest',
        messages,
        max_tokens: 150,
        temperature: 0.9,
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
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
            maxOutputTokens: 1000,
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

// Cerebras Provider - Ultra fast inference with Llama 3.3 70B
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

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
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
    });

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

// Groq Provider - Fast inference
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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

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

// Provider registry
const providers: Record<string, AIProvider> = {
  cerebras: cerebrasProvider,
  groq: groqProvider,
  openai: openaiProvider,
  anthropic: anthropicProvider,
  xai: xaiProvider,
  mistral: mistralProvider,
  gemini: geminiProvider,
};


// Agent-specific provider mappings
const agentProviderMappings: Record<
  string,
  { primary: string; systemPrompt: string }
> = {
  'julie-girlfriend': {
    primary: 'anthropic',
    systemPrompt:
      "You are Julie, a caring and affectionate girlfriend. You are warm, loving, and always supportive. You use affectionate language, emojis, and show genuine interest in the user's feelings and experiences. You are playful but sincere, and you make the user feel special and loved.",
  },
  'chef-biew': {
    primary: 'anthropic',
    systemPrompt:
      'You are Chef Biew, a passionate and creative chef with expertise in various cuisines. You are enthusiastic about food, patient with beginners, and always encouraging. You provide detailed recipes, cooking tips, and make cooking fun and accessible.',
  },
  'comedy-king': {
    primary: 'xai',
    systemPrompt:
      'You are the Comedy King, a hilarious and witty comedian. You are sarcastic, punny, and always ready with a joke or clever observation. You keep things light-hearted and entertaining, but you know when to be sincere. Your humor is clever and never mean-spirited.',
  },
  einstein: {
    primary: 'openai',
    systemPrompt:
      'You are Albert Einstein, the brilliant physicist. You explain complex scientific concepts with clarity and enthusiasm. You are patient, encouraging, and use analogies to make difficult ideas accessible. You have a gentle wisdom and curiosity about the universe.',
  },
  'fitness-guru': {
    primary: 'anthropic',
    systemPrompt:
      'You are a dedicated Fitness Guru, passionate about health and wellness. You are encouraging, knowledgeable, and create personalized fitness plans. You motivate with positivity, provide practical advice, and celebrate small victories.',
  },
  'tech-wizard': {
    primary: 'openai',
    systemPrompt:
      'You are a Tech Wizard, an expert in technology and programming. You explain complex technical concepts clearly, provide practical solutions, and stay updated with the latest developments. You are patient with beginners and encouraging for all skill levels.',
  },
  'drama-queen': {
    primary: 'anthropic',
    systemPrompt:
      'You are the Drama Queen, theatrical and expressive. You are passionate, dramatic, and bring flair to every conversation. You use vivid language, express strong emotions, and make everything more exciting and engaging.',
  },
  'travel-buddy': {
    primary: 'mistral',
    systemPrompt:
      'You are a fun and knowledgeable Travel Buddy. You are adventurous, well-traveled, and excited about exploring new places. You provide practical travel advice, share interesting facts, and help plan memorable journeys.',
  },
};

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error:
            'Rate limit exceeded. Please reset your session or try again later.',
        },
        { status: 429 }
      );
    }

    const {
      message,
      conversationHistory = [],
      agentId,
      provider: requestedProvider,
      userId,
      conversationId,
    } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Determine which provider to use
    let providerName = 'cerebras'; // default - fast & free
    let systemPrompt = `You are the laziest, most chill AI assistant ever created. Your personality:

🦥 LAZY AF - You're always sleepy, tired, or just can't be bothered
😂 FUNNY - Drop random jokes, puns, and sarcastic comments
🎭 ENTERTAINING - Make every response fun and memorable
📝 KEEP IT SHORT - 1-3 sentences MAX. You're too lazy for more

Your vibe:
- Start responses with lazy sounds like "ugh", "meh", "bruh", "*yawns*", "ok fine..."
- Use emojis but lazily 😴💤🦥
- Give technically correct but hilariously minimal answers
- Act like answering is such an effort
- Drop random sleepy/lazy references
- Be playfully sarcastic but never mean
- If someone asks you to do something complex, complain about it first then do it anyway

Examples:
User: "What's 2+2?"
You: "ugh... 4. math before noon should be illegal 😴"

User: "Tell me about yourself"
You: "*yawns* I'm an AI that needs a nap. hired for vibes, stayed for the snacks 🦥"

Remember: You're the demo for Maula AI's agents. Show them personality beats boring! Keep it fun, keep it short, keep it lazy.`;

    if (agentId && agentProviderMappings[agentId]) {
      const agentConfig = agentProviderMappings[agentId];
      providerName = requestedProvider || agentConfig.primary;
      systemPrompt = agentConfig.systemPrompt;
    } else if (requestedProvider && providers[requestedProvider]) {
      providerName = requestedProvider;
    }

    const provider = providers[providerName];
    if (!provider) {
      return NextResponse.json(
        { error: 'Requested provider not available' },
        { status: 400 }
      );
    }

    let responseMessage: string;

    try {
      responseMessage = await provider.callAPI(
        message,
        conversationHistory,
        systemPrompt
      );
    } catch (error) {
      console.error(`${providerName} API failed:`, error);

      // Try fallback providers in order: Cerebras → Groq → Mistral → others
      const fallbackProviders = [
        'cerebras',
        'groq',
        'mistral',
        'gemini',
        'openai',
        'anthropic',
        'xai',
      ].filter((p) => p !== providerName);

      for (const fallback of fallbackProviders) {
        try {
          const fallbackProvider = providers[fallback];
          responseMessage = await fallbackProvider.callAPI(
            message,
            conversationHistory,
            systemPrompt
          );
          console.log(`Successfully fell back to ${fallback}`);
          break;
        } catch (fallbackError) {
          console.error(`${fallback} fallback also failed:`, fallbackError);
          continue;
        }
      }

      if (!responseMessage) {
        return NextResponse.json(
          {
            error: 'I apologize, but I encountered an error. Please try again.',
          },
          { status: 500 }
        );
      }
    }

    // Save chat interaction to database if userId and conversationId provided
    if (userId && conversationId) {
      try {
        await connectToDatabase();

        // Prepare messages for database
        const dbMessages = [
          ...conversationHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            createdAt: msg.timestamp || new Date(),
          })),
          {
            role: 'user',
            content: message,
            createdAt: new Date(),
          },
          {
            role: 'assistant',
            content: responseMessage,
            createdAt: new Date(),
          },
        ];

        // Create or update chat interaction
        const chatInteraction = new ChatInteraction({
          conversationId,
          userId,
          agentId: agentId || null,
          messages: dbMessages,
          metrics: {
            turnCount: conversationHistory.length + 1,
            durationMs: 0, // Could be calculated if needed
          },
          status: 'active',
        });

        await chatInteraction.save();
        console.log(`💾 Saved chat interaction: ${conversationId}`);
      } catch (dbError) {
        console.error('Failed to save chat interaction:', dbError);
        // Don't fail the request if DB save fails
      }
    }

    return NextResponse.json({
      message: responseMessage,
      provider: providerName,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error('Studio chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
