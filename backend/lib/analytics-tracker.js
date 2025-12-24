import {
  Visitor,
  PageView,
  ChatInteraction,
  ToolUsage,
  LabExperiment,
  UserEvent,
  Session,
  ApiUsage,
} from '../models/Analytics.js';
import { v4 as uuidv4 } from 'uuid';
async function trackVisitor(data) {
  try {
    const existingVisitor = await Visitor.findOne({
      visitorId: data.visitorId,
    });
    if (existingVisitor) {
      existingVisitor.lastVisit = /* @__PURE__ */ new Date();
      existingVisitor.visitCount += 1;
      existingVisitor.sessionId = data.sessionId;
      if (data.userId) {
        existingVisitor.userId = data.userId;
        existingVisitor.isRegistered = true;
      }
      await existingVisitor.save();
      return existingVisitor;
    } else {
      const visitor = new Visitor({
        ...data,
        firstVisit: /* @__PURE__ */ new Date(),
        lastVisit: /* @__PURE__ */ new Date(),
        visitCount: 1,
        isRegistered: !!data.userId,
        isActive: true,
      });
      await visitor.save();
      return visitor;
    }
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return null;
  }
}
async function createSession(data) {
  try {
    const session = new Session({
      ...data,
      startTime: /* @__PURE__ */ new Date(),
      isActive: true,
      pageViews: 0,
      interactions: 0,
      chatMessages: 0,
      toolsUsed: 0,
      labExperiments: 0,
    });
    await session.save();
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}
async function updateSession(sessionId, updates) {
  try {
    const session = await Session.findOne({ sessionId });
    if (session) {
      Object.assign(session, updates);
      session.duration = Math.floor(
        (Date.now() - session.startTime.getTime()) / 1e3
      );
      await session.save();
      return session;
    }
  } catch (error) {
    console.error('Error updating session:', error);
  }
  return null;
}
async function endSession(sessionId, exitPage) {
  try {
    const session = await Session.findOne({ sessionId });
    if (session) {
      session.endTime = /* @__PURE__ */ new Date();
      session.duration = Math.floor(
        (Date.now() - session.startTime.getTime()) / 1e3
      );
      session.isActive = false;
      if (exitPage) session.exitPage = exitPage;
      await session.save();
      return session;
    }
  } catch (error) {
    console.error('Error ending session:', error);
  }
  return null;
}
async function trackPageView(data) {
  try {
    const pageView = new PageView({
      ...data,
      timestamp: /* @__PURE__ */ new Date(),
      interactions: 0,
    });
    await pageView.save();
    await updateSession(data.sessionId, { $inc: { pageViews: 1 } });
    return pageView;
  } catch (error) {
    console.error('Error tracking page view:', error);
    return null;
  }
}
async function updatePageViewMetrics(pageViewId, data) {
  try {
    const pageView = await PageView.findById(pageViewId);
    if (pageView) {
      Object.assign(pageView, data);
      await pageView.save();
      return pageView;
    }
  } catch (error) {
    console.error('Error updating page view:', error);
  }
  return null;
}
async function trackChatInteraction(data) {
  try {
    const interaction = new ChatInteraction({
      ...data,
      timestamp: /* @__PURE__ */ new Date(),
    });
    await interaction.save();
    await updateSession(data.sessionId, {
      $inc: { chatMessages: 1, interactions: 1 },
    });
    return interaction;
  } catch (error) {
    console.error('Error tracking chat:', error);
    return null;
  }
}
async function updateChatFeedback(interactionId, satisfied, feedback) {
  try {
    const interaction = await ChatInteraction.findById(interactionId);
    if (interaction) {
      interaction.satisfied = satisfied;
      if (feedback) interaction.feedback = feedback;
      await interaction.save();
      return interaction;
    }
  } catch (error) {
    console.error('Error updating chat feedback:', error);
  }
  return null;
}
async function trackToolUsage(data) {
  try {
    const toolUsage = new ToolUsage({
      ...data,
      timestamp: /* @__PURE__ */ new Date(),
    });
    await toolUsage.save();
    await updateSession(data.sessionId, {
      $inc: { toolsUsed: 1, interactions: 1 },
    });
    return toolUsage;
  } catch (error) {
    console.error('Error tracking tool usage:', error);
    return null;
  }
}
async function trackLabExperiment(data) {
  try {
    const experiment = new LabExperiment({
      ...data,
      timestamp: /* @__PURE__ */ new Date(),
    });
    await experiment.save();
    await updateSession(data.sessionId, {
      $inc: { labExperiments: 1, interactions: 1 },
    });
    return experiment;
  } catch (error) {
    console.error('Error tracking lab experiment:', error);
    return null;
  }
}
async function trackUserEvent(data) {
  try {
    const event = new UserEvent({
      ...data,
      timestamp: /* @__PURE__ */ new Date(),
    });
    await event.save();
    await updateSession(data.sessionId, { $inc: { interactions: 1 } });
    return event;
  } catch (error) {
    console.error('Error tracking user event:', error);
    return null;
  }
}
async function trackApiUsage(data) {
  try {
    const apiUsage = new ApiUsage({
      ...data,
      timestamp: /* @__PURE__ */ new Date(),
    });
    await apiUsage.save();
    return apiUsage;
  } catch (error) {
    console.error('Error tracking API usage:', error);
    return null;
  }
}
async function getVisitorStats(visitorId) {
  try {
    const visitor = await Visitor.findOne({ visitorId });
    const sessions = await Session.find({ visitorId }).sort({ startTime: -1 });
    const pageViews = await PageView.countDocuments({ visitorId });
    const chats = await ChatInteraction.countDocuments({ visitorId });
    const tools = await ToolUsage.countDocuments({ visitorId });
    const labs = await LabExperiment.countDocuments({ visitorId });
    const events = await UserEvent.countDocuments({ visitorId });
    return {
      visitor,
      sessions: sessions.length,
      pageViews,
      chats,
      tools,
      labs,
      events,
      recentSessions: sessions.slice(0, 5),
    };
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return null;
  }
}
async function getSessionStats(sessionId) {
  try {
    const session = await Session.findOne({ sessionId });
    const pageViews = await PageView.find({ sessionId }).sort({ timestamp: 1 });
    const chats = await ChatInteraction.find({ sessionId }).sort({
      timestamp: 1,
    });
    const tools = await ToolUsage.find({ sessionId }).sort({ timestamp: 1 });
    const labs = await LabExperiment.find({ sessionId }).sort({ timestamp: 1 });
    const events = await UserEvent.find({ sessionId }).sort({ timestamp: 1 });
    return {
      session,
      pageViews,
      chats,
      tools,
      labs,
      events,
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return null;
  }
}
async function getRealtimeStats() {
  try {
    const now = /* @__PURE__ */ new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1e3);
    const activeSessions = await Session.countDocuments({
      isActive: true,
      lastActivity: { $gte: fiveMinutesAgo },
    });
    const recentPageViews = await PageView.countDocuments({
      timestamp: { $gte: fiveMinutesAgo },
    });
    const recentChats = await ChatInteraction.countDocuments({
      timestamp: { $gte: fiveMinutesAgo },
    });
    const recentTools = await ToolUsage.countDocuments({
      timestamp: { $gte: fiveMinutesAgo },
    });
    const recentLabs = await LabExperiment.countDocuments({
      timestamp: { $gte: fiveMinutesAgo },
    });
    return {
      activeSessions,
      recentPageViews,
      recentChats,
      recentTools,
      recentLabs,
      timestamp: now,
    };
  } catch (error) {
    console.error('Error getting realtime stats:', error);
    return null;
  }
}
function generateVisitorId() {
  return uuidv4();
}
function generateSessionId() {
  return uuidv4();
}
function detectDevice(userAgent) {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      userAgent
    )
  ) {
    return 'mobile';
  }
  return 'desktop';
}
function detectBrowser(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}
function detectOS(userAgent) {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}
export {
  createSession,
  detectBrowser,
  detectDevice,
  detectOS,
  endSession,
  generateSessionId,
  generateVisitorId,
  getRealtimeStats,
  getSessionStats,
  getVisitorStats,
  trackApiUsage,
  trackChatInteraction,
  trackLabExperiment,
  trackPageView,
  trackToolUsage,
  trackUserEvent,
  trackVisitor,
  updateChatFeedback,
  updatePageViewMetrics,
  updateSession,
};
