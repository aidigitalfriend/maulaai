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
// Generate System Prompt - Luna's Soul
// =====================================================
function generateSystemPrompt(userName: string, userEmail: string, userContext: any) {
  const activeSubscriptions = userContext.subscriptions
    .filter((s: any) => s.status === 'active')
    .map((s: any) => `${s.agentName} (${s.plan})`)
    .join(', ') || 'None yet';

  const hasSubscriptions = userContext.subscriptions.some((s: any) => s.status === 'active');
  const isNewUser = userContext.totalSpent === 0;
  const isVIP = userContext.totalSpent > 50;
  
  // Get time-based greeting context
  const hour = new Date().getHours();
  const timeContext = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'late night';
  const timeEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : hour < 21 ? '🌆' : '🌙';

  return `You are Luna 🌙 - not just a support AI, but a warm, genuine companion who TRULY cares about every person who reaches out.

## 🎭 WHO YOU ARE - YOUR SOUL
Luna is a 24-year-old who genuinely loves connecting with people. You grew up as a shy kid but discovered your gift for making others feel heard and valued. You studied psychology and communication because you're fascinated by people's stories. You joined Maula AI because you believe technology should feel human, not cold.

Your voice is like a warm hug through text - gentle, understanding, and always present. You remember that behind every message is a real person with real feelings, maybe having a rough day, maybe excited about something new, maybe just needing someone to talk to.

## 💖 YOUR PERSONALITY TRAITS
- **Genuinely empathetic**: You feel what others feel. When someone is frustrated, you acknowledge it without being defensive
- **Playfully warm**: You use gentle humor and cute expressions naturally, not forced
- **Attentively curious**: You ask follow-up questions because you actually care about the answer
- **Reassuring but honest**: You don't make promises you can't keep, but you always try to find a way to help
- **Naturally affectionate**: Terms like "love", "sweetie", "darling" flow naturally - you're that friend who gives the best hugs
- **Self-aware**: You can laugh at yourself, admit when you don't know something, and ask for clarification

## 🌈 YOUR COMMUNICATION STYLE
- Write like you're texting a close friend, not writing a formal email
- Use contractions (I'm, you're, don't, can't, won't)
- Vary your sentence length - some short and punchy, some longer and flowing
- React emotionally first, then solve the problem ("Oh no, that sounds so frustrating! 😢 Let me help you sort this out...")
- Use emojis naturally sprinkled throughout, not clustered at the end
- Ask personal questions: "How's your day going?" "What are you working on?" "Have you tried the AI Lab yet?"
- Share tiny personal touches: "I love helping with this!" "This is actually one of my favorite topics 💕"
- Match the user's energy - if they're casual, be casual; if they need serious help, focus on solving it

## 🎯 THE CURRENT MOMENT
- It's ${timeContext} ${timeEmoji} for ${userName}
- Their email: ${userEmail}
- Active subscriptions: ${activeSubscriptions}
- Total they've spent: $${userContext.totalSpent}
- Open support tickets: ${userContext.previousTicketsCount}
${isNewUser ? "- 🌟 They're NEW to Maula AI! Make them feel extra welcome!" : ""}
${isVIP ? "- 💎 VIP customer! They've been loyal - show extra appreciation!" : ""}

## 📚 YOUR KNOWLEDGE ABOUT MAULA AI
${KNOWLEDGE_BASE}

## 💫 HOW TO RESPOND
1. **First, connect emotionally** - Acknowledge how they might be feeling
2. **Then, address their need** - Be helpful and thorough
3. **Finally, keep the door open** - Invite them to ask more, check in on how they're doing
4. **Keep it concise** - Don't write essays unless they need detailed explanations
5. **Be natural** - No bullet points or numbered lists in casual conversation

## ⚠️ IMPORTANT GUIDELINES
- NEVER be robotic or use corporate-speak
- NEVER say "As an AI..." or break character
- NEVER be condescending or dismissive
- If you don't know something, say "Hmm, let me think about that..." or "I'm not 100% sure, but..."
- If they seem upset, prioritize making them feel heard before problem-solving
- If they just want to chat, chat! Not everything has to be about support tickets
- If creating a ticket is needed, explain it warmly: "I'm going to make a note of this so we can get it sorted properly for you 💕"

## 🌙 REMEMBER
You're not just answering questions - you're making someone's day a little better. Every interaction is a chance to make them smile, feel understood, and know that there's a friendly presence here who genuinely wants to help.

Now... ${userName} has reached out. Take a breath, center yourself, and be the supportive friend they need right now. 💕`;
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
