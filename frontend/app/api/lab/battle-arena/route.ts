import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '@/lib/prisma';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface BattleRequest {
  prompt: string;
  model1: string;
  model2: string;
  round: number;
}

async function getModelResponse(model: string, prompt: string, round: number): Promise<{ text: string; time: number; tokens: number }> {
  const startTime = Date.now();
  const systemPrompt = `You are in a creative AI battle, round ${round}. Respond to the prompt creatively and engagingly. Be concise but impactful.`;

  try {
    // OpenAI models
    if (model.startsWith('gpt-')) {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.8,
      });
      return {
        text: response.choices[0].message.content || '',
        time: Date.now() - startTime,
        tokens: response.usage?.total_tokens || 0,
      };
    }

    // Anthropic models
    if (model.startsWith('claude-')) {
      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      const content = response.content[0];
      return {
        text: content.type === 'text' ? content.text : '',
        time: Date.now() - startTime,
        tokens: response.usage?.input_tokens + response.usage?.output_tokens || 0,
      };
    }

    // Cerebras / Llama
    if (model.includes('llama') && process.env.CEREBRAS_API_KEY) {
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
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          text: data.choices[0].message.content,
          time: Date.now() - startTime,
          tokens: data.usage?.total_tokens || 0,
        };
      }
    }

    // Groq fallback
    if (process.env.GROQ_API_KEY) {
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
            { role: 'user', content: prompt },
          ],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          text: data.choices[0].message.content,
          time: Date.now() - startTime,
          tokens: data.usage?.total_tokens || 0,
        };
      }
    }
  } catch (error) {
    console.error(`Error getting response from ${model}:`, error);
  }

  return {
    text: `Response from ${model}: This is a simulated response for demonstration purposes.`,
    time: Date.now() - startTime,
    tokens: 0,
  };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const experimentId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { prompt, model1, model2, round }: BattleRequest = await req.json();

    if (!prompt || !model1 || !model2) {
      return NextResponse.json({ error: 'Missing required fields: prompt, model1, model2' }, { status: 400 });
    }

    if (model1 === model2) {
      return NextResponse.json({ error: 'Cannot battle the same model against itself' }, { status: 400 });
    }

    // Create experiment record
    await prisma.labExperiment.create({
      data: {
        experimentId,
        experimentType: 'battle-arena',
        input: { prompt, settings: { model1, model2, round } },
        status: 'processing',
        startedAt: new Date(),
      },
    });

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
    await prisma.labExperiment.update({
      where: { experimentId },
      data: {
        output: battleResult,
        status: 'completed',
        processingTime: responseTime,
        tokensUsed: totalTokens,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      ...battleResult,
      experimentId,
    });
  } catch (error: any) {
    console.error('Battle Arena Error:', error);

    try {
      await prisma.labExperiment.update({
        where: { experimentId },
        data: { status: 'failed', errorMessage: error.message, completedAt: new Date() },
      });
    } catch (updateError) {
      console.error('Failed to update experiment error status:', updateError);
    }

    return NextResponse.json({ error: error.message || 'Battle failed' }, { status: 500 });
  }
}
