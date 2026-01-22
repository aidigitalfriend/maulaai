function getClientIP(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0].trim() : realIP;
  return ip || "unknown";
}
function extractRequestMetadata(request) {
  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname;
  const userAgent = request.headers.get("user-agent") || "unknown";
  const referer = request.headers.get("referer");
  const ip = getClientIP(request);
  const isSecure = url.protocol === "https:" || url.hostname === "localhost";
  return {
    method,
    path,
    userAgent,
    referer,
    ip,
    isSecure
  };
}
function logRequest(request, options) {
  const metadata = extractRequestMetadata(request);
  const log = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    method: metadata.method,
    path: metadata.path,
    status: options?.status,
    duration: options?.duration,
    userId: options?.userId,
    ip: metadata.ip,
    userAgent: metadata.userAgent,
    referer: metadata.referer || void 0,
    isSecure: metadata.isSecure,
    rateLimit: options?.rateLimit
  };
  if (process.env.NODE_ENV === "development") {
    console.log("[API Request]", log);
  }
}
function detectSuspiciousActivity(request, options) {
  const metadata = extractRequestMetadata(request);
  const suspiciousPatterns = [
    // SQL injection attempts
    /('|"|;|--|\/\*|\*\/).*?(union|select|insert|update|delete|drop)/i,
    // Path traversal
    /\.\.\//,
    // Script injection
    /<script|javascript:|onerror=|onclick=/i
  ];
  const path = metadata.path;
  const isSuspicious = suspiciousPatterns.some((pattern) => pattern.test(path));
  if (isSuspicious) {
    console.warn("[SUSPICIOUS ACTIVITY]", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ip: metadata.ip,
      path,
      userAgent: metadata.userAgent,
      userId: options?.userId
    });
  }
  if (options?.rateLimit?.exceeded) {
    console.warn("[RATE LIMIT EXCEEDED]", {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ip: metadata.ip,
      path,
      userId: options?.userId
    });
  }
}
function createRequestContext(request, userId) {
  const metadata = extractRequestMetadata(request);
  const startTime = Date.now();
  return {
    metadata,
    startTime,
    userId,
    log: (status, rateLimit) => {
      const duration = Date.now() - startTime;
      logRequest(request, {
        userId,
        status,
        duration,
        rateLimit
      });
      detectSuspiciousActivity(request, {
        userId,
        rateLimit
      });
    }
  };
}
var security_request_logger_default = logRequest;
export {
  createRequestContext,
  security_request_logger_default as default,
  detectSuspiciousActivity,
  extractRequestMetadata,
  getClientIP,
  logRequest
};
