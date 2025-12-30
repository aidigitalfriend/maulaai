import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface PersonalityRequest {
  writingSample: string;
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

    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      system: `You are an expert psychologist and personality analyst. Analyze writing samples to determine personality traits using the Big Five model. Return analysis in JSON format with:
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
      }`,
      messages: [
        {
          role: 'user',
          content: `Analyze this writing sample for personality traits:\n\n"${writingSample}"`,
        },
      ],
    });

    const content = message.content[0];
    const analysisText = content.type === 'text' ? content.text : '';

    // Parse JSON from the response
    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      throw new Error('Failed to parse personality analysis');
    }

    const processingTime = Date.now() - startTime;
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

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
