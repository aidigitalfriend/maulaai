import { NextResponse } from "next/server";
const RATE_LIMIT_CONFIG = {
  // Agent endpoints - strict limits to prevent abuse
  "agent-chat": {
    maxRequests: 30,
    windowSeconds: 3600,
    // 30 requests per hour
    description: "Agent chat requests"
  },
  "agent-config": {
    maxRequests: 100,
    windowSeconds: 3600,
    // 100 requests per hour
    description: "Agent configuration requests"
  },
  // Auth endpoints - moderate limits
  "auth-login": {
    maxRequests: 10,
    windowSeconds: 900,
    // 10 requests per 15 minutes
    description: "Login attempts"
  },
  "auth-register": {
    maxRequests: 5,
    windowSeconds: 3600,
    // 5 requests per hour
    description: "Registration attempts"
  },
  "auth-refresh": {
    maxRequests: 50,
    windowSeconds: 3600,
    // 50 requests per hour
    description: "Token refresh"
  },
  // Payment endpoints - strict limits
  "payment-create": {
    maxRequests: 10,
    windowSeconds: 3600,
    // 10 requests per hour
    description: "Payment creation"
  },
  "payment-webhook": {
    maxRequests: 100,
    windowSeconds: 3600,
    // 100 requests per hour (webhooks can burst)
    description: "Payment webhooks"
  },
  // General API - relaxed limits
  "api-general": {
    maxRequests: 100,
    windowSeconds: 60,
    // 100 requests per minute
    description: "General API calls"
  }
};
const rateLimitStore = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((value, key) => {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
}, 6e4);
async function checkRateLimit(identifier, endpoint = "api-general") {
  const config = RATE_LIMIT_CONFIG[endpoint] || RATE_LIMIT_CONFIG["api-general"];
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  let entry = rateLimitStore.get(key);
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowSeconds * 1e3
    };
    rateLimitStore.set(key, entry);
  }
  entry.count++;
  const exceeded = entry.count > config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetTime = Math.ceil(entry.resetTime / 1e3);
  const retryAfter = exceeded ? Math.ceil((entry.resetTime - now) / 1e3) : void 0;
  return {
    success: !exceeded,
    limit: config.maxRequests,
    remaining,
    reset: resetTime,
    retryAfter
  };
}
async function getRateLimitStatus(identifier, endpoint = "api-general") {
  const config = RATE_LIMIT_CONFIG[endpoint] || RATE_LIMIT_CONFIG["api-general"];
  const key = `${identifier}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetTime < now) {
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Math.ceil((now + config.windowSeconds * 1e3) / 1e3)
    };
  }
  const remaining = Math.max(0, config.maxRequests - entry.count);
  return {
    success: entry.count <= config.maxRequests,
    limit: config.maxRequests,
    remaining,
    reset: Math.ceil(entry.resetTime / 1e3),
    retryAfter: entry.count > config.maxRequests ? Math.ceil((entry.resetTime - now) / 1e3) : void 0
  };
}
function addRateLimitHeaders(response, result) {
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset.toString());
  if (result.retryAfter) {
    response.headers.set("Retry-After", result.retryAfter.toString());
  }
  return response;
}
function rateLimitExceededResponse(result) {
  const response = NextResponse.json(
    {
      success: false,
      error: "Rate limit exceeded",
      retryAfter: result.retryAfter,
      resetAt: new Date(result.reset * 1e3).toISOString()
    },
    { status: 429 }
  );
  return addRateLimitHeaders(response, result);
}
function getIdentifierFromRequest(req, userId) {
  if (userId) {
    return userId;
  }
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip");
  return ip || "unknown";
}
var rate_limit_default = checkRateLimit;
export {
  RATE_LIMIT_CONFIG,
  addRateLimitHeaders,
  checkRateLimit,
  rate_limit_default as default,
  getIdentifierFromRequest,
  getRateLimitStatus,
  rateLimitExceededResponse
};
