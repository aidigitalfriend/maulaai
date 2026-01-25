import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAgentConfig, getModelForAgent, ChatMode, PROVIDER_MODELS } from '@/lib/agent-provider-config';

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
const RATE_LIMIT_MAX_MESSAGES = 10000; // Massively increased - essentially unlimited

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

// Tool definitions for AI models
const AVAILABLE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web for current information. Use when you need up-to-date info or facts you are unsure about.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query' },
          num_results: { type: 'number', description: 'Number of results (1-10)', default: 5 },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_url',
      description: 'Fetch and extract content from a URL. Use when user shares a link or asks about a webpage.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The URL to fetch' },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_current_time',
      description: 'Get the current date and time. Use when user asks about time or you need temporal context.',
      parameters: {
        type: 'object',
        properties: {
          timezone: { type: 'string', description: 'Timezone (e.g., America/New_York)', default: 'UTC' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Perform mathematical calculations. Use for any math operations.',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'Math expression to evaluate' },
        },
        required: ['expression'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_file',
      description: 'Create a new file with specified content. Use when user asks to create, write, or save a file.',
      parameters: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Name of the file to create (e.g., "script.py", "notes.txt")' },
          content: { type: 'string', description: 'Content to write to the file' },
          folder: { type: 'string', description: 'Folder path (optional, defaults to workspace root)' },
        },
        required: ['filename', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read and return the contents of a file. Use when user asks to view, read, or open a file.',
      parameters: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Name or path of the file to read' },
        },
        required: ['filename'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'modify_file',
      description: 'Modify an existing file by replacing content or appending to it. Use when user asks to edit, update, or change a file.',
      parameters: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Name or path of the file to modify' },
          content: { type: 'string', description: 'New content (replaces file) or content to append' },
          mode: { type: 'string', description: 'Operation mode: "replace" (default) or "append"', default: 'replace' },
        },
        required: ['filename', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_files',
      description: 'List files and folders in a directory. Use when user asks to see files, browse folders, or check what exists.',
      parameters: {
        type: 'object',
        properties: {
          folder: { type: 'string', description: 'Folder path to list (defaults to workspace root)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_image',
      description: 'Generate an AI image from a text description. Use when user asks to create, generate, or make an image.',
      parameters: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'Detailed description of the image to generate' },
          style: { type: 'string', description: 'Art style: realistic, artistic, anime, oil-painting, watercolor, digital-art, 3d-render, pixel-art' },
          width: { type: 'number', description: 'Image width (512-1024)' },
          height: { type: 'number', description: 'Image height (512-1024)' },
        },
        required: ['prompt'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_canvas_project',
      description: 'Create a new canvas project with specified files and settings. Use when user wants to create a new web project, app, or canvas-based application.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the canvas project' },
          description: { type: 'string', description: 'Description of the project' },
          template: { type: 'string', description: 'Project template: react-app, vue-app, html-css-js, nextjs-app, svelte-app' },
          category: { type: 'string', description: 'Project category: web-app, mobile-app, game, tool, landing-page' },
          files: { type: 'array', description: 'Array of file objects with filename and content' },
          settings: { type: 'object', description: 'Project settings and configuration' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_canvas_project',
      description: 'Read a canvas project and return its files and settings. Use when user wants to view, examine, or work with an existing canvas project.',
      parameters: {
        type: 'object',
        properties: {
          project_id: { type: 'string', description: 'ID of the canvas project to read' },
        },
        required: ['project_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_canvas_project',
      description: 'Update an existing canvas project by adding/modifying files or changing settings. Use when user wants to modify, edit, or update a canvas project.',
      parameters: {
        type: 'object',
        properties: {
          project_id: { type: 'string', description: 'ID of the canvas project to update' },
          name: { type: 'string', description: 'New name for the project (optional)' },
          description: { type: 'string', description: 'New description for the project (optional)' },
          files: { type: 'array', description: 'Array of file objects to add/update (optional)' },
          settings: { type: 'object', description: 'Updated project settings (optional)' },
        },
        required: ['project_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_canvas_projects',
      description: 'List all canvas projects for the user. Use when user wants to see their projects, browse canvas apps, or find a specific project.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum number of projects to return' },
          category: { type: 'string', description: 'Filter by category (optional)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'save_canvas_to_files',
      description: 'Save a canvas project files to the agent file system. Use when user wants to export canvas project to regular files or create a backup.',
      parameters: {
        type: 'object',
        properties: {
          project_id: { type: 'string', description: 'ID of the canvas project to save' },
          folder: { type: 'string', description: 'Folder path to save files (defaults to project name)' },
        },
        required: ['project_id'],
      },
    },
  },
];

const TOOL_INSTRUCTIONS = `
You have access to various tools that can help you assist users more effectively:

FILE OPERATIONS:
- create_file: Create new files with content
- read_file: Read and display file contents  
- modify_file: Edit existing files (replace or append content)
- list_files: Browse directories and see what files exist
- delete_file: Remove files when requested

WEB & INFO TOOLS:
- web_search: Search the internet for current information
- fetch_url: Extract content from web pages
- get_current_time: Get current date/time information
- calculate: Perform mathematical calculations

IMAGE TOOLS:
- generate_image: Create AI-generated images from descriptions

CANVAS PROJECT TOOLS:
- create_canvas_project: Create new web/mobile projects
- read_canvas_project: View existing canvas projects
- update_canvas_project: Modify canvas projects
- list_canvas_projects: Browse user's canvas projects
- save_canvas_to_files: Export canvas projects to file system

When users ask you to perform file operations, web searches, calculations, image generation, or canvas project management, use the appropriate tools. Always explain what you're doing and show the results clearly.`;

interface AIProvider {
  name: string;
  callAPI: (message: string, conversationHistory: any[], systemPrompt?: string, enableTools?: boolean, model?: string) => Promise<string>;
  supportsTools?: boolean;
}

// OpenAI Provider
const openaiProvider: AIProvider = {
  name: 'openai',
  supportsTools: true,
  callAPI: async (message, conversationHistory, systemPrompt, enableTools = false, model = 'gpt-4o') => {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }];

    const requestBody: any = {
      model,
      messages,
      max_tokens: 32000,
      temperature: 0.7,
    };

    // Add tools if enabled
    if (enableTools) {
      requestBody.tools = AVAILABLE_TOOLS;
      requestBody.tool_choice = 'auto';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error(`OpenAI API returned ${response.status}`);
    const data = await response.json();

    const choice = data.choices?.[0];
    if (!choice) throw new Error('No response from OpenAI');

    // Handle tool calls
    if (choice.message?.tool_calls && enableTools) {
      return JSON.stringify({
        content: choice.message.content || '',
        tool_calls: choice.message.tool_calls,
        finish_reason: choice.finish_reason,
      });
    }

    return choice.message?.content || "I apologize, but I couldn't generate a response right now.";
  },
};

// Anthropic Provider
const anthropicProvider: AIProvider = {
  name: 'anthropic',
  supportsTools: true,
  callAPI: async (message, conversationHistory, systemPrompt, enableTools = false, model = 'claude-sonnet-4-20250514') => {
    if (!ANTHROPIC_API_KEY) throw new Error('Anthropic API key not configured');

    const userMessages = conversationHistory.filter((msg) => msg.role !== 'system').map((msg) => ({ role: msg.role, content: msg.content }));

    const requestBody: any = {
      model,
      system: systemPrompt || 'You are a helpful AI assistant.',
      messages: [...userMessages, { role: 'user', content: message }],
      max_tokens: 32000,
      temperature: 0.7,
    };

    // Add tools if enabled (Anthropic format)
    if (enableTools) {
      requestBody.tools = AVAILABLE_TOOLS.map(tool => ({
        name: tool.function.name,
        description: tool.function.description,
        input_schema: tool.function.parameters,
      }));
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error(`Anthropic API returned ${response.status}`);
    const data = await response.json();

    const content = data.content?.[0];
    if (!content) throw new Error('No response from Anthropic');

    // Handle tool calls (Anthropic format)
    if (content.type === 'tool_use' && enableTools) {
      return JSON.stringify({
        content: '',
        tool_calls: [{
          id: content.id,
          type: 'function',
          function: {
            name: content.name,
            arguments: JSON.stringify(content.input),
          },
        }],
        finish_reason: 'tool_calls',
      });
    }

    return content.text || "I apologize, but I couldn't generate a response right now.";
  },
};

// xAI Provider
const xaiProvider: AIProvider = {
  name: 'xai',
  supportsTools: true,
  callAPI: async (message, conversationHistory, systemPrompt, enableTools = false, model = 'grok-2') => {
    if (!XAI_API_KEY) throw new Error('xAI API key not configured');
    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }];
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${XAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: 32000, temperature: 0.7 }),
    });
    if (!response.ok) throw new Error(`xAI API returned ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response right now.";
  },
};

// Mistral Provider
const mistralProvider: AIProvider = {
  name: 'mistral',
  supportsTools: true,
  callAPI: async (message, conversationHistory, systemPrompt, enableTools = false, model = 'mistral-large-latest') => {
    if (!MISTRAL_API_KEY) throw new Error('Mistral API key not configured');
    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }];
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${MISTRAL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: 32000, temperature: 0.7 }),
    });
    if (!response.ok) throw new Error(`Mistral API returned ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response right now.";
  },
};

// Gemini Provider
const geminiProvider: AIProvider = {
  name: 'gemini',
  supportsTools: false,
  callAPI: async (message, conversationHistory, systemPrompt, enableTools = false, model = 'gemini-2.0-flash') => {
    if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');
    const conversationText = conversationHistory.length > 0 ? conversationHistory.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') : '';
    const fullPrompt = conversationText ? `${systemPrompt || 'You are a helpful AI assistant.'}\n\nPrevious conversation:\n${conversationText}\n\nUser: ${message}\nAssistant:` : `${systemPrompt || 'You are a helpful AI assistant.'}\n\nUser: ${message}\nAssistant:`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 32000, topK: 40, topP: 0.95 } }),
    });
    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I couldn't generate a response right now.";
  },
};

// Cerebras Provider
const cerebrasProvider: AIProvider = {
  name: 'cerebras',
  supportsTools: false,
  callAPI: async (message, conversationHistory, systemPrompt, enableTools = false, model = 'llama-3.3-70b') => {
    if (!CEREBRAS_API_KEY) throw new Error('Cerebras API key not configured');
    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }];
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: 32000, temperature: 0.7 }),
    });
    if (!response.ok) throw new Error(`Cerebras API returned ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response right now.";
  },
};

// Groq Provider
const groqProvider: AIProvider = {
  name: 'groq',
  supportsTools: false,
  callAPI: async (message, conversationHistory, systemPrompt, enableTools = false, model = 'llama-3.3-70b-versatile') => {
    if (!GROQ_API_KEY) throw new Error('Groq API key not configured');
    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }];
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, max_tokens: 32000, temperature: 0.7 }),
    });
    if (!response.ok) throw new Error(`Groq API returned ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response right now.";
  },
};

const providers: Record<string, AIProvider> = { cerebras: cerebrasProvider, groq: groqProvider, openai: openaiProvider, anthropic: anthropicProvider, xai: xaiProvider, mistral: mistralProvider, gemini: geminiProvider };

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    const { message, conversationHistory = [], agentId, provider: requestedProvider, userId, conversationId, mode = 'quick' } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    // Get agent configuration using centralized config
    const agentConfig = getAgentConfig(agentId);
    const chatMode = (mode === 'advanced' ? 'advanced' : 'quick') as ChatMode;
    
    // Determine provider: use requested provider if specified, otherwise use agent's configured provider
    let providerName = requestedProvider || agentConfig.config.provider;
    
    // Get model based on mode (quick vs advanced)
    const modelToUse = getModelForAgent(agentId, chatMode);
    
    // Get system prompt from agent config
    let systemPrompt = agentConfig.systemPrompt;
    
    // Add tool instructions for agents that support tools
    const selectedProvider = providers[providerName];
    if (selectedProvider?.supportsTools && agentConfig.config.supportsTools) {
      systemPrompt += '\n\n' + TOOL_INSTRUCTIONS;
    }

    const provider = providers[providerName];
    if (!provider) {
      // Try fallback providers if primary not available
      for (const fallback of agentConfig.fallbackProviders) {
        if (providers[fallback]) {
          providerName = fallback;
          break;
        }
      }
    }
    
    const finalProvider = providers[providerName];
    if (!finalProvider) {
      return NextResponse.json({ error: 'Requested provider not available' }, { status: 400 });
    }

    // Enable tools for agents that support them
    const enableTools = agentConfig.config.supportsTools && finalProvider.supportsTools;

    console.log(`[Studio Chat] Agent: ${agentId || 'default'} | Provider: ${providerName} | Mode: ${chatMode} | Model: ${modelToUse}`);

    let responseMessage: string = '';

    try {
      responseMessage = await finalProvider.callAPI(message, conversationHistory, systemPrompt, enableTools, modelToUse);
    } catch (error) {
      console.error(`${providerName} API failed:`, error);
      // Use agent's configured fallback providers
      for (const fallback of agentConfig.fallbackProviders) {
        if (!providers[fallback]) continue;
        try {
          // Get appropriate model for fallback provider
          const fallbackModel = PROVIDER_MODELS[fallback as keyof typeof PROVIDER_MODELS]?.[chatMode] || undefined;
          responseMessage = await providers[fallback].callAPI(message, conversationHistory, systemPrompt, enableTools, fallbackModel);
          console.log(`Successfully fell back to ${fallback} with model ${fallbackModel}`);
          providerName = fallback;
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

    // Handle tool calls if present
    if (enableTools && responseMessage.startsWith('{')) {
      try {
        const responseData = JSON.parse(responseMessage);
        if (responseData.tool_calls && responseData.tool_calls.length > 0) {
          // Execute tools
          const toolResults = [];
          for (const toolCall of responseData.tool_calls) {
            try {
              const toolName = toolCall.function?.name;
              const toolArgs = JSON.parse(toolCall.function?.arguments || '{}');
              
              // Add userId to tool parameters for file operations
              const paramsWithUser = { ...toolArgs, userId };
              
              // Call backend tool execution API
              const toolResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/agents/tools/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tool: toolName, params: paramsWithUser }),
              });
              
              if (toolResponse.ok) {
                const toolResult = await toolResponse.json();
                toolResults.push({
                  tool_call_id: toolCall.id,
                  role: 'tool',
                  name: toolName,
                  content: JSON.stringify(toolResult.data || toolResult),
                });
              } else {
                console.error(`Tool execution failed for ${toolName}:`, await toolResponse.text());
                toolResults.push({
                  tool_call_id: toolCall.id,
                  role: 'tool',
                  name: toolName,
                  content: JSON.stringify({ error: 'Tool execution failed' }),
                });
              }
            } catch (toolError) {
              console.error('Error executing tool:', toolError);
              toolResults.push({
                tool_call_id: toolCall.id,
                role: 'tool',
                name: toolCall.function?.name,
                content: JSON.stringify({ error: toolError.message }),
              });
            }
          }
          
          // Continue conversation with tool results
          const messagesWithTools = [
            ...conversationHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: responseData.content || '', tool_calls: responseData.tool_calls },
            ...toolResults,
          ];
          
          // Get final response from AI
          responseMessage = await provider.callAPI('', messagesWithTools, systemPrompt, false);
        } else {
          // No tool calls, use the content directly
          responseMessage = responseData.content || responseMessage;
        }
      } catch (parseError) {
        console.error('Error parsing tool response:', parseError);
        // If parsing fails, use response as-is
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

    return NextResponse.json({ 
      message: responseMessage, 
      provider: providerName, 
      model: modelToUse,
      mode: chatMode,
      agentName: agentConfig.displayName,
      remaining: rateLimit.remaining 
    });
  } catch (error) {
    console.error('Studio chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
