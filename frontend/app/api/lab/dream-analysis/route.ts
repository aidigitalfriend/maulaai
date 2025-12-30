import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface DreamAnalysisRequest {
  dream: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let experimentId = `exp_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    await dbConnect();

    const { dream }: DreamAnalysisRequest = await req.json();

    if (!dream) {
      return NextResponse.json(
        { error: 'Dream description is required' },
        { status: 400 }
      );
    }

    // Create experiment record with initial status
    const experiment = new LabExperiment({
      experimentId,
      experimentType: 'dream-interpreter',
      input: {
        prompt: dream,
      },
      status: 'processing',
      startedAt: new Date(),
    });
    await experiment.save();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert dream interpreter and psychologist. Analyze dreams and provide insights in JSON format with these fields:
          {
            "mainTheme": "brief theme description",
            "emotions": ["emotion1", "emotion2", "emotion3"],
            "symbols": [
              {"name": "symbol name", "meaning": "detailed interpretation"}
            ],
            "interpretation": "comprehensive dream interpretation"
          }`,
        },
        {
          role: 'user',
          content: `Analyze this dream: ${dream}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    const processingTime = Date.now() - startTime;
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Update experiment with results
    await LabExperiment.findOneAndUpdate(
      { experimentId },
      {
        output: {
          result: analysis,
          metadata: { tokensUsed, processingTime },
        },
        status: 'completed',
        processingTime,
        tokensUsed,
        completedAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      analysis,
      tokens: tokensUsed,
      experimentId,
    });
  } catch (error: any) {
    console.error('Dream Analysis Error:', error);

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
      { error: error.message || 'Failed to analyze dream' },
      { status: 500 }
    );
  }
}
