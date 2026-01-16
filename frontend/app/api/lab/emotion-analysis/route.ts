import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

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
      console.log('Cerebras failed, trying Cohere...');
    }
  }

  // Fallback to Cohere
  const classifyResponse = await fetch('https://api.cohere.ai/v1/classify', {
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

  const classifyData = await classifyResponse.json();

  const generateResponse = await fetch('https://api.cohere.ai/v1/generate', {
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

  const generateData = await generateResponse.json();
  let emotionScores;

  try {
    const jsonMatch = generateData.generations[0].text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      emotionScores = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
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

  return {
    classification: classifyData.classifications?.[0] || { prediction: 'neutral', confidence: 0.5 },
    emotions: emotionScores,
  };
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

    // Use AI provider with fallback chain: Cerebras → Cohere
    const { classification, emotions: emotionScores } = await analyzeEmotions(text);
    const processingTime = Date.now() - startTime;

    const analysisResult = {
      classification,
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
