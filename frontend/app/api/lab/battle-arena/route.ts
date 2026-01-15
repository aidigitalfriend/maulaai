import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import { LabExperiment } from '@/lib/models/LabExperiment';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface BattleRequest {
  prompt: string;
  model1: string;
  model2: string;
  round: number;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let experimentId = `exp_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    await dbConnect();

    const { prompt, model1, model2, round }: BattleRequest = await req.json();

    if (!prompt || !model1 || !model2) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, model1, model2' },
        { status: 400 }
      );
    }

    // Prevent same model battle
    if (model1 === model2) {
      return NextResponse.json(
        { error: 'Cannot battle the same model against itself' },
        { status: 400 }
      );
    }

    // Create experiment record with initial status
    const experiment = new LabExperiment({
      experimentId,
      experimentType: 'battle-arena',
      input: {
        prompt,
        settings: { model1, model2, round },
      },
      status: 'processing',
      startedAt: new Date(),
    });
    await experiment.save();

    // Get responses from both models in parallel
    const [response1, response2] = await Promise.all([
      getModelResponse(model1, prompt, round),
      getModelResponse(model2, prompt, round),
    ]);

    const responseTime = Date.now() - startTime;
    const totalTokens = (response1.tokens || 0) + (response2.tokens || 0);

    const battleResult = {
      round,
      model1: {
        name: model1,
        response: response1.text,
        responseTime: response1.time,
        tokens: response1.tokens,
      },
      model2: {
        name: model2,
        response: response2.text,
        responseTime: response2.time,
        tokens: response2.tokens,
      },
      totalTime: responseTime,
    };

    // Update experiment with results
    await LabExperiment.findOneAndUpdate(
      { experimentId },
      {
        output: {
          result: battleResult,
          metadata: { totalTokens, responseTime },
        },
        status: 'completed',
        processingTime: responseTime,
        tokensUsed: totalTokens,
        completedAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      ...battleResult,
      experimentId,
    });
  } catch (error: any) {
    console.error('Battle Arena Error:', error);

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
      { error: error.message || 'Failed to generate battle responses' },
      { status: 500 }
    );
  }
}

async function getModelResponse(model: string, prompt: string, round: number) {
  const startTime = Date.now();

  try {
    switch (model) {
      case 'gpt-4': {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are participating in an AI Battle Arena (Round ${round}/3). Give your best, most impressive response to win the user's vote. Be creative, accurate, and engaging.`,
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.8,
        });

        return {
          text: completion.choices[0].message.content || '',
          time: Date.now() - startTime,
          tokens: completion.usage?.total_tokens || 0,
        };
      }

      case 'claude-3': {
        const message = await anthropic.messages.create({
          model: 'claude-3-opus-20240229',
          max_tokens: 500,
          temperature: 0.8,
          system: `You are participating in an AI Battle Arena (Round ${round}/3). Give your best, most impressive response to win the user's vote. Be creative, accurate, and engaging.`,
          messages: [{ role: 'user', content: prompt }],
        });

        const content = message.content[0];
        return {
          text: content.type === 'text' ? content.text : '',
          time: Date.now() - startTime,
          tokens: message.usage.input_tokens + message.usage.output_tokens,
        };
      }

      case 'gemini': {
        const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await geminiModel.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `[AI Battle Arena - Round ${round}/3]\n\n${prompt}\n\nGive your best response to win the vote!`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.8,
          },
        });

        const response = await result.response;
        return {
          text: response.text(),
          time: Date.now() - startTime,
          tokens: 0, // Gemini doesn't return token count easily
        };
      }

      case 'mistral': {
        // Using OpenAI-compatible endpoint for Mistral
        const response = await fetch(
          'https://api.mistral.ai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'mistral-large-latest',
              messages: [
                {
                  role: 'system',
                  content: `You are participating in an AI Battle Arena (Round ${round}/3). Give your best, most impressive response to win the user's vote. Be creative, accurate, and engaging.`,
                },
                { role: 'user', content: prompt },
              ],
              max_tokens: 500,
              temperature: 0.8,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Mistral API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          text: data.choices[0].message.content,
          time: Date.now() - startTime,
          tokens: data.usage?.total_tokens || 0,
        };
      }

      case 'cerebras': {
        // Cerebras - Ultra fast Llama 3.3 70B
        const response = await fetch(
          'https://api.cerebras.ai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b',
              messages: [
                {
                  role: 'system',
                  content: `You are participating in an AI Battle Arena (Round ${round}/3). Give your best, most impressive response to win the user's vote. Be creative, accurate, and engaging.`,
                },
                { role: 'user', content: prompt },
              ],
              max_tokens: 500,
              temperature: 0.8,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Cerebras API error: ${response.statusText}`);
        }

        const cereData = await response.json();
        return {
          text: cereData.choices[0].message.content,
          time: Date.now() - startTime,
          tokens: cereData.usage?.total_tokens || 0,
        };
      }

      case 'groq': {
        // Groq - Fast Llama inference
        const response = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'system',
                  content: `You are participating in an AI Battle Arena (Round ${round}/3). Give your best, most impressive response to win the user's vote. Be creative, accurate, and engaging.`,
                },
                { role: 'user', content: prompt },
              ],
              max_tokens: 500,
              temperature: 0.8,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Groq API error: ${response.statusText}`);
        }

        const groqData = await response.json();
        return {
          text: groqData.choices[0].message.content,
          time: Date.now() - startTime,
          tokens: groqData.usage?.total_tokens || 0,
        };
      }

      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  } catch (error) {
    console.error(`Error with ${model}:`, error);
    throw error;
  }
}
