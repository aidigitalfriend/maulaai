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

    // Check if user is requesting image generation - flexible patterns
    const imageGenerationPatterns = [
      /create\s+(an?\s+)?image/i,
      /generate\s+(an?\s+)?image/i,
      /make\s+(an?\s+)?image/i,
      /draw\s+(an?\s+)?/i,
      /create\s+(an?\s+)?picture/i,
      /generate\s+(an?\s+)?picture/i,
      /make\s+(an?\s+)?picture/i,
      /create\s+(an?\s+)?photo/i,
      /generate\s+(an?\s+)?photo/i,
      /create\s+art(work)?/i,
      /generate\s+art(work)?/i,
      /design\s+(an?\s+)?image/i,
      /visualize/i,
      /illustration\s+of/i,
      /create\s+.*\.(jpg|jpeg|png|gif)/i,
      /generate\s+.*\.(jpg|jpeg|png|gif)/i,
      // More flexible patterns for different word orders
      /image\s+(create|generate|make)/i,
      /picture\s+(create|generate|make)/i,
      /photo\s+(create|generate|make)/i,
      /(create|make|generate)\s+.{1,50}\s+(image|picture|photo)/i,
      /\b(dawn|sunset|sunrise|landscape|portrait|city|nature|animal|car|house|person|scene)\s+.*\s*(image|picture|photo)\s*(create|generate|make)?/i,
      /\b(image|picture|photo)\s+.{1,30}\s*(create|generate|make)/i,
      // Catch "X image with Y" patterns
      /\w+\s+image\s+(with|in|of|for|on)/i,
    ];

    // Patterns for image editing requests
    const imageEditPatterns = [
      /edit\s+(this\s+)?(image|photo|picture)/i,
      /change\s+(the\s+)?(background|color|style)/i,
      /modify\s+(this\s+)?(image|photo|picture)/i,
      /remove\s+(the\s+)?(background|object|person|text)/i,
      /add\s+.+\s+to\s+(this\s+)?(image|photo|picture)/i,
      /replace\s+.+\s+(in|on)\s+(this\s+)?(image|photo|picture)/i,
      /make\s+(this|the)\s+(image|photo|picture|it)\s+/i,
      /transform\s+(this\s+)?(image|photo|picture)/i,
      /convert\s+(this\s+)?(image|photo|picture)/i,
      /can\s+you\s+edit/i,
      /edit\s+it/i,
      /change\s+it/i,
    ];

    const isImageRequest = imageGenerationPatterns.some(pattern => pattern.test(message));
    const isImageEditRequest = imageEditPatterns.some(pattern => pattern.test(message));
    const hasImageAttachment = attachments?.some((a: any) => a.type?.startsWith('image/'));

    // Handle image editing - when user uploads an image and asks to edit it
    if (isImageEditRequest && hasImageAttachment && apiKeys.openai) {
      console.log('[chat-stream] Detected image edit request with attachment');
      
      // Get the image attachment
      const imageAttachment = attachments.find((a: any) => a.type?.startsWith('image/'));
      const imageUrl = imageAttachment?.url || imageAttachment?.data;
      
      if (imageUrl) {
        try {
          // Step 1: Use GPT-4 Vision to analyze the image
          console.log('[chat-stream] Analyzing image with GPT-4 Vision...');
          const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKeys.openai}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: `Describe this image in detail for image generation. Focus on the main subject, colors, composition, and style. Keep description under 200 words. The user wants to: ${message}`
                    },
                    {
                      type: 'image_url',
                      image_url: { url: imageUrl, detail: 'high' }
                    }
                  ]
                }
              ],
              max_tokens: 500,
            }),
          });

          if (!visionResponse.ok) {
            console.error('[chat-stream] Vision API error:', await visionResponse.text());
            throw new Error('Vision API failed');
          }

          const visionData = await visionResponse.json();
          const imageDescription = visionData.choices?.[0]?.message?.content || '';
          console.log('[chat-stream] Image description:', imageDescription.substring(0, 100) + '...');

          // Step 2: Generate edited image with DALL-E using the description + edit request
          const editPrompt = `Based on this image: ${imageDescription}\n\nApply this edit: ${message}\n\nCreate a new version of the image with the requested changes.`;
          
          console.log('[chat-stream] Generating edited image with DALL-E...');
          const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKeys.openai}`,
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: editPrompt,
              n: 1,
              size: '1024x1024',
              quality: 'standard',
              style: 'vivid',
            }),
          });

          if (dalleResponse.ok) {
            const dalleData = await dalleResponse.json();
            const newImageUrl = dalleData.data?.[0]?.url;
            const revisedPrompt = dalleData.data?.[0]?.revised_prompt;

            if (newImageUrl) {
              console.log('[chat-stream] Edited image generated successfully');
              const encoder = new TextEncoder();
              const editResultStream = new ReadableStream({
                start(controller) {
                  const resultMessage = `✨ **Image Edited Successfully!**

![edited-image-${Date.now()}.png](${newImageUrl})

**What I did:** I analyzed your original image and created a new version with the requested changes: "${message}"

**Note:** This is a newly generated image based on your original. Some details may differ from the original.`;
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: resultMessage })}\n\n`));
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                  controller.close();
                }
              });

              return new Response(editResultStream, {
                headers: {
                  'Content-Type': 'text/event-stream',
                  'Cache-Control': 'no-cache',
                  Connection: 'keep-alive',
                  'X-Accel-Buffering': 'no',
                },
              });
            }
          } else {
            console.error('[chat-stream] DALL-E edit error:', await dalleResponse.text());
          }
        } catch (editError) {
          console.error('[chat-stream] Image edit error:', editError);
          // Fall through to regular chat
        }
      }
    }

    // If it's an image request and we have OpenAI API key, generate image
    if (isImageRequest && apiKeys.openai) {
      console.log('[chat-stream] Detected image generation request, prompt:', message);
      
      // Extract the image prompt from the message
      const imagePrompt = message
        .replace(/create\s+(an?\s+)?image\s+(of\s+)?/i, '')
        .replace(/generate\s+(an?\s+)?image\s+(of\s+)?/i, '')
        .replace(/make\s+(an?\s+)?image\s+(of\s+)?/i, '')
        .replace(/draw\s+(an?\s+)?/i, '')
        .replace(/create\s+(an?\s+)?picture\s+(of\s+)?/i, '')
        .replace(/generate\s+(an?\s+)?picture\s+(of\s+)?/i, '')
        .replace(/please/gi, '')
        .trim() || message;

      console.log('[chat-stream] Extracted image prompt:', imagePrompt);

      try {
        // Create abort controller with 60 second timeout for DALL-E
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        console.log('[chat-stream] Calling DALL-E API...');
        // Call DALL-E API directly
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKeys.openai}`,
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid',
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log('[chat-stream] DALL-E API response status:', imageResponse.status);

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const imageUrl = imageData.data?.[0]?.url;
          const revisedPrompt = imageData.data?.[0]?.revised_prompt;

          if (imageUrl) {
            console.log('[chat-stream] Image generated successfully, URL:', imageUrl.substring(0, 100) + '...');
            
            // Return image in the response using the token format
            // Use markdown image format which frontend already handles with download button
            const encoder = new TextEncoder();
            const imageResultStream = new ReadableStream({
              start(controller) {
                // Use standard markdown image - frontend has custom img renderer with download button
                const resultMessage = `🎨 **Image Generated Successfully!**

![generated-image-${Date.now()}.png](${imageUrl})

**Prompt Used:** ${revisedPrompt || imagePrompt}`;
                
                // Send as streaming chunks using token format (matches regular chat)
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: resultMessage })}\n\n`));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                controller.close();
              }
            });

            return new Response(imageResultStream, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
                'X-Accel-Buffering': 'no',
              },
            });
          }
        } else {
          console.error('[chat-stream] DALL-E API error:', await imageResponse.text());
          // Fall through to regular chat if image generation fails
        }
      } catch (imageError) {
        console.error('[chat-stream] Image generation error:', imageError);
        // Fall through to regular chat if image generation fails
      }
    }

    // Create streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Build messages array
          const messages: any[] = [];

          // Enhance system prompt with image generation and editing capabilities
          const enhancedSystemPrompt = systemPrompt 
            ? `${systemPrompt}\n\n[IMPORTANT CAPABILITIES] You have the following image abilities:
1. IMAGE GENERATION: You CAN create new images! When a user asks you to create, generate, make, or draw an image, picture, or artwork, acknowledge their request - the system will automatically generate the image using DALL-E.
2. IMAGE EDITING: You CAN edit images! When a user uploads an image and asks to edit it (change background, modify colors, add/remove elements, etc.), acknowledge their request - the system will analyze the image and generate an edited version.
Do NOT say you cannot create or edit images. Do NOT suggest using external tools like Canva, Photoshop, or other websites. You have built-in image generation and editing capabilities.`
            : `You are a helpful AI assistant with image generation and editing capabilities. You CAN create new images and edit uploaded images. When asked, acknowledge the request - the system handles the actual generation/editing.`;

          if (enhancedSystemPrompt) {
            messages.push({ role: 'system', content: enhancedSystemPrompt });
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
