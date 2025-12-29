/**
 * SUPPORT ROUTES
 * Handles support tickets, consultations, and customer service
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SupportTicket } from '../models/SupportTicket.js';
import { Consultation } from '../models/Consultation.js';

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
        'ticketId ticketNumber subject category status priority createdAt updatedAt'
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
        'consultationId consultationType status scheduledAt meeting createdAt'
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

export default router;
