import { NextRequest } from 'next/server';

// Helper function to get API keys at request time
// This ensures environment variables are read dynamically
function getApiKeys() {
  return {
    openai: process.env.OPENAI_API_KEY,
    openaiBackup: process.env.OPENAI_API_KEY_BACKUP, // Backup key for failover
    anthropic: process.env.ANTHROPIC_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    xai: process.env.XAI_API_KEY,
    groq: process.env.GROQ_API_KEY,
    cerebras: process.env.CEREBRAS_API_KEY,
  };
}

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

    // Get API keys at request time
    const apiKeys = getApiKeys();
    
    // Log available providers for debugging
    console.log(`[chat-stream] Request provider: ${provider}, model: ${model}`);
    console.log(`[chat-stream] Available providers: openai=${!!apiKeys.openai}, anthropic=${!!apiKeys.anthropic}, mistral=${!!apiKeys.mistral}, xai=${!!apiKeys.xai}, groq=${!!apiKeys.groq}, cerebras=${!!apiKeys.cerebras}`);

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
          
          if (provider === 'anthropic' && apiKeys.anthropic) {
            // Anthropic streaming (different format)
            const systemMessage = messages.find((m) => m.role === 'system');
            // Filter out empty messages and system messages for Anthropic
            const chatMessages = messages
              .filter((m) => m.role !== 'system')
              .filter((m) => {
                const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
                return content && content.trim().length > 0;
              });

            try {
              const response = await fetch(
                'https://api.anthropic.com/v1/messages',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKeys.anthropic,
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
          } else if (provider === 'mistral' && apiKeys.mistral) {
            // Mistral uses OpenAI-compatible API
            hadError = await streamOpenAICompatible(
              'https://api.mistral.ai/v1/chat/completions',
              apiKeys.mistral,
              'mistral-large-latest'
            );
          } else if (provider === 'xai' && apiKeys.xai) {
            // xAI Grok uses OpenAI-compatible API
            hadError = await streamOpenAICompatible(
              'https://api.x.ai/v1/chat/completions',
              apiKeys.xai,
              'grok-3'
            );
          } else if (provider === 'groq' && apiKeys.groq) {
            // Groq uses OpenAI-compatible API
            hadError = await streamOpenAICompatible(
              'https://api.groq.com/openai/v1/chat/completions',
              apiKeys.groq,
              'llama-3.3-70b-versatile'
            );
          } else if (provider === 'cerebras' && apiKeys.cerebras) {
            // Cerebras uses OpenAI-compatible API
            hadError = await streamOpenAICompatible(
              'https://api.cerebras.ai/v1/chat/completions',
              apiKeys.cerebras,
              'llama-3.3-70b'
            );
          } else if (provider === 'openai' && apiKeys.openai) {
            // OpenAI with automatic failover to backup key
            hadError = await streamOpenAICompatible(
              'https://api.openai.com/v1/chat/completions',
              apiKeys.openai,
              'gpt-4o-mini'
            );
            
            // If primary key failed and we have a backup, try it
            if (hadError && apiKeys.openaiBackup) {
              console.log('[chat-stream] Primary OpenAI key failed, trying backup key...');
              hadError = await streamOpenAICompatible(
                'https://api.openai.com/v1/chat/completions',
                apiKeys.openaiBackup,
                'gpt-4o-mini'
              );
              if (!hadError) {
                console.log('[chat-stream] ✅ Backup OpenAI key succeeded!');
              }
            }
          } else if (apiKeys.openai) {
            // Fallback to OpenAI if provider not available
            console.log(`[chat-stream] Provider ${provider} not available, falling back to OpenAI`);
            hadError = await streamOpenAICompatible(
              'https://api.openai.com/v1/chat/completions',
              apiKeys.openai,
              'gpt-4o-mini'
            );
            
            // If primary key failed and we have a backup, try it
            if (hadError && apiKeys.openaiBackup) {
              console.log('[chat-stream] Primary OpenAI key failed in fallback, trying backup...');
              hadError = await streamOpenAICompatible(
                'https://api.openai.com/v1/chat/completions',
                apiKeys.openaiBackup,
                'gpt-4o-mini'
              );
            }
          } else if (apiKeys.openaiBackup) {
            // Try backup OpenAI key if primary not set
            console.log('[chat-stream] No primary OpenAI key, using backup key');
            hadError = await streamOpenAICompatible(
              'https://api.openai.com/v1/chat/completions',
              apiKeys.openaiBackup,
              'gpt-4o-mini'
            );
          } else if (apiKeys.mistral) {
            // Fallback to Mistral
            console.log(`[chat-stream] No OpenAI key, falling back to Mistral`);
            hadError = await streamOpenAICompatible(
              'https://api.mistral.ai/v1/chat/completions',
              apiKeys.mistral,
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
