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
const RATE_LIMIT_MAX_MESSAGES = 200; // 200 messages per hour - increased for better UX

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
      userId: requestUserId,
      agentId,
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
      /can\s+you\s+edit/i,
      /edit\s+it/i,
      /change\s+it/i,
      // Enhancement/fix patterns
      /fix\s+(this\s+)?(image|photo|picture|it)/i,
      /fix\s+(the\s+)?(clarity|quality|blur|blurr?iness|resolution)/i,
      /enhance\s+(this\s+)?(image|photo|picture|it)/i,
      /improve\s+(this\s+)?(image|photo|picture|it)/i,
      /improve\s+(the\s+)?(clarity|quality|resolution)/i,
      /upscale\s+(this\s+)?(image|photo|picture|it)/i,
      /sharpen\s+(this\s+)?(image|photo|picture|it)/i,
      /clear\s+up\s+(this\s+)?(image|photo|picture|it)/i,
      /make\s+(it|this)\s+(clear|clearer|sharper|better)/i,
      /increase\s+(the\s+)?(resolution|quality|clarity)/i,
      /reduce\s+(the\s+)?(blur|noise|grain)/i,
      /denoise\s+(this\s+)?(image|photo|picture|it)?/i,
      /clean\s+up\s+(this\s+)?(image|photo|picture|it)/i,
      /(pixelat|blur|fuzzy|grainy)\w*\s*(fix|improve|enhance|remove)/i,
    ];

    // Patterns for image format conversion
    const imageConvertPatterns = [
      /convert\s+(this\s+)?(image|photo|picture|file|it)?\s*(to|into)\s*(png|jpg|jpeg|webp)/i,
      /save\s+(this\s+)?(image|photo|picture|it)?\s*(as|to)\s*(png|jpg|jpeg|webp)/i,
      /(to|into|as)\s*(\.?)(png|jpg|jpeg|webp)\s*(format|file)?/i,
      /change\s+(to|into)\s*(png|jpg|jpeg|webp)/i,
      /make\s+(it\s+)?(a\s+)?(png|jpg|jpeg|webp)/i,
      /(png|jpg|jpeg|webp)\s*(conversion|convert)/i,
    ];

    // Patterns for file operations
    const fileOperationPatterns = [
      // Create file
      /create\s+(a\s+)?(new\s+)?file/i,
      /make\s+(a\s+)?(new\s+)?file/i,
      /save\s+(this\s+)?(as\s+)?(a\s+)?file/i,
      /write\s+(to\s+)?(a\s+)?file/i,
      /generate\s+(a\s+)?file/i,
      /create\s+.+\.(txt|py|js|ts|json|md|html|css|csv|xml|yaml|yml)/i,
      /save\s+.+\.(txt|py|js|ts|json|md|html|css|csv|xml|yaml|yml)/i,
      // Read file
      /read\s+(the\s+)?file/i,
      /open\s+(the\s+)?file/i,
      /show\s+(me\s+)?(the\s+)?file/i,
      /view\s+(the\s+)?file/i,
      /what('s| is)\s+in\s+(the\s+)?file/i,
      // List files
      /list\s+(all\s+)?(my\s+)?files/i,
      /show\s+(all\s+)?(my\s+)?files/i,
      /what\s+files\s+(do\s+i\s+have|exist)/i,
      // Delete file
      /delete\s+(the\s+)?file/i,
      /remove\s+(the\s+)?file/i,
      // Modify file
      /edit\s+(the\s+)?file/i,
      /update\s+(the\s+)?file/i,
      /modify\s+(the\s+)?file/i,
      /change\s+(the\s+)?file/i,
      /append\s+to\s+(the\s+)?file/i,
      // Zip operations
      /zip\s+(the\s+)?files?/i,
      /create\s+(a\s+)?zip/i,
      /compress\s+(the\s+)?files?/i,
      /unzip\s+(the\s+)?file/i,
      /extract\s+(the\s+)?zip/i,
    ];

    const isFileOperation = fileOperationPatterns.some(pattern => pattern.test(message));

    const isImageRequest = imageGenerationPatterns.some(pattern => pattern.test(message));
    const isImageEditRequest = imageEditPatterns.some(pattern => pattern.test(message));
    const isImageConvertRequest = imageConvertPatterns.some(pattern => pattern.test(message));
    const hasImageAttachment = attachments?.some((a: any) => a.type?.startsWith('image/'));
    
    // Check if there's a recently generated image in conversation history
    // Look for base64 image data URLs in previous assistant messages
    let recentImageFromHistory: string | null = null;
    if (isImageConvertRequest && !hasImageAttachment && conversationHistory.length > 0) {
      // Search conversation history (most recent first) for generated images
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const msg = conversationHistory[i];
        if (msg.role === 'assistant' && msg.content) {
          // Look for base64 image data URLs in markdown format ![...](data:image/...)
          const base64Match = msg.content.match(/!\[.*?\]\((data:image\/[^)]+)\)/);
          if (base64Match) {
            recentImageFromHistory = base64Match[1];
            console.log('[chat-stream] Found recent image in conversation history');
            break;
          }
          // Also check for S3/remote image URLs
          const urlMatch = msg.content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
          if (urlMatch) {
            recentImageFromHistory = urlMatch[1];
            console.log('[chat-stream] Found recent image URL in conversation history');
            break;
          }
        }
      }
    }
    
    const hasImageToConvert = hasImageAttachment || recentImageFromHistory;

    // Handle image format conversion - when user uploads an image OR has recently generated one
    if (isImageConvertRequest && hasImageToConvert) {
      console.log('[chat-stream] Detected image conversion request');
      console.log('[chat-stream] Has attachment:', hasImageAttachment, 'Has history image:', !!recentImageFromHistory);
      if (attachments.length > 0) {
        console.log('[chat-stream] Attachments:', JSON.stringify(attachments.map((a: any) => ({ 
          name: a.name, 
          type: a.type, 
          hasUrl: !!a.url, 
          hasData: !!a.data,
          dataPrefix: a.data?.substring(0, 50) 
        }))));
      }
      
      // Extract target format from message - handle with or without dot prefix
      const formatMatch = message.match(/\.?(png|jpg|jpeg|webp)\b/i);
      const targetFormat = formatMatch ? formatMatch[1].toLowerCase() : 'png';
      console.log('[chat-stream] Requested format from message:', message, '-> detected:', targetFormat);
      const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
      const outputExtension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
      
      // Get the image - prefer attachment, fallback to history image
      const imageAttachment = attachments.find((a: any) => a.type?.startsWith('image/'));
      const imageData = imageAttachment?.data;
      // Priority: attachment data URL > attachment URL > history image
      const imageUrl = (imageData && imageData.startsWith('data:')) 
        ? imageData 
        : (imageAttachment?.url || imageData || recentImageFromHistory);
      
      if (imageUrl) {
        console.log('[chat-stream] Starting image conversion to', targetFormat.toUpperCase());
        try {
          // Fetch the image
          let imageBuffer: Buffer;
          
          if (imageUrl.startsWith('data:')) {
            // Base64 data URL
            const base64Data = imageUrl.split(',')[1];
            imageBuffer = Buffer.from(base64Data, 'base64');
          } else {
            // Remote URL
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) throw new Error('Failed to fetch image');
            const arrayBuffer = await imageResponse.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
          }
          
          // Try to use sharp for conversion, fallback to returning as-is
          let outputBuffer = imageBuffer;
          let convertedFormat = targetFormat;
          
          try {
            const sharp = (await import('sharp')).default;
            let processor = sharp(imageBuffer);
            
            switch (targetFormat) {
              case 'jpeg':
              case 'jpg':
                outputBuffer = await processor.jpeg({ quality: 90 }).toBuffer();
                convertedFormat = 'jpeg';
                break;
              case 'webp':
                outputBuffer = await processor.webp({ quality: 90 }).toBuffer();
                break;
              case 'png':
              default:
                outputBuffer = await processor.png().toBuffer();
                convertedFormat = 'png';
                break;
            }
          } catch (sharpError) {
            console.log('[chat-stream] Sharp not available, returning original image');
            // If sharp is not available, just return the original buffer
          }
          
          // Convert to base64 data URL - use user-friendly extension
          const base64Image = outputBuffer.toString('base64');
          const displayFormat = convertedFormat === 'jpeg' ? 'JPG' : convertedFormat.toUpperCase();
          const fileExtension = convertedFormat === 'jpeg' ? 'jpg' : convertedFormat;
          const dataUrl = `data:image/${convertedFormat};base64,${base64Image}`;
          const filename = `converted-image-${Date.now()}.${fileExtension}`;
          
          console.log('[chat-stream] Image converted successfully to', displayFormat);
          
          const encoder = new TextEncoder();
          const convertResultStream = new ReadableStream({
            start(controller) {
              const resultMessage = `✅ **Image Converted to ${displayFormat}!**

Here's your converted image:

![${filename}](${dataUrl})

**Filename:** ${filename}

*Hover over the image to download, or right-click to save.*`;
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: resultMessage })}\n\n`));
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
              controller.close();
            }
          });

          return new Response(convertResultStream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
              'X-Accel-Buffering': 'no',
            },
          });
        } catch (convertError) {
          console.error('[chat-stream] Image conversion error:', convertError);
          // Fall through to regular chat
        }
      }
    }

    // Handle file operations - create, read, list, delete, modify files
    if (isFileOperation) {
      console.log('[chat-stream] Detected file operation request');
      
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005';
      const userId = requestUserId || 'default';
      
      try {
        // Determine the type of file operation
        const lowerMessage = message.toLowerCase();
        
        // CREATE FILE
        if (/create|make|save|write|generate/.test(lowerMessage) && /file|\.txt|\.py|\.js|\.ts|\.json|\.md|\.html|\.css/.test(lowerMessage)) {
          // Extract filename from message
          const filenameMatch = message.match(/(?:called|named|as|file:?)\s*["']?([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)["']?/i) ||
                               message.match(/["']([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)["']/i) ||
                               message.match(/([a-zA-Z0-9_-]+\.(txt|py|js|ts|json|md|html|css|csv|xml|yaml|yml))/i);
          
          if (filenameMatch) {
            const filename = filenameMatch[1];
            // Extract content between code blocks or after "content:" or "with:"
            const contentMatch = message.match(/```[\w]*\n?([\s\S]*?)```/i) ||
                                message.match(/(?:content|with|containing)[:=]?\s*["']?([\s\S]+?)["']?$/i);
            const content = contentMatch ? contentMatch[1].trim() : '// File created by AI agent\n';
            
            const response = await fetch(`${backendUrl}/api/agents/files/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename, content, userId }),
            });
            
            const result = await response.json();
            
            const encoder = new TextEncoder();
            const fileResultStream = new ReadableStream({
              start(controller) {
                const resultMessage = result.success
                  ? `✅ **File Created Successfully!**\n\n**Filename:** \`${filename}\`\n**Size:** ${result.size} bytes\n\n📁 Your file has been saved to your workspace.`
                  : `❌ **File Creation Failed**\n\n${result.error}`;
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: resultMessage })}\n\n`));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                controller.close();
              }
            });
            
            return new Response(fileResultStream, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              },
            });
          }
        }
        
        // LIST FILES
        if (/list|show|what files/.test(lowerMessage)) {
          const response = await fetch(`${backendUrl}/api/agents/files/list?userId=${userId}`);
          const result = await response.json();
          
          const encoder = new TextEncoder();
          const listResultStream = new ReadableStream({
            start(controller) {
              let resultMessage = '📁 **Your Files:**\n\n';
              
              if (result.success && result.files && result.files.length > 0) {
                result.files.forEach((f: any) => {
                  const icon = f.type === 'folder' ? '📂' : '📄';
                  const size = f.size ? ` (${f.size} bytes)` : '';
                  resultMessage += `${icon} \`${f.name}\`${size}\n`;
                });
                resultMessage += `\n**Total:** ${result.totalFiles} files, ${result.totalFolders} folders`;
              } else {
                resultMessage = '📁 **Your workspace is empty.**\n\nCreate a file by saying "create a file called example.txt"';
              }
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: resultMessage })}\n\n`));
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
              controller.close();
            }
          });
          
          return new Response(listResultStream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            },
          });
        }
        
        // READ FILE
        if (/read|open|show|view|what('s| is) in/.test(lowerMessage)) {
          const filenameMatch = message.match(/(?:file|read|open|view)\s*["']?([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)["']?/i) ||
                               message.match(/["']([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)["']/i);
          
          if (filenameMatch) {
            const filename = filenameMatch[1];
            const response = await fetch(`${backendUrl}/api/agents/files/read?filename=${encodeURIComponent(filename)}&userId=${userId}`);
            const result = await response.json();
            
            const encoder = new TextEncoder();
            const readResultStream = new ReadableStream({
              start(controller) {
                const resultMessage = result.success
                  ? `📄 **File: \`${filename}\`**\n\n\`\`\`\n${result.content}\n\`\`\`\n\n*Size: ${result.size} bytes*`
                  : `❌ **Could not read file**\n\n${result.error}`;
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: resultMessage })}\n\n`));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                controller.close();
              }
            });
            
            return new Response(readResultStream, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              },
            });
          }
        }
        
        // DELETE FILE
        if (/delete|remove/.test(lowerMessage)) {
          const filenameMatch = message.match(/(?:delete|remove)\s*(?:the\s+)?(?:file\s+)?["']?([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)["']?/i);
          
          if (filenameMatch) {
            const filename = filenameMatch[1];
            const response = await fetch(`${backendUrl}/api/agents/files/delete?filename=${encodeURIComponent(filename)}&userId=${userId}`, {
              method: 'DELETE',
            });
            const result = await response.json();
            
            const encoder = new TextEncoder();
            const deleteResultStream = new ReadableStream({
              start(controller) {
                const resultMessage = result.success
                  ? `🗑️ **File Deleted**\n\n\`${filename}\` has been removed from your workspace.`
                  : `❌ **Could not delete file**\n\n${result.error}`;
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: resultMessage })}\n\n`));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                controller.close();
              }
            });
            
            return new Response(deleteResultStream, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              },
            });
          }
        }
      } catch (fileError) {
        console.error('[chat-stream] File operation error:', fileError);
        // Fall through to regular chat
      }
    }

    // Handle image editing - when user uploads an image OR asks to edit a recently generated image
    const hasImageToEdit = hasImageAttachment || recentImageFromHistory;
    if (isImageEditRequest && hasImageToEdit && apiKeys.openai) {
      console.log('[chat-stream] Detected image edit request, hasAttachment:', hasImageAttachment, 'hasHistoryImage:', !!recentImageFromHistory);
      
      // Get the image - prefer attachment, fallback to history image
      const imageAttachment = attachments.find((a: any) => a.type?.startsWith('image/'));
      const imageUrl = imageAttachment?.url || imageAttachment?.data || recentImageFromHistory;
      
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
                      text: `Briefly describe this image for recreation (max 150 words). Include: main subject, colors, style, background. User wants to: ${message.substring(0, 200)}`
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
          let imageDescription = visionData.choices?.[0]?.message?.content || '';
          // Limit description to prevent DALL-E prompt overflow (max 4000 chars total)
          if (imageDescription.length > 2500) {
            imageDescription = imageDescription.substring(0, 2500) + '...';
          }
          console.log('[chat-stream] Image description:', imageDescription.substring(0, 100) + '...');

          // Step 2: Generate edited image with DALL-E using the description + edit request
          // Keep prompt under 4000 chars
          const userRequest = message.length > 500 ? message.substring(0, 500) : message;
          const editPrompt = `Recreate this image with modifications: ${imageDescription}\n\nApply this change: ${userRequest}`;
          
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
              response_format: 'b64_json', // Get base64 to avoid expiring Azure URLs
            }),
          });

          if (dalleResponse.ok) {
            const dalleData = await dalleResponse.json();
            const base64Image = dalleData.data?.[0]?.b64_json;
            const revisedPrompt = dalleData.data?.[0]?.revised_prompt;

            if (base64Image) {
              const imageDataUrl = `data:image/png;base64,${base64Image}`;
              const filename = `edited-image-${Date.now()}.png`;
              console.log('[chat-stream] Edited image generated successfully');
              const encoder = new TextEncoder();
              const editResultStream = new ReadableStream({
                start(controller) {
                  const resultMessage = `✨ **Image Edited Successfully!**

![${filename}](${imageDataUrl})

*Hover over the image to download, or right-click to save.*`;
                  
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
        // Call DALL-E API directly - use b64_json to avoid expiring Azure URLs
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
            response_format: 'b64_json', // Get base64 to avoid expiring Azure URLs
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log('[chat-stream] DALL-E API response status:', imageResponse.status);

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const base64Image = imageData.data?.[0]?.b64_json;
          const revisedPrompt = imageData.data?.[0]?.revised_prompt;

          if (base64Image) {
            // Convert to data URL for display
            const imageDataUrl = `data:image/png;base64,${base64Image}`;
            const filename = `generated-image-${Date.now()}.png`;
            console.log('[chat-stream] Image generated successfully');
            
            // Return image in the response using the token format
            // Use markdown image format which frontend already handles with download button
            const encoder = new TextEncoder();
            const imageResultStream = new ReadableStream({
              start(controller) {
                // Use standard markdown image - frontend has custom img renderer with download button
                const resultMessage = `🎨 **Image Generated Successfully!**

![${filename}](${imageDataUrl})

*Hover over the image to download, or right-click to save.*`;
                
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

          // Add conversation history - but filter out base64 image data to prevent token overflow
          for (const msg of conversationHistory) {
            let content = msg.content;
            
            // Strip base64 image data URLs from content (they can be 2MB+ and cause token limit errors)
            // Replace with a placeholder so the AI knows an image was there
            if (content && typeof content === 'string') {
              // Match markdown images with base64 data URLs: ![alt](data:image/...)
              content = content.replace(/!\[([^\]]*)\]\(data:image\/[^)]+\)/g, '[Generated Image: $1]');
              // Also match standalone base64 data URLs
              content = content.replace(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]{100,}/g, '[base64 image data removed]');
            }
            
            messages.push({
              role: msg.role,
              content: content,
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
                    model: model || 'claude-sonnet-4-20250514',  // Latest Claude Sonnet 4
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
              'mistral-large-2411'  // Latest Mistral Large 2
            );
          } else if (provider === 'xai' && apiKeys.xai) {
            // xAI Grok uses OpenAI-compatible API
            hadError = await streamOpenAICompatible(
              'https://api.x.ai/v1/chat/completions',
              apiKeys.xai,
              'grok-3'  // Latest Grok 3
            );
          } else if (provider === 'groq' && apiKeys.groq) {
            // Groq uses OpenAI-compatible API
            hadError = await streamOpenAICompatible(
              'https://api.groq.com/openai/v1/chat/completions',
              apiKeys.groq,
              'llama-3.3-70b-specdec'  // Ultra-fast with speculative decoding
            );
          } else if (provider === 'cerebras' && apiKeys.cerebras) {
            // Cerebras uses OpenAI-compatible API
            hadError = await streamOpenAICompatible(
              'https://api.cerebras.ai/v1/chat/completions',
              apiKeys.cerebras,
              'llama-3.3-70b'  // Fast inference
            );
          } else if (provider === 'openai' && apiKeys.openai) {
            // OpenAI with automatic failover to backup key
            hadError = await streamOpenAICompatible(
              'https://api.openai.com/v1/chat/completions',
              apiKeys.openai,
              'gpt-4.1'  // Latest GPT-4.1
            );
            
            // If primary key failed and we have a backup, try it
            if (hadError && apiKeys.openaiBackup) {
              console.log('[chat-stream] Primary OpenAI key failed, trying backup key...');
              hadError = await streamOpenAICompatible(
                'https://api.openai.com/v1/chat/completions',
                apiKeys.openaiBackup,
                'gpt-4.1'  // Latest GPT-4.1
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
              'gpt-4.1'  // Latest GPT-4.1
            );
            
            // If primary key failed and we have a backup, try it
            if (hadError && apiKeys.openaiBackup) {
              console.log('[chat-stream] Primary OpenAI key failed in fallback, trying backup...');
              hadError = await streamOpenAICompatible(
                'https://api.openai.com/v1/chat/completions',
                apiKeys.openaiBackup,
                'gpt-4.1'  // Latest GPT-4.1
              );
            }
          } else if (apiKeys.openaiBackup) {
            // Try backup OpenAI key if primary not set
            console.log('[chat-stream] No primary OpenAI key, using backup key');
            hadError = await streamOpenAICompatible(
              'https://api.openai.com/v1/chat/completions',
              apiKeys.openaiBackup,
              'gpt-4.1'  // Latest GPT-4.1
            );
          } else if (apiKeys.mistral) {
            // Fallback to Mistral
            console.log(`[chat-stream] No OpenAI key, falling back to Mistral`);
            hadError = await streamOpenAICompatible(
              'https://api.mistral.ai/v1/chat/completions',
              apiKeys.mistral,
              'mistral-large-2411'  // Latest Mistral Large 2
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
