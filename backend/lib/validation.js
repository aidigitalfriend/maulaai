/**
 * INPUT VALIDATION UTILITIES
 * Comprehensive validation rules and sanitization
 */

import { body, param, query } from 'express-validator';

// Custom validator for Prisma IDs (CUID, UUID, or legacy ObjectIds)
const isValidPrismaId = (value) => {
  if (!value || typeof value !== 'string') return false;
  // Accept UUIDs
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) return true;
  // Accept CUIDs (start with 'c' and are 25 chars)
  if (/^c[a-z0-9]{24}$/i.test(value)) return true;
  // Accept legacy ObjectIds (24 hex chars) for backwards compatibility
  if (/^[a-f0-9]{24}$/i.test(value)) return true;
  // Accept other reasonable string IDs
  if (/^[a-zA-Z0-9_-]{1,64}$/.test(value)) return true;
  return false;
};

// ============================================
// COMMON VALIDATION RULES
// ============================================

export const commonValidation = {
  // ID validation (works with CUID, UUID, or legacy ObjectIds)
  id: param('id').custom(isValidPrismaId).withMessage('Invalid ID format'),

  // Pagination
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isIn(['asc', 'desc', 'createdAt', '-createdAt', 'name', '-name'])
      .withMessage('Invalid sort parameter'),
  ],

  // Search
  search: query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be 1-100 characters'),

  // Date range
  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
  ],
};

// ============================================
// USER VALIDATION
// ============================================

export const userValidation = {
  create: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('name')
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be 1-100 characters'),
    body('role')
      .optional()
      .isIn(['user', 'admin', 'moderator'])
      .withMessage('Invalid role'),
    body('preferences')
      .optional()
      .isObject()
      .withMessage('Preferences must be an object'),
  ],

  update: [
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be 1-100 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required'),
    body('preferences')
      .optional()
      .isObject()
      .withMessage('Preferences must be an object'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
  ],

  changePassword: [
    body('currentPassword').exists().withMessage('Current password required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  ],
};

// ============================================
// AGENT VALIDATION
// ============================================

export const agentValidation = {
  create: [
    body('name')
      .isLength({ min: 1, max: 100 })
      .withMessage('Agent name required (1-100 chars)'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description max 500 characters'),
    body('model')
      .isIn(['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'mistral'])
      .withMessage('Invalid model'),
    body('temperature')
      .optional()
      .isFloat({ min: 0, max: 2 })
      .withMessage('Temperature must be 0-2'),
    body('maxTokens')
      .optional()
      .isInt({ min: 1, max: 4000 })
      .withMessage('Max tokens must be 1-4000'),
    body('systemPrompt')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('System prompt max 2000 characters'),
    body('tools').optional().isArray().withMessage('Tools must be an array'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be boolean'),
  ],

  update: [
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Agent name 1-100 chars'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description max 500 characters'),
    body('model')
      .optional()
      .isIn(['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'mistral'])
      .withMessage('Invalid model'),
    body('temperature')
      .optional()
      .isFloat({ min: 0, max: 2 })
      .withMessage('Temperature must be 0-2'),
    body('maxTokens')
      .optional()
      .isInt({ min: 1, max: 4000 })
      .withMessage('Max tokens must be 1-4000'),
    body('systemPrompt')
      .optional()
      .isLength({ max: 2000 })
      .withMessage('System prompt max 2000 characters'),
    body('tools').optional().isArray().withMessage('Tools must be an array'),
    body('isPublic')
      .optional()
      .isBoolean()
      .withMessage('isPublic must be boolean'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
  ],
};

// ============================================
// ANALYTICS VALIDATION
// ============================================

export const analyticsValidation = {
  track: [
    body('event')
      .isLength({ min: 1, max: 100 })
      .withMessage('Event name required (1-100 chars)'),
    body('userId').optional().custom(isValidPrismaId).withMessage('Invalid user ID'),
    body('sessionId')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Session ID max 100 chars'),
    body('properties')
      .optional()
      .isObject()
      .withMessage('Properties must be an object'),
    body('timestamp')
      .optional()
      .isISO8601()
      .withMessage('Invalid timestamp format'),
  ],

  query: [
    query('event')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Event name max 100 chars'),
    query('userId').optional().custom(isValidPrismaId).withMessage('Invalid user ID'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    ...commonValidation.pagination,
  ],
};

// ============================================
// COMMUNITY VALIDATION
// ============================================

export const communityValidation = {
  createPost: [
    body('title')
      .isLength({ min: 1, max: 200 })
      .withMessage('Title required (1-200 chars)'),
    body('content')
      .isLength({ min: 1, max: 10000 })
      .withMessage('Content required (max 10k chars)'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Tag max 50 characters'),
    body('isPublished')
      .optional()
      .isBoolean()
      .withMessage('isPublished must be boolean'),
  ],

  updatePost: [
    body('title')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title 1-200 chars'),
    body('content')
      .optional()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Content max 10k chars'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('tags.*')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Tag max 50 characters'),
    body('isPublished')
      .optional()
      .isBoolean()
      .withMessage('isPublished must be boolean'),
  ],

  createComment: [
    body('content')
      .isLength({ min: 1, max: 2000 })
      .withMessage('Comment required (max 2k chars)'),
    body('parentId')
      .optional()
      .custom(isValidPrismaId)
      .withMessage('Invalid parent comment ID'),
  ],
};

// ============================================
// SUBSCRIPTION VALIDATION
// ============================================

export const subscriptionValidation = {
  create: [
    body('planId')
      .isLength({ min: 1, max: 100 })
      .withMessage('Plan ID required'),
    body('billingCycle')
      .isIn(['monthly', 'yearly'])
      .withMessage('Invalid billing cycle'),
    body('paymentMethodId')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Invalid payment method ID'),
  ],

  update: [
    body('planId')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Invalid plan ID'),
    body('billingCycle')
      .optional()
      .isIn(['monthly', 'yearly'])
      .withMessage('Invalid billing cycle'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be boolean'),
  ],
};

// ============================================
// SANITIZATION UTILITIES
// ============================================

export const sanitizeInput = {
  // Remove HTML tags and trim whitespace
  text: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/<[^>]*>/g, '').trim();
  },

  // Sanitize email
  email: (value) => {
    if (typeof value !== 'string') return value;
    return value.toLowerCase().trim();
  },

  // Sanitize array of strings
  stringArray: (value) => {
    if (!Array.isArray(value)) return value;
    return value.map((item) => (typeof item === 'string' ? item.trim() : item));
  },

  // Deep sanitize object
  object: (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput.text(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = sanitizeInput.stringArray(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeInput.object(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  },
};
