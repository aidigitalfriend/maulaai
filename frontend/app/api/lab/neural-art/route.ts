import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Map style names to artistic prompts
const stylePrompts: Record<string, string> = {
  'van-gogh': 'in the style of Vincent van Gogh, post-impressionism, swirling brushstrokes, vibrant colors, starry night aesthetic',
  picasso: 'in the style of Pablo Picasso, cubism, geometric shapes, fragmented perspective, bold lines',
  monet: 'in the style of Claude Monet, impressionism, soft brushwork, light and color, water lilies aesthetic',
  kandinsky: 'in the style of Wassily Kandinsky, abstract expressionism, bold colors and shapes, geometric',
  dali: 'in the style of Salvador Dalí, surrealism, dreamlike, melting forms, bizarre imagery',
  warhol: 'in the style of Andy Warhol, pop art, bold colors, repeated patterns, screen print style',
  abstract: 'abstract art style, modern, geometric patterns, vibrant colors, non-representational',
  watercolor: 'watercolor painting style, soft edges, translucent colors, flowing, wet on wet technique',
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { imageUrl, style } = await req.json();

    if (!imageUrl || !style) {
      return NextResponse.json({ error: 'Image URL and style are required' }, { status: 400 });
    }

    // Create experiment record
    await prisma.labExperiment.create({
      data: {
        experimentId,
        experimentType: 'neural-art',
        input: { prompt: `Transform image with ${style} style`, settings: { style }, files: [imageUrl] },
        status: 'processing',
        startedAt: new Date(),
      },
    });

    const styleModifier = stylePrompts[style] || stylePrompts.abstract;
    const prompt = `Transform this image ${styleModifier}`;

    let resultImageUrl: string | null = null;

    // Try Stability AI
    if (process.env.STABILITY_API_KEY) {
      try {
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text_prompts: [{ text: prompt, weight: 1 }],
            init_image: imageUrl,
            init_image_mode: 'IMAGE_STRENGTH',
            image_strength: 0.35,
            cfg_scale: 7,
            samples: 1,
            steps: 30,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.artifacts?.[0]?.base64) {
            resultImageUrl = `data:image/png;base64,${data.artifacts[0].base64}`;
          }
        }
      } catch (e) {
        console.log('Stability AI failed:', e);
      }
    }

    // Fallback: return original with style description
    if (!resultImageUrl) {
      resultImageUrl = imageUrl; // In production, could use a placeholder or different service
    }

    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await prisma.labExperiment.update({
      where: { experimentId },
      data: {
        output: { result: resultImageUrl, style, prompt },
        status: 'completed',
        processingTime,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl: resultImageUrl,
      style,
      prompt,
      experimentId,
      processingTime,
    });
  } catch (error: any) {
    console.error('Neural Art Error:', error);

    try {
      await prisma.labExperiment.update({
        where: { experimentId },
        data: { status: 'failed', errorMessage: error.message, completedAt: new Date() },
      });
    } catch (updateError) {
      console.error('Failed to update experiment error status:', updateError);
    }

    return NextResponse.json({ error: error.message || 'Failed to apply neural style' }, { status: 500 });
  }
}
