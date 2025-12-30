import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface StoryRequest {
  story: string;
  genre: string;
  action: 'continue' | 'enhance' | 'complete';
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 800,
    });

    const generatedText = completion.choices[0].message.content || '';
    const processingTime = Date.now() - startTime;
    const tokensUsed = completion.usage?.total_tokens || 0;

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
