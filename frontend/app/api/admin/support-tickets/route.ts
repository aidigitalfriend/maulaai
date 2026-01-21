import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { 
  notifyNewReply, 
  notifyStatusChange, 
  notifySlaBreach 
} from '@/lib/services/emailNotifications';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Admin emails (in production, store in database with roles)
const ADMIN_EMAILS = [
  'admin@maula.ai',
  'support@maula.ai',
  'tech@maula.ai',
  // Add your admin emails here
];

// =====================================================
// Database Connection
// =====================================================
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not configured');

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
// Auth Check
// =====================================================
async function verifyAdmin(req: NextRequest): Promise<{ isAdmin: boolean; user?: any; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return { isAdmin: false, error: 'Not authenticated' };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user is admin
    // In production, check role in database
    const isAdmin = ADMIN_EMAILS.includes(decoded.email?.toLowerCase()) || 
                    decoded.role === 'admin' || 
                    decoded.isAdmin === true;
    
    if (!isAdmin) {
      return { isAdmin: false, error: 'Admin access required' };
    }

    return { isAdmin: true, user: decoded };
  } catch (error) {
    return { isAdmin: false, error: 'Invalid or expired token' };
  }
}

// =====================================================
// Mongoose Schema
// =====================================================
const supportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  ticketNumber: { type: Number, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userEmail: { type: String, required: true },
  userName: { type: String },
  subject: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  category: { type: String, enum: ['billing', 'technical', 'account', 'agents', 'subscription', 'feature-request', 'bug-report', 'general', 'other'] },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'waiting-customer', 'waiting-internal', 'resolved', 'closed'], default: 'open' },
  assignedTo: { type: String },
  assignedName: { type: String },
  messages: [{
    sender: { type: String, enum: ['customer', 'support', 'system', 'ai'], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String },
    message: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  relatedAgent: { type: String },
  relatedChatId: { type: String },
  resolution: {
    summary: { type: String },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date }
  },
  satisfaction: {
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    ratedAt: { type: Date }
  },
  sla: {
    firstResponseDue: { type: Date },
    firstResponseAt: { type: Date },
    resolutionDue: { type: Date },
    breached: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  closedAt: { type: Date }
}, { collection: 'supporttickets' });

const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);

// =====================================================
// Email Notification Helper (use service)
// =====================================================
async function sendNotificationEmail(to: string, subject: string, body: string) {
  // Legacy function - now using emailNotifications service
  // Keeping for backwards compatibility
  console.log(`[EMAIL NOTIFICATION] To: ${to}, Subject: ${subject}`);
}

// =====================================================
// GET - Get All Tickets (Admin)
// =====================================================
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const slaBreached = searchParams.get('slaBreached') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query
    const query: any = {};
    
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (category && category !== 'all') query.category = category;
    if (slaBreached) query['sla.breached'] = true;
    
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { ticketNumber: parseInt(search) || 0 }
      ];
    }

    // Get tickets
    const tickets = await SupportTicket.find(query)
      .sort({ priority: -1, createdAt: -1 }) // Urgent first, then by date
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get stats
    const stats = await SupportTicket.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          breached: [{ $match: { 'sla.breached': true } }, { $count: 'count' }]
        }
      }
    ]);

    const statsData = stats[0];
    const formattedStats = {
      total: statsData.total[0]?.count || 0,
      open: statsData.byStatus.find((s: any) => s._id === 'open')?.count || 0,
      inProgress: statsData.byStatus.find((s: any) => s._id === 'in-progress')?.count || 0,
      waitingCustomer: statsData.byStatus.find((s: any) => s._id === 'waiting-customer')?.count || 0,
      resolved: statsData.byStatus.find((s: any) => s._id === 'resolved')?.count || 0,
      closed: statsData.byStatus.find((s: any) => s._id === 'closed')?.count || 0,
      urgent: statsData.byPriority.find((p: any) => p._id === 'urgent')?.count || 0,
      breachedSla: statsData.breached[0]?.count || 0
    };

    return NextResponse.json({
      success: true,
      tickets,
      stats: formattedStats,
      pagination: {
        page,
        limit,
        total: formattedStats.total,
        totalPages: Math.ceil(formattedStats.total / limit)
      }
    });

  } catch (error) {
    console.error('Admin get tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Reply to Ticket / Update Status (Admin)
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin(req);
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const body = await req.json();
    const { ticketId, message, isInternal, newStatus, assignTo, agentName } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Missing ticketId' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find ticket first
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
      lastActivityAt: new Date()
    };

    // Add message if provided
    if (message && message.trim()) {
      const newMessage = {
        sender: 'support',
        senderName: agentName || 'Support Team',
        message: message.trim(),
        isInternal: isInternal || false,
        createdAt: new Date()
      };
      
      updateData.$push = { messages: newMessage };

      // Mark first response for SLA
      if (!ticket.sla?.firstResponseAt && !isInternal) {
        updateData['sla.firstResponseAt'] = new Date();
      }

      // Send email notification to customer (unless internal note)
      if (!isInternal) {
        await notifyNewReply({
          ticketNumber: ticket.ticketNumber,
          ticketId: ticket.ticketId,
          subject: ticket.subject,
          userName: ticket.userName || 'Customer',
          userEmail: ticket.userEmail,
          message: message.trim()
        });
      }
    }

    // Update status if changed
    if (newStatus && newStatus !== ticket.status) {
      updateData.status = newStatus;
      
      // Add system message for status change
      const statusMessage = {
        sender: 'system',
        senderName: 'System',
        message: `Ticket status changed to: ${newStatus.replace('-', ' ')}`,
        isInternal: false,
        createdAt: new Date()
      };
      
      if (updateData.$push) {
        updateData.$push.messages = { $each: [updateData.$push.messages, statusMessage] };
      } else {
        updateData.$push = { messages: statusMessage };
      }

      // Handle resolution
      if (newStatus === 'resolved') {
        updateData['resolution.resolvedAt'] = new Date();
        updateData['resolution.resolvedBy'] = auth.user?.id;
        
        // Send resolution email
        await notifyStatusChange({
          ticketNumber: ticket.ticketNumber,
          ticketId: ticket.ticketId,
          subject: ticket.subject,
          userName: ticket.userName || 'Customer',
          userEmail: ticket.userEmail,
          status: 'resolved'
        });
      }

      if (newStatus === 'closed') {
        updateData.closedAt = new Date();
      }

      if (newStatus === 'waiting-customer') {
        // Send email asking for response
        await notifyStatusChange({
          ticketNumber: ticket.ticketNumber,
          ticketId: ticket.ticketId,
          subject: ticket.subject,
          userName: ticket.userName || 'Customer',
          userEmail: ticket.userEmail,
          status: 'waiting-customer'
        });
      }
    }

    // Update assignment if changed
    if (assignTo !== undefined) {
      updateData.assignedTo = assignTo || null;
      // Map agent ID to name (in production, fetch from database)
      const agentNames: Record<string, string> = {
        'agent1': 'Support Team',
        'agent2': 'Technical Support',
        'agent3': 'Billing Support'
      };
      updateData.assignedName = agentNames[assignTo] || null;
    }

    // Apply update
    const updatedTicket = await SupportTicket.findOneAndUpdate(
      { ticketId },
      updateData,
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });

  } catch (error) {
    console.error('Admin update ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Check SLA Breaches (Cron/Manual)
// =====================================================
export async function PATCH(req: NextRequest) {
  try {
    // This can be called by a cron job or manually
    const auth = await verifyAdmin(req);
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    await connectToDatabase();

    const now = new Date();

    // Find tickets with breached SLA
    const breachedTickets = await SupportTicket.find({
      status: { $nin: ['resolved', 'closed'] },
      'sla.breached': { $ne: true },
      $or: [
        { 'sla.firstResponseDue': { $lt: now }, 'sla.firstResponseAt': null },
        { 'sla.resolutionDue': { $lt: now } }
      ]
    });

    const breachedIds: string[] = [];

    for (const ticket of breachedTickets) {
      // Mark as breached
      await SupportTicket.updateOne(
        { ticketId: ticket.ticketId },
        {
          $set: {
            'sla.breached': true,
            updatedAt: new Date()
          },
          $push: {
            messages: {
              sender: 'system',
              senderName: 'System',
              message: '⚠️ SLA BREACHED - This ticket requires immediate attention!',
              isInternal: true,
              createdAt: new Date()
            }
          }
        }
      );

      // Auto-escalate priority if not already urgent
      if (ticket.priority !== 'urgent') {
        await SupportTicket.updateOne(
          { ticketId: ticket.ticketId },
          { $set: { priority: 'urgent' } }
        );
      }

      breachedIds.push(ticket.ticketId);

      // Send notification to admins
      await notifySlaBreach({
        ticketNumber: ticket.ticketNumber,
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        userName: ticket.userName || 'Customer',
        userEmail: ticket.userEmail,
        priority: 'urgent'
      }, 'support@maula.ai');
    }

    return NextResponse.json({
      success: true,
      message: `SLA check complete. ${breachedIds.length} tickets breached.`,
      breachedTickets: breachedIds
    });

  } catch (error) {
    console.error('SLA check error:', error);
    return NextResponse.json(
      { error: 'Failed to check SLA' },
      { status: 500 }
    );
  }
}
