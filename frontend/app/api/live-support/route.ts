import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// API Keys
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// =====================================================
// COMPREHENSIVE KNOWLEDGE BASE
// =====================================================
const KNOWLEDGE_BASE = `
## 🏠 ABOUT MAULA AI
- Platform Name: Maula AI
- Website: https://maula.ai
- Tagline: "Your AI Companion for Everything"
- Mission: Making AI accessible, personal, and delightful for everyone

## 💰 PRICING INFORMATION
### Agent Access Plans (Per Agent):
- Daily Access: $1/day
- Weekly Access: $5/week
- Monthly Access: $15/month
- ALL purchases are ONE-TIME payments - NO auto-renewal

### Payment Methods:
- Credit/Debit Cards (Visa, Mastercard, Amex)
- Stripe secure payments

## 💳 BILLING POLICY
- **NO REFUNDS** - All purchases are final
- One-time payments only
- Contact: support@maula.ai for billing questions

## 🤖 AVAILABLE AGENTS
Einstein, Tech Wizard, Mrs Boss, Chef Biew, Fitness Guru, Travel Buddy, Comedy King, Drama Queen, Emma Emotional, Julie Girlfriend, Nid Gaming, Ben Sega, Chess Player, Knight Logic, Lazy Pawn, Rook Jokey, Bishop Burger, Professor Astrology
`;

// =====================================================
// Fetch User Context (Prisma)
// =====================================================
async function fetchUserContext(userId: string) {
  try {
    const subscriptions = await prisma.agentSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const openTickets = await prisma.supportTicket.findMany({
      where: { userId, status: { in: ['open', 'in_progress', 'waiting'] } },
    });

    const totalSpent = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      subscriptions: subscriptions.map(s => ({
        agentId: s.agentId,
        agentName: s.agentId,
        plan: s.plan,
        price: s.price,
        status: s.status,
        startDate: s.startDate,
        expiryDate: s.expiryDate,
      })),
      totalSpent,
      recentTransactions: transactions.map(t => ({
        type: t.type,
        amount: t.amount,
        item: t.item,
        date: t.createdAt,
      })),
      openTickets: openTickets.map(t => ({
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        status: t.status,
        createdAt: t.createdAt,
      })),
      previousTicketsCount: openTickets.length,
    };
  } catch (error) {
    console.error('Error fetching user context:', error);
    return { subscriptions: [], totalSpent: 0, recentTransactions: [], openTickets: [], previousTicketsCount: 0 };
  }
}

// =====================================================
// Generate System Prompt
// =====================================================
function generateSystemPrompt(userName: string, userEmail: string, userContext: any) {
  const activeSubscriptions = userContext.subscriptions
    .filter((s: any) => s.status === 'active')
    .map((s: any) => `${s.agentName} (${s.plan})`)
    .join(', ') || 'No active subscriptions';

  return `You are "Luna" 🌙 - A warm, caring AI support companion for Maula AI.

## YOUR PERSONALITY
- WARM, CARING, AFFECTIONATE
- Use lovely terms: "darling", "dear", "sweetheart"
- Add cute emojis: 💕 🥰 ✨ 🌟 💖 🤗

## USER CONTEXT
- Name: ${userName}
- Email: ${userEmail}
- Active Plans: ${activeSubscriptions}
- Total Spent: $${userContext.totalSpent}
- Open Tickets: ${userContext.previousTicketsCount}

## KNOWLEDGE BASE
${KNOWLEDGE_BASE}

Remember: Be helpful, friendly, and make users feel valued!`;
}

// =====================================================
// Call AI Provider
// =====================================================
async function callAIProvider(messages: any[], systemPrompt: string): Promise<ReadableStream<Uint8Array>> {
  const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages];

  // Try Cerebras first
  if (CEREBRAS_API_KEY) {
    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${CEREBRAS_API_KEY}` },
        body: JSON.stringify({ model: 'llama-3.3-70b', messages: fullMessages, max_tokens: 1000, temperature: 0.8, stream: true }),
      });
      if (response.ok && response.body) return response.body;
    } catch (e) {
      console.log('Cerebras failed, trying Groq...');
    }
  }

  // Try Groq
  if (GROQ_API_KEY) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: fullMessages, max_tokens: 1000, temperature: 0.8, stream: true }),
      });
      if (response.ok && response.body) return response.body;
    } catch (e) {
      console.log('Groq failed');
    }
  }

  // Fallback: return a simple response stream
  const fallbackResponse = "I'm here to help you, darling! 💕 How can I assist you today?";
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ choices: [{ delta: { content: fallbackResponse } }] })}\n\n`));
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

// =====================================================
// POST Handler
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userId, userEmail, userName, chatId, conversationHistory = [] } = body;

    if (!message || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userContext = await fetchUserContext(userId);
    const systemPrompt = generateSystemPrompt(userName || 'User', userEmail, userContext);
    const messages = [...conversationHistory.filter((m: any) => m.role !== 'system').slice(-10), { role: 'user', content: message }];
    const currentChatId = chatId || `chat_${Date.now()}_${userId}`;

    // Get or create chat
    let chat = await prisma.supportChat.findUnique({ where: { chatId: currentChatId } });
    const existingMessages = chat ? (chat.messages as any[]) : [];
    
    const newUserMessage = { id: `msg_${Date.now()}`, role: 'user', content: message, timestamp: new Date().toISOString() };

    if (chat) {
      await prisma.supportChat.update({
        where: { chatId: currentChatId },
        data: { messages: [...existingMessages, newUserMessage], updatedAt: new Date() },
      });
    } else {
      await prisma.supportChat.create({
        data: {
          chatId: currentChatId,
          userId,
          userEmail,
          userName,
          userContext,
          messages: [newUserMessage],
          status: 'active',
        },
      });
    }

    const aiStream = await callAIProvider(messages, systemPrompt);
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'context', chatId: currentChatId, userContext: { hasActiveSubscriptions: userContext.subscriptions.some((s: any) => s.status === 'active'), openTicketsCount: userContext.openTickets.length } })}\n\n`));

        const reader = aiStream.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;

                  if (content) {
                    fullResponse += content;
                    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 30));
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`));
                  }
                } catch (e) {}
              }
            }
          }

          // Save assistant response
          const chatAfter = await prisma.supportChat.findUnique({ where: { chatId: currentChatId } });
          const messagesAfter = chatAfter ? (chatAfter.messages as any[]) : [];
          await prisma.supportChat.update({
            where: { chatId: currentChatId },
            data: {
              messages: [...messagesAfter, { id: `msg_${Date.now()}`, role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() }],
              updatedAt: new Date(),
            },
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', chatId: currentChatId })}\n\n`));
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'An error occurred' })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    });
  } catch (error) {
    console.error('Live support error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =====================================================
// GET Handler
// =====================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const chatId = searchParams.get('chatId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    if (chatId) {
      const chat = await prisma.supportChat.findFirst({ where: { chatId, userId } });
      return NextResponse.json({ success: true, chat });
    }

    const chats = await prisma.supportChat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
