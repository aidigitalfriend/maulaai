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
9. Ensure accessibility with proper ARIA labels and semantic HTML.`;

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
    throw new Error(
      'Groq API key not configured. Please add GROQ_API_KEY to your environment.'
    );
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
    throw new Error(
      'Mistral API key not configured. Please add MISTRAL_API_KEY to your environment.'
    );
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
    throw new Error(
      'Cohere API key not configured. Please add COHERE_API_KEY to your environment.'
    );
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
    throw new Error(
      'xAI API key not configured. Please add XAI_API_KEY to your environment.'
    );
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
  if (!apiKey) throw new Error('Gemini API key not configured');

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

  // Map model IDs to actual Gemini model names
  let actualModel = 'gemini-1.5-flash';
  if (modelId.includes('pro')) {
    actualModel = 'gemini-1.5-pro';
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
    throw new Error(
      'OpenAI API key not configured. Please add a valid OPENAI_API_KEY to your environment.'
    );
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
    throw new Error(
      'Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment.'
    );
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

  // Map model IDs
  let actualModel = 'claude-3-5-sonnet-20241022';
  if (modelId === 'claude-3-opus') actualModel = 'claude-3-opus-20240229';
  if (modelId === 'claude-3-haiku') actualModel = 'claude-3-haiku-20240307';

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
