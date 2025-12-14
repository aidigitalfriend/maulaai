/**
 * STANDARDIZED API ROUTER
 * Centralized API routing with consistent patterns
 * Implements RESTful conventions and proper resource organization
 */

import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';

// Import existing route handlers
import analyticsRouter from './analytics.js';
import agentSubscriptionsRouter from './agentSubscriptions.js';
import agentsRouter from './agents.js';
import userRouter from './user.js';
import gamificationRouter from './gamification.js';
import communityRouter from './community.js';

const router = express.Router();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

// Input validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API-specific rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 API requests per windowMs
  message: {
    success: false,
    message: 'API rate limit exceeded, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth-specific rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth attempts per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// API VERSIONING & HEALTH CHECKS
// ============================================

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API version info
router.get('/version', (req, res) => {
  res.json({
    success: true,
    version: '1.0.0',
    apiVersion: 'v1',
    buildDate: new Date().toISOString(),
    features: [
      'authentication',
      'agents',
      'analytics',
      'gamification',
      'community',
      'subscriptions',
    ],
  });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Apply auth rate limiting to auth routes
router.use('/auth', authLimiter);

// Auth validation rules
const authValidation = {
  signup: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').optional().isLength({ min: 1, max: 100 }),
    body('authMethod').optional().isIn(['password', 'google', 'github']),
  ],
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
    body('rememberMe').optional().isBoolean(),
  ],
  resetPassword: [body('email').isEmail().normalizeEmail()],
  changePassword: [
    body('currentPassword').exists(),
    body('newPassword').isLength({ min: 8 }),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),
  ],
};

// Auth routes will be handled by frontend Next.js API routes
// These are just placeholders for backend auth if needed

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

router.use('/users', apiLimiter);
router.use('/users', userRouter);

// ============================================
// AGENT ROUTES
// ============================================

router.use('/agents', apiLimiter);
router.use('/agents', agentsRouter);

// Agent subscriptions
router.use('/agent/subscriptions', apiLimiter);
router.use('/agent/subscriptions', agentSubscriptionsRouter);

// ============================================
// ANALYTICS ROUTES
// ============================================

router.use('/analytics', apiLimiter);
router.use('/analytics', analyticsRouter);

// ============================================
// GAMIFICATION ROUTES
// ============================================

router.use('/gamification', apiLimiter);
router.use('/gamification', gamificationRouter);

// ============================================
// COMMUNITY ROUTES
// ============================================

router.use('/community', apiLimiter);
router.use('/community', communityRouter);

// ============================================
// SUBSCRIPTIONS ROUTES
// ============================================

router.use('/subscriptions', apiLimiter);
// Mount existing subscription router if available

// ============================================
// UTILITY ROUTES
// ============================================

// API documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    endpoints: {
      health: 'GET /api/health',
      version: 'GET /api/version',
      docs: 'GET /api/docs',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile',
      },
      users: {
        profile: 'GET /api/users/profile',
        update: 'PUT /api/users/profile',
        delete: 'DELETE /api/users/:id',
      },
      agents: {
        list: 'GET /api/agents',
        create: 'POST /api/agents',
        get: 'GET /api/agents/:id',
        update: 'PUT /api/agents/:id',
        delete: 'DELETE /api/agents/:id',
      },
      analytics: 'GET /api/analytics/*',
      gamification: 'GET /api/gamification/*',
      community: 'GET /api/community/*',
      subscriptions: 'GET /api/subscriptions/*',
    },
    rateLimits: {
      global: '100 requests per 15 minutes',
      api: '500 requests per 15 minutes',
      auth: '10 requests per 15 minutes',
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
router.use((error, req, res, next) => {
  console.error('API Error:', error);

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map((err) => err.message),
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Handle MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      message: 'Database error',
    });
  }

  // Generic error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

export default router;
