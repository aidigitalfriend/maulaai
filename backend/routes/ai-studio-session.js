import express from 'express';
const router = express.Router();

// In-memory session storage (in production, use Redis or database)
const sessions = new Map();

// GET /api/studio/session - Get current AI Studio session
router.get('/session', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const sessionKey = `ai-studio-${userId}`;
    
    const session = sessions.get(sessionKey);
    
    if (!session) {
      return res.json({
        success: true,
        data: {
          messages: [],
          messageCount: 0,
          isNew: true,
          timestamp: null
        }
      });
    }

    // Check if session is expired (30 minutes)
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (now - session.timestamp > thirtyMinutes) {
      sessions.delete(sessionKey);
      return res.json({
        success: true,
        data: {
          messages: [],
          messageCount: 0,
          isNew: true,
          timestamp: null,
          expired: true
        }
      });
    }

    res.json({
      success: true,
      data: {
        messages: session.messages,
        messageCount: session.messageCount,
        isNew: false,
        timestamp: session.timestamp,
        maxMessages: 18
      }
    });
  } catch (error) {
    console.error('Get AI Studio session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session'
    });
  }
});

// POST /api/studio/session - Update AI Studio session
router.post('/session', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const sessionKey = `ai-studio-${userId}`;
    const { messages, messageCount } = req.body;

    if (!Array.isArray(messages) || typeof messageCount !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Invalid session data'
      });
    }

    // Store session data
    sessions.set(sessionKey, {
      messages,
      messageCount,
      timestamp: Date.now(),
      userId
    });

    res.json({
      success: true,
      data: {
        messages,
        messageCount,
        timestamp: Date.now(),
        maxMessages: 18,
        rateLimitReached: messageCount >= 18
      }
    });
  } catch (error) {
    console.error('Update AI Studio session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update session'
    });
  }
});

// DELETE /api/studio/session - Clear AI Studio session
router.delete('/session', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const sessionKey = `ai-studio-${userId}`;
    
    sessions.delete(sessionKey);

    res.json({
      success: true,
      message: 'Session cleared'
    });
  } catch (error) {
    console.error('Clear AI Studio session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear session'
    });
  }
});

// POST /api/studio/reset - Reset session (clear all data)
router.post('/reset', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const sessionKey = `ai-studio-${userId}`;
    
    sessions.delete(sessionKey);

    res.json({
      success: true,
      data: {
        messages: [],
        messageCount: 0,
        timestamp: null,
        reset: true
      }
    });
  } catch (error) {
    console.error('Reset AI Studio session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset session'
    });
  }
});

export default router;