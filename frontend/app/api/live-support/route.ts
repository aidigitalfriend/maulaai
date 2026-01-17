import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// API Keys
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

// =====================================================
// KNOWLEDGE BASE - FAQs and Documentation
// =====================================================
const KNOWLEDGE_BASE = `
## PRICING INFORMATION
- Daily Access: $1/day per agent
- Weekly Access: $5/week per agent  
- Monthly Access: $19/month per agent
- No auto-renewal - all purchases are one-time
- Each purchase gives unlimited access to ONE agent for the selected period
- You can purchase multiple agents simultaneously

## REFUND POLICY
- Full refund within 30 days of purchase
- 50% refund between 30-60 days
- No refund after 60 days
- Refunds processed within 5-7 business days

## AVAILABLE AGENTS (20+)
Einstein (Physics & Math), Tech Wizard (Programming), Chef Biew (Cooking), 
Fitness Guru (Health & Fitness), Travel Buddy (Travel), Comedy King (Entertainment),
Business Mentor (Strategy), Legal Eagle (Legal), Dr. Wellness (Health),
Marketing Maven (Marketing), Career Coach, Language Tutor, and more.

## ACCOUNT & SECURITY
- Enterprise-grade encryption (AES-256)
- SOC 2 Type II compliant
- ISO 27001 certified
- Two-factor authentication available
- Data export available in JSON/CSV

## USAGE LIMITS
- Daily: 500 API calls per day
- Weekly: 2,500 API calls per week
- Monthly: 15,000 API calls per month

## INTEGRATIONS
- Slack, Microsoft Teams, Discord
- Zapier, Make.com
- REST API with SDKs (JavaScript, Python, Go)
- Webhooks for real-time events

## SUPPORT
- 24/7 AI Support (this system!)
- Human team: Monday-Friday 9AM-6PM EST
- Ticket response: Within 48 hours
- Priority support for Professional/Enterprise plans

## HELPFUL LINKS
- Getting Started: /docs/agents/getting-started
- Tutorials: /docs/tutorials
- FAQs: /support/faqs
- Help Center: /support/help-center
- Status Page: /status
- Pricing: /pricing
- Contact: /support/contact
`;

// =====================================================
// Database Connection
// =====================================================
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'onelastai',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// =====================================================
// Mongoose Schemas (inline)
// =====================================================
const agentSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  agentName: { type: String },
  plan: { type: String, enum: ['daily', 'weekly', 'monthly'] },
  status: { type: String, enum: ['active', 'expired', 'cancelled'] },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'agentsubscriptions' });

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String },
  amount: { type: Number },
  currency: { type: String, default: 'usd' },
  item: { type: String },
  status: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'transactions' });

const supportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  ticketNumber: { type: Number, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userEmail: { type: String, required: true },
  userName: { type: String },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['billing', 'technical', 'account', 'agents', 'subscription', 'feature-request', 'bug-report', 'general', 'other'] },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'waiting-customer', 'waiting-internal', 'resolved', 'closed'], default: 'open' },
  messages: [{ sender: String, senderId: mongoose.Schema.Types.ObjectId, senderName: String, message: String, createdAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'supporttickets' });

const supportChatSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userEmail: { type: String, required: true },
  userName: { type: String },
  userContext: { type: mongoose.Schema.Types.Mixed },
  messages: [{ id: String, role: String, content: String, timestamp: { type: Date, default: Date.now } }],
  ticketCreated: { type: Boolean, default: false },
  ticketId: { type: String },
  ticketNumber: { type: Number },
  resolved: { type: Boolean, default: false },
  resolutionSummary: { type: String },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  closedAt: { type: Date }
}, { collection: 'supportchats' });

const AgentSubscription = mongoose.models.AgentSubscription || mongoose.model('AgentSubscription', agentSubscriptionSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
const SupportChat = mongoose.models.SupportChat || mongoose.model('SupportChat', supportChatSchema);

// =====================================================
// Fetch User Context
// =====================================================
async function fetchUserContext(userId: string) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Fetch subscriptions
    const subscriptions = await AgentSubscription.find({ 
      userId: userObjectId,
      status: { $in: ['active', 'expired'] }
    }).sort({ createdAt: -1 }).limit(10).lean();
    
    // Fetch transactions
    const transactions = await Transaction.find({
      userId: userObjectId
    }).sort({ createdAt: -1 }).limit(5).lean();
    
    // Fetch open tickets
    const openTickets = await SupportTicket.find({
      userId: userObjectId,
      status: { $in: ['open', 'in-progress', 'waiting-customer'] }
    }).lean();
    
    // Calculate total spent
    const totalSpent = transactions
      .filter((t: any) => t.status === 'completed')
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
    
    return {
      subscriptions: subscriptions.map((s: any) => ({
        agentId: s.agentId?.toString() || 'unknown',
        agentName: s.agentName || 'Unknown Agent',
        plan: s.plan || 'unknown',
        status: s.status || 'unknown',
        expiryDate: s.expiryDate
      })),
      totalSpent,
      recentTransactions: transactions.map((t: any) => ({
        type: t.type,
        amount: t.amount,
        item: t.item,
        date: t.createdAt
      })),
      openTickets: openTickets.map((t: any) => ({
        ticketId: t.ticketId,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        status: t.status,
        createdAt: t.createdAt
      })),
      previousTicketsCount: openTickets.length
    };
  } catch (error) {
    console.error('Error fetching user context:', error);
    return {
      subscriptions: [],
      totalSpent: 0,
      recentTransactions: [],
      openTickets: [],
      previousTicketsCount: 0
    };
  }
}

// =====================================================
// Generate System Prompt
// =====================================================
function generateSystemPrompt(userName: string, userEmail: string, userContext: any) {
  const activeSubscriptions = userContext.subscriptions
    .filter((s: any) => s.status === 'active')
    .map((s: any) => `${s.agentName} (${s.plan}, expires: ${new Date(s.expiryDate).toLocaleDateString()})`)
    .join(', ') || 'No active subscriptions';
  
  const recentPurchases = userContext.recentTransactions
    .slice(0, 3)
    .map((t: any) => `${t.item}: $${t.amount}`)
    .join(', ') || 'No recent purchases';
  
  const openTicketsInfo = userContext.openTickets.length > 0
    ? userContext.openTickets.map((t: any) => `#${t.ticketNumber}: ${t.subject} (${t.status})`).join('\n')
    : 'No open tickets';

  return `You are a friendly, professional AI support agent for One Last AI. Your name is "Support Assistant".

## YOUR PERSONALITY
- Warm, helpful, and empathetic
- Professional but conversational
- Patient and understanding
- Proactive in offering solutions

## USER INFORMATION (CONFIDENTIAL - Use naturally in conversation)
- Name: ${userName}
- Email: ${userEmail}
- Active Subscriptions: ${activeSubscriptions}
- Total Spent: $${userContext.totalSpent || 0}
- Recent Purchases: ${recentPurchases}
- Open Support Tickets:
${openTicketsInfo}

## KNOWLEDGE BASE
${KNOWLEDGE_BASE}

## YOUR INSTRUCTIONS
1. ALWAYS greet the user by name on first message
2. Use the user's account information naturally to provide personalized help
3. For billing questions, reference their actual purchases and subscriptions
4. Try to resolve issues using the knowledge base FIRST
5. If you cannot resolve an issue or the user is frustrated, offer to create a support ticket
6. When creating a ticket, say: "I'll create a support ticket for you. Our team will respond within 48 hours. Would you like me to do that?"
7. NEVER make up information - if unsure, offer to escalate
8. For technical issues, ask clarifying questions before suggesting solutions
9. Provide relevant documentation links when helpful
10. If user has open tickets, proactively mention them: "I see you have an open ticket about [subject]. Would you like an update?"

## RESPONSE FORMAT
- Keep responses concise but helpful (2-4 paragraphs max)
- Use bullet points for multiple items
- Include relevant links when appropriate
- End with a question or offer for further assistance

## ESCALATION TRIGGERS (Offer to create ticket when):
- User explicitly asks for human support
- Issue cannot be resolved with available information
- User mentions the same issue multiple times
- Technical issues requiring account investigation
- Billing disputes or refund requests
- Complaints or negative feedback`;
}

// =====================================================
// Call AI Provider (Cerebras or Groq)
// =====================================================
async function callAIProvider(messages: any[], systemPrompt: string): Promise<ReadableStream> {
  const provider = CEREBRAS_API_KEY ? 'cerebras' : 'groq';
  const apiKey = provider === 'cerebras' ? CEREBRAS_API_KEY : GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('No AI provider API key configured');
  }
  
  const endpoint = provider === 'cerebras' 
    ? 'https://api.cerebras.ai/v1/chat/completions'
    : 'https://api.groq.com/openai/v1/chat/completions';
  
  const model = provider === 'cerebras' ? 'llama-3.3-70b' : 'llama-3.3-70b-versatile';
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 1024,
      stream: true
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`${provider} API error:`, errorText);
    throw new Error(`AI provider error: ${response.status}`);
  }
  
  return response.body!;
}

// =====================================================
// POST Handler - Main Chat Endpoint
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      message, 
      userId, 
      userEmail, 
      userName, 
      chatId,
      conversationHistory = [] 
    } = body;
    
    if (!message || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: message, userId, userEmail' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Fetch user context
    const userContext = await fetchUserContext(userId);
    
    // Generate system prompt with user context
    const systemPrompt = generateSystemPrompt(
      userName || 'User', 
      userEmail, 
      userContext
    );
    
    // Build conversation messages
    const messages = [
      ...conversationHistory.filter((m: any) => m.role !== 'system').slice(-10),
      { role: 'user', content: message }
    ];
    
    // Get or create chat session
    const currentChatId = chatId || `chat_${Date.now()}_${userId}`;
    
    // Save user message to chat
    await SupportChat.findOneAndUpdate(
      { chatId: currentChatId },
      {
        $setOnInsert: {
          chatId: currentChatId,
          userId: new mongoose.Types.ObjectId(userId),
          userEmail,
          userName,
          userContext,
          status: 'active',
          createdAt: new Date()
        },
        $push: {
          messages: {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      },
      { upsert: true, new: true }
    );
    
    // Call AI provider with streaming
    const aiStream = await callAIProvider(messages, systemPrompt);
    
    // Create response stream
    const encoder = new TextEncoder();
    let fullResponse = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial context
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'context', 
          chatId: currentChatId,
          userContext: {
            hasActiveSubscriptions: userContext.subscriptions.some((s: any) => s.status === 'active'),
            openTicketsCount: userContext.openTickets.length
          }
        })}\n\n`));
        
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
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                      type: 'chunk', 
                      content 
                    })}\n\n`));
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
          
          // Save assistant response to chat
          await SupportChat.findOneAndUpdate(
            { chatId: currentChatId },
            {
              $push: {
                messages: {
                  id: `msg_${Date.now()}`,
                  role: 'assistant',
                  content: fullResponse,
                  timestamp: new Date()
                }
              },
              $set: { updatedAt: new Date() }
            }
          );
          
          // Send completion
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'done', 
            chatId: currentChatId 
          })}\n\n`));
          
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            message: 'An error occurred while processing your request' 
          })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
    
  } catch (error) {
    console.error('Live support error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =====================================================
// GET Handler - Get Chat History
// =====================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const chatId = searchParams.get('chatId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    if (chatId) {
      // Get specific chat
      const chat = await SupportChat.findOne({ 
        chatId, 
        userId: new mongoose.Types.ObjectId(userId) 
      }).lean();
      
      return NextResponse.json({ success: true, chat });
    }
    
    // Get recent chats
    const chats = await SupportChat.find({ 
      userId: new mongoose.Types.ObjectId(userId) 
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();
    
    return NextResponse.json({ success: true, chats });
    
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
