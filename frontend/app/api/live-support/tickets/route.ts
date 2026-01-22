import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

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
// GET Handler - Get User's Tickets
// =====================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const ticketId = searchParams.get('ticketId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Get specific ticket
    if (ticketId) {
      const ticket = await SupportTicket.findOne({
        ticketId,
        userId: new mongoose.Types.ObjectId(userId)
      }).lean();
      
      if (!ticket) {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        ticket
      });
    }
    
    // Build query
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId)
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Get total count
    const totalCount = await SupportTicket.countDocuments(query);
    
    // Get tickets with pagination
    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select({
        ticketId: 1,
        ticketNumber: 1,
        subject: 1,
        category: 1,
        priority: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        lastActivityAt: 1,
        'sla.firstResponseDue': 1,
        'sla.resolutionDue': 1,
        'sla.breached': 1,
        'resolution.summary': 1,
        'satisfaction.rating': 1
      })
      .lean();
    
    // Get status counts
    const statusCounts = await SupportTicket.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const counts = {
      total: totalCount,
      open: 0,
      'in-progress': 0,
      'waiting-customer': 0,
      resolved: 0,
      closed: 0
    };
    
    statusCounts.forEach((item: any) => {
      if (item._id in counts) {
        counts[item._id as keyof typeof counts] = item.count;
      }
    });
    
    return NextResponse.json({
      success: true,
      tickets,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      },
      counts
    });
    
  } catch (error) {
    console.error('Get tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to get tickets' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST Handler - Add Reply to Ticket
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, userId, message, userName } = body;
    
    if (!ticketId || !userId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: ticketId, userId, message' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Find and update ticket
    const ticket = await SupportTicket.findOneAndUpdate(
      { 
        ticketId, 
        userId: new mongoose.Types.ObjectId(userId) 
      },
      {
        $push: {
          messages: {
            sender: 'customer',
            senderId: new mongoose.Types.ObjectId(userId),
            senderName: userName || 'Customer',
            message,
            createdAt: new Date()
          }
        },
        $set: {
          lastActivityAt: new Date(),
          updatedAt: new Date(),
          // If ticket was waiting on customer, change to open
          ...(true && { status: 'open' })
        }
      },
      { new: true }
    );
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found or access denied' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Reply added successfully',
      ticket: {
        ticketId: ticket.ticketId,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        lastActivityAt: ticket.lastActivityAt
      }
    });
    
  } catch (error) {
    console.error('Add reply error:', error);
    return NextResponse.json(
      { error: 'Failed to add reply' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH Handler - Rate Ticket / Close Ticket
// =====================================================
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, userId, action, rating, feedback } = body;
    
    if (!ticketId || !userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: ticketId, userId, action' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    let updateData: any = {
      updatedAt: new Date(),
      lastActivityAt: new Date()
    };
    
    if (action === 'rate') {
      if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: 'Invalid rating. Must be between 1 and 5' },
          { status: 400 }
        );
      }
      
      updateData.satisfaction = {
        rating,
        feedback: feedback || '',
        ratedAt: new Date()
      };
    } else if (action === 'close') {
      updateData.status = 'closed';
      updateData.closedAt = new Date();
    } else if (action === 'reopen') {
      updateData.status = 'open';
      updateData.closedAt = null;
    }
    
    const ticket = await SupportTicket.findOneAndUpdate(
      { 
        ticketId, 
        userId: new mongoose.Types.ObjectId(userId) 
      },
      { $set: updateData },
      { new: true }
    );
    
    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found or access denied' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Ticket ${action}d successfully`,
      ticket: {
        ticketId: ticket.ticketId,
        status: ticket.status,
        satisfaction: ticket.satisfaction
      }
    });
    
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}
