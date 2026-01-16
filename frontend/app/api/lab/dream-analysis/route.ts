import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

interface DreamAnalysisRequest {
  dream: string;
}

// GET handler for fetching real-time stats
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wantStats = searchParams.get('stats');

    if (wantStats === 'true') {
      await dbConnect();
      
      // Get total dream analyses count
      const totalAnalyzed = await LabExperiment.countDocuments({
        experimentType: 'dream-analysis'
      });

      // Get active users in the last 5 minutes (approximation based on recent experiments)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentExperiments = await LabExperiment.distinct('userId', {
        experimentType: 'dream-analysis',
        createdAt: { $gte: fiveMinutesAgo }
      });

      return NextResponse.json({
        activeUsers: recentExperiments.length || Math.floor(Math.random() * 5) + 1, // Show at least 1-5 if no recent
        totalAnalyzed: totalAnalyzed
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ activeUsers: 0, totalAnalyzed: 0 });
  }
}

// AI Provider helper for dream analysis
async function analyzeWithAI(dream: string): Promise<{ analysis: any; tokens: number }> {
  const systemPrompt = `You are an expert dream interpreter and psychologist. Analyze dreams and provide insights in JSON format with these fields:
  {
    "mainTheme": "brief theme description",
    "emotions": ["emotion1", "emotion2", "emotion3"],
    "symbols": [
      {"name": "symbol name", "meaning": "detailed interpretation"}
    ],
    "interpretation": "comprehensive dream interpretation"
  }`;

  const userPrompt = `Analyze this dream: ${dream}`;

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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 800,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return { analysis: JSON.parse(jsonMatch[0]), tokens: data.usage?.total_tokens || 0 };
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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 800,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return { analysis: JSON.parse(jsonMatch[0]), tokens: data.usage?.total_tokens || 0 };
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
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  });

  return {
    analysis: JSON.parse(completion.choices[0].message.content || '{}'),
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

    // Use AI provider with fallback chain: Cerebras → Groq → OpenAI
    const { analysis, tokens } = await analyzeWithAI(dream);
    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await LabExperiment.findOneAndUpdate(
      { experimentId },
      {
        output: {
          result: analysis,
          metadata: { tokensUsed: tokens, processingTime },
        },
        status: 'completed',
        processingTime,
        tokensUsed: tokens,
        completedAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      analysis,
      tokens,
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
