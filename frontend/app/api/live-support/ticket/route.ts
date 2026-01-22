import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { notifyTicketCreated } from '@/lib/services/emailNotifications';

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
  category: { 
    type: String, 
    required: true,
    enum: ['billing', 'technical', 'account', 'agents', 'subscription', 'feature-request', 'bug-report', 'general', 'other'] 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'waiting-customer', 'waiting-internal', 'resolved', 'closed'], 
    default: 'open' 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTeam: { type: String },
  messages: [{
    sender: { type: String, enum: ['customer', 'support', 'system', 'ai'], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String },
    message: { type: String, required: true },
    attachments: [{
      name: String,
      url: String,
      type: String,
      size: Number
    }],
    isInternal: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  relatedAgent: { type: String },
  relatedSubscription: { type: String },
  relatedTransaction: { type: String },
  relatedChatId: { type: String }, // Link to AI chat session
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
  tags: [{ type: String }],
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

// Auto-increment ticket number
supportTicketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const SupportTicketModel = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
    const lastTicket = await SupportTicketModel.findOne({}, {}, { sort: { ticketNumber: -1 } });
    this.ticketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1001;
  }
  next();
});

const supportChatSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  ticketCreated: { type: Boolean, default: false },
  ticketId: { type: String },
  ticketNumber: { type: Number }
}, { collection: 'supportchats' });

const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
const SupportChat = mongoose.models.SupportChat || mongoose.model('SupportChat', supportChatSchema);

// =====================================================
// Determine Category from Issue
// =====================================================
function determineCategory(issue: string): string {
  const lowerIssue = issue.toLowerCase();
  
  if (lowerIssue.includes('payment') || lowerIssue.includes('charge') || lowerIssue.includes('refund') || lowerIssue.includes('billing') || lowerIssue.includes('invoice')) {
    return 'billing';
  }
  if (lowerIssue.includes('subscription') || lowerIssue.includes('plan') || lowerIssue.includes('expire') || lowerIssue.includes('renew')) {
    return 'subscription';
  }
  if (lowerIssue.includes('agent') || lowerIssue.includes('einstein') || lowerIssue.includes('wizard')) {
    return 'agents';
  }
  if (lowerIssue.includes('account') || lowerIssue.includes('login') || lowerIssue.includes('password') || lowerIssue.includes('profile')) {
    return 'account';
  }
  if (lowerIssue.includes('bug') || lowerIssue.includes('error') || lowerIssue.includes('crash') || lowerIssue.includes('not working')) {
    return 'bug-report';
  }
  if (lowerIssue.includes('feature') || lowerIssue.includes('suggestion') || lowerIssue.includes('request')) {
    return 'feature-request';
  }
  if (lowerIssue.includes('technical') || lowerIssue.includes('api') || lowerIssue.includes('integration')) {
    return 'technical';
  }
  
  return 'general';
}

// =====================================================
// Determine Priority from Issue
// =====================================================
function determinePriority(issue: string): string {
  const lowerIssue = issue.toLowerCase();
  
  if (lowerIssue.includes('urgent') || lowerIssue.includes('emergency') || lowerIssue.includes('critical') || lowerIssue.includes('immediately')) {
    return 'urgent';
  }
  if (lowerIssue.includes('important') || lowerIssue.includes('asap') || lowerIssue.includes('soon')) {
    return 'high';
  }
  if (lowerIssue.includes('not urgent') || lowerIssue.includes('whenever') || lowerIssue.includes('low priority')) {
    return 'low';
  }
  
  return 'medium';
}

// =====================================================
// POST Handler - Create Support Ticket
// =====================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      chatId,
      userId, 
      userEmail, 
      userName,
      subject,
      description,
      issue, // Alternative to description
      category,
      priority,
      messages = [], // Chat messages to include
      relatedAgent,
      relatedSubscription
    } = body;
    
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userEmail' },
        { status: 400 }
      );
    }
    
    const ticketDescription = description || issue || 'No description provided';
    const ticketSubject = subject || (ticketDescription.length > 50 
      ? ticketDescription.substring(0, 50) + '...' 
      : ticketDescription);
    
    await connectToDatabase();
    
    // Generate ticket ID
    const ticketId = `TICKET-${Date.now()}`;
    
    // Calculate SLA times (first response within 24 hours, resolution within 48 hours)
    const now = new Date();
    const firstResponseDue = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const resolutionDue = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    // Format chat messages for ticket
    const ticketMessages = [
      {
        sender: 'system',
        senderName: 'System',
        message: `Ticket created from AI Live Support chat session.`,
        createdAt: now
      }
    ];
    
    // Add AI chat conversation to ticket
    if (messages.length > 0) {
      messages.forEach((msg: any) => {
        ticketMessages.push({
          sender: msg.role === 'user' ? 'customer' : 'ai',
          senderName: msg.role === 'user' ? userName : 'AI Support',
          message: msg.content,
          createdAt: msg.timestamp || now
        });
      });
    }
    
    // Add the issue description
    ticketMessages.push({
      sender: 'customer',
      senderName: userName || 'Customer',
      message: ticketDescription,
      createdAt: now
    });
    
    // Create the ticket
    const ticket = new SupportTicket({
      ticketId,
      userId: new mongoose.Types.ObjectId(userId),
      userEmail,
      userName,
      subject: ticketSubject,
      description: ticketDescription,
      category: category || determineCategory(ticketDescription),
      priority: priority || determinePriority(ticketDescription),
      status: 'open',
      messages: ticketMessages,
      relatedAgent,
      relatedSubscription,
      relatedChatId: chatId,
      sla: {
        firstResponseDue,
        resolutionDue,
        breached: false
      },
      tags: ['live-support', 'ai-escalated']
    });
    
    await ticket.save();
    
    // Send email notification to customer
    await notifyTicketCreated({
      ticketNumber: ticket.ticketNumber,
      ticketId: ticket.ticketId,
      subject: ticket.subject,
      userName: userName || 'Customer',
      userEmail,
      priority: ticket.priority
    });
    
    // Update the chat session to link to ticket
    if (chatId) {
      await SupportChat.findOneAndUpdate(
        { chatId },
        {
          $set: {
            ticketCreated: true,
            ticketId: ticket.ticketId,
            ticketNumber: ticket.ticketNumber,
            updatedAt: new Date()
          }
        }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: {
        ticketId: ticket.ticketId,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
        sla: {
          firstResponseDue: ticket.sla.firstResponseDue,
          resolutionDue: ticket.sla.resolutionDue
        }
      }
    });
    
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}
