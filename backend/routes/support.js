/**
 * SUPPORT ROUTES
 * Handles support tickets, consultations, and customer service
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SupportTicket } from '../models/SupportTicket.js';
import { Consultation } from '../models/Consultation.js';
import { ContactMessage } from '../models/ContactMessage.js';
import {
  notifyAdminContactForm,
  notifyAdminSupportTicket,
  notifyAdminConsultation,
} from '../services/email.js';

const router = express.Router();

// ============================================
// SUPPORT TICKETS
// ============================================

/**
 * Create a new support ticket
 */
router.post('/tickets', async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      subject,
      description,
      category,
      priority,
      relatedAgent,
      relatedSubscription,
    } = req.body;

    if (!userId || !userEmail || !subject || !description || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ticket = new SupportTicket({
      ticketId: `tkt_${Date.now()}_${uuidv4().slice(0, 8)}`,
      userId,
      userEmail,
      userName,
      subject,
      description,
      category,
      priority: priority || 'medium',
      relatedAgent,
      relatedSubscription,
      status: 'open',
      messages: [
        {
          sender: 'customer',
          senderId: userId,
          senderName: userName,
          message: description,
          createdAt: new Date(),
        },
      ],
    });

    await ticket.save();

    // Send admin notification email
    notifyAdminSupportTicket({
      ticketId: ticket.ticketId,
      ticketNumber: ticket.ticketNumber,
      subject,
      userName: userName || 'Unknown',
      userEmail,
      category,
      priority: priority || 'medium',
    }).catch((err) => console.error('Failed to send admin notification:', err));

    res.json({
      success: true,
      ticket: {
        ticketId: ticket.ticketId,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
      message: 'Support ticket created successfully',
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

/**
 * Get user's support tickets
 */
router.get('/tickets/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const tickets = await SupportTicket.find(filter)
      .select(
        'ticketId ticketNumber subject category status priority createdAt updatedAt',
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await SupportTicket.countDocuments(filter);

    res.json({
      success: true,
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

/**
 * Get single ticket details
 */
router.get('/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

/**
 * Add message to ticket
 */
router.post('/tickets/:ticketId/messages', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { senderId, senderName, message, attachments } = req.body;

    const ticket = await SupportTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.messages.push({
      sender: 'customer',
      senderId,
      senderName,
      message,
      attachments,
      createdAt: new Date(),
    });

    ticket.lastActivityAt = new Date();
    ticket.status = 'open'; // Reopen if was waiting-customer

    await ticket.save();

    res.json({
      success: true,
      message: 'Message added successfully',
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

/**
 * Submit ticket satisfaction rating
 */
router.post('/tickets/:ticketId/satisfaction', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { rating, feedback } = req.body;

    const ticket = await SupportTicket.findOne({ ticketId });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.satisfaction = {
      rating,
      feedback,
      ratedAt: new Date(),
    };

    await ticket.save();

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
    });
  } catch (error) {
    console.error('Error submitting satisfaction:', error);
    res.status(500).json({ error: 'Failed to submit satisfaction' });
  }
});

// ============================================
// CONSULTATIONS
// ============================================

/**
 * Request a consultation
 */
router.post('/consultations', async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      userPhone,
      consultationType,
      company,
      project,
      preferredDates,
      timezone,
      source,
    } = req.body;

    if (!userEmail || !userName || !consultationType || !project?.description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const consultation = new Consultation({
      consultationId: `cons_${Date.now()}_${uuidv4().slice(0, 8)}`,
      userId,
      userEmail,
      userName,
      userPhone,
      consultationType,
      company,
      project,
      preferredDates,
      timezone: timezone || 'UTC',
      source,
      status: 'pending',
    });

    await consultation.save();

    // Send admin notification email
    notifyAdminConsultation({
      consultationId: consultation.consultationId,
      consultationNumber: consultation.consultationNumber || 0,
      userName,
      userEmail,
      userPhone,
      consultationType,
      projectDescription: project?.description || '',
    }).catch((err) => console.error('Failed to send admin notification:', err));

    res.json({
      success: true,
      consultation: {
        consultationId: consultation.consultationId,
        status: consultation.status,
        createdAt: consultation.createdAt,
      },
      message: 'Consultation request submitted. We will contact you soon!',
    });
  } catch (error) {
    console.error('Error creating consultation:', error);
    res.status(500).json({ error: 'Failed to create consultation request' });
  }
});

/**
 * Get user's consultations
 */
router.get('/consultations/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const consultations = await Consultation.find({ userId })
      .select(
        'consultationId consultationType status scheduledAt meeting createdAt',
      )
      .sort({ createdAt: -1 });

    res.json({ success: true, consultations });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

/**
 * Get consultation details
 */
router.get('/consultations/:consultationId', async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultation = await Consultation.findOne({ consultationId });

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json({ success: true, consultation });
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ error: 'Failed to fetch consultation' });
  }
});

/**
 * Submit consultation feedback
 */
router.post('/consultations/:consultationId/feedback', async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { rating, comment, wouldRecommend } = req.body;

    const consultation = await Consultation.findOne({ consultationId });

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    consultation.feedback = {
      rating,
      comment,
      wouldRecommend,
      submittedAt: new Date(),
    };

    await consultation.save();

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// ============================================
// CONTACT MESSAGES
// ============================================

/**
 * Submit a contact message
 */
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message, agentName, category, priority } =
      req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const contactMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
      agentName,
      category: category || 'general',
      priority: priority || 'normal',
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        referrer: req.get('Referer'),
      },
    });

    await contactMessage.save();

    // Send admin notification email
    notifyAdminContactForm({
      name,
      email,
      subject,
      message,
      ticketId: contactMessage.ticketId,
    }).catch((err) => console.error('Failed to send admin notification:', err));

    res.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you soon.',
      ticketId: contactMessage.ticketId,
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({ error: 'Failed to submit message' });
  }
});

/**
 * Get contact messages (admin only)
 */
router.get('/contact', async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Get all messages matching query (Prisma-compatible)
    let messages = await ContactMessage.find(query);
    
    // Sort in JavaScript
    messages.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === 'desc') {
        return new Date(bVal) - new Date(aVal);
      }
      return new Date(aVal) - new Date(bVal);
    });
    
    // Paginate in JavaScript
    const totalDocs = messages.length;
    const totalPages = Math.ceil(totalDocs / parseInt(limit));
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const docs = messages.slice(skip, skip + parseInt(limit));

    // Calculate stats in JavaScript
    const allMessages = await ContactMessage.find({});
    const stats = [{
      total: allMessages.length,
      pending: allMessages.filter(m => m.status === 'pending').length,
      read: allMessages.filter(m => m.status === 'read').length,
      replied: allMessages.filter(m => m.status === 'replied').length,
      closed: allMessages.filter(m => m.status === 'closed').length,
    }];

    res.json({
      success: true,
      data: docs,
      pagination: {
        page: parseInt(page),
        pages: totalPages,
        total: totalDocs,
        limit: parseInt(limit),
      },
      stats: stats[0] || {
        total: 0,
        pending: 0,
        read: 0,
        replied: 0,
        closed: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * Get a specific contact message
 */
router.get('/contact/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findById(id).populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'response.respondedBy', select: 'name email' },
    ]);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
  }
});

/**
 * Update contact message status
 */
router.patch('/contact/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const update = {};
    if (status) update.status = status;
    if (assignedTo) update.assignedTo = assignedTo;

    const message = await ContactMessage.findByIdAndUpdate(id, update, {
      new: true,
    }).populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'response.respondedBy', select: 'name email' },
    ]);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

/**
 * Add response to contact message
 */
router.post('/contact/:id/response', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, respondedBy } = req.body;

    if (!content || !respondedBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.response = {
      content,
      respondedBy,
      respondedAt: new Date(),
    };
    message.status = 'replied';

    await message.save();

    await message.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'response.respondedBy', select: 'name email' },
    ]);

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
});

/**
 * Get contact message statistics
 */
router.get('/contact/stats/overview', async (req, res) => {
  try {
    // Get all messages for statistics (Prisma-compatible)
    const allMessages = await ContactMessage.find({});
    
    // Calculate stats in JavaScript
    const total = allMessages.length;
    const pending = allMessages.filter(m => m.status === 'pending').length;
    const read = allMessages.filter(m => m.status === 'read').length;
    const replied = allMessages.filter(m => m.status === 'replied').length;
    const closed = allMessages.filter(m => m.status === 'closed').length;
    const responseRate = total > 0 ? (replied / total) * 100 : 0;
    
    const stats = [{
      total,
      pending,
      read,
      replied,
      closed,
      responseRate,
    }];

    // Category breakdown
    const categoryMap = {};
    allMessages.forEach(m => {
      const cat = m.category || 'uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryStats = Object.entries(categoryMap)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Group by date
    const recentMessages = allMessages.filter(m => new Date(m.createdAt) >= thirtyDaysAgo);
    const dateMap = {};
    recentMessages.forEach(m => {
      const dateStr = new Date(m.createdAt).toISOString().split('T')[0];
      dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
    });
    const recentStats = Object.entries(dateMap)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => a._id.localeCompare(b._id));

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          pending: 0,
          read: 0,
          replied: 0,
          closed: 0,
          responseRate: 0,
        },
        categories: categoryStats,
        recentActivity: recentStats,
      },
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
