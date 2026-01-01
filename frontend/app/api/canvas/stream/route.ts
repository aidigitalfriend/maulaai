import { NextRequest } from 'next/server';
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
8. Use smooth animations and transitions for a polished feel.`;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const { prompt, provider, modelId, isThinking, currentCode, history } =
      await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const selectedProvider = provider || 'Gemini';

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (selectedProvider === 'Gemini') {
            await streamWithGemini(
              controller,
              encoder,
              prompt,
              modelId,
              isThinking,
              currentCode,
              history
            );
          } else if (selectedProvider === 'OpenAI') {
            await streamWithOpenAI(
              controller,
              encoder,
              prompt,
              modelId,
              currentCode,
              history
            );
          } else if (selectedProvider === 'Anthropic') {
            await streamWithAnthropic(
              controller,
              encoder,
              prompt,
              modelId,
              currentCode,
              history
            );
          }
          controller.close();
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : 'Stream error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Stream error:', error);
    return new Response(
      JSON.stringify({ error: 'Stream initialization failed' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function streamWithGemini(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  prompt: string,
  modelId: string,
  isThinking: boolean,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    // Return a mock response when API key is not configured
    const mockCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated App - API Key Not Configured</title>
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
                <h3 class="mt-4 text-lg font-medium text-gray-900">API Key Required</h3>
                <p class="mt-2 text-sm text-gray-500">
                    The canvas app requires API keys to generate code. Please configure your AI provider API keys.
                </p>
                <div class="mt-4 text-xs text-gray-400">
                    Prompt: ${prompt}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify({ chunk: mockCode })}\n\n`)
    );
    return;
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

  let actualModel = 'gemini-1.5-flash';
  if (modelId.includes('pro')) actualModel = 'gemini-1.5-pro';

  const model = genAI.getGenerativeModel({
    model: actualModel,
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: isThinking ? 1 : 0.7,
      maxOutputTokens: 8192,
    },
  });

  const result = await model.generateContentStream({ contents });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`)
      );
    }
  }

  controller.enqueue(
    encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
  );
}

async function streamWithOpenAI(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  prompt: string,
  modelId: string,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    // Return a mock response when API key is not configured
    const mockCode = `<!DOCTYPE html>
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
                <h3 class="mt-4 text-lg font-medium text-gray-900">OpenAI API Key Required</h3>
                <p class="mt-2 text-sm text-gray-500">
                    Configure your OpenAI API key to generate code with GPT models.
                </p>
                <div class="mt-4 text-xs text-gray-400">
                    Prompt: ${prompt}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify({ chunk: mockCode })}\n\n`)
    );
    return;
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

  let actualModel = 'gpt-4o';
  if (modelId === 'gpt-4o-mini') actualModel = 'gpt-4o-mini';

  const stream = await openai.chat.completions.create({
    model: actualModel,
    messages,
    temperature: 0.7,
    max_tokens: 8192,
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`)
      );
    }
  }

  controller.enqueue(
    encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
  );
}

async function streamWithAnthropic(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  prompt: string,
  modelId: string,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Return a mock response when API key is not configured
    const mockCode = `<!DOCTYPE html>
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
                <h3 class="mt-4 text-lg font-medium text-gray-900">Anthropic API Key Required</h3>
                <p class="mt-2 text-sm text-gray-500">
                    Configure your Anthropic API key to generate code with Claude models.
                </p>
                <div class="mt-4 text-xs text-gray-400">
                    Prompt: ${prompt}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify({ chunk: mockCode })}\n\n`)
    );
    return;
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

  let actualModel = 'claude-3-5-sonnet-20241022';
  if (modelId === 'claude-3-opus') actualModel = 'claude-3-opus-20240229';

  const stream = await anthropic.messages.stream({
    model: actualModel,
    max_tokens: 8192,
    system: SYSTEM_INSTRUCTION,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ chunk: event.delta.text })}\n\n`
        )
      );
    }
  }

  controller.enqueue(
    encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
  );
}
