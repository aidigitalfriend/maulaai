import { NextResponse } from 'next/server';
const ErrorSeverity = /* @__PURE__ */ ((ErrorSeverity2) => {
  ErrorSeverity2['LOW'] = 'low';
  ErrorSeverity2['MEDIUM'] = 'medium';
  ErrorSeverity2['HIGH'] = 'high';
  ErrorSeverity2['CRITICAL'] = 'critical';
  return ErrorSeverity2;
})(ErrorSeverity || {});
const ERROR_MESSAGES = {
  // Authentication errors
  UNAUTHORIZED: { status: 401, message: 'Authentication required', code: 'UNAUTHORIZED' },
  INVALID_TOKEN: { status: 401, message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
  FORBIDDEN: { status: 403, message: 'Access denied', code: 'FORBIDDEN' },
  // Validation errors
  BAD_REQUEST: { status: 400, message: 'Invalid request', code: 'BAD_REQUEST' },
  MISSING_REQUIRED_FIELD: { status: 400, message: 'Missing required field', code: 'MISSING_FIELD' },
  INVALID_DATA_FORMAT: { status: 400, message: 'Invalid data format', code: 'INVALID_FORMAT' },
  // Rate limiting
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Too many requests', code: 'RATE_LIMIT' },
  // Resource errors
  NOT_FOUND: { status: 404, message: 'Resource not found', code: 'NOT_FOUND' },
  CONFLICT: { status: 409, message: 'Resource conflict', code: 'CONFLICT' },
  // Server errors (generic - never leak details)
  INTERNAL_ERROR: { status: 500, message: 'An error occurred', code: 'INTERNAL_ERROR' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service temporarily unavailable', code: 'SERVICE_UNAVAILABLE' },
};
function createErrorResponse(errorType, _details) {
  const errorConfig = ERROR_MESSAGES[errorType];
  return NextResponse.json(
    {
      success: false,
      error: errorConfig.message,
      code: errorConfig.code,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    },
    { status: errorConfig.status },
  );
}
function logSecurityError(severity, message, context) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const safeContext = {
    userId: context?.userId,
    endpoint: context?.endpoint,
    method: context?.method,
    ip: context?.ip?.split('.').slice(0, 3).join('.') + '.*',
    // Anonymize IP
  };
  const logMessage = {
    timestamp,
    severity,
    message,
    context: safeContext,
  };
  if (severity === 'critical' /* CRITICAL */ || severity === 'high' /* HIGH */) {
    console.error(`[${severity.toUpperCase()}]`, logMessage);
  } else {
    console.warn(`[${severity.toUpperCase()}]`, logMessage);
  }
}
function validateRequestBody(body, requiredFields) {
  if (!body) {
    return { valid: false, message: 'Request body is required' };
  }
  for (const field of requiredFields) {
    if (!(field in body)) {
      return { valid: false, message: `Missing required field: ${field}` };
    }
  }
  return { valid: true };
}
function sanitizeError(error) {
  if (!error) return null;
  return {
    message: error.message || 'Unknown error',
    code: error.code,
    // DO NOT include: stack trace, internal paths, file names
  };
}
const security_error_handler_default = createErrorResponse;
export {
  ERROR_MESSAGES,
  ErrorSeverity,
  createErrorResponse,
  security_error_handler_default as default,
  logSecurityError,
  sanitizeError,
  validateRequestBody,
};
