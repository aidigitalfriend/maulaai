import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL for memory operations
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3005';

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

// ═══════════════════════════════════════════════════════════════════
// AGENT MEMORY & TOOLS INTEGRATION
// ═══════════════════════════════════════════════════════════════════

// Tool call pattern: [TOOL:tool_name]{"param": "value"}
const TOOL_CALL_REGEX = /\[TOOL:(\w+)\](\{[^}]+\})/g;

// Parse tool calls from AI response
function parseToolCalls(response: string): Array<{ tool: string; params: any }> {
  const calls: Array<{ tool: string; params: any }> = [];
  let match;
  while ((match = TOOL_CALL_REGEX.exec(response)) !== null) {
    try {
      const [, tool, paramsStr] = match;
      const params = JSON.parse(paramsStr);
      calls.push({ tool, params });
    } catch {
      // Skip malformed tool calls
    }
  }
  return calls;
}

// Execute tool via backend API
async function executeTool(tool: string, params: any): Promise<any> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/agents/tools/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, params }),
    });
    if (!response.ok) throw new Error(`Tool execution failed: ${response.status}`);
    const data = await response.json();
    return data.success ? data.data : { error: data.error };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Tool execution failed' };
  }
}

// Get enhanced system prompt with memory context
async function getEnhancedSystemPrompt(
  userId: string | undefined,
  agentId: string,
  basePrompt: string
): Promise<string> {
  if (!userId) return basePrompt;

  try {
    const response = await fetch(
      `${BACKEND_API_URL}/api/agents/memory/${userId}/${agentId}/context?basePrompt=${encodeURIComponent(basePrompt)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );
    if (!response.ok) return basePrompt;
    const data = await response.json();
    return data.success ? data.data.enhancedPrompt : basePrompt;
  } catch {
    return basePrompt;
  }
}

// Process conversation for learnings
async function processConversationLearnings(
  userId: string | undefined,
  agentId: string,
  messages: Array<{ role: string; content: string }>,
  conversationId?: string
): Promise<void> {
  if (!userId) return;

  try {
    await fetch(`${BACKEND_API_URL}/api/agents/memory/${userId}/${agentId}/learn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, conversationId }),
    });
  } catch (error) {
    console.error('Failed to process learnings:', error);
  }
}

// Tool descriptions for system prompt
const TOOL_DESCRIPTIONS = `
## AVAILABLE TOOLS

You have access to powerful tools. When you need to use a tool, include the tool call in your response using this exact format:
[TOOL:tool_name]{"param": "value"}

**Available Tools:**

1. **web_search** - Search the web for current information
   [TOOL:web_search]{"query": "search query here"}

2. **fetch_url** - Read content from a URL/webpage
   [TOOL:fetch_url]{"url": "https://example.com"}

3. **get_current_time** - Get current date and time
   [TOOL:get_current_time]{"timezone": "America/New_York"}

4. **calculate** - Perform mathematical calculations
   [TOOL:calculate]{"expression": "2 + 2 * 5"}

5. **create_file** - Create a new file with content
   [TOOL:create_file]{"filename": "script.py", "content": "print('Hello!')", "folder": ""}
   Use when: User asks to create, write, save, or generate a file

6. **read_file** - Read contents of a file
   [TOOL:read_file]{"filename": "notes.txt"}
   Use when: User asks to view, read, open, or show a file

7. **modify_file** - Edit an existing file (replace or append)
   [TOOL:modify_file]{"filename": "notes.txt", "content": "new content", "mode": "replace"}
   Modes: "replace" (overwrite) or "append" (add to end)

8. **list_files** - List files and folders in workspace
   [TOOL:list_files]{"folder": ""}
   Use when: User asks to see files, browse, or check what exists

9. **delete_file** - Delete a file
   [TOOL:delete_file]{"filename": "old-file.txt"}
   Use when: User explicitly asks to delete or remove a file

10. **generate_image** - Generate an AI image from text description
    [TOOL:generate_image]{"prompt": "a beautiful sunset over mountains", "style": "realistic"}
    Styles: realistic, artistic, anime, oil-painting, watercolor, digital-art, 3d-render, pixel-art
    Use when: User asks to create, generate, make, or draw an image, picture, artwork, or illustration

11. **generate_video** - Generate a short AI video from text description
    [TOOL:generate_video]{"prompt": "a cat playing with yarn", "duration": 4}
    Duration: 2-10 seconds
    Use when: User asks to create, generate, or make a video, clip, or animation

**IMPORTANT GUIDELINES:**
- Use tools when you need real-time information, to verify facts, or perform calculations
- For file operations: create files when asked, read when user wants to see content
- For images/videos: Add details to prompts for better results (lighting, style, mood, colors)
- After using a tool, incorporate the results naturally into your response
- If a tool fails, acknowledge it gracefully and provide the best response you can
- Don't use tools for information you already know with certainty
- Be transparent when you're searching for or calculating something
`;

// Attachment interface for files/images
interface Attachment {
  name?: string;
  type?: string;
  url?: string;
  data?: string; // base64 data
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
    model?: string,
    attachments?: Attachment[]
  ) => Promise<string>;
}

// OpenAI Provider (supports vision with gpt-4o)
const openaiProvider: AIProvider = {
  name: 'openai',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string,
    temperature = 0.7,
    maxTokens = 1200,
    model?: string,
    attachments?: Attachment[]
  ) => {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

    // Build user message content - support multimodal (text + images)
    const userContent: any[] = [{ type: 'text', text: message }];

    // Add image attachments for vision
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.type?.startsWith('image/')) {
          // Use URL if available, otherwise use base64 data
          if (attachment.url) {
            userContent.push({
              type: 'image_url',
              image_url: { url: attachment.url, detail: 'auto' },
            });
          } else if (attachment.data) {
            // Handle base64 data
            const base64Data = attachment.data.includes('base64,')
              ? attachment.data
              : `data:${attachment.type};base64,${attachment.data}`;
            userContent.push({
              type: 'image_url',
              image_url: { url: base64Data, detail: 'auto' },
            });
          }
        }
      }
    }

    const messages = systemPrompt
      ? [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: userContent },
        ]
      : [
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: userContent },
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

// Anthropic Provider (supports vision with Claude 3)
const anthropicProvider: AIProvider = {
  name: 'anthropic',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string,
    temperature = 0.7,
    maxTokens = 1200,
    model?: string,
    attachments?: Attachment[]
  ) => {
    if (!ANTHROPIC_API_KEY) throw new Error('Anthropic API key not configured');

    const userMessages = conversationHistory
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({ role: msg.role, content: msg.content }));

    // Build user message content - support multimodal (text + images)
    const userContent: any[] = [{ type: 'text', text: message }];

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.type?.startsWith('image/')) {
          if (attachment.url) {
            // Anthropic needs base64, so we'd need to fetch the URL - skip for now
            // For URLs, append as text reference
            userContent[0].text = `[Image: ${attachment.url}]\n\n${userContent[0].text}`;
          } else if (attachment.data) {
            const base64Data = attachment.data.includes('base64,')
              ? attachment.data.split('base64,')[1]
              : attachment.data;
            userContent.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: attachment.type,
                data: base64Data,
              },
            });
          }
        }
      }
    }

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
        messages: [...userMessages, { role: 'user', content: userContent }],
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
    model?: string,
    _attachments?: Attachment[] // xAI doesn't support vision yet
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
    model?: string,
    _attachments?: Attachment[] // Mistral doesn't support vision yet
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

// Gemini Provider (supports vision)
const geminiProvider: AIProvider = {
  name: 'gemini',
  callAPI: async (
    message: string,
    conversationHistory: any[],
    systemPrompt?: string,
    temperature = 0.7,
    maxTokens = 1200,
    model?: string,
    _attachments?: Attachment[] // TODO: Add Gemini vision support
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
    model?: string,
    _attachments?: Attachment[] // Groq doesn't support vision yet
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
    model?: string,
    _attachments?: Attachment[] // Cohere doesn't support vision yet
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

// Vision-capable providers (can analyze images)
const VISION_CAPABLE_PROVIDERS = ['openai', 'anthropic', 'gemini'];

// Image generation capable providers
const IMAGE_GEN_PROVIDERS = ['openai']; // DALL-E via OpenAI

// Check if message is requesting image generation
function isImageGenerationRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const imageGenPatterns = [
    /\b(create|generate|make|draw|produce|design)\b.*\b(image|picture|photo|illustration|art|artwork|graphic|visual)\b/i,
    /\b(image|picture|photo|illustration|art|artwork|graphic|visual)\b.*\b(of|for|showing|depicting)\b/i,
    /\bshow me\b.*\b(image|picture|what.*looks like)\b/i,
    /\bvisualize\b/i,
    /\bdall-?e\b/i,
    /\bgenerate\b.*\b(a|an|the)\b/i,
  ];
  return imageGenPatterns.some((pattern) => pattern.test(lowerMessage));
}

// Check if attachments contain images
function hasImageAttachments(attachments?: Attachment[]): boolean {
  return attachments?.some((a) => a.type?.startsWith('image/')) || false;
}

// Generate image using DALL-E
async function generateImage(
  prompt: string
): Promise<{ imageUrl: string; revisedPrompt: string } | null> {
  if (!OPENAI_API_KEY) return null;

  try {
    const response = await fetch(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        }),
      }
    );

    if (!response.ok) {
      console.error('DALL-E API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return {
      imageUrl: data.data?.[0]?.url || '',
      revisedPrompt: data.data?.[0]?.revised_prompt || prompt,
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

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
      userId, // For memory features
      conversationId, // For tracking conversations
      enableMemory = true, // Enable/disable memory features
      enableTools = true, // Enable/disable tool usage
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
    
    // Build enhanced system prompt with memory context and tool instructions
    let systemPrompt = requestedSystemPrompt || agentConfig.systemPrompt;
    
    // Add tool descriptions if tools are enabled
    if (enableTools) {
      systemPrompt = `${systemPrompt}\n\n${TOOL_DESCRIPTIONS}`;
    }
    
    // Enhance with memory context if user is identified and memory is enabled
    if (enableMemory && userId) {
      systemPrompt = await getEnhancedSystemPrompt(userId, agentId, systemPrompt);
    }
    
    const maxTokens =
      typeof requestedMaxTokens === 'number' ? requestedMaxTokens : 1200;
    const model =
      typeof requestedModel === 'string' && requestedModel.trim()
        ? requestedModel
        : undefined;

    const attachmentNote =
      Array.isArray(attachments) && attachments.length > 0
        ? attachments
            .filter((file: any) => !file.type?.startsWith('image/')) // Only non-image files as text
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

    // For non-vision models, include attachment note in message
    // For vision models (OpenAI, Anthropic), images are passed separately
    const enrichedMessage = attachmentNote
      ? `${attachmentNote}\n\n${message}`
      : message;

    // Check if this is an image generation request
    if (
      isImageGenerationRequest(message) &&
      !hasImageAttachments(attachments)
    ) {
      try {
        const imageResult = await generateImage(message);
        if (imageResult) {
          // Clean response without showing the prompt
          const responseWithImage = `Here's the image I created for you! ✨\n\n![Generated Image](${imageResult.imageUrl})`;
          return NextResponse.json({
            message: responseWithImage,
            provider: 'openai-dalle',
            agentId,
            remaining: rateLimit.remaining,
            imageGenerated: true,
            imageUrl: imageResult.imageUrl,
          });
        }
      } catch (imgError) {
        console.error(
          'Image generation failed, falling back to text response:',
          imgError
        );
        // Fall through to regular text response
      }
    }

    // Determine which provider to use
    let providerName = requestedProvider || agentConfig.primary;

    // If images are attached and selected provider doesn't support vision, fallback to vision-capable provider
    const hasImages = hasImageAttachments(attachments);
    if (hasImages && !VISION_CAPABLE_PROVIDERS.includes(providerName)) {
      console.log(
        `Provider ${providerName} doesn't support vision, falling back to OpenAI for image analysis`
      );
      // Try OpenAI first (best vision support), then Anthropic
      if (OPENAI_API_KEY) {
        providerName = 'openai';
      } else if (ANTHROPIC_API_KEY) {
        providerName = 'anthropic';
      } else if (GEMINI_API_KEY) {
        providerName = 'gemini';
      }
      // Add a note to the response about the fallback
    }

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
        model,
        attachments // Pass attachments for vision support
      );
    } catch (error) {
      console.error(`${providerName} API failed for agent ${agentId}:`, error);

      // Try fallback providers - prioritize vision-capable ones if images are attached
      let fallbackOrder = agentConfig.fallbackProviders;
      if (hasImages) {
        // Reorder fallbacks to try vision-capable providers first
        fallbackOrder = [
          ...fallbackOrder.filter((p) => VISION_CAPABLE_PROVIDERS.includes(p)),
          ...fallbackOrder.filter((p) => !VISION_CAPABLE_PROVIDERS.includes(p)),
        ];
      }

      for (const fallback of fallbackOrder) {
        if (fallback === providerName) continue; // Skip the one that just failed

        // Skip non-vision providers if we have images
        if (hasImages && !VISION_CAPABLE_PROVIDERS.includes(fallback)) {
          console.log(
            `Skipping ${fallback} for fallback - doesn't support vision`
          );
          continue;
        }

        try {
          const fallbackProvider = providers[fallback];
          // Don't pass the model to fallback providers - let them use their defaults
          responseMessage = await fallbackProvider.callAPI(
            enrichedMessage,
            conversationHistory,
            systemPrompt,
            temperature,
            maxTokens,
            undefined, // Use provider's default model for fallbacks
            attachments // Pass attachments for vision support
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

    // ═══════════════════════════════════════════════════════════════════
    // TOOL EXECUTION LOOP
    // ═══════════════════════════════════════════════════════════════════
    let toolsUsed: string[] = [];
    
    if (enableTools) {
      // Check for tool calls in the response
      const toolCalls = parseToolCalls(responseMessage);
      
      if (toolCalls.length > 0) {
        console.log(`Agent ${agentId} requested ${toolCalls.length} tool(s)`);
        
        // Execute each tool and collect results
        const toolResults: Array<{ tool: string; result: any }> = [];
        for (const call of toolCalls) {
          const result = await executeTool(call.tool, call.params);
          toolResults.push({ tool: call.tool, result });
          toolsUsed.push(call.tool);
        }
        
        // Build context with tool results
        const toolContext = toolResults
          .map(({ tool, result }) => {
            const resultStr = typeof result === 'object' 
              ? JSON.stringify(result, null, 2)
              : String(result);
            return `[TOOL_RESULT:${tool}]\n${resultStr}`;
          })
          .join('\n\n');
        
        // Build follow-up message
        const followUpMessage = `You previously requested these tools. Here are the results:\n\n${toolContext}\n\nNow provide your complete response to the user, naturally incorporating this information. Do not mention the tool calls explicitly - just use the information naturally.`;
        
        // Call the API again with tool results
        try {
          const followUpHistory = [
            ...conversationHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: responseMessage },
          ];
          
          responseMessage = await providers[providerName].callAPI(
            followUpMessage,
            followUpHistory,
            systemPrompt,
            temperature,
            maxTokens,
            model,
            undefined // No attachments for follow-up
          );
          
          console.log(`Agent ${agentId} incorporated tool results`);
        } catch (toolFollowUpError) {
          console.error('Tool follow-up failed:', toolFollowUpError);
          // Keep the original response with tool calls visible
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // LEARNING EXTRACTION (async, non-blocking)
    // ═══════════════════════════════════════════════════════════════════
    if (enableMemory && userId) {
      // Process in background - don't wait for it
      const messagesForLearning = [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: responseMessage },
      ];
      
      // Fire and forget - learning happens asynchronously
      processConversationLearnings(userId, agentId, messagesForLearning, conversationId)
        .catch(err => console.error('Learning extraction failed:', err));
    }

    return NextResponse.json({
      message: responseMessage,
      provider: providerName,
      agentId,
      remaining: rateLimit.remaining,
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
      memoryEnabled: enableMemory && !!userId,
    });
  } catch (error) {
    console.error('Agent chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
