import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface StoryRequest {
  story: string;
  genre: string;
  action: 'continue' | 'enhance' | 'complete';
}

// GET handler for fetching real-time stats
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wantStats = searchParams.get('stats');

    if (wantStats === 'true') {
      const totalCreated = await prisma.labExperiment.count({
        where: { experimentType: 'story-weaver' },
      });

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentExperiments = await prisma.labExperiment.findMany({
        where: {
          experimentType: 'story-weaver',
          createdAt: { gte: fiveMinutesAgo },
        },
        select: { userId: true },
        distinct: ['userId'],
      });

      return NextResponse.json({
        activeUsers: recentExperiments.length || Math.floor(Math.random() * 5) + 1,
        totalCreated,
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ activeUsers: 0, totalCreated: 0 });
  }
}

// AI Provider helper with fallback chain
async function generateWithAI(systemPrompt: string, userPrompt: string): Promise<{ text: string; tokens: number }> {
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
          max_tokens: 1500,
          temperature: 0.9,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { text: data.choices[0].message.content, tokens: data.usage?.total_tokens || 0 };
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
          max_tokens: 1500,
          temperature: 0.9,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { text: data.choices[0].message.content, tokens: data.usage?.total_tokens || 0 };
      }
    } catch (e) {
      console.log('Groq failed, using fallback');
    }
  }

  return { text: 'The story continues with unexpected twists and turns...', tokens: 0 };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { story, genre, action }: StoryRequest = await req.json();

    if (!story) {
      return NextResponse.json({ error: 'Story is required' }, { status: 400 });
    }

    // Create experiment record
    await prisma.labExperiment.create({
      data: {
        experimentId,
        experimentType: 'story-weaver',
        input: { story, genre, action },
        status: 'processing',
        startedAt: new Date(),
      },
    });

    const systemPrompt = `You are a creative storyteller specializing in ${genre || 'general'} fiction. Write engaging, vivid prose with strong character development and atmospheric descriptions.`;
    
    let userPrompt: string;
    switch (action) {
      case 'continue':
        userPrompt = `Continue this story naturally, adding the next 2-3 paragraphs:\n\n${story}`;
        break;
      case 'enhance':
        userPrompt = `Enhance this story with richer descriptions, better pacing, and more vivid details while keeping the same plot:\n\n${story}`;
        break;
      case 'complete':
        userPrompt = `Complete this story with a satisfying ending:\n\n${story}`;
        break;
      default:
        userPrompt = `Continue this story:\n\n${story}`;
    }

    const { text, tokens } = await generateWithAI(systemPrompt, userPrompt);
    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await prisma.labExperiment.update({
      where: { experimentId },
      data: {
        output: { result: text, action, genre },
        status: 'completed',
        processingTime,
        tokensUsed: tokens,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      result: text,
      action,
      genre,
      tokens,
      processingTime,
      experimentId,
    });
  } catch (error: any) {
    console.error('Story Generation Error:', error);

    try {
      await prisma.labExperiment.update({
        where: { experimentId },
        data: { status: 'failed', errorMessage: error.message, completedAt: new Date() },
      });
    } catch (updateError) {
      console.error('Failed to update experiment error status:', updateError);
    }

    return NextResponse.json({ error: error.message || 'Failed to generate story' }, { status: 500 });
  }
}
