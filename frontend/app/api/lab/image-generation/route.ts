import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface ImageGenerationRequest {
  prompt: string;
  style: string;
  width?: number;
  height?: number;
}

const stylePrompts: Record<string, string> = {
  realistic: 'photorealistic, highly detailed, 8k uhd, professional photography',
  artistic: 'artistic painting, creative interpretation, vibrant colors, expressive brushstrokes',
  anime: 'anime style, manga art, japanese animation, vibrant colors, cel shaded',
  'oil-painting': 'oil painting, classical art, textured brushstrokes, rich colors, artistic masterpiece',
  watercolor: 'watercolor painting, soft colors, flowing edges, artistic, delicate',
  'digital-art': 'digital art, modern illustration, clean lines, vibrant, contemporary',
  '3d-render': '3d render, octane render, unreal engine, photorealistic, detailed lighting',
  'pixel-art': 'pixel art, retro gaming style, 8-bit, 16-bit, nostalgic',
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { prompt, style, width = 1024, height = 1024 }: ImageGenerationRequest = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Enhance prompt with style
    const styleModifier = stylePrompts[style] || '';
    const enhancedPrompt = `${prompt}, ${styleModifier}`;

    // Create experiment record
    await prisma.labExperiment.create({
      data: {
        experimentId,
        experimentType: 'neural-art',
        input: { prompt: enhancedPrompt, settings: { style, width, height } },
        status: 'processing',
        startedAt: new Date(),
      },
    });

    let imageUrl: string | null = null;

    // Try Stability AI
    if (process.env.STABILITY_API_KEY) {
      try {
        const response = await fetch(
          'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
              Accept: 'application/json',
            },
            body: JSON.stringify({
              text_prompts: [{ text: enhancedPrompt, weight: 1 }],
              cfg_scale: 7,
              width,
              height,
              samples: 1,
              steps: 30,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.artifacts?.[0]?.base64) {
            imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`;
          }
        }
      } catch (e) {
        console.log('Stability AI failed:', e);
      }
    }

    // Try OpenAI DALL-E as fallback
    if (!imageUrl && process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
        });

        if (response.data?.[0]?.url) {
          imageUrl = response.data[0].url;
        }
      } catch (e) {
        console.log('OpenAI DALL-E failed:', e);
      }
    }

    // Placeholder if no API available
    if (!imageUrl) {
      imageUrl = `https://placehold.co/${width}x${height}/1a1a2e/eee?text=Image+Generation`;
    }

    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await prisma.labExperiment.update({
      where: { experimentId },
      data: {
        output: { imageUrl, prompt: enhancedPrompt, style },
        status: 'completed',
        processingTime,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      style,
      width,
      height,
      processingTime,
      experimentId,
    });
  } catch (error: any) {
    console.error('Image Generation Error:', error);

    try {
      await prisma.labExperiment.update({
        where: { experimentId },
        data: { status: 'failed', errorMessage: error.message, completedAt: new Date() },
      });
    } catch (updateError) {
      console.error('Failed to update experiment error status:', updateError);
    }

    return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
  }
}
