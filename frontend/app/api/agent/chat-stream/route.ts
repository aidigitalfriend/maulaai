import { NextRequest } from 'next/server';
import { 
  getAgentConfig, 
  getModelForAgent, 
  ChatMode, 
  PROVIDER_MODELS,
  PROVIDER_CONFIGS,
  getProviderModels,
  getFallbackModels,
  getModelWithCapability,
  getNextModel,
  ProviderName
} from '@/lib/agent-provider-config';

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
    gemini: process.env.GEMINI_API_KEY,
  };
}

// Track failed models to avoid retrying them immediately
const failedModelsCache = new Map<string, { timestamp: number; models: Set<string> }>();
const FAILED_MODEL_COOLDOWN = 60000; // 1 minute cooldown for failed models

function getAvailableModels(provider: ProviderName, excludeModel?: string): string[] {
  const cacheKey = provider;
  const cached = failedModelsCache.get(cacheKey);
  const now = Date.now();
  
  // Clean up expired failures
  if (cached && now - cached.timestamp > FAILED_MODEL_COOLDOWN) {
    failedModelsCache.delete(cacheKey);
  }
  
  const failedModels = failedModelsCache.get(cacheKey)?.models || new Set();
  const allModels = getProviderModels(provider).map(m => m.id);
  
  return allModels.filter(m => m !== excludeModel && !failedModels.has(m));
}

function markModelFailed(provider: ProviderName, modelId: string) {
  const cacheKey = provider;
  const existing = failedModelsCache.get(cacheKey);
  
  if (existing) {
    existing.models.add(modelId);
    existing.timestamp = Date.now();
  } else {
    failedModelsCache.set(cacheKey, {
      timestamp: Date.now(),
      models: new Set([modelId])
    });
  }
}

// Helper function to generate user-friendly error messages with suggestions
function getUserFriendlyError(errorType: string, details?: string, provider?: string): string {
  const settingsHint = `\n\n💡 **Tip:** Click the ⚙️ Settings icon (top right) to change your AI model or provider.`;
  
  switch (errorType) {
    case 'image_format':
      return `⚠️ **Image Processing Issue**\n\nThe current AI model (${provider || 'selected'}) had trouble processing your image. This can happen with certain image formats or sizes.\n\n**Suggested solutions:**\n• Try a different AI provider like OpenAI (GPT-4o) which has excellent vision capabilities\n• Resize the image to a smaller size\n• Convert the image to PNG or JPEG format${settingsHint}`;
    
    case 'image_not_supported':
      return `⚠️ **Image Vision Not Supported**\n\nThe current AI model doesn't support image analysis.\n\n**Models with vision support:**\n• OpenAI: GPT-4o, GPT-4 Turbo\n• Anthropic: Claude Sonnet 4, Claude Opus 4\n• Google: Gemini Pro Vision${settingsHint}`;
    
    case 'image_generation_failed':
      return `⚠️ **Image Generation Failed**\n\n${details || 'The image could not be generated.'}\n\n**Suggested solutions:**\n• Try simplifying your image description\n• Remove any potentially problematic content\n• Try again in a few moments${settingsHint}`;
    
    case 'model_overloaded':
      return `⚠️ **Model Temporarily Unavailable**\n\nThe AI model is currently experiencing high demand.\n\n**Suggested solutions:**\n• Try a different AI provider or model\n• Wait a few moments and try again${settingsHint}`;
    
    case 'context_too_long':
      return `⚠️ **Conversation Too Long**\n\nThe conversation has become too long for the current model to process.\n\n**Suggested solutions:**\n• Start a new conversation\n• Use a model with larger context window (e.g., Claude Sonnet 4, GPT-4 Turbo)${settingsHint}`;
    
    case 'rate_limit':
      return `⚠️ **Rate Limit Reached**\n\nYou've reached the usage limit for this model.\n\n**Suggested solutions:**\n• Wait a few minutes before trying again\n• Switch to a different AI provider${settingsHint}`;
    
    case 'api_error':
      return `⚠️ **Service Error**\n\n${details || 'An error occurred while processing your request.'}\n\n**Suggested solutions:**\n• Try a different AI provider or model\n• Try again in a few moments${settingsHint}`;
    
    default:
      return `⚠️ **Something Went Wrong**\n\n${details || 'An unexpected error occurred.'}\n\n**Suggested solutions:**\n• Try again\n• Switch to a different AI model${settingsHint}`;
  }
}

// Parse API error responses to determine error type
function parseApiError(errorData: string, provider: string): { type: string; message: string } {
  const lowerError = errorData.toLowerCase();
  
  // Image format errors
  if (lowerError.includes('image_url') || lowerError.includes('image format') || 
      lowerError.includes('invalid_request_error') && lowerError.includes('image')) {
    return { type: 'image_format', message: 'Image format not supported by this model' };
  }
  
  // Vision not supported
  if (lowerError.includes('vision') || lowerError.includes('does not support images')) {
    return { type: 'image_not_supported', message: 'Model does not support image analysis' };
  }
  
  // Overloaded
  if (lowerError.includes('overloaded') || lowerError.includes('capacity') || 
      lowerError.includes('503') || lowerError.includes('service unavailable')) {
    return { type: 'model_overloaded', message: 'Model is temporarily unavailable' };
  }
  
  // Context length
  if (lowerError.includes('context') || lowerError.includes('token') || 
      lowerError.includes('too long') || lowerError.includes('maximum')) {
    return { type: 'context_too_long', message: 'Conversation too long for model' };
  }
  
  // Rate limit
  if (lowerError.includes('rate') || lowerError.includes('limit') || lowerError.includes('429')) {
    return { type: 'rate_limit', message: 'Rate limit exceeded' };
  }
  
  return { type: 'api_error', message: errorData };
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_MESSAGES = 10000; // 10000 messages per hour - essentially unlimited

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
      provider: topLevelProvider,
      model: topLevelModel,
      temperature: topLevelTemp = 0.7,
      maxTokens: topLevelMaxTokens = 32000,
      systemPrompt: topLevelSystemPrompt,
      attachments = [],
      mode = 'quick', // Speed mode: 'quick' or 'advanced'
      userId: requestUserId,
      agentId,
      settings = {},
    } = body;

    // Support both top-level and settings-nested provider/model
    const requestedProvider = settings.provider || topLevelProvider;
    const requestedModel = settings.model || topLevelModel;
    const temperature = settings.temperature ?? topLevelTemp;
    const maxTokens = settings.maxTokens ?? topLevelMaxTokens;
    const systemPrompt = settings.systemPrompt || topLevelSystemPrompt;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get API keys at request time
    const apiKeys = getApiKeys();
    
    // Get agent configuration and resolve provider/model
    const agentConfig = getAgentConfig(agentId);
    const chatMode = (mode === 'advanced' ? 'advanced' : 'quick') as ChatMode;
    
    // Debug: Log what getAgentConfig returned
    console.log(`[chat-stream] getAgentConfig(${agentId}) returned: agentId=${agentConfig.agentId}, displayName=${agentConfig.displayName}, provider=${agentConfig.config.provider}`);
    
    // Use requested provider if specified, otherwise use agent's configured provider
    const provider = requestedProvider || agentConfig.config.provider;
    
    // Get model based on mode (quick vs advanced)
    const model = requestedModel || getModelForAgent(agentId, chatMode);
    
    // Log for debugging
    console.log(`[chat-stream] Agent: ${agentId || 'default'} | Provider: ${provider} | Mode: ${chatMode} | Model: ${model}`);
    console.log(`[chat-stream] Requested: provider=${requestedProvider}, model=${requestedModel} | Config: provider=${agentConfig.config.provider}, model=${agentConfig.config.quickModel}`);
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
      /add\s+to\s+(the\s+)?file/i,
      // Zip operations
      /zip\s+(the\s+)?files?/i,
      /create\s+(a\s+)?zip/i,
      /compress\s+(the\s+)?files?/i,
      /unzip\s+(the\s+)?file/i,
      /extract\s+(the\s+)?zip/i,
      // Extract text from documents
      /extract\s+(text|content)\s+(from)?/i,
      /get\s+text\s+(from)?/i,
      /parse\s+(the\s+)?pdf/i,
      /parse\s+(the\s+)?docx?/i,
      /read\s+(the\s+)?pdf/i,
      /convert\s+.+\s+to\s+text/i,
      // Convert/Export file format
      /convert\s+(the\s+)?file/i,
      /export\s+(the\s+)?file/i,
      /save\s+(as|to)\s+\.?txt/i,
      /convert\s+to\s+\.?txt/i,
      /export\s+as\s+\.?txt/i,
      // Download file
      /download\s+(the\s+)?file/i,
      /give\s+me\s+(the\s+)?file/i,
      /provide\s+(the\s+)?file/i,
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
      
      const backendUrl = process.env.BACKEND_BASE_URL || process.env.BACKEND_URL || 'http://localhost:3005';
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
                const resultMessage = result.success || result.data?.success
                  ? `✅ **File Created Successfully!**\n\n**Filename:** \`${filename}\`\n**Size:** ${result.data?.size || result.size || content.length} bytes\n\n📁 Your file has been saved to your workspace.\n\n[📥 Download ${filename}](/api/agents/files/download?filename=${encodeURIComponent(filename)}&userId=${userId})`
                  : `❌ **File Creation Failed**\n\n${result.error || result.data?.error || 'Unknown error'}`;
                
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
                const fileContent = result.data?.content || result.content || '';
                const fileSize = result.data?.size || result.size || fileContent.length;
                const isSuccess = result.success || result.data?.success;
                
                const resultMessage = isSuccess
                  ? `📄 **File: \`${filename}\`**\n\n\`\`\`\n${fileContent}\n\`\`\`\n\n*Size: ${fileSize} bytes*\n\n[📥 Download ${filename}](/api/agents/files/download?filename=${encodeURIComponent(filename)}&userId=${userId})`
                  : `❌ **Could not read file**\n\n${result.error || result.data?.error || 'File not found'}`;
                
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
        
        // MODIFY FILE (edit, update, change, append)
        if (/edit|update|change|modify|append|add to/.test(lowerMessage) && /file|\.txt|\.py|\.js|\.ts|\.json|\.md|\.html|\.css/.test(lowerMessage)) {
          const filenameMatch = message.match(/(?:edit|update|change|modify|append|add to)\s*(?:the\s+)?(?:file\s+)?["']?([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)["']?/i) ||
                               message.match(/["']([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)["']/i);
          
          if (filenameMatch) {
            const filename = filenameMatch[1];
            const isAppend = /append|add to/.test(lowerMessage);
            
            // Extract new content from message
            const contentMatch = message.match(/```[\w]*\n?([\s\S]*?)```/i) ||
                                message.match(/(?:with|to|content|text)[:=]?\s*["']?([\s\S]+?)["']?$/i);
            const content = contentMatch ? contentMatch[1].trim() : '';
            
            if (content) {
              const response = await fetch(`${backendUrl}/api/agents/files/modify`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content, mode: isAppend ? 'append' : 'replace', userId }),
              });
              
              const result = await response.json();
              
              const encoder = new TextEncoder();
              const modifyResultStream = new ReadableStream({
                start(controller) {
                  const resultMessage = result.success || result.data?.success
                    ? `✅ **File Modified Successfully!**\n\n**Filename:** \`${filename}\`\n**Mode:** ${isAppend ? 'Appended' : 'Replaced'}\n**New Size:** ${result.data?.size || result.size || 'updated'} bytes\n\n📝 Your changes have been saved.\n\n[📥 Download File](/api/agents/files/download?filename=${encodeURIComponent(filename)}&userId=${userId})`
                    : `❌ **File Modification Failed**\n\n${result.error || result.data?.error || 'Unknown error'}`;
                  
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: resultMessage })}\n\n`));
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                  controller.close();
                }
              });
              
              return new Response(modifyResultStream, {
                headers: {
                  'Content-Type': 'text/event-stream',
                  'Cache-Control': 'no-cache',
                  Connection: 'keep-alive',
                },
              });
            }
          }
        }
        
        // EXTRACT TEXT (from PDF, DOCX, etc.)
        if (/extract|get text|read text|parse|convert to text/.test(lowerMessage) && /pdf|docx|doc|document|file/.test(lowerMessage)) {
          const filenameMatch = message.match(/(?:from|in|of)\s*["']?([a-zA-Z0-9_.-]+\.(pdf|docx|doc|txt))["']?/i) ||
                               message.match(/["']([a-zA-Z0-9_.-]+\.(pdf|docx|doc|txt))["']/i);
          
          if (filenameMatch) {
            const filename = filenameMatch[1];
            
            // Call extract_text endpoint
            const response = await fetch(`${backendUrl}/api/agents/tools/execute`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                tool: 'extract_text', 
                params: { file: filename, userId } 
              }),
            });
            
            const result = await response.json();
            
            const encoder = new TextEncoder();
            const extractResultStream = new ReadableStream({
              start(controller) {
                let resultMessage;
                if (result.success && result.data?.success) {
                  const text = result.data.text || '';
                  const preview = text.length > 3000 ? text.substring(0, 3000) + '\n... (truncated)' : text;
                  resultMessage = `📄 **Text Extracted from \`${filename}\`**\n\n\`\`\`\n${preview}\n\`\`\`\n\n*Total characters: ${text.length}*`;
                } else {
                  resultMessage = `❌ **Could not extract text**\n\n${result.error || result.data?.error || 'Unknown error'}`;
                }
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: resultMessage })}\n\n`));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                controller.close();
              }
            });
            
            return new Response(extractResultStream, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              },
            });
          }
        }
        
        // CONVERT FILE (convert to txt, convert format)
        if (/convert|export|save as|download as/.test(lowerMessage) && /text|txt|\.txt|plain text/.test(lowerMessage)) {
          const filenameMatch = message.match(/(?:convert|export)\s*["']?([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)["']?/i) ||
                               message.match(/["']([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)["']/i);
          
          if (filenameMatch) {
            const sourceFile = filenameMatch[1];
            const baseName = sourceFile.replace(/\.[^.]+$/, '');
            const outputFile = `${baseName}.txt`;
            
            // First read/extract the source file
            let extractResponse;
            if (/\.(pdf|docx|doc)$/i.test(sourceFile)) {
              extractResponse = await fetch(`${backendUrl}/api/agents/tools/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  tool: 'extract_text', 
                  params: { file: sourceFile, userId } 
                }),
              });
            } else {
              extractResponse = await fetch(`${backendUrl}/api/agents/files/read?filename=${encodeURIComponent(sourceFile)}&userId=${userId}`);
            }
            
            const extractResult = await extractResponse.json();
            const textContent = extractResult.data?.text || extractResult.data?.content || extractResult.content || '';
            
            if (textContent) {
              // Create a new text file with the content
              const createResponse = await fetch(`${backendUrl}/api/agents/files/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: outputFile, content: textContent, userId }),
              });
              
              const createResult = await createResponse.json();
              
              const encoder = new TextEncoder();
              const convertResultStream = new ReadableStream({
                start(controller) {
                  const resultMessage = createResult.success || createResult.data?.success
                    ? `✅ **File Converted to Text!**\n\n**Original:** \`${sourceFile}\`\n**Converted:** \`${outputFile}\`\n**Size:** ${createResult.data?.size || createResult.size || textContent.length} bytes\n\n[📥 Download ${outputFile}](/api/agents/files/download?filename=${encodeURIComponent(outputFile)}&userId=${userId})`
                    : `❌ **Conversion Failed**\n\n${createResult.error || 'Could not create text file'}`;
                  
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
                },
              });
            }
          }
        }
        
        // DOWNLOAD FILE (provide direct download link for existing file)
        if (/download|get|give me|provide/.test(lowerMessage) && /file|\.txt|\.py|\.js|\.json|\.md|\.pdf|\.docx/.test(lowerMessage)) {
          const filenameMatch = message.match(/download\s*(?:the\s+)?(?:file\s+)?["']?([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)["']?/i) ||
                               message.match(/["']([a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+)["']/i);
          
          if (filenameMatch) {
            const filename = filenameMatch[1];
            
            // Check if file exists
            const response = await fetch(`${backendUrl}/api/agents/files/read?filename=${encodeURIComponent(filename)}&userId=${userId}`);
            const result = await response.json();
            
            const encoder = new TextEncoder();
            const downloadResultStream = new ReadableStream({
              start(controller) {
                let resultMessage;
                if (result.success || result.data?.success) {
                  const fileSize = result.data?.size || result.size || 'unknown';
                  resultMessage = `📥 **Download Ready!**\n\n**File:** \`${filename}\`\n**Size:** ${fileSize} bytes\n\n[📥 Click to Download](/api/agents/files/download?filename=${encodeURIComponent(filename)}&userId=${userId})`;
                } else {
                  resultMessage = `❌ **File not found:** \`${filename}\`\n\nUse "list files" to see available files.`;
                }
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: resultMessage })}\n\n`));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                controller.close();
              }
            });
            
            return new Response(downloadResultStream, {
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
          const errorText = await imageResponse.text();
          console.error('[chat-stream] DALL-E API error:', errorText);
          
          // Return user-friendly error for image generation failure
          const encoder = new TextEncoder();
          const errorMessage = getUserFriendlyError('image_generation_failed', 
            errorText.includes('safety') || errorText.includes('content') 
              ? 'The image prompt may contain content that cannot be generated.' 
              : 'Please try a different description.');
          
          const errorStream = new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: errorMessage })}\n\n`));
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
              controller.close();
            }
          });

          return new Response(errorStream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
              'X-Accel-Buffering': 'no',
            },
          });
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
                // Prefer base64 data over URL since OpenAI can't access our server URLs
                // The 'data' field contains base64 preview, 'url' is the server URL
                let imageUrl: string | null = null;
                
                if (attachment.data && attachment.data.startsWith('data:image/')) {
                  // Already a base64 data URL
                  imageUrl = attachment.data;
                } else if (attachment.data && attachment.data.length > 100 && !attachment.data.startsWith('http') && !attachment.data.startsWith('File available')) {
                  // Likely raw base64 - convert to data URL
                  imageUrl = `data:${attachment.type};base64,${attachment.data}`;
                } else if (attachment.url && (attachment.url.startsWith('data:') || attachment.url.startsWith('https://oaidalleapiprodscus'))) {
                  // OpenAI can access data URLs and its own Azure blob URLs
                  imageUrl = attachment.url;
                }
                
                if (imageUrl) {
                  // Use 'low' detail to reduce token usage (512x512 = ~85 tokens vs high which can be 65k+)
                  userContent.push({
                    type: 'image_url',
                    image_url: { url: imageUrl, detail: 'low' },
                  });
                  console.log('[chat-stream] Added image attachment, type:', attachment.type, 'detail: low, url-length:', imageUrl.length);
                } else {
                  console.log('[chat-stream] Skipping image attachment - no accessible URL. Has data:', !!attachment.data, 'Has url:', !!attachment.url);
                }
              }
            }
          }

          messages.push({
            role: 'user',
            content: userContent.length === 1 ? message : userContent,
          });

          // Helper function to stream OpenAI-compatible responses with multi-model fallback
          // Returns true if controller was closed due to error
          async function streamOpenAICompatible(
            apiUrl: string,
            apiKey: string,
            defaultModel: string,
            providerName?: ProviderName
          ): Promise<boolean> {
            const modelsToTry = [model || defaultModel];
            
            // Add fallback models if provider is specified
            if (providerName) {
              const availableModels = getAvailableModels(providerName, model || defaultModel);
              // Add up to 3 fallback models
              modelsToTry.push(...availableModels.slice(0, 3));
            }
            
            let lastError: string | null = null;
            
            for (const currentModel of modelsToTry) {
              console.log(`[chat-stream] Trying model: ${currentModel}`);
              
              try {
                const response = await fetch(apiUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                  },
                  body: JSON.stringify({
                    model: currentModel,
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                    stream: true,
                  }),
                });

                if (!response.ok) {
                  const errorData = await response.text();
                  console.error(`[chat-stream] Model ${currentModel} failed:`, errorData);
                  lastError = `Model ${currentModel}: ${response.status}`;
                  
                  // Mark model as failed for cooldown
                  if (providerName) {
                    markModelFailed(providerName, currentModel);
                  }
                  
                  // Try next model
                  continue;
                }

                console.log(`[chat-stream] ✅ Model ${currentModel} succeeded`);
                
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
                return false; // Success!
                
              } catch (error) {
                console.error(`[chat-stream] Error with model ${currentModel}:`, error);
                lastError = `Model ${currentModel}: ${error}`;
                
                if (providerName) {
                  markModelFailed(providerName, currentModel);
                }
                // Try next model
              }
            }
            
            // All models failed - provide user-friendly error
            const parsedError = parseApiError(lastError || 'Unknown error', providerName || 'unknown');
            const friendlyMessage = getUserFriendlyError(parsedError.type, parsedError.message, providerName);
            
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ token: friendlyMessage })}\n\n`
              )
            );
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ done: true })}\n\n`
              )
            );
            return true;
          }

          // Route to the appropriate provider with multi-model fallback
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

            // Convert OpenAI format to Anthropic format for images
            const convertToAnthropicFormat = (content: unknown): unknown => {
              if (typeof content === 'string') return content;
              if (!Array.isArray(content)) return content;
              
              return content.map((item: { type: string; text?: string; image_url?: { url: string } }) => {
                if (item.type === 'text') {
                  return { type: 'text', text: item.text };
                }
                if (item.type === 'image_url' && item.image_url?.url) {
                  const url = item.image_url.url;
                  // Handle base64 data URLs
                  if (url.startsWith('data:')) {
                    const matches = url.match(/^data:([^;]+);base64,(.+)$/);
                    if (matches) {
                      return {
                        type: 'image',
                        source: {
                          type: 'base64',
                          media_type: matches[1],
                          data: matches[2],
                        },
                      };
                    }
                  }
                  // Handle regular URLs
                  return {
                    type: 'image',
                    source: {
                      type: 'url',
                      url: url,
                    },
                  };
                }
                return item;
              });
            };

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
                      content: convertToAnthropicFormat(m.content),
                    })),
                    stream: true,
                  }),
                }
              );

              if (!response.ok) {
                const errorData = await response.text();
                console.error('Anthropic API error:', errorData);
                
                // Parse error and provide user-friendly message
                const parsedError = parseApiError(errorData, 'anthropic');
                const friendlyMessage = getUserFriendlyError(parsedError.type, parsedError.message, 'Anthropic Claude');
                
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ token: friendlyMessage })}\n\n`
                  )
                );
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ done: true })}\n\n`
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
            // Mistral uses OpenAI-compatible API with multi-model fallback
            hadError = await streamOpenAICompatible(
              'https://api.mistral.ai/v1/chat/completions',
              apiKeys.mistral,
              PROVIDER_CONFIGS.mistral.advanced,
              'mistral'
            );
          } else if (provider === 'xai' && apiKeys.xai) {
            // xAI Grok uses OpenAI-compatible API with multi-model fallback
            hadError = await streamOpenAICompatible(
              'https://api.x.ai/v1/chat/completions',
              apiKeys.xai,
              PROVIDER_CONFIGS.xai.advanced,
              'xai'
            );
          } else if (provider === 'groq' && apiKeys.groq) {
            // Groq uses OpenAI-compatible API with multi-model fallback
            hadError = await streamOpenAICompatible(
              'https://api.groq.com/openai/v1/chat/completions',
              apiKeys.groq,
              PROVIDER_CONFIGS.groq.advanced,
              'groq'
            );
          } else if (provider === 'cerebras' && apiKeys.cerebras) {
            // Cerebras uses OpenAI-compatible API with multi-model fallback
            hadError = await streamOpenAICompatible(
              'https://api.cerebras.ai/v1/chat/completions',
              apiKeys.cerebras,
              PROVIDER_CONFIGS.cerebras.advanced,
              'cerebras'
            );
          } else if (provider === 'openai' && apiKeys.openai) {
            // OpenAI with multi-model fallback
            hadError = await streamOpenAICompatible(
              'https://api.openai.com/v1/chat/completions',
              apiKeys.openai,
              PROVIDER_CONFIGS.openai.advanced,
              'openai'
            );
            
            // If all OpenAI models failed and we have a backup key, try it
            if (hadError && apiKeys.openaiBackup) {
              console.log('[chat-stream] All OpenAI models failed with primary key, trying backup key...');
              hadError = await streamOpenAICompatible(
                'https://api.openai.com/v1/chat/completions',
                apiKeys.openaiBackup,
                PROVIDER_CONFIGS.openai.advanced,
                'openai'
              );
              if (!hadError) {
                console.log('[chat-stream] ✅ Backup OpenAI key succeeded!');
              }
            }
          } else if (apiKeys.openai) {
            // Fallback to OpenAI if provider not available
            console.log(`[chat-stream] Provider ${provider} not available, falling back to OpenAI with multi-model`);
            hadError = await streamOpenAICompatible(
              'https://api.openai.com/v1/chat/completions',
              apiKeys.openai,
              PROVIDER_CONFIGS.openai.advanced,
              'openai'
            );
            
            // If primary key failed and we have a backup, try it
            if (hadError && apiKeys.openaiBackup) {
              console.log('[chat-stream] Primary OpenAI key failed in fallback, trying backup...');
              hadError = await streamOpenAICompatible(
                'https://api.openai.com/v1/chat/completions',
                apiKeys.openaiBackup,
                PROVIDER_CONFIGS.openai.advanced,
                'openai'
              );
            }
          } else if (apiKeys.openaiBackup) {
            // Try backup OpenAI key if primary not set
            console.log('[chat-stream] No primary OpenAI key, using backup key with multi-model');
            hadError = await streamOpenAICompatible(
              'https://api.openai.com/v1/chat/completions',
              apiKeys.openaiBackup,
              PROVIDER_CONFIGS.openai.advanced,
              'openai'
            );
          } else if (apiKeys.mistral) {
            // Fallback to Mistral with multi-model
            console.log(`[chat-stream] No OpenAI key, falling back to Mistral with multi-model`);
            hadError = await streamOpenAICompatible(
              'https://api.mistral.ai/v1/chat/completions',
              apiKeys.mistral,
              PROVIDER_CONFIGS.mistral.advanced,
              'mistral',
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
