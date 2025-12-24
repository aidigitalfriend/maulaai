import { metricsTracker } from "./metrics-tracker.js";
import { v4 as uuidv4 } from "uuid";
function getSessionId(req) {
  let sessionId = req.cookies?.sessionId;
  if (!sessionId) {
    sessionId = req.headers["x-session-id"];
  }
  if (!sessionId) {
    sessionId = uuidv4();
  }
  return sessionId;
}
function getAgentFromRequest(req) {
  if (req.query.agent) {
    return req.query.agent;
  }
  if (req.body?.agent) {
    return req.body.agent;
  }
  if (req.path.includes("/chat") && req.body?.agentId) {
    return req.body.agentId;
  }
  return void 0;
}
function sessionTrackingMiddleware(req, res, next) {
  const sessionId = getSessionId(req);
  req.sessionId = sessionId;
  if (!req.cookies?.sessionId) {
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1e3,
      // 30 days
      sameSite: "lax"
    });
  }
  metricsTracker.trackSession(sessionId, {
    sessionId,
    userId: req.user?.id,
    ipAddress: req.ip || req.socket.remoteAddress || "unknown",
    userAgent: req.headers["user-agent"] || "unknown"
  }).catch((error) => {
    console.error("Error in session tracking:", error);
  });
  next();
}
function apiMetricsMiddleware(req, res, next) {
  const startTime = Date.now();
  const sessionId = req.sessionId || getSessionId(req);
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  res.json = function(body) {
    trackMetrics(body);
    return originalJson(body);
  };
  res.send = function(body) {
    trackMetrics(body);
    return originalSend(body);
  };
  function trackMetrics(body) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;
    metricsTracker.trackApiRequest(
      req.path,
      req.method,
      statusCode,
      responseTime,
      isError && body?.error ? body.error : void 0
    ).catch((error) => {
      console.error("Error tracking API metrics:", error);
    });
    const agentName = getAgentFromRequest(req);
    if (agentName && req.path.includes("/chat")) {
      metricsTracker.trackAgentRequest(agentName, sessionId, responseTime, !isError).catch((error) => {
        console.error("Error tracking agent metrics:", error);
      });
    }
  }
  next();
}
function startMetricsCleanupJob() {
  setInterval(
    () => {
      metricsTracker.cleanupSessions().catch((error) => {
        console.error("Error in cleanup job:", error);
      });
    },
    5 * 60 * 1e3
  );
  setInterval(
    () => {
      metricsTracker.updateDailyMetrics().catch((error) => {
        console.error("Error updating daily metrics:", error);
      });
    },
    60 * 60 * 1e3
  );
  console.log("\u2705 Metrics cleanup jobs started");
}
async function initializeMetrics() {
  try {
    await metricsTracker.initializeIndexes();
    startMetricsCleanupJob();
    console.log("\u2705 Metrics tracking initialized");
  } catch (error) {
    console.error("Error initializing metrics:", error);
  }
}
export {
  apiMetricsMiddleware,
  initializeMetrics,
  sessionTrackingMiddleware,
  startMetricsCleanupJob
};
