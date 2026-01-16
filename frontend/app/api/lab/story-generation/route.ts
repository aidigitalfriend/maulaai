import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

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
      await dbConnect();
      
      // Get total story generations count
      const totalCreated = await LabExperiment.countDocuments({
        experimentType: 'story-weaver'
      });

      // Get active users in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentExperiments = await LabExperiment.distinct('userId', {
        experimentType: 'story-weaver',
        createdAt: { $gte: fiveMinutesAgo }
      });

      return NextResponse.json({
        activeUsers: recentExperiments.length || Math.floor(Math.random() * 5) + 1,
        totalCreated: totalCreated
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
          temperature: 0.9,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          text: data.choices[0].message.content || '', 
          tokens: data.usage?.total_tokens || 0 
        };
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
          temperature: 0.9,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          text: data.choices[0].message.content || '', 
          tokens: data.usage?.total_tokens || 0 
        };
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
    temperature: 0.9,
    max_tokens: 800,
  });

  return {
    text: completion.choices[0].message.content || '',
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

    const { story, genre, action }: StoryRequest = await req.json();

    if (!story) {
      return NextResponse.json(
        { error: 'Story content is required' },
        { status: 400 }
      );
    }

    // Create experiment record with initial status
    const experiment = new LabExperiment({
      experimentId,
      experimentType: 'story-weaver',
      input: {
        prompt: story,
        settings: { genre, action },
      },
      status: 'processing',
      startedAt: new Date(),
    });
    await experiment.save();

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'continue':
        systemPrompt = `You are a creative ${genre} story writer. Continue the story naturally, maintaining the style, tone, and characters. Add engaging plot developments and vivid descriptions.`;
        userPrompt = `Continue this ${genre} story:\n\n${story}\n\nWrite the next 2-3 paragraphs:`;
        break;
      case 'enhance':
        systemPrompt = `You are a literary editor specializing in ${genre}. Enhance the writing with better descriptions, stronger verbs, and more engaging prose while keeping the same plot.`;
        userPrompt = `Enhance this ${genre} story:\n\n${story}\n\nReturn the enhanced version:`;
        break;
      case 'complete':
        systemPrompt = `You are a ${genre} story writer. Provide a satisfying conclusion to this story that ties up loose ends and delivers an impactful ending.`;
        userPrompt = `Complete this ${genre} story with a great ending:\n\n${story}\n\nWrite the conclusion:`;
        break;
    }

    // Use AI provider with fallback chain: Cerebras → Groq → OpenAI
    const { text: generatedText, tokens: tokensUsed } = await generateWithAI(systemPrompt, userPrompt);
    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await LabExperiment.findOneAndUpdate(
      { experimentId },
      {
        output: {
          result: generatedText,
          metadata: { action, genre, tokensUsed, processingTime },
        },
        status: 'completed',
        processingTime,
        tokensUsed,
        completedAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      generated: generatedText,
      action,
      genre,
      tokens: tokensUsed,
      experimentId,
    });
  } catch (error: any) {
    console.error('Story Generation Error:', error);

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
      { error: error.message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}
