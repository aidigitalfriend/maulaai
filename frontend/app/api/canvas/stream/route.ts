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

const PROVIDER_PRIORITY: ReadonlyArray<'Anthropic' | 'OpenAI' | 'Gemini'> = [
  'Anthropic',
  'OpenAI',
  'Gemini',
];

function getProviderQueue(requested?: string) {
  const base = Array.from(PROVIDER_PRIORITY);
  if (!requested || requested.toLowerCase() === 'auto') {
    return base;
  }

  const normalized = requested.toLowerCase();
  const matched = base.find((name) => name.toLowerCase() === normalized);
  if (!matched) {
    return base;
  }

  return [matched, ...base.filter((name) => name !== matched)];
}

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

    const providersToTry = getProviderQueue(provider);

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        const errors: string[] = [];

        for (const candidate of providersToTry) {
          try {
            if (candidate === 'Anthropic') {
              await streamWithAnthropic(
                controller,
                encoder,
                prompt,
                modelId,
                currentCode,
                history
              );
            } else if (candidate === 'OpenAI') {
              await streamWithOpenAI(
                controller,
                encoder,
                prompt,
                modelId,
                currentCode,
                history
              );
            } else {
              await streamWithGemini(
                controller,
                encoder,
                prompt,
                modelId,
                isThinking,
                currentCode,
                history
              );
            }

            controller.close();
            return;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Unknown error';
            errors.push(`${candidate}: ${message}`);
          }
        }

        const fallbackMessage =
          errors.length > 0
            ? errors.join(' | ')
            : 'No AI providers are configured';

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: fallbackMessage })}\n\n`)
        );
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
        );
        controller.close();
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
  if (!apiKey || apiKey.includes('placeholder')) {
    throw new Error('Gemini API key is not configured');
  }

  try {
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gemini stream failed';
    throw new Error(message);
  }
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
    throw new Error('OpenAI API key is not configured');
  }

  try {
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'OpenAI stream failed';
    throw new Error(message);
  }
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
