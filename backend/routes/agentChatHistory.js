import express from 'express';
import AgentChatHistory from '../models/AgentChatHistory.js';
import mongoose from 'mongoose';

const router = express.Router();

// ============================================
// 1. Get Chat History for User and Agent
// ============================================
router.get('/:userId/:agentId', async (req, res) => {
  try {
    const { userId, agentId } = req.params;

    let chatHistory = await AgentChatHistory.findOne({ userId, agentId });

    // Create new chat history if doesn't exist
    if (!chatHistory) {
      chatHistory = new AgentChatHistory({
        userId,
        agentId,
        sessions: [],
        activeSessionId: null
      });
      await chatHistory.save();
    }

    res.json({ chatHistory });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// ============================================
// 2. Create New Chat Session
// ============================================
router.post('/:userId/:agentId/session', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { sessionId, sessionName, initialMessage } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    let chatHistory = await AgentChatHistory.findOne({ userId, agentId });

    if (!chatHistory) {
      chatHistory = new AgentChatHistory({
        userId,
        agentId,
        sessions: [],
        activeSessionId: null
      });
    }

    // Add new session
    const newSession = chatHistory.addSession(sessionId, initialMessage);
    if (sessionName) {
      newSession.name = sessionName;
    }

    await chatHistory.save();

    res.status(201).json({
      message: 'Session created successfully',
      session: newSession,
      chatHistory
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// ============================================
// 3. Add Message to Session
// ============================================
router.post('/:userId/:agentId/session/:sessionId/message', async (req, res) => {
  try {
    const { userId, agentId, sessionId } = req.params;
    const { messageId, role, content, attachments, feedback } = req.body;

    if (!messageId || !role || !content) {
      return res.status(400).json({ 
        error: 'messageId, role, and content are required' 
      });
    }

    const chatHistory = await AgentChatHistory.findOne({ userId, agentId });

    if (!chatHistory) {
      return res.status(404).json({ error: 'Chat history not found' });
    }

    const message = {
      messageId,
      role,
      content,
      timestamp: new Date(),
      feedback: feedback || null,
      attachments: attachments || []
    };

    const success = chatHistory.addMessage(sessionId, message);

    if (!success) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await chatHistory.save();

    res.status(201).json({
      message: 'Message added successfully',
      chatHistory
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// ============================================
// 4. Get Specific Session
// ============================================
router.get('/:userId/:agentId/session/:sessionId', async (req, res) => {
  try {
    const { userId, agentId, sessionId } = req.params;

    const chatHistory = await AgentChatHistory.findOne({ userId, agentId });

    if (!chatHistory) {
      return res.status(404).json({ error: 'Chat history not found' });
    }

    const session = chatHistory.sessions.find(s => s.sessionId === sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// ============================================
// 5. Update Session Name
// ============================================
router.patch('/:userId/:agentId/session/:sessionId/name', async (req, res) => {
  try {
    const { userId, agentId, sessionId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const chatHistory = await AgentChatHistory.findOne({ userId, agentId });

    if (!chatHistory) {
      return res.status(404).json({ error: 'Chat history not found' });
    }

    const session = chatHistory.sessions.find(s => s.sessionId === sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.name = name;
    await chatHistory.save();

    res.json({
      message: 'Session name updated successfully',
      session
    });
  } catch (error) {
    console.error('Error updating session name:', error);
    res.status(500).json({ error: 'Failed to update session name' });
  }
});

// ============================================
// 6. Set Active Session
// ============================================
router.patch('/:userId/:agentId/active-session', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { sessionId } = req.body;

    const chatHistory = await AgentChatHistory.findOne({ userId, agentId });

    if (!chatHistory) {
      return res.status(404).json({ error: 'Chat history not found' });
    }

    chatHistory.activeSessionId = sessionId;
    await chatHistory.save();

    res.json({
      message: 'Active session updated successfully',
      chatHistory
    });
  } catch (error) {
    console.error('Error setting active session:', error);
    res.status(500).json({ error: 'Failed to set active session' });
  }
});

// ============================================
// 7. Delete Session
// ============================================
router.delete('/:userId/:agentId/session/:sessionId', async (req, res) => {
  try {
    const { userId, agentId, sessionId } = req.params;

    const chatHistory = await AgentChatHistory.findOne({ userId, agentId });

    if (!chatHistory) {
      return res.status(404).json({ error: 'Chat history not found' });
    }

    chatHistory.sessions = chatHistory.sessions.filter(
      s => s.sessionId !== sessionId
    );

    // Reset active session if it was deleted
    if (chatHistory.activeSessionId === sessionId) {
      chatHistory.activeSessionId = 
        chatHistory.sessions.length > 0 ? chatHistory.sessions[0].sessionId : null;
    }

    await chatHistory.save();

    res.json({
      message: 'Session deleted successfully',
      chatHistory
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// ============================================
// 8. Update Message Feedback
// ============================================
router.patch('/:userId/:agentId/session/:sessionId/message/:messageId/feedback', async (req, res) => {
  try {
    const { userId, agentId, sessionId, messageId } = req.params;
    const { feedback } = req.body;

    if (!['positive', 'negative', null].includes(feedback)) {
      return res.status(400).json({ 
        error: 'feedback must be "positive", "negative", or null' 
      });
    }

    const chatHistory = await AgentChatHistory.findOne({ userId, agentId });

    if (!chatHistory) {
      return res.status(404).json({ error: 'Chat history not found' });
    }

    const session = chatHistory.sessions.find(s => s.sessionId === sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const message = session.messages.find(m => m.messageId === messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.feedback = feedback;
    await chatHistory.save();

    res.json({
      message: 'Feedback updated successfully',
      updatedMessage: message
    });
  } catch (error) {
    console.error('Error updating message feedback:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// ============================================
// 9. Get All User's Chat Histories (All Agents)
// ============================================
router.get('/user/:userId/all', async (req, res) => {
  try {
    const { userId } = req.params;

    const chatHistories = await AgentChatHistory.find({ userId })
      .sort({ lastActivity: -1 });

    res.json({
      count: chatHistories.length,
      chatHistories
    });
  } catch (error) {
    console.error('Error fetching all chat histories:', error);
    res.status(500).json({ error: 'Failed to fetch chat histories' });
  }
});

// ============================================
// 10. Get Recent Activity Across All Agents
// ============================================
router.get('/user/:userId/recent', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const chatHistories = await AgentChatHistory.find({ userId })
      .sort({ lastActivity: -1 })
      .limit(parseInt(limit));

    const recentActivity = chatHistories.map(ch => ({
      agentId: ch.agentId,
      lastActivity: ch.lastActivity,
      totalMessages: ch.totalMessages,
      activeSession: ch.getActiveSession()
    }));

    res.json({ recentActivity });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// ============================================
// 11. Bulk Save Messages (for migration from localStorage)
// ============================================
router.post('/:userId/:agentId/bulk-import', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { sessions } = req.body;

    if (!sessions || !Array.isArray(sessions)) {
      return res.status(400).json({ error: 'sessions array is required' });
    }

    let chatHistory = await AgentChatHistory.findOne({ userId, agentId });

    if (!chatHistory) {
      chatHistory = new AgentChatHistory({
        userId,
        agentId,
        sessions: [],
        activeSessionId: null
      });
    }

    // Merge sessions
    chatHistory.sessions = sessions;
    if (sessions.length > 0) {
      chatHistory.activeSessionId = sessions[0].sessionId;
    }

    await chatHistory.save();

    res.json({
      message: 'Bulk import successful',
      imported: sessions.length,
      chatHistory
    });
  } catch (error) {
    console.error('Error bulk importing sessions:', error);
    res.status(500).json({ error: 'Failed to bulk import' });
  }
});

export default router;
