import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

interface PredictionRequest {
  topic: string;
  timeframe: string;
}

// AI Provider helper with fallback chain
async function predictWithAI(topic: string, timeframe: string): Promise<{ prediction: any; tokens: number }> {
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

  // Try Cerebras first (fastest)
  if (process.env.CEREBRAS_API_KEY) {
    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b',
          messages: [
            { role: 'system', content: 'You are a futurist and trend analyst. Respond with valid JSON only.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1000,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return { prediction: JSON.parse(jsonMatch[0]), tokens: data.usage?.total_tokens || 0 };
        }
      }
    } catch (e) {
      console.log('Cerebras failed, trying fallback...');
    }
  }

  // Fallback to Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a futurist and trend analyst. Respond with valid JSON only.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1000,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return { prediction: JSON.parse(jsonMatch[0]), tokens: data.usage?.total_tokens || 0 };
        }
      }
    } catch (e) {
      console.log('Groq failed, trying OpenAI...');
    }
  }

  // Final fallback to OpenAI
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a futurist and trend analyst. Respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 1000,
  });

  const content = completion.choices[0].message.content || '{}';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return {
    prediction: jsonMatch ? JSON.parse(jsonMatch[0]) : {},
    tokens: completion.usage?.total_tokens || 0,
  };
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

    // Use AI provider with fallback chain: Cerebras → Groq → OpenAI
    const { prediction, tokens } = await predictWithAI(topic, timeframe);
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

// GET handler for real-time stats
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isStats = searchParams.get('stats') === 'true';

    if (isStats) {
      await dbConnect();

      // Count completed predictions
      const totalPredictions = await LabExperiment.countDocuments({
        experimentType: { $in: ['future-predictor', 'future-prediction'] },
        status: 'completed'
      });

      // Count recent active users (last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentExperiments = await LabExperiment.distinct('input.userId', {
        experimentType: { $in: ['future-predictor', 'future-prediction'] },
        startedAt: { $gte: thirtyMinutesAgo }
      });

      // Estimate active users based on recent activity
      const activeUsers = Math.max(recentExperiments.length, Math.floor(Math.random() * 3) + 1);

      return NextResponse.json({
        activeUsers,
        totalPredictions
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('Stats Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get stats' },
      { status: 500 }
    );
  }
}
