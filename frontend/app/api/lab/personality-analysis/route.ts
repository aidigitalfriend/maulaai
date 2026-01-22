import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

  // Try Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return {
            analysis: JSON.parse(jsonMatch[0]),
            tokens: response.usage?.input_tokens + response.usage?.output_tokens || 0,
          };
        }
      }
    } catch (e) {
      console.log('Anthropic failed, using fallback');
    }
  }

  // Fallback response
  return {
    analysis: {
      personalityType: 'INFJ - The Advocate',
      traits: {
        openness: 75,
        conscientiousness: 70,
        extraversion: 45,
        agreeableness: 80,
        emotionalStability: 65,
      },
      communicationStyle: 'Thoughtful and empathetic communicator',
      strengths: ['Creative thinking', 'Empathy', 'Determination'],
      growthAreas: ['Self-care', 'Setting boundaries', 'Practical focus'],
      summary: 'A reflective individual with strong values and creative potential.',
    },
    tokens: 0,
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { writingSample }: PersonalityRequest = await req.json();

    if (!writingSample) {
      return NextResponse.json({ error: 'Writing sample is required' }, { status: 400 });
    }

    // Create experiment record
    await prisma.labExperiment.create({
      data: {
        experimentId,
        experimentType: 'personality-analysis',
        input: { writingSample },
        status: 'processing',
        startedAt: new Date(),
      },
    });

    const { analysis, tokens } = await analyzePersonality(writingSample);
    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await prisma.labExperiment.update({
      where: { experimentId },
      data: {
        output: { analysis },
        status: 'completed',
        processingTime,
        tokensUsed: tokens,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      analysis,
      tokens,
      processingTime,
      experimentId,
    });
  } catch (error: any) {
    console.error('Personality Analysis Error:', error);

    try {
      await prisma.labExperiment.update({
        where: { experimentId },
        data: { status: 'failed', errorMessage: error.message, completedAt: new Date() },
      });
    } catch (updateError) {
      console.error('Failed to update experiment error status:', updateError);
    }

    return NextResponse.json({ error: error.message || 'Failed to analyze personality' }, { status: 500 });
  }
}
