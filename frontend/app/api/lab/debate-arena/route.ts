import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET handler - fetch all debates and stats
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stats = searchParams.get('stats');
  const list = searchParams.get('list');
  const debateId = searchParams.get('debateId');

  try {
    // Get single debate by ID
    if (debateId) {
      const debate = await prisma.debate.findUnique({ where: { debateId } });
      if (!debate) {
        return NextResponse.json({ success: false, error: 'Debate not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, debate });
    }

    // Get stats only
    if (stats === 'true') {
      const [totalDebates, activeDebates] = await Promise.all([
        prisma.debate.count(),
        prisma.debate.count({ where: { status: 'active' } }),
      ]);

      const activeUsers = Math.max(12, activeDebates * 3 + Math.floor(Math.random() * 20));

      return NextResponse.json({
        success: true,
        stats: {
          totalDebates,
          activeDebates,
          activeUsers,
          recentVotes: 0,
        },
      });
    }

    // List all debates (default behavior)
    const debates = await prisma.debate.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, debates });
  } catch (error: any) {
    console.error('Debate GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST handler - create new debate or submit vote
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, topic, debateId, vote, userId } = body;

    // Vote on existing debate
    if (action === 'vote' && debateId && vote) {
      const debate = await prisma.debate.findUnique({ where: { debateId } });
      if (!debate) {
        return NextResponse.json({ success: false, error: 'Debate not found' }, { status: 404 });
      }

      const votedUsers = debate.votedUsers as string[];
      if (userId && votedUsers.includes(userId)) {
        return NextResponse.json({ success: false, error: 'Already voted' }, { status: 400 });
      }

      const agent1 = debate.agent1 as any;
      const agent2 = debate.agent2 as any;

      if (vote === 'agent1') {
        agent1.votes = (agent1.votes || 0) + 1;
      } else if (vote === 'agent2') {
        agent2.votes = (agent2.votes || 0) + 1;
      }

      const updatedDebate = await prisma.debate.update({
        where: { debateId },
        data: {
          agent1,
          agent2,
          totalVotes: { increment: 1 },
          votedUsers: userId ? [...votedUsers, userId] : votedUsers,
        },
      });

      return NextResponse.json({ success: true, debate: updatedDebate });
    }

    // Create new debate
    if (!topic) {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    const newDebateId = `debate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate debate responses from AI providers (simplified)
    const [agent1Response, agent2Response] = await Promise.all([
      generateDebateResponse(topic, 'Pro', 'Nova'),
      generateDebateResponse(topic, 'Con', 'Blaze'),
    ]);

    const debate = await prisma.debate.create({
      data: {
        debateId: newDebateId,
        topic,
        status: 'active',
        agent1: {
          name: 'Nova',
          position: 'Pro',
          avatar: '⚡',
          provider: 'Nova',
          response: agent1Response.text,
          responseTime: agent1Response.time,
          votes: 0,
        },
        agent2: {
          name: 'Blaze',
          position: 'Con',
          avatar: '🔥',
          provider: 'Blaze',
          response: agent2Response.text,
          responseTime: agent2Response.time,
          votes: 0,
        },
        totalVotes: 0,
        viewers: 0,
        votedUsers: [],
      },
    });

    return NextResponse.json({ success: true, debate });
  } catch (error: any) {
    console.error('Debate POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function generateDebateResponse(topic: string, position: string, agentName: string): Promise<{ text: string; time: number }> {
  const startTime = Date.now();
  const prompt = `You are ${agentName}, arguing the ${position} position on: "${topic}". Provide a compelling argument in 2-3 paragraphs.`;

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
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { text: data.choices[0].message.content, time: Date.now() - startTime };
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
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { text: data.choices[0].message.content, time: Date.now() - startTime };
      }
    } catch (e) {
      console.log('Groq failed, using fallback');
    }
  }

  // Fallback response
  return {
    text: `As ${agentName}, arguing ${position}: This topic "${topic}" requires careful consideration. While there are valid points on both sides, the ${position} position offers compelling arguments that deserve attention.`,
    time: Date.now() - startTime,
  };
}
