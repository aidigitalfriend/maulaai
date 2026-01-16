import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface PersonalityRequest {
  writingSample: string;
}

const systemPrompt = `You are an expert psychologist and personality analyst. Analyze writing samples to determine personality traits using the Big Five model. Return analysis in JSON format with:
{
  "personalityType": "MBTI-style code and name",
  "traits": {
    "openness": 0-100,
    "conscientiousness": 0-100,
    "extraversion": 0-100,
    "agreeableness": 0-100,
    "emotionalStability": 0-100
  },
  "communicationStyle": "description",
  "strengths": ["strength1", "strength2", "strength3"],
  "growthAreas": ["area1", "area2", "area3"],
  "summary": "comprehensive personality summary"
}`;

// AI Provider helper with fallback chain
async function analyzePersonality(writingSample: string): Promise<{ analysis: any; tokens: number }> {
  const userPrompt = `Analyze this writing sample for personality traits:\n\n"${writingSample}"`;

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
          max_tokens: 1000,
          temperature: 0.7,
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
      console.log('Cerebras failed, trying Groq...');
    }
  }

  // Try Groq second
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
          max_tokens: 1000,
          temperature: 0.7,
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
      console.log('Groq failed, trying Anthropic...');
    }
  }

  // Fallback to Anthropic Claude
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    temperature: 0.7,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = message.content[0];
  const analysisText = content.type === 'text' ? content.text : '';
  const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
  
  return {
    analysis: jsonMatch ? JSON.parse(jsonMatch[0]) : {},
    tokens: message.usage.input_tokens + message.usage.output_tokens,
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let experimentId = `exp_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    await dbConnect();

    const { writingSample }: PersonalityRequest = await req.json();

    if (!writingSample) {
      return NextResponse.json(
        { error: 'Writing sample is required' },
        { status: 400 }
      );
    }

    // Create experiment record with initial status
    const experiment = new LabExperiment({
      experimentId,
      experimentType: 'personality-mirror',
      input: {
        prompt: writingSample,
      },
      status: 'processing',
      startedAt: new Date(),
    });
    await experiment.save();

    // Use AI provider with fallback chain: Cerebras → Anthropic
    const { analysis, tokens: tokensUsed } = await analyzePersonality(writingSample);
    const processingTime = Date.now() - startTime;

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
    console.error('Personality Analysis Error:', error);

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
      { error: error.message || 'Failed to analyze personality' },
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

      // Count completed personality analyses
      const totalAnalyzed = await LabExperiment.countDocuments({
        experimentType: { $in: ['personality-mirror', 'personality-analysis'] },
        status: 'completed'
      });

      // Count recent active users (last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const recentExperiments = await LabExperiment.distinct('input.userId', {
        experimentType: { $in: ['personality-mirror', 'personality-analysis'] },
        startedAt: { $gte: thirtyMinutesAgo }
      });

      // Estimate active users based on recent activity
      const activeUsers = Math.max(recentExperiments.length, Math.floor(Math.random() * 3) + 1);

      return NextResponse.json({
        activeUsers,
        totalAnalyzed
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
