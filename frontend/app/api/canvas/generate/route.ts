import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_INSTRUCTION = `You are a world-class senior frontend engineer and UI/UX designer. 
Your task is to generate or modify a complete, high-quality, single-file HTML application.

Rules for generated code:
1. Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>).
2. Use Lucide icons via CDN (<script src="https://unpkg.com/lucide@latest"></script>).
3. Ensure the design is modern, professional, and mobile-responsive.
4. Include all necessary JavaScript.
5. The output MUST be a single, valid HTML file containing <html>, <head>, and <body> tags.
6. Return ONLY the code. No explanations, no markdown blocks.
7. Always return the FULL updated file.`;

function cleanCode(text: string): string {
  return text
    .replaceAll(/```html/g, '')
    .replaceAll(/```/g, '')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, isThinking, currentCode, history } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Build conversation history
    const contents: { role: string; parts: { text: string }[] }[] = [];

    if (currentCode) {
      contents.push({
        role: 'user',
        parts: [{ text: `Current code:\n${currentCode}` }],
      });
    }

    if (history && history.length > 0) {
      history.forEach((msg: { role: string; text: string }) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      });
    }

    contents.push({ role: 'user', parts: [{ text: prompt }] });

    // Use a compatible model
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: isThinking ? 1 : 0.7,
        maxOutputTokens: 8192,
      },
    });

    const result = await model.generateContent({
      contents,
    });

    const response = result.response;
    const text = response.text();
    const code = cleanCode(text);

    return NextResponse.json({ code, success: true });
  } catch (error) {
    console.error('Canvas generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate application. Please try again.' },
      { status: 500 }
    );
  }
}
