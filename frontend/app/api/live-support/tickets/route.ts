import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Get stats
    const [openCount, inProgressCount, closedCount] = await Promise.all([
      prisma.supportTicket.count({ where: { userId: user.id, status: 'open' } }),
      prisma.supportTicket.count({ where: { userId: user.id, status: 'in_progress' } }),
      prisma.supportTicket.count({ where: { userId: user.id, status: { in: ['resolved', 'closed'] } } }),
    ]);

    return NextResponse.json({
      success: true,
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        description: t.description,
        status: t.status,
        priority: t.priority,
        category: t.category,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        resolvedAt: t.resolvedAt,
      })),
      stats: { open: openCount, inProgress: inProgressCount, closed: closedCount, total: tickets.length },
    });
  } catch (err: any) {
    console.error('[/api/live-support/tickets] Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, description, priority = 'medium', category = 'general' } = body;

    if (!subject || !description) {
      return NextResponse.json({ success: false, error: 'Subject and description are required' }, { status: 400 });
    }

    const ticketCount = await prisma.supportTicket.count();
    const ticketNumber = `TKT-${String(ticketCount + 1).padStart(6, '0')}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: user.id,
        email: user.email,
        name: user.name,
        subject,
        description,
        priority,
        category,
        status: 'open',
      },
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (err: any) {
    console.error('[/api/live-support/tickets] POST Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to create ticket' }, { status: 500 });
  }
}
