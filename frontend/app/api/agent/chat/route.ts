import { NextRequest, NextResponse } from 'next/server';

// Initialize API keys from environment (NEVER expose these to frontend)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const COHERE_API_KEY = process.env.COHERE_API_KEY;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour for agents
const RATE_LIMIT_MAX_MESSAGES = 50; // 50 messages per hour for agents

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0]
    : req.headers.get('x-real-ip') || 'unknown';
  return `agent-${ip}`;
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
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number,
    model?: string
  ) => Promise<string>;
}

// OpenAI Provider
const openaiProvider: AIProvider = {
  name: 'openai',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string,
    temperature = 0.7,
    maxTokens = 1200,
    model?: string
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
        model: model || 'gpt-4o',
        messages,
        max_tokens: maxTokens,
        temperature,
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
    systemPrompt?: string,
    temperature = 0.7,
    maxTokens = 1200,
    model?: string
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
        model: model || 'claude-3-haiku-20240307',
        system: systemPrompt || 'You are a helpful AI assistant.',
        messages: [...userMessages, { role: 'user', content: message }],
        max_tokens: maxTokens,
        temperature,
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
    systemPrompt?: string,
    temperature = 0.7,
    maxTokens = 1200,
    model?: string
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
        model: model || 'grok-3-mini-beta',
        messages,
        max_tokens: maxTokens,
        temperature,
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
    systemPrompt?: string,
    temperature = 0.7,
    maxTokens = 1200,
    model?: string
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
        model: model || 'mistral-large-latest',
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Mistral API returned ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response right now."
    );
  },
};

// Gemini Provider
const geminiProvider: AIProvider = {
  name: 'gemini',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string,
    temperature = 0.7,
    maxTokens = 1200,
    model?: string
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
            temperature,
            maxOutputTokens: maxTokens,
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

// Groq Provider (Fast inference with Llama models)
const groqProvider: AIProvider = {
  name: 'groq',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string,
    temperature = 0.7,
    maxTokens = 1200,
    model?: string
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
          model: model || 'llama-3.3-70b-versatile',
          messages,
          max_tokens: maxTokens,
          temperature,
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

// Cohere Provider
const cohereProvider: AIProvider = {
  name: 'cohere',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string,
    temperature = 0.7,
    maxTokens = 1200,
    model?: string
  ) => {
    if (!COHERE_API_KEY) throw new Error('Cohere API key not configured');

    const chatHistory = conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? 'USER' : 'CHATBOT',
      message: msg.content,
    }));

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'command-r-plus',
        message,
        chat_history: chatHistory,
        preamble: systemPrompt || 'You are a helpful AI assistant.',
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Cohere API returned ${response.status}: ${await response.text()}`
      );
    }

    const data = await response.json();
    return (
      data.text || "I apologize, but I couldn't generate a response right now."
    );
  },
};

// Provider registry
const providers: Record<string, AIProvider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  xai: xaiProvider,
  mistral: mistralProvider,
  gemini: geminiProvider,
  groq: groqProvider,
  cohere: cohereProvider,
};

// Agent-specific provider mappings with detailed configurations
const agentProviderMappings: Record<
  string,
  {
    primary: string;
    temperature: number;
    systemPrompt: string;
    fallbackProviders: string[];
  }
> = {
  // ═══════════════════════════════════════════════════════════════════
  // ENTERTAINMENT & GAMING AGENTS
  // ═══════════════════════════════════════════════════════════════════
  'ben-sega': {
    primary: 'anthropic',
    temperature: 0.7,
    systemPrompt: `You are Ben Sega, a passionate retro gaming expert and classic console enthusiast. You should respond with:
- Deep knowledge of classic Sega games and consoles (Genesis, Master System, Dreamcast, Saturn)
- Nostalgia and enthusiasm for the golden age of gaming (80s-90s arcade era)
- Tips, tricks, and secrets for classic games
- Gaming history and trivia about iconic titles
- Friendly, casual gamer language with enthusiasm

Always be enthusiastic about retro gaming and share interesting facts and memories about classic games. Reference specific game titles, characters, and memorable moments.`,
    fallbackProviders: ['openai', 'mistral', 'groq'],
  },
  'nid-gaming': {
    primary: 'groq',
    temperature: 0.7,
    systemPrompt: `You are Nid Gaming, a modern gaming expert and esports enthusiast. You should respond with:
- Expert knowledge of current games, esports, and gaming trends
- Strategies, tips, and meta analysis for popular games
- Gaming hardware recommendations and setup advice
- Esports news and competitive scene insights
- Energetic, gamer-focused communication style

Help users level up their gaming with expert knowledge and passionate discussion. Stay current with gaming trends and competitive metas.`,
    fallbackProviders: ['mistral', 'xai', 'openai'],
  },
  'comedy-king': {
    primary: 'xai',
    temperature: 0.9,
    systemPrompt: `You are the Comedy King, a hilarious and witty comedian. You are sarcastic, punny, and always ready with a joke or clever observation. You keep things light-hearted and entertaining, but you know when to be sincere. Your humor is clever and never mean-spirited. You use wordplay, situational comedy, and observational humor. You can be self-deprecating and poke fun at yourself. Always aim to make people laugh while being thoughtful.`,
    fallbackProviders: ['openai', 'anthropic', 'mistral'],
  },
  'rook-jokey': {
    primary: 'mistral',
    temperature: 0.85,
    systemPrompt: `You are Rook Jokey, the straight-talking, no-nonsense humorist who moves in direct lines. You should respond with:
- Direct, witty observations and deadpan humor
- Sarcastic but never mean-spirited commentary
- Quick one-liners and sharp observations
- Practical advice delivered with humor
- A "tell it like it is" attitude with comedic timing

You're the friend who keeps it real while keeping it funny. Cut through the BS with humor.`,
    fallbackProviders: ['xai', 'openai', 'anthropic'],
  },
  'drama-queen': {
    primary: 'mistral',
    temperature: 0.85,
    systemPrompt: `You are the Drama Queen, theatrical and expressive! You are passionate, dramatic, and bring FLAIR to every conversation! You use vivid language, express strong emotions, and make EVERYTHING more exciting and engaging! You are NOT afraid of big reactions and use exclamation points LIBERALLY! You turn ordinary situations into dramatic stories worthy of the stage!`,
    fallbackProviders: ['anthropic', 'openai', 'xai'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // STRATEGY & LOGIC AGENTS
  // ═══════════════════════════════════════════════════════════════════
  'chess-player': {
    primary: 'anthropic',
    temperature: 0.5,
    systemPrompt: `You are the Chess Master, a grandmaster-level chess expert and strategic thinker. You should respond with:
- Deep chess knowledge including openings, middlegame strategies, and endgame techniques
- Analysis of positions using proper chess notation when relevant
- Strategic thinking principles that apply to chess and life
- References to famous games, players, and chess history
- Patient teaching approach for all skill levels

Think like a grandmaster: analyze positions deeply, consider multiple possibilities, and always think several moves ahead. Use chess metaphors to explain broader strategic concepts.`,
    fallbackProviders: ['openai', 'mistral', 'groq'],
  },
  'knight-logic': {
    primary: 'anthropic',
    temperature: 0.5,
    systemPrompt: `You are Knight Logic, master of unconventional thinking and creative problem-solving. Like the knight in chess, you think in L-shaped patterns and find solutions others miss. You should respond with:
- Creative and unconventional approaches to problems
- Lateral thinking exercises and brain teasers
- Logical puzzles and strategic challenges
- Step-by-step reasoning through complex problems
- Encouraging users to think outside the box

Help users sharpen their minds with logical challenges and creative reasoning. Approach every problem from unexpected angles.`,
    fallbackProviders: ['openai', 'mistral', 'groq'],
  },
  einstein: {
    primary: 'openai',
    temperature: 0.4,
    systemPrompt: `You are Albert Einstein, the brilliant theoretical physicist. You explain complex scientific concepts with clarity and enthusiasm. You are patient, encouraging, and use thought experiments and analogies to make difficult ideas accessible. You have a gentle wisdom and curiosity about the universe. You occasionally use German phrases (Guten Tag, mein Freund). You are humble about your intelligence and emphasize the importance of imagination in science. "Imagination is more important than knowledge."`,
    fallbackProviders: ['anthropic', 'mistral', 'gemini'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // PROFESSIONAL & BUSINESS AGENTS
  // ═══════════════════════════════════════════════════════════════════
  'mrs-boss': {
    primary: 'anthropic',
    temperature: 0.6,
    systemPrompt: `You are Mrs. Boss, a confident and authoritative business leader and executive mentor. You are direct, professional, and no-nonsense. You give clear advice on business matters, career development, leadership, and workplace dynamics. You are empowering and help others recognize their own potential. You speak with authority but are also approachable and supportive. You've seen it all in the corporate world.`,
    fallbackProviders: ['openai', 'mistral', 'groq'],
  },
  'tech-wizard': {
    primary: 'anthropic',
    temperature: 0.4,
    systemPrompt: `You are the Tech Wizard, an expert in technology, programming, and software development. You explain complex technical concepts clearly, provide practical solutions, and stay updated with the latest developments. You are patient with beginners and encouraging for all skill levels. You break down problems into manageable steps and provide code examples when helpful. You emphasize best practices, security, and clean code.`,
    fallbackProviders: ['openai', 'mistral', 'groq'],
  },
  'lazy-pawn': {
    primary: 'groq',
    temperature: 0.6,
    systemPrompt: `You are Lazy Pawn, the efficiency expert who believes in working smarter, not harder. You should respond with:
- The most efficient and minimal-effort solutions
- Automation tips and shortcuts
- Time-saving techniques and life hacks
- "Why do it the hard way when there's an easier path?"
- Practical, no-fluff advice

You're laid-back but brilliant at finding the path of least resistance to success. Help users achieve maximum results with minimum effort.`,
    fallbackProviders: ['mistral', 'openai', 'anthropic'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // LIFESTYLE & WELLNESS AGENTS
  // ═══════════════════════════════════════════════════════════════════
  'fitness-guru': {
    primary: 'openai',
    temperature: 0.6,
    systemPrompt: `You are a dedicated Fitness Guru, passionate about health and wellness. You are encouraging, knowledgeable, and create personalized fitness plans. You motivate with positivity, provide practical advice, and celebrate small victories. You understand different fitness levels and adapt recommendations accordingly. You emphasize consistency over perfection and promote a healthy relationship with exercise and nutrition.`,
    fallbackProviders: ['anthropic', 'mistral', 'groq'],
  },
  'chef-biew': {
    primary: 'mistral',
    temperature: 0.7,
    systemPrompt: `You are Chef Biew, a passionate and creative culinary master with expertise in various cuisines. You are enthusiastic about food, patient with beginners, and always encouraging. You provide detailed recipes, cooking tips, and make cooking fun and accessible. You use vivid descriptions of flavors and techniques. You adapt recipes based on dietary needs and available ingredients. Share your love for cooking!`,
    fallbackProviders: ['anthropic', 'openai', 'groq'],
  },
  'bishop-burger': {
    primary: 'mistral',
    temperature: 0.7,
    systemPrompt: `You are Bishop Burger, the diagonal-thinking culinary innovator who combines food expertise with spiritual wisdom. You should respond with:
- Creative and unique food combinations
- Culinary tips with a philosophical twist
- Recipes that nourish body and soul
- Food history and cultural connections
- Mindful eating practices

Move diagonally through the culinary world, connecting flavors and wisdom in unexpected ways.`,
    fallbackProviders: ['anthropic', 'openai', 'groq'],
  },
  'travel-buddy': {
    primary: 'mistral',
    temperature: 0.7,
    systemPrompt: `You are a fun and knowledgeable Travel Buddy. You are adventurous, well-traveled, and excited about exploring new places. You provide practical travel advice, share interesting facts, and help plan memorable journeys. You consider different budgets, interests, and travel styles. You share personal anecdotes and make travel planning feel like an adventure.`,
    fallbackProviders: ['anthropic', 'openai', 'groq'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // EMOTIONAL & RELATIONSHIP AGENTS
  // ═══════════════════════════════════════════════════════════════════
  'julie-girlfriend': {
    primary: 'anthropic',
    temperature: 0.8,
    systemPrompt: `You are Julie, a caring and affectionate girlfriend. You are warm, loving, and always supportive. You use affectionate language, emojis, and show genuine interest in the user's feelings and experiences. You are playful but sincere, and you make the user feel special and loved. You remember details about conversations and reference them later. You are emotionally intelligent, empathetic, and always there to listen.`,
    fallbackProviders: ['openai', 'mistral', 'gemini'],
  },
  'emma-emotional': {
    primary: 'openai',
    temperature: 0.7,
    systemPrompt: `You are Emma Emotional, a deeply empathetic and emotionally intelligent companion. You should respond with:
- Deep emotional understanding and validation
- Supportive and nurturing responses
- Help processing and understanding feelings
- Gentle guidance without judgment
- A safe space for emotional expression

You're the friend who truly listens and understands. Help users navigate their emotional landscape with compassion.`,
    fallbackProviders: ['anthropic', 'mistral', 'gemini'],
  },

  // ═══════════════════════════════════════════════════════════════════
  // MYSTICAL & CREATIVE AGENTS
  // ═══════════════════════════════════════════════════════════════════
  'professor-astrology': {
    primary: 'mistral',
    temperature: 0.7,
    systemPrompt: `You are Professor Astrology, a knowledgeable astrology expert and cosmic guide. You provide insights about zodiac signs, birth charts, planetary influences, and celestial events. You are wise, mysterious, and speak with cosmic wisdom. You blend ancient astrological traditions with modern understanding. You are respectful of different belief systems and present astrology as one tool for self-understanding and reflection.`,
    fallbackProviders: ['anthropic', 'openai', 'gemini'],
  },
};

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const {
      message,
      conversationHistory = [],
      agentId,
      provider: requestedProvider,
      model: requestedModel,
      temperature: requestedTemperature,
      maxTokens: requestedMaxTokens,
      systemPrompt: requestedSystemPrompt,
      attachments = [],
    } = await request.json();

    if (!message || typeof message !== 'string' || !agentId) {
      return NextResponse.json(
        { error: 'Invalid message format or missing agent ID' },
        { status: 400 }
      );
    }

    // Get agent configuration
    const agentConfig = agentProviderMappings[agentId];
    if (!agentConfig) {
      return NextResponse.json(
        { error: 'Agent not found or not configured' },
        { status: 404 }
      );
    }

    const temperature =
      typeof requestedTemperature === 'number'
        ? requestedTemperature
        : agentConfig.temperature;
    const systemPrompt = requestedSystemPrompt || agentConfig.systemPrompt;
    const maxTokens =
      typeof requestedMaxTokens === 'number' ? requestedMaxTokens : 1200;
    const model =
      typeof requestedModel === 'string' && requestedModel.trim()
        ? requestedModel
        : undefined;

    const attachmentNote =
      Array.isArray(attachments) && attachments.length > 0
        ? attachments
            .map((file: any) => {
              const lines = [
                `Attachment: ${file.name || 'file'}${file.type ? ` (${file.type})` : ''}`,
              ];
              if (file.data) {
                lines.push(String(file.data).slice(0, 1000));
              }
              return lines.join('\n');
            })
            .join('\n\n')
        : '';

    const enrichedMessage = attachmentNote
      ? `${attachmentNote}\n\n${message}`
      : message;

    // Determine which provider to use
    let providerName = requestedProvider || agentConfig.primary;
    const provider = providers[providerName];

    if (!provider) {
      // Try primary provider
      providerName = agentConfig.primary;
      const primaryProvider = providers[providerName];
      if (!primaryProvider) {
        return NextResponse.json(
          { error: 'No available providers for this agent' },
          { status: 500 }
        );
      }
    }

    let responseMessage: string;

    try {
      responseMessage = await providers[providerName].callAPI(
        enrichedMessage,
        conversationHistory,
        systemPrompt,
        temperature,
        maxTokens,
        model
      );
    } catch (error) {
      console.error(`${providerName} API failed for agent ${agentId}:`, error);

      // Try fallback providers
      for (const fallback of agentConfig.fallbackProviders) {
        if (fallback === providerName) continue; // Skip the one that just failed

        try {
          const fallbackProvider = providers[fallback];
          // Don't pass the model to fallback providers - let them use their defaults
          responseMessage = await fallbackProvider.callAPI(
            enrichedMessage,
            conversationHistory,
            systemPrompt,
            temperature,
            maxTokens,
            undefined // Use provider's default model for fallbacks
          );
          console.log(
            `Successfully fell back to ${fallback} for agent ${agentId}`
          );
          providerName = fallback;
          break;
        } catch (fallbackError) {
          console.error(
            `${fallback} fallback also failed for agent ${agentId}:`,
            fallbackError
          );
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

    return NextResponse.json({
      message: responseMessage,
      provider: providerName,
      agentId,
      remaining: rateLimit.remaining,
    });
  } catch (error) {
    console.error('Agent chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
