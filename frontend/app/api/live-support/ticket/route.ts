import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionId } from '@/lib/session-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, description, priority = 'medium', category = 'general', chatId } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { success: false, error: 'Subject and description are required' },
        { status: 400 }
      );
    }

    const sessionId = getSessionId(request);
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (sessionId) {
      const user = await prisma.user.findFirst({
        where: { sessionId, sessionExpiry: { gt: new Date() }, isActive: true },
      });
      if (user) {
        userId = user.id;
        userEmail = user.email;
      }
    }

    // Generate ticket number
    const ticketCount = await prisma.supportTicket.count();
    const ticketNumber = `TKT-${String(ticketCount + 1).padStart(6, '0')}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        email: userEmail || body.email || 'unknown@maula.ai',
        name: body.name || null,
        subject,
        description,
        priority,
        category,
        status: 'open',
      },
    });

    // Link ticket to SupportChat if chatId provided (from Luna)
    if (chatId) {
      try {
        await prisma.supportChat.update({
          where: { chatId },
          data: {
            ticketCreated: true,
            ticketId: ticket.id,
            ticketNumber: parseInt(ticketNumber.replace('TKT-', ''), 10) || ticketCount + 1,
          },
        });
        console.log(`[/api/live-support/ticket] Linked ticket ${ticketNumber} to chat ${chatId}`);
      } catch (linkError) {
        console.warn(`[/api/live-support/ticket] Could not link to chat ${chatId}:`, linkError);
      }
    }

    console.log(`[/api/live-support/ticket] Created ticket ${ticketNumber}`);

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
      },
    });
  } catch (err: any) {
    console.error('[/api/live-support/ticket] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

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

    return NextResponse.json({
      success: true,
      tickets: tickets.map((t: typeof tickets[0]) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        category: t.category,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        resolvedAt: t.resolvedAt,
      })),
    });
  } catch (err: any) {
    console.error('[/api/live-support/ticket] GET Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
