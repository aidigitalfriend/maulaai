import { NextRequest } from 'next/server';

// Initialize API keys from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const XAI_API_KEY = process.env.XAI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_MESSAGES = 50; // 50 messages per hour

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0]
    : req.headers.get('x-real-ip') || 'unknown';
  return `agent-stream-${ip}`;
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

interface Attachment {
  name?: string;
  type?: string;
  url?: string;
  data?: string;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request);
    const rateLimit = checkRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please try again later.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const {
      message,
      conversationHistory = [],
      provider = 'openai',
      model,
      temperature = 0.7,
      maxTokens = 1200,
      systemPrompt,
      attachments = [],
    } = body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Build messages array
          const messages: any[] = [];

          if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
          }

          // Add conversation history
          for (const msg of conversationHistory) {
            messages.push({
              role: msg.role,
              content: msg.content,
            });
          }

          // Build user message content
          const userContent: any[] = [{ type: 'text', text: message }];

          // Add image attachments
          if (attachments && attachments.length > 0) {
            for (const attachment of attachments) {
              if (attachment.type?.startsWith('image/')) {
                if (attachment.url) {
                  userContent.push({
                    type: 'image_url',
                    image_url: { url: attachment.url, detail: 'auto' },
                  });
                } else if (attachment.data) {
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

          messages.push({
            role: 'user',
            content: userContent.length === 1 ? message : userContent,
          });

          // Helper function to stream OpenAI-compatible responses
          // Returns true if controller was closed due to error
          async function streamOpenAICompatible(
            apiUrl: string,
            apiKey: string,
            defaultModel: string
          ): Promise<boolean> {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: model || defaultModel,
                messages,
                temperature,
                max_tokens: maxTokens,
                stream: true,
              }),
            });

            if (!response.ok) {
              const errorData = await response.text();
              console.error(`API error (${apiUrl}):`, errorData);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: `API error: ${response.status}` })}\n\n`
                )
              );
              return true; // Indicate error occurred
            }

            const reader = response.body?.getReader();
            if (!reader) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: 'No reader available' })}\n\n`
                )
              );
              return true;
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    const token = parsed.choices?.[0]?.delta?.content;
                    if (token) {
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
                      );
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
            return false; // No error
          }

          // Route to the appropriate provider
          let hadError = false;
          
          if (provider === 'anthropic' && ANTHROPIC_API_KEY) {
            // Anthropic streaming (different format)
            const systemMessage = messages.find((m) => m.role === 'system');
            const chatMessages = messages.filter((m) => m.role !== 'system');

            try {
              const response = await fetch(
                'https://api.anthropic.com/v1/messages',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01',
                  },
                  body: JSON.stringify({
                    model: model || 'claude-sonnet-4-20250514',
                    max_tokens: maxTokens,
                    temperature,
                    system:
                      systemMessage?.content || 'You are a helpful AI assistant.',
                    messages: chatMessages.map((m) => ({
                      role: m.role,
                      content:
                        typeof m.content === 'string' ? m.content : m.content,
                    })),
                    stream: true,
                  }),
                }
              );

              if (!response.ok) {
                const errorData = await response.text();
                console.error('Anthropic API error:', errorData);
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ error: `Anthropic API error: ${response.status}` })}\n\n`
                  )
                );
                hadError = true;
              } else {
                const reader = response.body?.getReader();
                if (!reader) {
                  hadError = true;
                } else {
                  const decoder = new TextDecoder();
                  let buffer = '';

                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                      if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                          const parsed = JSON.parse(data);
                          if (
                            parsed.type === 'content_block_delta' &&
                            parsed.delta?.text
                          ) {
                            controller.enqueue(
                              encoder.encode(
                                `data: ${JSON.stringify({ token: parsed.delta.text })}\n\n`
                              )
                            );
                          }
                        } catch (e) {
                          // Skip invalid JSON
                        }
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Anthropic streaming error:', error);
              hadError = true;
            }
          } else if (provider === 'mistral' && MISTRAL_API_KEY) {
            // Mistral uses OpenAI-compatible API
            hadError = await streamOpenAICompatible(
              'https://api.mistral.ai/v1/chat/completions',
              MISTRAL_API_KEY,
              'mistral-large-latest'
            );
          } else if (provider === 'xai' && XAI_API_KEY) {
            // xAI Grok uses OpenAI-compatible API
            hadError = await streamOpenAICompatible(
              'https://api.x.ai/v1/chat/completions',
              XAI_API_KEY,
              'grok-3'
            );
          } else if (provider === 'groq' && GROQ_API_KEY) {
            // Groq uses OpenAI-compatible API
            hadError = await streamOpenAICompatible(
              'https://api.groq.com/openai/v1/chat/completions',
              GROQ_API_KEY,
              'llama-3.3-70b-versatile'
            );
          } else if (provider === 'openai' && OPENAI_API_KEY) {
            // OpenAI
            hadError = await streamOpenAICompatible(
              'https://api.openai.com/v1/chat/completions',
              OPENAI_API_KEY,
              'gpt-4o'
            );
          } else if (OPENAI_API_KEY) {
            // Fallback to OpenAI if provider not available
            console.log(`Provider ${provider} not available, falling back to OpenAI`);
            hadError = await streamOpenAICompatible(
              'https://api.openai.com/v1/chat/completions',
              OPENAI_API_KEY,
              'gpt-4o'
            );
          } else if (MISTRAL_API_KEY) {
            // Fallback to Mistral
            console.log(`No OpenAI key, falling back to Mistral`);
            hadError = await streamOpenAICompatible(
              'https://api.mistral.ai/v1/chat/completions',
              MISTRAL_API_KEY,
              'mistral-large-latest'
            );
          } else {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: 'No API key configured for the selected provider' })}\n\n`
              )
            );
            hadError = true;
          }

          // Send done signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: 'Streaming failed: ' + (error as Error).message })}\n\n`
              )
            );
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
            );
            controller.close();
          } catch (closeError) {
            // Controller already closed, ignore
          }
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
    console.error('Stream API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
