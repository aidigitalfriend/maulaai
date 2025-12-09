/**
 * ANALYTICS TRACKER SERVICE
 * Core tracking functions for all user interactions
 */

import { getClientPromise } from './mongodb.ts';
import { detectDevice, detectBrowser, detectOS } from './device-detection.js';

// ============================================
// TRACK VISITOR
// ============================================
export async function trackVisitor(data) {
  try {
    const { visitorId, userId, ipAddress, userAgent, country, city } = data;

    // Detect device, browser, OS from userAgent
    const device = detectDevice(userAgent);
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const visitors = db.collection('visitors');

    // Check if visitor exists
    const existingVisitor = await visitors.findOne({ visitorId });

    if (existingVisitor) {
      // Update existing visitor
      const updateData = {
        lastVisit: new Date(),
        visitCount: existingVisitor.visitCount + 1,
        isActive: true,
      };
      if (userId && !existingVisitor.userId) {
        updateData.userId = userId;
        updateData.isRegistered = true;
      }

      await visitors.updateOne({ visitorId }, { $set: updateData });

      return { ...existingVisitor, ...updateData };
    } else {
      // Create new visitor
      const visitorData = {
        visitorId,
        userId,
        firstVisit: new Date(),
        lastVisit: new Date(),
        visitCount: 1,
        device,
        browser,
        os,
        country: country || 'Unknown',
        city: city || 'Unknown',
        ipAddress,
        userAgent,
        landingPage: '/',
        isRegistered: !!userId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await visitors.insertOne(visitorData);
      return visitorData;
    }
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return null;
  }
}

// ============================================
// CREATE SESSION
// ============================================
export async function createSession(data) {
  try {
    const { sessionId, visitorId, userId } = data;

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const sessions = db.collection('sessions');

    // Check if session exists
    const existingSession = await sessions.findOne({ sessionId });

    if (existingSession) {
      // Update existing session
      const updateData = {
        lastActivity: new Date(),
        isActive: true,
      };
      if (userId && !existingSession.userId) {
        updateData.userId = userId;
      }

      await sessions.updateOne({ sessionId }, { $set: updateData });

      return { ...existingSession, ...updateData };
    } else {
      // Create new session
      const sessionData = {
        sessionId,
        visitorId,
        userId,
        startTime: new Date(),
        lastActivity: new Date(),
        pageViews: 0,
        events: 0,
        duration: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await sessions.insertOne(sessionData);
      return sessionData;
    }
  } catch (error) {
    console.error('Error creating session:', error);
    return null;
  }
}

// ============================================
// TRACK PAGE VIEW
// ============================================
export async function trackPageView(data) {
  try {
    const { visitorId, sessionId, userId, url, title, referrer } = data;

    const pageView = new PageView({
      visitorId,
      sessionId,
      userId,
      url,
      title,
      referrer,
      timestamp: new Date(),
    });

    await pageView.save();

    // Update session page view count
    const session = await Session.findOne({ sessionId });
    if (session) {
      session.pageViews += 1;
      session.lastActivity = new Date();
      await session.save();
    }

    return pageView;
  } catch (error) {
    console.error('Error tracking page view:', error);
    return null;
  }
}

// ============================================
// UPDATE PAGE VIEW (time spent, scroll depth)
// ============================================
export async function updatePageView(pageViewId, timeSpent, scrollDepth) {
  try {
    const pageView = await PageView.findById(pageViewId);
    if (pageView) {
      pageView.timeSpent = timeSpent;
      pageView.scrollDepth = scrollDepth;
      await pageView.save();
      return pageView;
    }
    return null;
  } catch (error) {
    console.error('Error updating page view:', error);
    return null;
  }
}

// ============================================
// TRACK CHAT INTERACTION
// ============================================
export async function trackChatInteraction(data) {
  try {
    const {
      visitorId,
      sessionId,
      userId,
      agentId,
      agentName,
      userMessage,
      aiResponse,
      responseTime,
      model,
      language,
    } = data;

    const interaction = new ChatInteraction({
      visitorId,
      sessionId,
      userId,
      agentId,
      agentName,
      userMessage,
      aiResponse,
      responseTime,
      model,
      language,
      timestamp: new Date(),
    });

    await interaction.save();

    // Update session event count
    const session = await Session.findOne({ sessionId });
    if (session) {
      session.events += 1;
      session.lastActivity = new Date();
      await session.save();
    }

    return interaction;
  } catch (error) {
    console.error('Error tracking chat interaction:', error);
    return null;
  }
}

// ============================================
// UPDATE CHAT FEEDBACK
// ============================================
export async function updateChatFeedback(interactionId, satisfied, feedback) {
  try {
    const interaction = await ChatInteraction.findById(interactionId);
    if (interaction) {
      interaction.satisfied = satisfied;
      if (feedback) {
        interaction.feedback = feedback;
      }
      await interaction.save();
      return interaction;
    }
    return null;
  } catch (error) {
    console.error('Error updating chat feedback:', error);
    return null;
  }
}

// ============================================
// TRACK TOOL USAGE
// ============================================
export async function trackToolUsage(data) {
  try {
    const {
      visitorId,
      sessionId,
      userId,
      toolName,
      toolCategory,
      input,
      output,
      success,
      error,
      executionTime,
    } = data;

    const toolUsage = new ToolUsage({
      visitorId,
      sessionId,
      userId,
      toolName,
      toolCategory,
      input,
      output,
      success,
      error,
      executionTime,
      timestamp: new Date(),
    });

    await toolUsage.save();

    // Update session event count
    const session = await Session.findOne({ sessionId });
    if (session) {
      session.events += 1;
      session.lastActivity = new Date();
      await session.save();
    }

    return toolUsage;
  } catch (error) {
    console.error('Error tracking tool usage:', error);
    return null;
  }
}

// ============================================
// TRACK LAB EXPERIMENT
// ============================================
export async function trackLabExperiment(data) {
  try {
    const {
      visitorId,
      sessionId,
      userId,
      experimentName,
      experimentType,
      input,
      output,
      model,
      success,
      error,
      processingTime,
      rating,
    } = data;

    const experiment = new LabExperiment({
      visitorId,
      sessionId,
      userId,
      experimentName,
      experimentType,
      input,
      output,
      model,
      success,
      error,
      processingTime,
      rating,
      timestamp: new Date(),
    });

    await experiment.save();

    // Update session event count
    const session = await Session.findOne({ sessionId });
    if (session) {
      session.events += 1;
      session.lastActivity = new Date();
      await session.save();
    }

    return experiment;
  } catch (error) {
    console.error('Error tracking lab experiment:', error);
    return null;
  }
}

// ============================================
// TRACK USER EVENT
// ============================================
export async function trackUserEvent(data) {
  try {
    const {
      visitorId,
      sessionId,
      userId,
      eventType,
      eventName,
      eventData,
      success,
      error,
    } = data;

    const event = new UserEvent({
      visitorId,
      sessionId,
      userId,
      eventType,
      eventName,
      eventData,
      success,
      error,
      timestamp: new Date(),
    });

    await event.save();

    // Update session event count
    const session = await Session.findOne({ sessionId });
    if (session) {
      session.events += 1;
      session.lastActivity = new Date();
      await session.save();
    }

    return event;
  } catch (error) {
    console.error('Error tracking user event:', error);
    return null;
  }
}

// ============================================
// TRACK API USAGE
// ============================================
export async function trackApiUsage(data) {
  try {
    const {
      visitorId,
      sessionId,
      endpoint,
      method,
      statusCode,
      responseTime,
      userAgent,
      ipAddress,
    } = data;

    const apiUsage = new ApiUsage({
      visitorId,
      sessionId,
      endpoint,
      method,
      statusCode,
      responseTime,
      userAgent,
      ipAddress,
      timestamp: new Date(),
    });

    await apiUsage.save();
    return apiUsage;
  } catch (error) {
    console.error('Error tracking API usage:', error);
    return null;
  }
}

// ============================================
// UPDATE SESSION ACTIVITY
// ============================================
export async function updateSessionActivity(sessionId) {
  try {
    const session = await Session.findOne({ sessionId });
    if (session) {
      session.lastActivity = new Date();
      await session.save();
      return session;
    }
    return null;
  } catch (error) {
    console.error('Error updating session activity:', error);
    return null;
  }
}

// ============================================
// ANALYTICS: Get Visitor Stats
// ============================================
export async function getVisitorStats(visitorId) {
  try {
    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');

    const visitors = db.collection('visitors');
    const sessions = db.collection('sessions');
    const pageViews = db.collection('pageviews');
    const chatInteractions = db.collection('chat_interactions');
    const toolUsage = db.collection('tool_usage');
    const labExperiments = db.collection('lab_experiments');
    const userEvents = db.collection('user_events');

    const visitor = await visitors.findOne({ visitorId });
    const sessionList = await sessions
      .find({ visitorId })
      .sort({ startTime: -1 })
      .limit(10)
      .toArray();
    const pageViewsCount = await pageViews.countDocuments({ visitorId });
    const chatsCount = await chatInteractions.countDocuments({ visitorId });
    const toolsCount = await toolUsage.countDocuments({ visitorId });
    const labsCount = await labExperiments.countDocuments({ visitorId });
    const eventsCount = await userEvents.countDocuments({ visitorId });

    return {
      visitor,
      sessionsCount: sessionList.length,
      sessions: sessionList,
      pageViews: pageViewsCount,
      chats: chatsCount,
      tools: toolsCount,
      labs: labsCount,
      events: eventsCount,
    };
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return null;
  }
}

// ============================================
// ANALYTICS: Get Session Stats
// ============================================
export async function getSessionStats(sessionId) {
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
      timeline: [
        ...pageViews.map((p) => ({ type: 'pageView', data: p })),
        ...chats.map((c) => ({ type: 'chat', data: c })),
        ...tools.map((t) => ({ type: 'tool', data: t })),
        ...labs.map((l) => ({ type: 'lab', data: l })),
        ...events.map((e) => ({ type: 'event', data: e })),
      ].sort((a, b) => a.data.timestamp - b.data.timestamp),
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return null;
  }
}

// ============================================
// ANALYTICS: Get Real-time Stats
// ============================================
export async function getRealtimeStats() {
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    const activeSessions = await Session.countDocuments({
      lastActivity: { $gte: fiveMinutesAgo },
    });

    const recentVisitors = await Visitor.countDocuments({
      lastVisit: { $gte: oneHourAgo },
    });

    const todayVisitors = await Visitor.countDocuments({
      lastVisit: { $gte: oneDayAgo },
    });

    const recentPageViews = await PageView.countDocuments({
      timestamp: { $gte: oneHourAgo },
    });

    const recentChats = await ChatInteraction.countDocuments({
      timestamp: { $gte: oneHourAgo },
    });

    const recentTools = await ToolUsage.countDocuments({
      timestamp: { $gte: oneHourAgo },
    });

    const recentLabs = await LabExperiment.countDocuments({
      timestamp: { $gte: oneHourAgo },
    });

    return {
      activeSessions,
      recentVisitors,
      todayVisitors,
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

// ============================================
// HELPERS: Device/Browser/OS Detection
// ============================================
export function detectDevice(userAgent) {
  if (!userAgent) return 'Unknown';
  if (/mobile/i.test(userAgent)) return 'Mobile';
  if (/tablet/i.test(userAgent)) return 'Tablet';
  return 'Desktop';
}

export function detectBrowser(userAgent) {
  if (!userAgent) return 'Unknown';
  if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) return 'Chrome';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/edg/i.test(userAgent)) return 'Edge';
  if (/opera|opr/i.test(userAgent)) return 'Opera';
  return 'Unknown';
}

export function detectOS(userAgent) {
  if (!userAgent) return 'Unknown';
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/mac os/i.test(userAgent)) return 'macOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS';
  return 'Unknown';
}

export function generateVisitorId() {
  return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
