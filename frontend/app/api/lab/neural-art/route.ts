import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Map style names to artistic prompts
const stylePrompts = {
  'van-gogh':
    'in the style of Vincent van Gogh, post-impressionism, swirling brushstrokes, vibrant colors',
  picasso:
    'in the style of Pablo Picasso, cubism, geometric shapes, fragmented perspective',
  monet:
    'in the style of Claude Monet, impressionism, soft brushwork, light and color',
  kandinsky:
    'in the style of Wassily Kandinsky, abstract expressionism, bold colors and shapes',
  dali: 'in the style of Salvador Dalí, surrealism, dreamlike, melting forms',
  warhol:
    'in the style of Andy Warhol, pop art, bold colors, repeated patterns',
  abstract: 'abstract art style, modern, geometric patterns, vibrant colors',
  watercolor:
    'watercolor painting style, soft edges, translucent colors, flowing',
};

// Demo styled images for fallback mode (art style examples from Unsplash)
const DEMO_STYLED_IMAGES: Record<string, string[]> = {
  'van-gogh': [
    'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=800&q=80', // starry night style
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
  ],
  picasso: [
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80', // cubism style
    'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80',
  ],
  monet: [
    'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80', // impressionist
    'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80',
  ],
  kandinsky: [
    'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80', // abstract
    'https://images.unsplash.com/photo-1573096108468-702f6014ef28?w=800&q=80',
  ],
  dali: [
    'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&q=80', // surreal
    'https://images.unsplash.com/photo-1534759926787-89b3e0497549?w=800&q=80',
  ],
  warhol: [
    'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80', // pop art style
    'https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800&q=80',
  ],
  abstract: [
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
    'https://images.unsplash.com/photo-1507908708918-778587c9e563?w=800&q=80',
  ],
  watercolor: [
    'https://images.unsplash.com/photo-1579762593175-20226054cad0?w=800&q=80',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
  ],
};

function getDemoStyledImage(style: string): string {
  const images = DEMO_STYLED_IMAGES[style] || DEMO_STYLED_IMAGES.abstract;
  return images[Math.floor(Math.random() * images.length)];
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let experimentId = `exp_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    await dbConnect();

    const { imageUrl, style } = await req.json();

    if (!imageUrl || !style) {
      return NextResponse.json(
        { error: 'Image URL and style are required' },
        { status: 400 }
      );
    }

    // Create experiment record with initial status
    const experiment = new LabExperiment({
      experimentId,
      experimentType: 'neural-art',
      input: {
        prompt: `Transform image with ${style} style`,
        settings: { style },
        files: [{ url: imageUrl, type: 'image' }],
      },
      status: 'processing',
      startedAt: new Date(),
    });
    await experiment.save();

    let resultImage: string;
    let isDemo = false;

    try {
      // Use Replicate's SDXL for style transfer
      // This model accepts both an image and a text prompt to apply artistic styles
      const output = await replicate.run(
        'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        {
          input: {
            image: imageUrl,
            prompt:
              stylePrompts[style as keyof typeof stylePrompts] ||
              stylePrompts['abstract'],
            strength: 0.7, // How much to transform (0-1, higher = more transformation)
            guidance_scale: 7.5,
            num_inference_steps: 30,
          },
        }
      );

      // Replicate returns an array of image URLs
      resultImage = Array.isArray(output) ? output[0] : (output as string);
    } catch (replicateError: any) {
      // Check if it's a payment/credit error (402) or auth error
      if (
        replicateError.message?.includes('402') ||
        replicateError.message?.includes('Payment') ||
        replicateError.message?.includes('credit') ||
        replicateError.message?.includes('Insufficient')
      ) {
        console.log('Replicate credits exhausted, using demo styled image');
        resultImage = getDemoStyledImage(style);
        isDemo = true;
      } else {
        throw replicateError;
      }
    }

    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await LabExperiment.findOneAndUpdate(
      { experimentId },
      {
        output: {
          result: resultImage,
          fileUrl: resultImage,
          metadata: { style, processingTime, isDemo },
        },
        status: 'completed',
        processingTime,
        completedAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      image: resultImage,
      style,
      experimentId,
      isDemo,
      ...(isDemo && {
        notice: 'Demo mode: Showing example styled artwork. AI transformation temporarily unavailable.',
      }),
    });
  } catch (error: any) {
    console.error('Neural art generation error:', error);

    // Update experiment with error status
    try {
      await LabExperiment.findOneAndUpdate(
        { experimentId },
        {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        }
      );
    } catch (updateError) {
      console.error('Failed to update experiment error status:', updateError);
    }

    return NextResponse.json(
      { error: 'Failed to generate neural art. Please try again.' },
      { status: 500 }
    );
  }
}
