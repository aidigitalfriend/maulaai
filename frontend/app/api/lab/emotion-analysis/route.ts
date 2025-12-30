import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

interface EmotionAnalysisRequest {
  text: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let experimentId = `exp_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    await dbConnect();

    const { text }: EmotionAnalysisRequest = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Create experiment record with initial status
    const experiment = new LabExperiment({
      experimentId,
      experimentType: 'emotion-visualizer',
      input: {
        prompt: text,
      },
      status: 'processing',
      startedAt: new Date(),
    });
    await experiment.save();

    // Using Cohere's sentiment analysis
    const response = await fetch('https://api.cohere.ai/v1/classify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [text],
        examples: [
          { text: "I'm so happy and excited!", label: 'joy' },
          { text: 'This is terrible and frustrating', label: 'anger' },
          { text: 'I feel sad and lonely', label: 'sadness' },
          { text: "I'm worried and anxious", label: 'fear' },
          { text: 'This is amazing and wonderful', label: 'joy' },
          { text: 'I trust you completely', label: 'trust' },
          { text: "I'm looking forward to this", label: 'anticipation' },
          { text: "Wow, that's unexpected!", label: 'surprise' },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Cohere API request failed');
    }

    const data = await response.json();

    // Also get detailed sentiment breakdown
    const sentimentResponse = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt: `Analyze the emotions in this text and provide intensity scores (0-100) for: joy, trust, anticipation, surprise, sadness, fear, anger, disgust. Also provide an overall sentiment score (-100 to 100). Return as JSON.

Text: "${text}"

JSON response:`,
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    const sentimentData = await sentimentResponse.json();
    let emotionScores;

    try {
      // Try to parse JSON from the generated text
      const jsonMatch = sentimentData.generations[0].text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        emotionScores = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback emotion scores
      emotionScores = {
        overall: 0,
        joy: 50,
        trust: 40,
        anticipation: 45,
        surprise: 30,
        sadness: 20,
        fear: 15,
        anger: 10,
        disgust: 5,
      };
    }

    const processingTime = Date.now() - startTime;

    const analysisResult = {
      classification: data.classifications[0],
      emotions: emotionScores,
      text,
    };

    // Update experiment with results
    await LabExperiment.findOneAndUpdate(
      { experimentId },
      {
        output: {
          result: analysisResult,
          metadata: { processingTime },
        },
        status: 'completed',
        processingTime,
        completedAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      ...analysisResult,
      experimentId,
    });
  } catch (error: any) {
    console.error('Emotion Analysis Error:', error);

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
      { error: error.message || 'Failed to analyze emotions' },
      { status: 500 }
    );
  }
}
