import { NextRequest, NextResponse } from 'next/server'

// Initialize Gemini API client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

export async function POST(request: NextRequest) {
  try {
    const { message, model, conversationId } = await request.json()

    if (!message || !model) {
      return NextResponse.json(
        { error: 'Missing message or model' },
        { status: 400 }
      )
    }

    let response

    // Route to appropriate LLM provider
    if (model.startsWith('gemini')) {
      response = await callGeminiAPI(message, model)
    } else if (model.startsWith('gpt')) {
      response = await callOpenAIAPI(message, model)
    } else if (model.startsWith('claude')) {
      response = await callAnthropicAPI(message, model)
    } else if (model.startsWith('mistral')) {
      response = await callMistralAPI(message, model)
    } else {
      return NextResponse.json(
        { error: 'Unsupported model' },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

async function callGeminiAPI(message: string, model: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  const modelId = model === 'gemini-pro' ? 'gemini-pro' : 'gemini-pro-vision'

  const response = await fetch(
    `${GEMINI_API_URL}/${modelId}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!textContent) {
    throw new Error('No text content in Gemini response')
  }

  return textContent
}

async function callOpenAIAPI(message: string, model: string): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response'
}

async function callAnthropicAPI(message: string, model: string): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    throw new Error('Anthropic API key not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [{ role: 'user', content: message }],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || 'No response'
}

async function callMistralAPI(message: string, model: string): Promise<string> {
  const mistralKey = process.env.MISTRAL_API_KEY
  if (!mistralKey) {
    throw new Error('Mistral API key not configured')
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mistralKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'mistral-medium',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Mistral API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response'
}
