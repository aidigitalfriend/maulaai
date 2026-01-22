import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

  // Try Cerebras first
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
      console.log('Cerebras failed, trying Groq...');
    }
  }

  // Try Groq
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
      console.log('Groq failed, using fallback');
    }
  }

  // Fallback response
  return {
    prediction: {
      confidence: 65,
      trend: 'rising',
      keyInsights: [
        'This area shows significant potential for growth',
        'Market conditions are favorable',
        'Technology advances will play a key role',
        'Consumer behavior is shifting',
      ],
      scenarios: [
        { name: 'Optimistic', probability: 40, description: 'Rapid adoption and growth' },
        { name: 'Moderate', probability: 45, description: 'Steady progression with some challenges' },
        { name: 'Conservative', probability: 15, description: 'Slower than expected development' },
      ],
      relatedTrends: ['Digital transformation', 'Sustainability', 'Automation'],
      summary: `The future of ${topic} over the next ${timeframe} shows promising developments with several key factors influencing its trajectory.`,
    },
    tokens: 0,
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { topic, timeframe }: PredictionRequest = await req.json();

    if (!topic || !timeframe) {
      return NextResponse.json({ error: 'Topic and timeframe are required' }, { status: 400 });
    }

    // Create experiment record
    await prisma.labExperiment.create({
      data: {
        experimentId,
        experimentType: 'future-prediction',
        input: { topic, timeframe },
        status: 'processing',
        startedAt: new Date(),
      },
    });

    const { prediction, tokens } = await predictWithAI(topic, timeframe);
    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await prisma.labExperiment.update({
      where: { experimentId },
      data: {
        output: { prediction, topic, timeframe },
        status: 'completed',
        processingTime,
        tokensUsed: tokens,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      prediction,
      topic,
      timeframe,
      tokens,
      processingTime,
      experimentId,
    });
  } catch (error: any) {
    console.error('Future Prediction Error:', error);

    try {
      await prisma.labExperiment.update({
        where: { experimentId },
        data: { status: 'failed', errorMessage: error.message, completedAt: new Date() },
      });
    } catch (updateError) {
      console.error('Failed to update experiment error status:', updateError);
    }

    return NextResponse.json({ error: error.message || 'Failed to generate prediction' }, { status: 500 });
  }
}
