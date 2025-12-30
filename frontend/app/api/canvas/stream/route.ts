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
    throw new Error('OpenAI API key not configured');
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
    throw new Error('Anthropic API key not configured');
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
