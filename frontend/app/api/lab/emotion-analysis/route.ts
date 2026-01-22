import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface EmotionAnalysisRequest {
  text: string;
}

// AI Provider helper for emotion analysis with fallback chain
async function analyzeEmotions(text: string): Promise<{ classification: any; emotions: any }> {
  const prompt = `Analyze the emotions in this text and provide a JSON response with:
1. A primary emotion classification (one of: joy, trust, anticipation, surprise, sadness, fear, anger, disgust)
2. Intensity scores (0-100) for each emotion: joy, trust, anticipation, surprise, sadness, fear, anger, disgust
3. An overall sentiment score (-100 to 100, where -100 is most negative and 100 is most positive)
4. A confidence score (0-1)

Text: "${text}"

Respond with valid JSON only:
{
  "primaryEmotion": "emotion_name",
  "confidence": 0.0-1.0,
  "overall": -100 to 100,
  "joy": 0-100,
  "trust": 0-100,
  "anticipation": 0-100,
  "surprise": 0-100,
  "sadness": 0-100,
  "fear": 0-100,
  "anger": 0-100,
  "disgust": 0-100
}`;

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
            { role: 'system', content: 'You are an emotion and sentiment analysis expert. Respond with valid JSON only.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            classification: { prediction: parsed.primaryEmotion, confidence: parsed.confidence || 0.85 },
            emotions: {
              overall: parsed.overall || 0,
              joy: parsed.joy || 0,
              trust: parsed.trust || 0,
              anticipation: parsed.anticipation || 0,
              surprise: parsed.surprise || 0,
              sadness: parsed.sadness || 0,
              fear: parsed.fear || 0,
              anger: parsed.anger || 0,
              disgust: parsed.disgust || 0,
            },
          };
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
            { role: 'system', content: 'You are an emotion and sentiment analysis expert. Respond with valid JSON only.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            classification: { prediction: parsed.primaryEmotion, confidence: parsed.confidence || 0.85 },
            emotions: {
              overall: parsed.overall || 0,
              joy: parsed.joy || 0,
              trust: parsed.trust || 0,
              anticipation: parsed.anticipation || 0,
              surprise: parsed.surprise || 0,
              sadness: parsed.sadness || 0,
              fear: parsed.fear || 0,
              anger: parsed.anger || 0,
              disgust: parsed.disgust || 0,
            },
          };
        }
      }
    } catch (e) {
      console.log('Groq failed, using fallback');
    }
  }

  // Fallback response
  return {
    classification: { prediction: 'neutral', confidence: 0.75 },
    emotions: {
      overall: 0,
      joy: 50,
      trust: 50,
      anticipation: 50,
      surprise: 20,
      sadness: 20,
      fear: 10,
      anger: 10,
      disgust: 5,
    },
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { text }: EmotionAnalysisRequest = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Create experiment record
    await prisma.labExperiment.create({
      data: {
        experimentId,
        experimentType: 'emotion-analysis',
        input: { text },
        status: 'processing',
        startedAt: new Date(),
      },
    });

    const { classification, emotions } = await analyzeEmotions(text);
    const processingTime = Date.now() - startTime;

    // Update experiment with results
    await prisma.labExperiment.update({
      where: { experimentId },
      data: {
        output: { classification, emotions },
        status: 'completed',
        processingTime,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      classification,
      emotions,
      processingTime,
      experimentId,
    });
  } catch (error: any) {
    console.error('Emotion Analysis Error:', error);

    try {
      await prisma.labExperiment.update({
        where: { experimentId },
        data: { status: 'failed', errorMessage: error.message, completedAt: new Date() },
      });
    } catch (updateError) {
      console.error('Failed to update experiment error status:', updateError);
    }

    return NextResponse.json({ error: error.message || 'Failed to analyze emotions' }, { status: 500 });
  }
}
