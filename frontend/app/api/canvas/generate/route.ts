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
    const selectedProvider = provider || 'Gemini';

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
      case 'Gemini':
      default:
        code = await generateWithGemini(
          prompt,
          modelId,
          isThinking,
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
