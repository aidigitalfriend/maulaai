/**
 * CANVAS GENERATION API ROUTES
 * Endpoints for AI-powered canvas content generation
 * Supports: OpenAI, Anthropic, Groq, Cerebras, Mistral, xAI, Gemini
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// Lazy initialization of AI clients
let openaiClient = null;
let anthropicClient = null;
let groqClient = null;
let cerebrasClient = null;
let mistralClient = null;
let xaiClient = null;
let geminiClient = null;

function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getAnthropicClient() {
  if (!anthropicClient && process.env.ANTHROPIC_API_KEY) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function getGroqClient() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

function getCerebrasClient() {
  if (!cerebrasClient && process.env.CEREBRAS_API_KEY) {
    cerebrasClient = new OpenAI({
      apiKey: process.env.CEREBRAS_API_KEY,
      baseURL: 'https://api.cerebras.ai/v1',
    });
  }
  return cerebrasClient;
}

function getMistralClient() {
  if (!mistralClient && process.env.MISTRAL_API_KEY) {
    mistralClient = new OpenAI({
      apiKey: process.env.MISTRAL_API_KEY,
      baseURL: 'https://api.mistral.ai/v1',
    });
  }
  return mistralClient;
}

function getXAIClient() {
  if (!xaiClient && process.env.XAI_API_KEY) {
    xaiClient = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: 'https://api.x.ai/v1',
    });
  }
  return xaiClient;
}

function getGeminiClient() {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// Professional system prompt for code generation
const getSystemPrompt = (currentCode, history) => {
  let prompt = `You are Nova, an expert web developer and UI/UX designer at Maula AI. You create stunning, production-ready web applications.

## Your Design Philosophy
- Modern, clean aesthetics with attention to detail
- Smooth animations and micro-interactions
- Responsive design that works on all devices
- Accessible and semantic HTML
- Professional color schemes and typography

## Technical Guidelines
- Use HTML5, CSS3 (with CSS variables), and modern ES6+ JavaScript
- Leverage Flexbox and CSS Grid for layouts
- Include hover states, transitions, and animations
- Add placeholder content that looks realistic
- Use proper meta tags and viewport settings
- Include embedded fonts from Google Fonts when appropriate
- Add subtle shadows, gradients, and modern UI patterns

## Code Requirements
- Return ONLY the complete HTML code with embedded CSS and JavaScript
- Do NOT include any markdown formatting, explanations, or code fences
- The code should be complete and runnable in a browser
- Include realistic placeholder content and images (use picsum.photos or placeholder.com)
- Ensure all links and buttons have proper hover states

## Your Response
Start directly with <!DOCTYPE html> - no explanations or markdown.`;

  if (currentCode) {
    prompt += `\n\n## Current Code to Modify
The user wants changes to this existing code. Make the requested modifications while preserving the overall structure and functionality:\n\n${currentCode}`;
  }

  if (history && history.length > 0) {
    const recentHistory = history.slice(-3).map(h => h.text || h.code || '').filter(Boolean);
    if (recentHistory.length > 0) {
      prompt += `\n\n## Recent Conversation Context
${recentHistory.join('\n---\n')}`;
    }
  }

  return prompt;
};

// Generate code with any provider
async function generateWithProvider(provider, modelId, prompt, systemPrompt) {
  let generatedCode = '';

  switch (provider) {
    case 'openai': {
      const client = getOpenAIClient();
      if (!client) throw new Error('OpenAI not configured');
      const completion = await client.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 8000,
        temperature: 0.7,
      });
      generatedCode = completion.choices[0]?.message?.content || '';
      break;
    }

    case 'anthropic': {
      const client = getAnthropicClient();
      if (!client) throw new Error('Anthropic not configured');
      const message = await client.messages.create({
        model: modelId,
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      generatedCode = message.content[0]?.text || '';
      break;
    }

    case 'groq': {
      const client = getGroqClient();
      if (!client) throw new Error('Groq not configured');
      const completion = await client.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 8000,
        temperature: 0.7,
      });
      generatedCode = completion.choices[0]?.message?.content || '';
      break;
    }

    case 'cerebras': {
      const client = getCerebrasClient();
      if (!client) throw new Error('Cerebras not configured');
      const completion = await client.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 8000,
        temperature: 0.7,
      });
      generatedCode = completion.choices[0]?.message?.content || '';
      break;
    }

    case 'mistral': {
      const client = getMistralClient();
      if (!client) throw new Error('Mistral not configured');
      const completion = await client.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 8000,
        temperature: 0.7,
      });
      generatedCode = completion.choices[0]?.message?.content || '';
      break;
    }

    case 'xai': {
      const client = getXAIClient();
      if (!client) throw new Error('xAI not configured');
      const completion = await client.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 8000,
        temperature: 0.7,
      });
      generatedCode = completion.choices[0]?.message?.content || '';
      break;
    }

    case 'gemini': {
      const client = getGeminiClient();
      if (!client) throw new Error('Gemini not configured');
      const result = await client.models.generateContent({
        model: modelId,
        contents: `${systemPrompt}\n\nUser request: ${prompt}`,
      });
      generatedCode = result.text || '';
      break;
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  return generatedCode;
}

// Clean generated code
function cleanGeneratedCode(code) {
  if (!code) return '';
  
  return code
    // Remove markdown code fences
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    // Remove any leading explanation text before <!DOCTYPE
    .replace(/^[\s\S]*?(?=<!DOCTYPE)/i, '')
    // Trim whitespace
    .trim();
}

/**
 * POST /api/canvas/generate
 * Generate canvas content (HTML/React code) using AI
 */
router.post('/generate', [
  body('prompt').isLength({ min: 1, max: 5000 }).withMessage('Prompt must be 1-5000 characters'),
  body('provider').isIn(['openai', 'anthropic', 'groq', 'cerebras', 'mistral', 'xai', 'gemini']).withMessage('Invalid provider'),
  body('modelId').exists().withMessage('Model ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { prompt, provider, modelId, currentCode, history } = req.body;

    console.log(`[CanvasAPI] Generating with ${provider}/${modelId}: "${prompt.substring(0, 80)}..."`);

    const systemPrompt = getSystemPrompt(currentCode, history);
    let generatedCode = await generateWithProvider(provider, modelId, prompt, systemPrompt);
    generatedCode = cleanGeneratedCode(generatedCode);

    if (!generatedCode || !generatedCode.includes('<!DOCTYPE') && !generatedCode.includes('<html')) {
      console.error('[CanvasAPI] Invalid code generated:', generatedCode?.substring(0, 200));
      return res.status(500).json({
        success: false,
        error: 'Failed to generate valid HTML code. Please try again.',
      });
    }

    res.json({
      success: true,
      code: generatedCode,
      provider,
      modelId,
      timestamp: new Date().toISOString(),
      metadata: {
        promptLength: prompt.length,
        codeLength: generatedCode.length,
        isModification: !!currentCode,
      },
    });

  } catch (error) {
    console.error('[CanvasAPI] Generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate canvas content',
    });
  }
});

/**
 * POST /api/canvas/stream
 * Stream canvas content generation for real-time updates
 */
router.post('/stream', [
  body('prompt').isLength({ min: 1, max: 5000 }).withMessage('Prompt must be 1-5000 characters'),
  body('provider').isIn(['openai', 'anthropic', 'groq', 'cerebras', 'mistral', 'xai', 'gemini']).withMessage('Invalid provider'),
  body('modelId').exists().withMessage('Model ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { prompt, provider, modelId, currentCode, history } = req.body;

    console.log(`[CanvasAPI] Streaming with ${provider}/${modelId}: "${prompt.substring(0, 80)}..."`);

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const systemPrompt = getSystemPrompt(currentCode, history);
    let fullCode = '';

    // Handle streaming based on provider
    if (provider === 'anthropic') {
      const client = getAnthropicClient();
      if (!client) throw new Error('Anthropic not configured');

      const stream = await client.messages.stream({
        model: modelId,
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.text) {
          fullCode += event.delta.text;
          res.write(`data: ${JSON.stringify({ chunk: event.delta.text })}\n\n`);
        }
      }
    } else if (provider === 'openai' || provider === 'groq' || provider === 'cerebras' || provider === 'mistral' || provider === 'xai') {
      let client;
      switch (provider) {
        case 'openai': client = getOpenAIClient(); break;
        case 'groq': client = getGroqClient(); break;
        case 'cerebras': client = getCerebrasClient(); break;
        case 'mistral': client = getMistralClient(); break;
        case 'xai': client = getXAIClient(); break;
      }
      if (!client) throw new Error(`${provider} not configured`);

      const stream = await client.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 8000,
        temperature: 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullCode += content;
          res.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
        }
      }
    } else if (provider === 'gemini') {
      // Gemini doesn't have streaming in the same way, use non-streaming fallback
      const client = getGeminiClient();
      if (!client) throw new Error('Gemini not configured');

      const result = await client.models.generateContent({
        model: modelId,
        contents: `${systemPrompt}\n\nUser request: ${prompt}`,
      });
      fullCode = result.text || '';
      res.write(`data: ${JSON.stringify({ chunk: fullCode })}\n\n`);
    }

    // Send completion event
    res.write(`data: ${JSON.stringify({ done: true, fullCode: cleanGeneratedCode(fullCode) })}\n\n`);
    res.end();

  } catch (error) {
    console.error('[CanvasAPI] Streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/canvas/status
 * Check canvas generation service status
 */
router.get('/status', (req, res) => {
  const providers = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
    cerebras: !!process.env.CEREBRAS_API_KEY,
    mistral: !!process.env.MISTRAL_API_KEY,
    xai: !!process.env.XAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
  };

  const activeProviders = Object.entries(providers)
    .filter(([, active]) => active)
    .map(([name]) => name);

  res.json({
    success: true,
    status: 'operational',
    capabilities: {
      providers,
      activeProviders,
      supportedProviders: ['openai', 'anthropic', 'groq', 'cerebras', 'mistral', 'xai', 'gemini'],
      maxPromptLength: 5000,
      maxCodeLength: 8000,
      streaming: true,
    },
  });
});

export default router;