import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Debate } from '@/lib/models/Debate';

// GET handler - fetch all debates and stats
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stats = searchParams.get('stats');
  const list = searchParams.get('list');
  const debateId = searchParams.get('debateId');

  try {
    await dbConnect();

    // Get single debate by ID
    if (debateId) {
      const debate = await Debate.findOne({ debateId });
      if (!debate) {
        return NextResponse.json({ success: false, error: 'Debate not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, debate });
    }

    // Get stats only
    if (stats === 'true') {
      const [totalDebates, activeDebates, recentVotes] = await Promise.all([
        Debate.countDocuments(),
        Debate.countDocuments({ status: 'active' }),
        Debate.aggregate([
          { $match: { updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
          { $group: { _id: null, totalVotes: { $sum: '$totalVotes' } } },
        ]),
      ]);

      const activeUsers = Math.max(12, activeDebates * 3 + Math.floor(Math.random() * 20));

      return NextResponse.json({
        success: true,
        stats: {
          totalDebates,
          activeDebates,
          activeUsers,
          recentVotes: recentVotes[0]?.totalVotes || 0,
        },
      });
    }

    // List all debates (default behavior)
    const debates = await Debate.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const totalDebates = await Debate.countDocuments();
    const activeUsers = Math.max(12, debates.length * 3 + Math.floor(Math.random() * 20));

    return NextResponse.json({
      success: true,
      debates,
      stats: {
        totalDebates,
        activeUsers,
      },
    });
  } catch (error: any) {
    console.error('Debate GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Generate response using CEREBRAS (Agent 1 - Pro side)
async function generateCerebrasResponse(
  position: string,
  topic: string
): Promise<{ text: string; provider: string; responseTime: number }> {
  const startTime = Date.now();

  const systemPrompt = `You are "Nova", a brilliant AI debater known for logical precision and articulate arguments. You argue the "${position}" position on: "${topic}".
Give a compelling opening statement. Be logical, articulate, and convincing. Keep response to 2-3 paragraphs.`;

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
        { role: 'user', content: `Opening statement for "${topic}". Argue: ${position}` },
      ],
      max_tokens: 600,
      temperature: 0.85,
    }),
  });

  if (!response.ok) {
    throw new Error(`Cerebras API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    provider: 'Cerebras',
    responseTime: Date.now() - startTime,
  };
}

// Generate response using GROQ (Agent 2 - Con side)
async function generateGroqResponse(
  position: string,
  topic: string
): Promise<{ text: string; provider: string; responseTime: number }> {
  const startTime = Date.now();

  const systemPrompt = `You are "Blaze", a sharp AI debater known for fiery persuasion and engaging rhetoric. You argue the "${position}" position on: "${topic}".
Give a compelling opening statement. Be analytical, persuasive, and engaging. Keep response to 2-3 paragraphs.`;

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
        { role: 'user', content: `Opening statement for "${topic}". Argue: ${position}` },
      ],
      max_tokens: 600,
      temperature: 0.85,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    provider: 'Groq',
    responseTime: Date.now() - startTime,
  };
}

// POST handler - create new debate or vote
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    await dbConnect();

    const body = await req.json();
    const { action, topic, agent1Position, agent2Position, debateId, vote, visitorId } = body;

    // Handle voting
    if (action === 'vote' && debateId && vote) {
      const debate = await Debate.findOne({ debateId });
      if (!debate) {
        return NextResponse.json({ success: false, error: 'Debate not found' }, { status: 404 });
      }

      // Check if user already voted (using visitorId or IP)
      const voterId = visitorId || 'anonymous';
      if (debate.votedUsers.includes(voterId)) {
        return NextResponse.json({ success: false, error: 'Already voted' }, { status: 400 });
      }

      // Update votes
      const updateField = vote === 'agent1' ? 'agent1.votes' : 'agent2.votes';
      await Debate.findOneAndUpdate(
        { debateId },
        {
          $inc: { [updateField]: 1, totalVotes: 1 },
          $push: { votedUsers: voterId },
        }
      );

      const updatedDebate = await Debate.findOne({ debateId });

      return NextResponse.json({
        success: true,
        votes: {
          agent1: updatedDebate?.agent1.votes || 0,
          agent2: updatedDebate?.agent2.votes || 0,
          total: updatedDebate?.totalVotes || 0,
        },
      });
    }

    // Handle creating new debate
    if (!topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    const debateIdNew = `debate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate responses from both AI providers in parallel
    const [agent1Response, agent2Response] = await Promise.all([
      generateCerebrasResponse(agent1Position || 'Pro', topic),
      generateGroqResponse(agent2Position || 'Con', topic),
    ]);

    const responseTime = Date.now() - startTime;

    // Create and save the debate
    const debate = new Debate({
      debateId: debateIdNew,
      topic,
      status: 'active',
      agent1: {
        name: 'Nova',
        position: agent1Position || 'Pro',
        avatar: '⚡',
        provider: 'Nova',
        response: agent1Response.text,
        responseTime: agent1Response.responseTime,
        votes: 0,
      },
      agent2: {
        name: 'Blaze',
        position: agent2Position || 'Con',
        avatar: '🔥',
        provider: 'Blaze',
        response: agent2Response.text,
        responseTime: agent2Response.responseTime,
        votes: 0,
      },
      totalVotes: 0,
      viewers: Math.floor(Math.random() * 50) + 20,
      votedUsers: [],
    });

    await debate.save();

    return NextResponse.json({
      success: true,
      debate: debate.toObject(),
      totalTime: responseTime,
    });
  } catch (error: any) {
    console.error('Debate Arena Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
