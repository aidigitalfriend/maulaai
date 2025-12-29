/**
 * ANALYTICS API ENDPOINTS
 * Provides endpoints for tracking and retrieving analytics data
 * COMPLETE TRACKING: visitors, sessions, pageviews, events, tools, chat, lab
 */

import express from 'express';
import {
  trackVisitor,
  createSession,
  trackPageView,
  trackChatInteraction,
  trackToolUsage,
  trackUserEvent,
  updateChatFeedback,
  getVisitorStats,
  getSessionStats,
  getRealtimeStats,
  detectDevice,
  detectBrowser,
  detectOS,
} from '../lib/analytics-tracker.js';
import { getTrackingData } from '../lib/tracking-middleware.js';
import { LabExperiment } from '../models/LabExperiment.js';

const router = express.Router();

// ============================================
// TRACK VISITOR (First visit)
// ============================================
router.post('/track/visitor', async (req, res) => {
  try {
    const { visitorId, sessionId, userId, referrer, landingPage, utmParams } =
      req.body;

    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress =
      req.ip ||
      req.headers['x-forwarded-for'] ||
      req.socket?.remoteAddress ||
      'unknown';

    const visitor = await trackVisitor({
      visitorId,
      sessionId,
      userId,
      ipAddress,
      userAgent,
      referrer,
      landingPage,
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      os: detectOS(userAgent),
      utmParams,
    });

    // Also create/update session
    await createSession({
      sessionId,
      visitorId,
      userId,
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      ipAddress,
    });

    res.json({
      success: true,
      visitorId: visitor?.visitorId,
      message: 'Visitor tracked',
    });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    res.status(500).json({ error: 'Failed to track visitor' });
  }
});

// ============================================
// TRACK PAGE VIEW
// ============================================
router.post('/track/pageview', async (req, res) => {
  try {
    const { visitorId, sessionId, userId, url, title, referrer, timeSpent } =
      req.body;

    if (!visitorId || !sessionId) {
      return res
        .status(400)
        .json({ error: 'visitorId and sessionId required' });
    }

    const pageView = await trackPageView({
      visitorId,
      sessionId,
      userId,
      url: url || '/',
      title,
      referrer,
      timeSpent: timeSpent || 0,
    });

    res.json({
      success: true,
      pageViewId: pageView?._id,
      message: 'Page view tracked',
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ error: 'Failed to track page view' });
  }
});

// ============================================
// TRACK LAB EXPERIMENT
// ============================================
router.post('/track/lab', async (req, res) => {
  try {
    const {
      experimentType,
      userId,
      sessionId,
      input,
      output,
      status,
      processingTime,
      tokensUsed,
    } = req.body;

    const experiment = new LabExperiment({
      experimentId: `exp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      experimentType,
      userId,
      sessionId,
      input,
      output,
      status: status || 'completed',
      processingTime,
      tokensUsed,
      createdAt: new Date(),
      completedAt: status === 'completed' ? new Date() : null,
    });

    await experiment.save();

    res.json({
      success: true,
      experimentId: experiment.experimentId,
      message: 'Lab experiment tracked',
    });
  } catch (error) {
    console.error('Error tracking lab experiment:', error);
    res.status(500).json({ error: 'Failed to track lab experiment' });
  }
});

// ============================================
// TRACK CHAT INTERACTION
// ============================================
router.post('/track/chat', async (req, res) => {
  try {
    const trackingData = getTrackingData(req);
    if (!trackingData) {
      return res.status(400).json({ error: 'Tracking data not available' });
    }

    const {
      agentId,
      agentName,
      userMessage,
      aiResponse,
      responseTime,
      model,
      language,
    } = req.body;

    const interaction = await trackChatInteraction({
      visitorId: trackingData.visitorId,
      sessionId: trackingData.sessionId,
      userId: trackingData.userId,
      agentId,
      agentName,
      userMessage,
      aiResponse,
      responseTime,
      model,
      language,
    });

    res.json({
      success: true,
      interactionId: interaction?._id,
      message: 'Chat interaction tracked',
    });
  } catch (error) {
    console.error('Error tracking chat:', error);
    res.status(500).json({ error: 'Failed to track chat' });
  }
});

// ============================================
// UPDATE CHAT FEEDBACK
// ============================================
router.post('/track/chat/feedback', async (req, res) => {
  try {
    const { interactionId, satisfied, feedback } = req.body;

    await updateChatFeedback(interactionId, satisfied, feedback);

    res.json({
      success: true,
      message: 'Feedback recorded',
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// ============================================
// TRACK TOOL USAGE
// ============================================
router.post('/track/tool', async (req, res) => {
  try {
    const trackingData = getTrackingData(req);
    if (!trackingData) {
      return res.status(400).json({ error: 'Tracking data not available' });
    }

    const {
      toolName,
      toolCategory,
      input,
      output,
      success,
      error,
      executionTime,
    } = req.body;

    const toolUsage = await trackToolUsage({
      visitorId: trackingData.visitorId,
      sessionId: trackingData.sessionId,
      userId: trackingData.userId,
      toolName,
      toolCategory,
      input,
      output,
      success,
      error,
      executionTime,
    });

    res.json({
      success: true,
      usageId: toolUsage?._id,
      message: 'Tool usage tracked',
    });
  } catch (error) {
    console.error('Error tracking tool:', error);
    res.status(500).json({ error: 'Failed to track tool usage' });
  }
});

// ============================================
// TRACK USER EVENT
// ============================================
router.post('/track/event', async (req, res) => {
  try {
    const trackingData = getTrackingData(req);
    if (!trackingData) {
      return res.status(400).json({ error: 'Tracking data not available' });
    }

    const { eventType, eventName, eventData, success, error } = req.body;

    const event = await trackUserEvent({
      visitorId: trackingData.visitorId,
      sessionId: trackingData.sessionId,
      userId: trackingData.userId,
      eventType,
      eventName,
      eventData,
      success,
      error,
    });

    res.json({
      success: true,
      eventId: event?._id,
      message: 'User event tracked',
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// ============================================
// GET VISITOR STATS
// ============================================
router.get('/analytics/visitor/:visitorId', async (req, res) => {
  try {
    const { visitorId } = req.params;
    const stats = await getVisitorStats(visitorId);

    if (!stats) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    res.status(500).json({ error: 'Failed to get visitor stats' });
  }
});

// ============================================
// GET SESSION STATS
// ============================================
router.get('/analytics/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const stats = await getSessionStats(sessionId);

    if (!stats) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting session stats:', error);
    res.status(500).json({ error: 'Failed to get session stats' });
  }
});

// ============================================
// GET REALTIME STATS
// ============================================
router.get('/analytics/realtime', async (req, res) => {
  try {
    const stats = await getRealtimeStats();

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting realtime stats:', error);
    res.status(500).json({ error: 'Failed to get realtime stats' });
  }
});

// ============================================
// GET CURRENT TRACKING DATA
// ============================================
router.get('/analytics/current', (req, res) => {
  const trackingData = getTrackingData(req);

  if (!trackingData) {
    return res.status(400).json({ error: 'Tracking data not available' });
  }

  res.json({
    success: true,
    data: {
      visitorId: trackingData.visitorId,
      sessionId: trackingData.sessionId,
      userId: trackingData.userId,
      device: trackingData.device,
      browser: trackingData.browser,
      os: trackingData.os,
    },
  });
});

export default router;
