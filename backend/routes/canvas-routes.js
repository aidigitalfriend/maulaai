/**
 * CANVAS GENERATION API ROUTES
 * Endpoints for AI-powered canvas content generation
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

// Lazy initialization of AI clients
let openaiClient = null;
let anthropicClient = null;

function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getAnthropicClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

/**
 * POST /api/canvas/generate
 * Generate canvas content (HTML/React code) using AI
 */
router.post('/generate', [
  body('prompt').isLength({ min: 1, max: 2000 }).withMessage('Prompt must be 1-2000 characters'),
  body('provider').isIn(['openai', 'anthropic']).withMessage('Provider must be openai or anthropic'),
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

    const { prompt, provider, modelId, isThinking: _isThinking, currentCode, history } = req.body;

    console.log(`[CanvasAPI] Generating content with ${provider}/${modelId} for prompt: ${prompt.substring(0, 100)}...`);

    let systemPrompt = `You are an expert web developer and UI/UX designer. Generate clean, modern, and responsive HTML/CSS/JavaScript code.

Guidelines:
- Use modern HTML5, CSS3, and ES6+ JavaScript
- Make it responsive and mobile-friendly
- Use semantic HTML
- Include proper accessibility attributes
- Use modern CSS features like Flexbox/Grid
- Add smooth animations and transitions where appropriate
- Ensure the code is production-ready

Return ONLY the complete HTML code with embedded CSS and JavaScript. Do not include any explanations or markdown formatting.`;

    if (currentCode) {
      systemPrompt += `\n\nCurrent code to modify/improve:\n${currentCode}`;
    }

    if (history && history.length > 0) {
      systemPrompt += `\n\nPrevious iterations:\n${history.map(h => h.code).join('\n---\n')}`;
    }

    let generatedCode = '';

    if (provider === 'openai') {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      });

      generatedCode = completion.choices[0]?.message?.content || '';
    } else if (provider === 'anthropic') {
      const anthropic = getAnthropicClient();
      const message = await anthropic.messages.create({
        model: modelId,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt },
        ],
      });

      generatedCode = message.content[0]?.text || '';
    }

    // Clean up the generated code (remove markdown formatting if present)
    generatedCode = generatedCode
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .trim();

    if (!generatedCode) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate content',
      });
    }

    // Create response
    const response = {
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
    };

    // Add to history if this is a modification
    if (currentCode) {
      response.history = history || [];
      response.history.push({
        code: generatedCode,
        timestamp: new Date().toISOString(),
        prompt,
      });
    }

    res.json(response);

  } catch (error) {
    console.error('[CanvasAPI] Generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate canvas content',
      details: error.message,
    });
  }
});

/**
 * GET /api/canvas/status
 * Check canvas generation service status
 */
router.get('/status', (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

  res.json({
    success: true,
    status: 'operational',
    capabilities: {
      openai: hasOpenAI,
      anthropic: hasAnthropic,
      supportedProviders: ['openai', 'anthropic'],
      maxPromptLength: 2000,
      maxCodeLength: 4000,
    },
  });
});

export default router;