/**
 * STANDARDIZED API ROUTER
 * Centralized API routing with consistent patterns
 * Implements RESTful conventions and proper resource organization
 */

import express from 'express';
import rateLimit from 'express-rate-limit';

// Import existing route handlers
import analyticsRouter from './analytics.js';
import agentSubscriptionsRouter from './agentSubscriptions.js';
import agentsRouter from './agents.js';
import userRouter from './user.js';
import gamificationRouter from './gamification.js';
import communityRouter from './community.js';

// Import NEW route handlers for complete tracking
import supportRouter from './support.js';
import billingRouter from './billing.js';
import careersRouter from './careers.js';
import webinarsRouter from './webinars.js';
import favoritesRouter from './favorites.js';
import suggestionsRouter from './suggestions.js';
import chatRouter from './chat.js';

// Import Agent Memory & Tools routes
import agentMemoryRouter from './agent-memory-routes.js';

// Import Agent Chat routes (with tool calling)
import agentChatRouter from './agent-chat-routes.js';

// Import Media Processing routes
import mediaRouter from './media-routes.js';

// Import Canvas Generation routes
import canvasRouter from './canvas-routes.js';

// Import Canvas Project routes
import canvasProjectRouter from './canvas-project-routes.js';

// Import Uploads routes (file uploads, proxy downloads)
import uploadsRouter from './uploads.js';

// Import Agent System (Orchestrator + Specialized Agents)
import agentSystemRouter from './agent-system-routes.js';

// Import AI Core (RAG, LangChain, LangGraph)
import aiCoreRouter from './ai-core-routes.js';

// Import Marketplace (Plugin SDK, Sandbox, Permissions)
import marketplaceRouter from './marketplace-routes.js';

const router = express.Router();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

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
      'chat',
    ],
  });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Apply auth rate limiting to auth routes
router.use('/auth', authLimiter);

// Auth routes will be handled by frontend Next.js API routes
// These are just placeholders for backend auth if needed

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

// Support both /api/users/* and /api/user/* (frontend uses /api/user/*)
router.use('/users', apiLimiter);
router.use('/users', userRouter);
router.use('/user', apiLimiter);
router.use('/user', userRouter);

// ============================================
// AGENT ROUTES
// ============================================

router.use('/agents', apiLimiter);
router.use('/agents', agentsRouter);

// Agent Memory & Tools (learning, web search, etc.)
router.use('/agents', apiLimiter);
router.use('/agents', agentMemoryRouter);

// Agent subscriptions
router.use('/agent/subscriptions', apiLimiter);
router.use('/agent/subscriptions', agentSubscriptionsRouter);

// ============================================
// MEDIA PROCESSING ROUTES
// ============================================

router.use('/media', apiLimiter);
router.use('/media', mediaRouter);

// ============================================
// CANVAS GENERATION ROUTES
// ============================================

router.use('/canvas', apiLimiter);
router.use('/canvas', canvasRouter);

// ============================================
// CANVAS PROJECT ROUTES
// ============================================

router.use('/canvas-projects', apiLimiter);
router.use('/canvas-projects', canvasProjectRouter);

// ============================================
// UPLOADS ROUTES (File uploads, proxy downloads)
// ============================================

router.use('/uploads', apiLimiter);
router.use('/uploads', uploadsRouter);

// ============================================
// AGENT CHAT ROUTES (Tool Calling & Multimodal)
// ============================================

router.use('/agent', apiLimiter);
router.use('/agent', agentChatRouter);

// ============================================
// AI AGENT SYSTEM ROUTES (Orchestrator + Specialized Agents)
// ============================================

router.use('/agent-system', apiLimiter);
router.use('/agent-system', agentSystemRouter);

// ============================================
// AI CORE ROUTES (RAG, LangChain, LangGraph)
// ============================================

router.use('/ai-core', apiLimiter);
router.use('/ai-core', aiCoreRouter);

// ============================================
// MARKETPLACE ROUTES (Plugin SDK, Sandbox, Permissions)
// ============================================

router.use('/marketplace', apiLimiter);
router.use('/marketplace', marketplaceRouter);

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
// SUPPORT ROUTES
// ============================================

router.use('/support', apiLimiter);
router.use('/support', supportRouter);

// Contact routes (direct access for frontend)
router.use('/contact', apiLimiter);
router.post('/contact', supportRouter);
router.get('/contact', supportRouter);
router.get('/contact/stats/overview', supportRouter);
router.get('/contact/:id', supportRouter);
router.patch('/contact/:id/status', supportRouter);
router.post('/contact/:id/response', supportRouter);

// ============================================
// BILLING ROUTES
// ============================================

router.use('/billing', apiLimiter);
router.use('/billing', billingRouter);

// ============================================
// CAREERS ROUTES
// ============================================

router.use('/careers', apiLimiter);
router.use('/careers', careersRouter);

// ============================================
// WEBINARS ROUTES
// ============================================

router.use('/webinars', apiLimiter);
router.use('/webinars', webinarsRouter);

// ============================================
// FAVORITES ROUTES
// ============================================

router.use('/favorites', apiLimiter);
router.use('/favorites', favoritesRouter);

// ============================================
// SUGGESTIONS ROUTES
// ============================================

router.use('/suggestions', apiLimiter);
router.use('/suggestions', suggestionsRouter);

// ============================================
// CHAT ROUTES
// ============================================

router.use('/chat', apiLimiter);
router.use('/chat', chatRouter);

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
      analytics: {
        trackVisitor: 'POST /api/analytics/track/visitor',
        trackPageview: 'POST /api/analytics/track/pageview',
        trackChat: 'POST /api/analytics/track/chat',
        trackTool: 'POST /api/analytics/track/tool',
        trackEvent: 'POST /api/analytics/track/event',
        trackLab: 'POST /api/analytics/track/lab',
        visitorStats: 'GET /api/analytics/visitor/:visitorId',
        sessionStats: 'GET /api/analytics/session/:sessionId',
        realtime: 'GET /api/analytics/realtime',
      },
      support: {
        createTicket: 'POST /api/support/tickets',
        getUserTickets: 'GET /api/support/tickets/user/:userId',
        getTicket: 'GET /api/support/tickets/:ticketId',
        addMessage: 'POST /api/support/tickets/:ticketId/messages',
        consultations: 'POST /api/support/consultations',
      },
      billing: {
        createTransaction: 'POST /api/billing/transactions',
        getTransactions: 'GET /api/billing/transactions/user/:userId',
        getBillingSummary: 'GET /api/billing/summary/:userId',
      },
      careers: {
        apply: 'POST /api/careers/applications',
        getApplications: 'GET /api/careers/applications/user/:userId',
        withdrawApplication:
          'POST /api/careers/applications/:applicationId/withdraw',
      },
      webinars: {
        register: 'POST /api/webinars/register',
        getRegistrations: 'GET /api/webinars/registrations/user/:userId',
        cancel: 'POST /api/webinars/registrations/:registrationId/cancel',
      },
      favorites: {
        add: 'POST /api/favorites',
        list: 'GET /api/favorites/user/:userId',
        check: 'GET /api/favorites/check/:userId/:type/:itemId',
        remove: 'DELETE /api/favorites/:userId/:type/:itemId',
      },
      suggestions: {
        create: 'POST /api/suggestions',
        list: 'GET /api/suggestions',
        vote: 'POST /api/suggestions/:suggestionId/vote',
        comment: 'POST /api/suggestions/:suggestionId/comments',
      },
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
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
router.use((error, req, res, _next) => {
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

  // Handle Prisma/database errors
  if (error.name === 'PrismaClientKnownRequestError' || error.name === 'PrismaClientValidationError') {
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
