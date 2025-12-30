import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface PredictionRequest {
  topic: string;
  timeframe: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let experimentId = `exp_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    await dbConnect();

    const { topic, timeframe }: PredictionRequest = await req.json();

    if (!topic || !timeframe) {
      return NextResponse.json(
        { error: 'Topic and timeframe are required' },
        { status: 400 }
      );
    }

    // Create experiment record with initial status
    const experiment = new LabExperiment({
      experimentId,
      experimentType: 'future-predictor',
      input: {
        prompt: topic,
        settings: { timeframe },
      },
      status: 'processing',
      startedAt: new Date(),
    });
    await experiment.save();

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `As a futurist and trend analyst, predict how "${topic}" will evolve over the next ${timeframe}. Provide your analysis in JSON format with:
    {
      "confidence": 0-100 percentage,
      "trend": "rising" | "falling" | "stable",
      "keyInsights": ["insight1", "insight2", "insight3", "insight4"],
      "scenarios": [
        {"name": "scenario name", "probability": 0-100, "description": "what might happen"}
      ],
      "relatedTrends": ["trend1", "trend2", "trend3"],
      "summary": "comprehensive prediction summary"
    }

    Base your predictions on current trends, technology developments, and social patterns.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.8,
      },
    });

    const response = await result.response;
    const analysisText = response.text();

    // Parse JSON from response
    let prediction;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      throw new Error('Failed to parse prediction analysis');
    }

    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await LabExperiment.findOneAndUpdate(
      { experimentId },
      {
        output: {
          result: prediction,
          metadata: { topic, timeframe, processingTime },
        },
        status: 'completed',
        processingTime,
        completedAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      prediction,
      topic,
      timeframe,
      experimentId,
    });
  } catch (error: any) {
    console.error('Future Prediction Error:', error);

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
      { error: error.message || 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}
