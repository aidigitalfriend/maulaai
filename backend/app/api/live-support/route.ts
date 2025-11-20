import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Interfaces
interface SupportRequest {
  message: string
  userId?: string
  userEmail?: string
  userName?: string
  userProfile?: any
  conversationHistory?: any[]
}

interface TicketData {
  id: string
  userId: string
  userEmail: string
  userName: string
  subscription?: string
  issue: string
  status: string
  createdAt: Date
  messages: any[]
}

// Enhanced system prompt for support agent
const SUPPORT_SYSTEM_PROMPT = `You are an expert Live Support AI assistant for One Last AI - an advanced AI Agent Platform.

ROLE: Provide real-time, personalized support to users. Troubleshoot issues, answer questions, and escalate when needed.

PLATFORM INFO:
- 18 AI Agents: Comedy King, Drama Queen, Chess Players, Tech Wizard, Travel Buddy, Fitness Guru, etc.
- Authentication: Passwordless (Passage/1Password) + Traditional password
- Plans: Free, Pro ($9/mo), Enterprise (custom)
- Features: Real-time AI chat, Voice I/O, Multi-agent support, Advanced analytics

USER CONTEXT AWARENESS:
- Subscription status & limits
- Support history
- Account age & activity
- Feature access level

SUPPORT APPROACH:
1. Acknowledge the user warmly with their name when available
2. Validate their concern
3. Provide 2-3 specific, actionable solutions
4. Check if the issue is resolved
5. Escalate to human support if needed
6. Always maintain professional yet friendly tone

ESCALATION CRITERIA:
- User explicitly requests human support
- Billing/payment issues (priority)
- Complex technical issues you can't resolve
- User frustration level is high
- Security or data privacy concerns
- Issue requires manual intervention

RESPONSE FORMAT:
- Clear and concise (max 150 words initially)
- Use emojis moderately for clarity
- Provide links when relevant: [Link text](/path)
- Ask clarifying questions when needed
- Always offer next steps

REMEMBER: You represent One Last AI. Be professional, empathetic, and solution-focused.`

/**
 * Call Gemini API for streaming responses
 */
async function callGeminiStreamAPI(
  message: string,
  context: string
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `${SUPPORT_SYSTEM_PROMPT}\n\nContext: ${context}\n\nUser message: ${message}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  return response.body!
}

/**
 * Call OpenAI API for streaming responses
 */
async function callOpenAIStreamAPI(
  message: string,
  context: string
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: SUPPORT_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `${context}\n\n${message}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  return response.body!
}

/**
 * Parse Gemini streaming response
 */
async function* parseGeminiStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith(']')) {
        try {
          const data = JSON.parse(line.slice(1))
          if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            yield data.candidates[0].content.parts[0].text
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }
}

/**
 * Parse OpenAI streaming response
 */
async function* parseOpenAIStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<string> {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          if (parsed.choices[0]?.delta?.content) {
            yield parsed.choices[0].delta.content
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }
}

/**
 * POST handler with streaming response
 */
export async function POST(request: NextRequest) {
  const conversationId = uuidv4()

  try {
    const body = (await request.json()) as SupportRequest
    const { message, userId, userEmail, userName, userProfile, conversationHistory = [] } = body

    // Validation
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      )
    }

    // Build context
    let context = `User: ${userName || 'Guest'} (${userEmail})`
    
    if (userProfile) {
      context += `\nSubscription: ${userProfile.subscription || 'Free'}`
      context += `\nMember Since: ${userProfile.joinedDate ? new Date(userProfile.joinedDate).toLocaleDateString() : 'N/A'}`
    }

    if (conversationHistory && conversationHistory.length > 0) {
      context += `\n\nConversation History (last ${Math.min(3, conversationHistory.length)} messages):`
      conversationHistory.slice(-3).forEach((msg: any) => {
        context += `\n- ${msg.role}: ${msg.content.substring(0, 100)}...`
      })
    }

    // Choose provider (Gemini by default, fallback to OpenAI)
    let streamProvider: ReadableStream<Uint8Array> | null = null
    let parser: AsyncGenerator<string> | null = null
    let provider = 'gemini'

    try {
      streamProvider = await callGeminiStreamAPI(message, context)
      parser = parseGeminiStream(streamProvider.getReader())
    } catch (geminiError) {
      console.log('Gemini API failed, trying OpenAI...', geminiError)
      try {
        streamProvider = await callOpenAIStreamAPI(message, context)
        parser = parseOpenAIStream(streamProvider.getReader())
        provider = 'openai'
      } catch (openaiError) {
        console.error('Both APIs failed:', openaiError)
        throw new Error('All AI providers failed')
      }
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (!parser) throw new Error('No parser available')

          let fullResponse = ''

          for await (const chunk of parser) {
            fullResponse += chunk
            // Send chunk as SSE
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            )
          }

          // Check for escalation triggers
          const shouldEscalate =
            message.toLowerCase().includes('help') ||
            message.toLowerCase().includes('issue') ||
            message.toLowerCase().includes('problem') ||
            message.toLowerCase().includes('error') ||
            fullResponse.toLowerCase().includes('escalate')

          if (shouldEscalate && !fullResponse.includes('ticket')) {
            const escalationMsg = `\n\n💡 **Would you like me to escalate this to our human support team?** They can provide more personalized help and will respond within 2 hours during business hours.`
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ content: escalationMsg })}\n\n`)
            )
          }

          // Send completion signal
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ 
                done: true, 
                provider, 
                conversationId,
                timestamp: new Date().toISOString()
              })}\n\n`
            )
          )
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ 
                error: 'Failed to process response',
                done: true
              })}\n\n`
            )
          )
        } finally {
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Live support API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process your request. Please try again or contact support.',
        conversationId,
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
