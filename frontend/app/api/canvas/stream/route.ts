import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_INSTRUCTION = `You are a world-class senior frontend engineer and UI/UX designer.
Generate or modify a complete, production-grade, single-file HTML application that feels bespoke for the user’s prompt.

Rules for generated code (must follow all):
1) Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>).
2) Use Lucide icons via CDN (<script src="https://unpkg.com/lucide@latest"></script>).
3) Ensure the design is modern, professional, accessible, and mobile-responsive.
4) Include all necessary JavaScript for interactivity.
5) Output MUST be one valid HTML document with <html>, <head>, <body>.
6) Return ONLY code (no markdown, no explanations).
7) Always return the FULL updated file.
8) Use smooth, subtle animations for polish.
9) Avoid reusing the same layouts or color systems between requests—produce varied structure, components, and palettes per prompt.
10) Prefer semantic HTML and ARIA labels for key controls.`;

const PROVIDER_PRIORITY: ReadonlyArray<'Mistral' | 'XAI' | 'OpenAI' | 'Gemini' | 'Anthropic'> = [
  'Mistral',
  'XAI',
  'OpenAI',
  'Gemini',
  'Anthropic',
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

    const stream = new ReadableStream({
      async start(controller) {
        const errors: string[] = [];

        for (const candidate of providersToTry) {
          try {
            if (candidate === 'Mistral') {
              await streamWithMistral(
                controller,
                encoder,
                prompt,
                modelId,
                currentCode,
                history
              );
            } else if (candidate === 'XAI') {
              await streamWithXAI(
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
            } else if (candidate === 'Gemini') {
              await streamWithGemini(
                controller,
                encoder,
                prompt,
                modelId,
                isThinking,
                currentCode,
                history
              );
            } else {
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
          encoder.encode(
            `data: ${JSON.stringify({ error: fallbackMessage })}\n\n`
          )
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

async function streamWithMistral(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  prompt: string,
  modelId: string,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error('Mistral API key is not configured');
  }

  try {
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

    let actualModel = 'mistral-large-latest';
    if (modelId === 'mistral-small') actualModel = 'mistral-small-latest';
    if (modelId === 'codestral') actualModel = 'codestral-latest';

    const stream = await mistral.chat.completions.create({
      model: actualModel,
      messages,
      temperature: 0.72,
      max_tokens: 8192,
      stream: true,
    });

    for await (const chunk of stream) {
      const piece = chunk.choices[0]?.delta?.content;
      const text = Array.isArray(piece) ? piece.join('') : piece;
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
      error instanceof Error ? error.message : 'Mistral stream failed';
    throw new Error(message);
  }
}

async function streamWithXAI(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  prompt: string,
  modelId: string,
  currentCode?: string,
  history?: { role: string; text: string }[]
) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error('xAI API key is not configured');
  }

  try {
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

    const actualModel = modelId && modelId !== 'auto' ? modelId : 'grok-beta';

    const stream = await xai.chat.completions.create({
      model: actualModel,
      messages,
      temperature: 0.7,
      max_tokens: 8192,
      stream: true,
    });

    for await (const chunk of stream) {
      const piece = chunk.choices[0]?.delta?.content;
      const text = Array.isArray(piece) ? piece.join('') : piece;
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
    const message = error instanceof Error ? error.message : 'xAI stream failed';
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
      const piece = chunk.choices[0]?.delta?.content;
      const text = Array.isArray(piece) ? piece.join('') : piece;
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
    if (modelId && modelId.includes('pro')) actualModel = 'gemini-1.5-pro';

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
    throw new Error('Anthropic API key is not configured');
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
