import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_INSTRUCTION = `You are a world-class senior frontend engineer and UI/UX designer. 
Your task is to generate or modify a complete, high-quality, single-file HTML application.

Rules for generated code:
1. Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>).
2. Use Lucide icons via CDN (<script src="https://unpkg.com/lucide@latest"></script>).
3. Ensure the design is modern, professional, and mobile-responsive.
4. Include all necessary JavaScript for interactivity.
5. The output MUST be a single, valid HTML file containing <html>, <head>, and <body> tags.
6. Return ONLY the code. No explanations, no markdown blocks.
7. Always return the FULL updated file.
8. Use smooth animations and transitions for a polished feel.
9. Ensure accessibility with proper ARIA labels and semantic HTML.
10. For placeholder images, use inline SVG placeholders or CSS gradients instead of external services like via.placeholder.com or placehold.co. Example: <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
11. When using Lucide icons, ensure the element exists before calling addEventListener. Use DOMContentLoaded or place scripts at the end of body.`;

function cleanCode(text: string): string {
  return text
    .replaceAll(/```html/g, '')
    .replaceAll(/```/g, '')
    .trim();
}

// Generate with Groq (fast inference)
async function generateWithGroq(
  prompt: string,
  modelId: string,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    // Return a mock response when API key is not configured
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App - Groq API Key Not Configured</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-8">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
                    <svg class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Model not available</h3>
                <p class="mt-2 text-sm text-gray-500">
                    Technical issue occurred. Please try again later.
                </p>
                <div class="mt-4 text-xs text-gray-400">
                    Prompt: ${prompt}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  const groq = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
  ];

  if (currentCode) {
    messages.push({ role: 'user', content: `Current code:\n${currentCode}` });
  }

  if (history && history.length > 0) {
    history.forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    });
  }

  messages.push({ role: 'user', content: prompt });

  // Map model IDs to Groq models
  let actualModel = 'llama-3.3-70b-versatile';
  if (modelId === 'mixtral-8x7b') actualModel = 'mixtral-8x7b-32768';
  if (modelId === 'llama-3.1-8b') actualModel = 'llama-3.1-8b-instant';

  const response = await groq.chat.completions.create({
    model: actualModel,
    messages,
    temperature: 0.7,
    max_tokens: 8192,
  });

  return cleanCode(response.choices[0]?.message?.content || '');
}

// Generate with Mistral
async function generateWithMistral(
  prompt: string,
  modelId: string,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    // Return a mock response when API key is not configured
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App - Mistral API Key Not Configured</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-8">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                    <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </div>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Model not available</h3>
                <p class="mt-2 text-sm text-gray-500">
                    Technical issue occurred. Please try again later.
                </p>
                <div class="mt-4 text-xs text-gray-400">
                    Prompt: ${prompt}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  const mistral = new OpenAI({
    apiKey,
    baseURL: 'https://api.mistral.ai/v1',
  });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
  ];

  if (currentCode) {
    messages.push({ role: 'user', content: `Current code:\n${currentCode}` });
  }

  if (history && history.length > 0) {
    history.forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    });
  }

  messages.push({ role: 'user', content: prompt });

  // Map model IDs to Mistral models
  let actualModel = 'mistral-large-latest';
  if (modelId === 'mistral-small') actualModel = 'mistral-small-latest';
  if (modelId === 'codestral') actualModel = 'codestral-latest';

  const response = await mistral.chat.completions.create({
    model: actualModel,
    messages,
    temperature: 0.7,
    max_tokens: 8192,
  });

  return cleanCode(response.choices[0]?.message?.content || '');
}

// Generate with Cohere
async function generateWithCohere(
  prompt: string,
  modelId: string,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    // Return a mock response when API key is not configured
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App - Cohere API Key Not Configured</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-8">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100">
                    <svg class="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Model not available</h3>
                <p class="mt-2 text-sm text-gray-500">
                    Technical issue occurred. Please try again later.
                </p>
                <div class="mt-4 text-xs text-gray-400">
                    Prompt: ${prompt}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  // Map model IDs to Cohere models
  let actualModel = 'command-a-03-2025';
  if (modelId === 'command-r-08-2024') actualModel = 'command-r-08-2024';
  if (modelId === 'command-r7b-12-2024') actualModel = 'command-r7b-12-2024';

  // Build message history for Cohere
  const chatHistory: { role: string; message: string }[] = [];

  if (currentCode) {
    chatHistory.push({
      role: 'USER',
      message: `Current code:\n${currentCode}`,
    });
    chatHistory.push({
      role: 'CHATBOT',
      message: "I understand. I'll work with this code.",
    });
  }

  if (history && history.length > 0) {
    history.forEach((msg) => {
      chatHistory.push({
        role: msg.role === 'user' ? 'USER' : 'CHATBOT',
        message: msg.text,
      });
    });
  }

  const response = await fetch('https://api.cohere.ai/v1/chat', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: actualModel,
      message: prompt,
      preamble: SYSTEM_INSTRUCTION,
      chat_history: chatHistory,
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cohere API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return cleanCode(data.text || '');
}

// Generate with xAI (Grok)
async function generateWithXAI(
  prompt: string,
  modelId: string,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    // Return a mock response when API key is not configured
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App - xAI API Key Not Configured</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-8">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-black">
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Model not available</h3>
                <p class="mt-2 text-sm text-gray-500">
                    Technical issue occurred. Please try again later.
                </p>
                <div class="mt-4 text-xs text-gray-400">
                    Prompt: ${prompt}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  const xai = new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
  ];

  if (currentCode) {
    messages.push({ role: 'user', content: `Current code:\n${currentCode}` });
  }

  if (history && history.length > 0) {
    history.forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    });
  }

  messages.push({ role: 'user', content: prompt });

  // Map model IDs to xAI models
  let actualModel = 'grok-3';
  if (modelId === 'grok-3-mini') actualModel = 'grok-3-mini';
  if (modelId === 'grok-2') actualModel = 'grok-2-1212';
  if (modelId === 'grok-4') actualModel = 'grok-4-0709';

  const response = await xai.chat.completions.create({
    model: actualModel,
    messages,
    temperature: 0.7,
    max_tokens: 8192,
  });

  return cleanCode(response.choices[0]?.message?.content || '');
}

// Generate with Gemini
async function generateWithGemini(
  prompt: string,
  modelId: string,
  isThinking: boolean,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    // Return a mock response when API key is not configured
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App - Gemini API Key Not Configured</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-8">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Model not available</h3>
                <p class="mt-2 text-sm text-gray-500">
                    Technical issue occurred. Please try again later.
                </p>
                <div class="mt-4 text-xs text-gray-400">
                    Prompt: ${prompt}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const contents: { role: string; parts: { text: string }[] }[] = [];

  if (currentCode) {
    contents.push({
      role: 'user',
      parts: [{ text: `Current code:\n${currentCode}` }],
    });
  }

  if (history && history.length > 0) {
    history.forEach((msg) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    });
  }

  contents.push({ role: 'user', parts: [{ text: prompt }] });

  // Map model IDs to actual Gemini model names - using latest 2.0 models
  let actualModel = 'gemini-2.0-flash';
  if (modelId.includes('pro')) {
    actualModel = 'gemini-2.0-flash-thinking-exp';
  }

  const model = genAI.getGenerativeModel({
    model: actualModel,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: isThinking ? 1 : 0.7,
      maxOutputTokens: 8192,
    },
  });

  const result = await model.generateContent({ contents });
  return cleanCode(result.response.text());
}

// Generate with OpenAI
async function generateWithOpenAI(
  prompt: string,
  modelId: string,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    // Return a mock response when API key is not configured
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App - OpenAI API Key Not Configured</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-8">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Model not available</h3>
                <p class="mt-2 text-sm text-gray-500">
                    Technical issue occurred. Please try again later.
                </p>
                <div class="mt-4 text-xs text-gray-400">
                    Prompt: ${prompt}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  const openai = new OpenAI({ apiKey });
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_INSTRUCTION },
  ];

  if (currentCode) {
    messages.push({ role: 'user', content: `Current code:\n${currentCode}` });
  }

  if (history && history.length > 0) {
    history.forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    });
  }

  messages.push({ role: 'user', content: prompt });

  // Map model IDs
  let actualModel = 'gpt-4o';
  if (modelId === 'gpt-4o-mini') actualModel = 'gpt-4o-mini';
  if (modelId === 'gpt-4-turbo') actualModel = 'gpt-4-turbo';
  if (modelId === 'o1-preview') actualModel = 'o1-preview';

  const response = await openai.chat.completions.create({
    model: actualModel,
    messages,
    temperature: 0.7,
    max_tokens: 8192,
  });

  return cleanCode(response.choices[0]?.message?.content || '');
}

// Generate with Anthropic Claude
async function generateWithAnthropic(
  prompt: string,
  modelId: string,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Return a mock response when API key is not configured
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App - Anthropic API Key Not Configured</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-8">
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100">
                    <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </div>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Model not available</h3>
                <p class="mt-2 text-sm text-gray-500">
                    Technical issue occurred. Please try again later.
                </p>
                <div class="mt-4 text-xs text-gray-400">
                    Prompt: ${prompt}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  const anthropic = new Anthropic({ apiKey });
  const messages: Anthropic.MessageParam[] = [];

  if (currentCode) {
    messages.push({ role: 'user', content: `Current code:\n${currentCode}` });
    messages.push({
      role: 'assistant',
      content: "I understand. I'll work with this code.",
    });
  }

  if (history && history.length > 0) {
    history.forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    });
  }

  messages.push({ role: 'user', content: prompt });

  // Map model IDs - using latest Claude models
  let actualModel = 'claude-sonnet-4-20250514';
  if (modelId === 'claude-3-opus') actualModel = 'claude-opus-4-20250514';
  if (modelId === 'claude-3-haiku') actualModel = 'claude-3-5-haiku-20241022';

  const response = await anthropic.messages.create({
    model: actualModel,
    max_tokens: 8192,
    system: SYSTEM_INSTRUCTION,
    messages,
  });

  const textContent = response.content.find((c) => c.type === 'text');
  return cleanCode(textContent?.text || '');
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, provider, modelId, isThinking, currentCode, history } =
      await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let code: string;
    const selectedProvider = provider || 'Anthropic';

    switch (selectedProvider) {
      case 'OpenAI':
        code = await generateWithOpenAI(prompt, modelId, currentCode, history);
        break;
      case 'Anthropic':
        code = await generateWithAnthropic(
          prompt,
          modelId,
          currentCode,
          history
        );
        break;
      case 'Groq':
        code = await generateWithGroq(prompt, modelId, currentCode, history);
        break;
      case 'Mistral':
        code = await generateWithMistral(prompt, modelId, currentCode, history);
        break;
      case 'Cohere':
        code = await generateWithCohere(prompt, modelId, currentCode, history);
        break;
      case 'xAI':
        code = await generateWithXAI(prompt, modelId, currentCode, history);
        break;
      case 'Gemini':
        code = await generateWithGemini(
          prompt,
          modelId,
          isThinking,
          currentCode,
          history
        );
        break;
      default:
        // Default to Anthropic as it's confirmed working
        code = await generateWithAnthropic(
          prompt,
          modelId,
          currentCode,
          history
        );
        break;
    }

    return NextResponse.json({
      code,
      success: true,
      provider: selectedProvider,
    });
  } catch (error) {
    console.error('Canvas generation error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate application';
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}
