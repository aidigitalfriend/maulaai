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
    const resultImage = Array.isArray(output) ? output[0] : output;
    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await LabExperiment.findOneAndUpdate(
      { experimentId },
      {
        output: {
          result: resultImage,
          fileUrl: resultImage,
          metadata: { style, processingTime },
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
    });
  } catch (error) {
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
