/**
 * DATABASE SERVICE - PRISMA/POSTGRESQL
 * All database operations go through this service
 */

import { prisma, handlePrismaError, queryOptimizer, withTransaction } from './prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ============================================
// USER OPERATIONS
// ============================================

export const UserService = {
  // Find user by ID
  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  // Find user by email
  findByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  // Find user by session ID
  findBySessionId: async (sessionId) => {
    return prisma.user.findFirst({
      where: { sessionId },
    });
  },

  // Create new user
  create: async (data) => {
    const hashedPassword = data.password 
      ? await bcrypt.hash(data.password, parseInt(process.env.BCRYPT_ROUNDS || '12'))
      : null;
    
    return prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
        password: hashedPassword,
      },
    });
  },

  // Update user
  update: async (id, data) => {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, parseInt(process.env.BCRYPT_ROUNDS || '12'));
    }
    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  },

  // Update by email
  updateByEmail: async (email, data) => {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, parseInt(process.env.BCRYPT_ROUNDS || '12'));
    }
    return prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  },

  // Compare password
  comparePassword: async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
  },

  // Delete user
  delete: async (id) => {
    return prisma.user.delete({
      where: { id },
    });
  },

  // Find with pagination
  findMany: async ({ page = 1, limit = 20, where = {}, orderBy = { createdAt: 'desc' } }) => {
    return queryOptimizer.withPagination('user', { page, limit, where, orderBy });
  },

  // Count users
  count: async (where = {}) => {
    return prisma.user.count({ where });
  },

  // Update last login
  updateLastLogin: async (id) => {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  },

  // Generate reset token
  generateResetToken: async (email) => {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });
    
    return token;
  },

  // Verify reset token
  findByResetToken: async (token) => {
    return prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });
  },
};

// ============================================
// AGENT OPERATIONS
// ============================================

export const AgentService = {
  findById: async (id) => {
    return prisma.agent.findUnique({
      where: { id },
    });
  },

  findByAgentId: async (agentId) => {
    return prisma.agent.findUnique({
      where: { agentId },
    });
  },

  findAll: async ({ status = 'active' } = {}) => {
    return prisma.agent.findMany({
      where: status ? { status } : {},
      orderBy: { name: 'asc' },
    });
  },

  create: async (data) => {
    return prisma.agent.create({ data });
  },

  update: async (agentId, data) => {
    return prisma.agent.update({
      where: { agentId },
      data: { ...data, updatedAt: new Date() },
    });
  },

  delete: async (agentId) => {
    return prisma.agent.delete({
      where: { agentId },
    });
  },

  incrementStats: async (agentId, field) => {
    return prisma.agent.update({
      where: { agentId },
      data: {
        [field]: { increment: 1 },
      },
    });
  },
};

// ============================================
// AGENT SUBSCRIPTION OPERATIONS
// ============================================

export const AgentSubscriptionService = {
  findById: async (id) => {
    return prisma.agentSubscription.findUnique({
      where: { id },
      include: { user: true, agent: true },
    });
  },

  findByUser: async (userId) => {
    return prisma.agentSubscription.findMany({
      where: { userId },
      include: { agent: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Alias for backwards compatibility
  findByUserId: async (userId) => {
    return prisma.agentSubscription.findMany({
      where: { userId },
      include: { agent: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  findActiveByUserAndAgent: async (userId, agentId) => {
    return prisma.agentSubscription.findFirst({
      where: {
        userId,
        agentId,
        status: 'active',
        expiryDate: { gt: new Date() },
      },
      include: { agent: true },
    });
  },

  findByStripeSubscriptionId: async (stripeSubscriptionId) => {
    return prisma.agentSubscription.findFirst({
      where: { stripeSubscriptionId },
      include: { user: true, agent: true },
    });
  },

  create: async (data) => {
    return prisma.agentSubscription.create({
      data,
      include: { user: true, agent: true },
    });
  },

  update: async (id, data) => {
    return prisma.agentSubscription.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: { user: true, agent: true },
    });
  },

  cancel: async (id) => {
    return prisma.agentSubscription.update({
      where: { id },
      data: {
        status: 'cancelled',
        autoRenew: false,
        updatedAt: new Date(),
      },
    });
  },

  expireOld: async () => {
    return prisma.agentSubscription.updateMany({
      where: {
        status: 'active',
        expiryDate: { lt: new Date() },
      },
      data: { status: 'expired' },
    });
  },

  findExpiring: async (withinDays = 3) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + withinDays);
    
    return prisma.agentSubscription.findMany({
      where: {
        status: 'active',
        expiryDate: {
          gt: new Date(),
          lt: futureDate,
        },
      },
      include: { user: true, agent: true },
    });
  },
};

// ============================================
// CHAT SESSION OPERATIONS
// ============================================

export const ChatSessionService = {
  findById: async (id) => {
    return prisma.chatSession.findUnique({
      where: { id },
      include: { messages: true, agent: true },
    });
  },

  findBySessionId: async (sessionId) => {
    return prisma.chatSession.findUnique({
      where: { sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } }, agent: true },
    });
  },

  findByUser: async (userId, { limit = 20, offset = 0, isActive = true } = {}) => {
    return prisma.chatSession.findMany({
      where: {
        userId,
        isActive,
      },
      include: { agent: true },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    });
  },

  create: async (data) => {
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    return prisma.chatSession.create({
      data: {
        ...data,
        sessionId,
      },
      include: { agent: true },
    });
  },

  update: async (sessionId, data) => {
    return prisma.chatSession.update({
      where: { sessionId },
      data: { ...data, updatedAt: new Date() },
    });
  },

  addMessage: async (sessionId, message) => {
    const msg = await prisma.chatMessage.create({
      data: {
        sessionId,
        ...message,
      },
    });

    // Update session stats
    await prisma.chatSession.update({
      where: { sessionId },
      data: {
        updatedAt: new Date(),
        stats: {
          // This will need to be handled differently - increment message count
        },
      },
    });

    return msg;
  },

  getMessages: async (sessionId, { limit = 100 } = {}) => {
    return prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  },

  archive: async (sessionId) => {
    return prisma.chatSession.update({
      where: { sessionId },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  delete: async (sessionId) => {
    // Delete messages first (cascade should handle this but being explicit)
    await prisma.chatMessage.deleteMany({
      where: { sessionId },
    });
    return prisma.chatSession.delete({
      where: { sessionId },
    });
  },
};

// ============================================
// CHAT SETTINGS OPERATIONS
// ============================================

export const ChatSettingsService = {
  findByUser: async (userId) => {
    return prisma.chatSettings.findUnique({
      where: { userId },
    });
  },

  upsert: async (userId, data) => {
    return prisma.chatSettings.upsert({
      where: { userId },
      update: { ...data, updatedAt: new Date() },
      create: { userId, ...data },
    });
  },
};

// ============================================
// TRANSACTION OPERATIONS
// ============================================

export const TransactionService = {
  findById: async (id) => {
    return prisma.transaction.findUnique({
      where: { id },
      include: { user: true },
    });
  },

  findByTransactionId: async (transactionId) => {
    return prisma.transaction.findUnique({
      where: { transactionId },
      include: { user: true },
    });
  },

  findByUser: async (userId, { page = 1, limit = 20 } = {}) => {
    return queryOptimizer.withPagination('transaction', {
      page,
      limit,
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  create: async (data) => {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    return prisma.transaction.create({
      data: {
        ...data,
        transactionId,
      },
    });
  },

  update: async (id, data) => {
    return prisma.transaction.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  },

  updateByStripeId: async (stripePaymentIntentId, data) => {
    return prisma.transaction.updateMany({
      where: { stripePaymentIntentId },
      data: { ...data, updatedAt: new Date() },
    });
  },
};

// ============================================
// ANALYTICS OPERATIONS
// ============================================

export const AnalyticsService = {
  // Visitor tracking
  trackVisitor: async (data) => {
    const visitorId = data.visitorId || `vis_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    return prisma.visitor.upsert({
      where: { visitorId },
      update: {
        lastVisit: new Date(),
        visitCount: { increment: 1 },
      },
      create: {
        ...data,
        visitorId,
      },
    });
  },

  // Page view tracking
  trackPageView: async (data) => {
    return prisma.pageView.create({ data });
  },

  // Event tracking
  trackEvent: async (data) => {
    return prisma.analyticsEvent.create({ data });
  },

  // Session tracking
  trackSession: async (data) => {
    const sessionId = data.sessionId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    return prisma.session.upsert({
      where: { sessionId },
      update: {
        lastActivity: new Date(),
        pageViews: { increment: 1 },
      },
      create: {
        ...data,
        sessionId,
      },
    });
  },

  // Get analytics summary
  getSummary: async (days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [visitors, pageViews, sessions, events] = await Promise.all([
      prisma.visitor.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.pageView.count({
        where: { timestamp: { gte: startDate } },
      }),
      prisma.session.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.analyticsEvent.count({
        where: { timestamp: { gte: startDate } },
      }),
    ]);

    return { visitors, pageViews, sessions, events, period: `${days} days` };
  },
};

// ============================================
// COMMUNITY OPERATIONS
// ============================================

export const CommunityService = {
  // Posts
  getPosts: async ({ page = 1, limit = 20, category } = {}) => {
    const where = category ? { category } : {};
    return queryOptimizer.withPagination('communityPost', {
      page,
      limit,
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
  },

  getPostById: async (id) => {
    return prisma.communityPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        comments: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  },

  createPost: async (data) => {
    return prisma.communityPost.create({
      data,
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
  },

  // Comments
  addComment: async (postId, data) => {
    const comment = await prisma.communityComment.create({
      data: { ...data, postId },
    });

    await prisma.communityPost.update({
      where: { id: postId },
      data: { repliesCount: { increment: 1 } },
    });

    return comment;
  },

  // Likes
  toggleLike: async (userId, postId = null, commentId = null) => {
    const where = postId
      ? { userId_postId: { userId, postId } }
      : { userId_commentId: { userId, commentId } };

    const existing = await prisma.communityLike.findUnique({ where });

    if (existing) {
      await prisma.communityLike.delete({ where });
      if (postId) {
        await prisma.communityPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        });
      }
      return { liked: false };
    }

    await prisma.communityLike.create({
      data: { userId, postId, commentId },
    });
    if (postId) {
      await prisma.communityPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });
    }
    return { liked: true };
  },
};

// ============================================
// SUPPORT TICKET OPERATIONS
// ============================================

export const SupportService = {
  findById: async (id) => {
    return prisma.supportTicket.findUnique({
      where: { id },
      include: { user: true },
    });
  },

  findByUser: async (userId) => {
    return prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findAll: async ({ status, priority, page = 1, limit = 20 } = {}) => {
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    return queryOptimizer.withPagination('supportTicket', {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  create: async (data) => {
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return prisma.supportTicket.create({
      data: {
        ...data,
        ticketId,
      },
    });
  },

  update: async (id, data) => {
    return prisma.supportTicket.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  },

  addResponse: async (id, response) => {
    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    const responses = ticket.responses || [];
    responses.push({
      ...response,
      timestamp: new Date().toISOString(),
    });
    
    return prisma.supportTicket.update({
      where: { id },
      data: {
        responses,
        status: response.isAdmin ? 'in_progress' : ticket.status,
        updatedAt: new Date(),
      },
    });
  },
};

// ============================================
// USER FAVORITES OPERATIONS
// ============================================

export const FavoritesService = {
  findByUser: async (userId) => {
    return prisma.userFavorites.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  add: async (userId, itemType, itemId, notes = null) => {
    return prisma.userFavorites.upsert({
      where: {
        userId_itemType_itemId: { userId, itemType, itemId },
      },
      update: { notes },
      create: { userId, itemType, itemId, notes },
    });
  },

  remove: async (userId, itemType, itemId) => {
    return prisma.userFavorites.delete({
      where: {
        userId_itemType_itemId: { userId, itemType, itemId },
      },
    });
  },

  check: async (userId, itemType, itemId) => {
    const fav = await prisma.userFavorites.findUnique({
      where: {
        userId_itemType_itemId: { userId, itemType, itemId },
      },
    });
    return !!fav;
  },
};

// ============================================
// AGENT MEMORY OPERATIONS
// ============================================

export const AgentMemoryService = {
  findByAgentAndUser: async (agentId, userId) => {
    return prisma.agentMemory.findUnique({
      where: {
        agentId_userId: { agentId, userId },
      },
    });
  },

  upsert: async (agentId, userId, memoryEntry) => {
    const existing = await prisma.agentMemory.findUnique({
      where: { agentId_userId: { agentId, userId } },
    });

    const memories = existing?.memories || [];
    memories.push({
      ...memoryEntry,
      timestamp: new Date().toISOString(),
    });

    return prisma.agentMemory.upsert({
      where: { agentId_userId: { agentId, userId } },
      update: {
        memories,
        totalMemories: memories.length,
        lastAccessed: new Date(),
        updatedAt: new Date(),
      },
      create: {
        agentId,
        userId,
        memories,
        totalMemories: 1,
        lastAccessed: new Date(),
      },
    });
  },

  updateSummary: async (agentId, userId, summary) => {
    return prisma.agentMemory.update({
      where: { agentId_userId: { agentId, userId } },
      data: {
        summary,
        updatedAt: new Date(),
      },
    });
  },

  clear: async (agentId, userId) => {
    return prisma.agentMemory.delete({
      where: { agentId_userId: { agentId, userId } },
    });
  },
};

// ============================================
// JOB APPLICATION OPERATIONS
// ============================================

export const CareerService = {
  findById: async (id) => {
    return prisma.jobApplication.findUnique({
      where: { id },
    });
  },

  findAll: async ({ status, position, page = 1, limit = 20 } = {}) => {
    const where = {};
    if (status) where.status = status;
    if (position) where.position = position;
    
    return queryOptimizer.withPagination('jobApplication', {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  create: async (data) => {
    return prisma.jobApplication.create({ data });
  },

  update: async (id, data) => {
    return prisma.jobApplication.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  },
};

// ============================================
// WEBINAR OPERATIONS
// ============================================

export const WebinarService = {
  register: async (data) => {
    return prisma.webinarRegistration.upsert({
      where: {
        webinarId_email: { webinarId: data.webinarId, email: data.email },
      },
      update: data,
      create: data,
    });
  },

  findByWebinar: async (webinarId) => {
    return prisma.webinarRegistration.findMany({
      where: { webinarId },
      orderBy: { createdAt: 'desc' },
    });
  },

  markAttended: async (webinarId, email) => {
    return prisma.webinarRegistration.update({
      where: { webinarId_email: { webinarId, email } },
      data: {
        attended: true,
        joinedAt: new Date(),
      },
    });
  },
};

// ============================================
// CANVAS OPERATIONS
// ============================================

export const CanvasService = {
  // Files
  createFile: async (data) => {
    return prisma.chatCanvasFile.create({ data });
  },

  updateFile: async (id, data) => {
    return prisma.chatCanvasFile.update({
      where: { id },
      data: { ...data, version: { increment: 1 }, updatedAt: new Date() },
    });
  },

  getFilesBySession: async (sessionId) => {
    return prisma.chatCanvasFile.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Projects
  createProject: async (data) => {
    return prisma.chatCanvasProject.create({ data });
  },

  getProjectsBySession: async (sessionId) => {
    return prisma.chatCanvasProject.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });
  },

  // History
  addHistory: async (sessionId, action, data) => {
    return prisma.chatCanvasHistory.create({
      data: { sessionId, action, data },
    });
  },
};

// ============================================
// CONTACT MESSAGE OPERATIONS
// ============================================

export const ContactService = {
  create: async (data) => {
    return prisma.contactMessage.create({ data });
  },

  findAll: async ({ status, page = 1, limit = 20 } = {}) => {
    const where = status ? { status } : {};
    return queryOptimizer.withPagination('contactMessage', {
      page,
      limit,
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  update: async (id, data) => {
    return prisma.contactMessage.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  },
};

// ============================================
// GAMIFICATION OPERATIONS
// ============================================

export const GamificationService = {
  // Get user gamification data
  getUserGamification: async (userId) => {
    return prisma.userGamification.findUnique({
      where: { userId },
    });
  },

  // Create user gamification record
  createUserGamification: async (userId, username = 'User') => {
    return GamificationService.initializeUserGamification(userId, username);
  },

  // Initialize user gamification if it doesn't exist
  initializeUserGamification: async (userId, username = 'User') => {
    return prisma.userGamification.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        username,
        totalPoints: 0,
        availablePoints: 0,
        totalPointsEarned: 0,
        totalPointsRedeemed: 0,
        totalBadgesEarned: 0,
        totalAchievements: 0,
        totalRewardsRedeemed: 0,
        totalMessagesSent: 0,
        perfectResponses: 0,
        highScores: 0,
        longestConversation: 0,
        totalConversationLength: 0,
        currentStreak: 0,
        longestStreak: 0,
        completedChallenges: 0,
        agentsUsed: [],
        agentUsageCount: {},
        lastActivityAt: new Date(),
      },
    });
  },

  // Update agent usage
  updateAgentUsage: async (userId, agentId) => {
    return withTransaction(async (tx) => {
      // Get current gamification
      const gamification = await tx.userGamification.findUnique({
        where: { userId },
      });

      if (!gamification) {
        throw new Error('User gamification not found');
      }

      const agentsUsed = gamification.agentsUsed || [];
      const agentUsageCount = gamification.agentUsageCount || {};

      // Update agents used array
      if (!agentsUsed.includes(agentId)) {
        agentsUsed.push(agentId);
      }

      // Update usage count
      agentUsageCount[agentId] = (agentUsageCount[agentId] || 0) + 1;

      // Update gamification
      return tx.userGamification.update({
        where: { userId },
        data: {
          agentsUsed,
          agentUsageCount,
          totalMessagesSent: { increment: 1 },
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });
  },

  // Increment perfect responses
  incrementPerfectResponses: async (userId) => {
    return prisma.userGamification.update({
      where: { userId },
      data: {
        perfectResponses: { increment: 1 },
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  // Increment high scores
  incrementHighScores: async (userId) => {
    return prisma.userGamification.update({
      where: { userId },
      data: {
        highScores: { increment: 1 },
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  // Update conversation stats
  updateConversationStats: async (userId, messageCount) => {
    return withTransaction(async (tx) => {
      const gamification = await tx.userGamification.findUnique({
        where: { userId },
      });

      if (!gamification) {
        throw new Error('User gamification not found');
      }

      const newLongestConversation = Math.max(gamification.longestConversation || 0, messageCount);

      return tx.userGamification.update({
        where: { userId },
        data: {
          longestConversation: newLongestConversation,
          totalConversationLength: { increment: messageCount },
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });
  },

  // Update streak
  updateStreak: async (userId, streakCount) => {
    return withTransaction(async (tx) => {
      const gamification = await tx.userGamification.findUnique({
        where: { userId },
      });

      if (!gamification) {
        throw new Error('User gamification not found');
      }

      const newLongestStreak = Math.max(gamification.longestStreak || 0, streakCount);

      return tx.userGamification.update({
        where: { userId },
        data: {
          currentStreak: streakCount,
          longestStreak: newLongestStreak,
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });
  },

  // Increment completed challenges
  incrementCompletedChallenges: async (userId) => {
    return prisma.userGamification.update({
      where: { userId },
      data: {
        completedChallenges: { increment: 1 },
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      },
    });
  },

  // Get recent points history
  getRecentPointsHistory: async (userId, limit = 10) => {
    return prisma.pointsHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  // Process event (combines event processing logic)
  processEvent: async (userId, eventType, eventData = {}) => {
    // Get or create user gamification record
    let userGamification = await GamificationService.getUserGamification(userId);
    if (!userGamification) {
      userGamification = await GamificationService.initializeUserGamification(userId, eventData.username || 'User');
    }

    // Define points for different event types
    const eventPoints = {
      'message-sent': 1,
      'perfect-response': 5,
      'high-score': 10,
      'session-end': 2,
      'streak-update': 3,
      'challenge-completed': 15,
      'agent-created': 20,
      'first-login': 5
    };

    const pointsToAward = eventPoints[eventType] || 0;

    // Award points if applicable
    if (pointsToAward > 0) {
      await GamificationService.addPoints(userId, pointsToAward, `Event: ${eventType}`, eventData);
    }

    // Update specific metrics based on event type
    switch (eventType) {
      case 'message-sent':
        if (eventData.agentId) {
          await GamificationService.updateAgentUsage(userId, eventData.agentId);
        }
        break;

      case 'perfect-response':
        await GamificationService.incrementPerfectResponses(userId);
        break;

      case 'high-score':
        await GamificationService.incrementHighScores(userId);
        break;

      case 'session-end':
        if (eventData.messageCount) {
          await GamificationService.updateConversationStats(userId, eventData.messageCount);
        }
        break;

      case 'streak-update':
        if (eventData.streakCount) {
          await GamificationService.updateStreak(userId, eventData.streakCount);
        }
        break;

      case 'challenge-completed':
        await GamificationService.incrementCompletedChallenges(userId);
        break;
    }

    return { pointsAwarded: pointsToAward, eventType };
  },

  // Check and award badges based on user activity
  checkAndAwardBadges: async (userId) => {
    const gamification = await GamificationService.getUserGamification(userId);
    if (!gamification) return [];

    const awardedBadges = [];

    // Get all available badges
    const badges = await prisma.badge.findMany();

    for (const badge of badges) {
      // Check if user already has this badge
      const existing = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.badgeId } },
      });

      if (existing) continue;

      // Check badge criteria
      let shouldAward = false;

      switch (badge.criteriaType) {
        case 'totalPoints':
          shouldAward = gamification.totalPoints >= badge.criteriaValue;
          break;
        case 'totalMessages':
          shouldAward = gamification.totalMessagesSent >= badge.criteriaValue;
          break;
        case 'perfectResponses':
          shouldAward = gamification.perfectResponses >= badge.criteriaValue;
          break;
        case 'highScores':
          shouldAward = gamification.highScores >= badge.criteriaValue;
          break;
        case 'streak':
          shouldAward = gamification.longestStreak >= badge.criteriaValue;
          break;
        case 'agentsUsed':
          shouldAward = gamification.agentsUsed?.length >= badge.criteriaValue;
          break;
      }

      if (shouldAward) {
        try {
          const awardedBadge = await GamificationService.awardBadge(userId, badge.badgeId);
          awardedBadges.push(awardedBadge);
        } catch (error) {
          // Badge might have been awarded already, continue
          console.log(`Badge ${badge.badgeId} already awarded or error:`, error.message);
        }
      }
    }

    return awardedBadges;
  },

  // Check and complete achievements based on user activity
  checkAndCompleteAchievements: async (userId) => {
    const gamification = await GamificationService.getUserGamification(userId);
    if (!gamification) return [];

    const completedAchievements = [];

    // Get all available achievements
    const achievements = await prisma.achievement.findMany();

    for (const achievement of achievements) {
      // Check if user already completed this achievement
      const existing = await prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId: achievement.achievementId } },
      });

      if (existing?.completed) continue;

      // Check achievement criteria
      let shouldComplete = false;
      let currentValue = 0;

      switch (achievement.criteriaType) {
        case 'totalPoints':
          currentValue = gamification.totalPoints;
          shouldComplete = currentValue >= achievement.criteriaValue;
          break;
        case 'totalMessages':
          currentValue = gamification.totalMessagesSent;
          shouldComplete = currentValue >= achievement.criteriaValue;
          break;
        case 'perfectResponses':
          currentValue = gamification.perfectResponses;
          shouldComplete = currentValue >= achievement.criteriaValue;
          break;
        case 'highScores':
          currentValue = gamification.highScores;
          shouldComplete = currentValue >= achievement.criteriaValue;
          break;
        case 'streak':
          currentValue = gamification.longestStreak;
          shouldComplete = currentValue >= achievement.criteriaValue;
          break;
        case 'agentsUsed':
          currentValue = gamification.agentsUsed?.length || 0;
          shouldComplete = currentValue >= achievement.criteriaValue;
          break;
      }

      if (shouldComplete) {
        try {
          // Update progress first if not completed
          if (!existing) {
            await GamificationService.updateAchievementProgress(userId, achievement.achievementId, currentValue);
          }

          // Complete achievement
          const completedAchievement = await GamificationService.completeAchievement(userId, achievement.achievementId);
          completedAchievements.push(completedAchievement);
        } catch (error) {
          console.log(`Achievement ${achievement.achievementId} completion error:`, error.message);
        }
      } else if (!existing || !existing.completed) {
        // Update progress
        await GamificationService.updateAchievementProgress(userId, achievement.achievementId, currentValue);
      }
    }

    return completedAchievements;
  },

  // Points Management
  addPoints: async (userId, amount, description, category = 'chat', relatedType = null, relatedId = null) => {
    return withTransaction(async (tx) => {
      // Update user gamification
      const gamification = await tx.userGamification.update({
        where: { userId },
        data: {
          totalPoints: { increment: amount },
          availablePoints: { increment: amount },
          totalPointsEarned: { increment: amount },
          updatedAt: new Date(),
        },
      });

      // Add points history
      await tx.pointsHistory.create({
        data: {
          userId,
          type: 'earned',
          amount,
          description,
          category,
          relatedType,
          relatedId,
        },
      });

      return gamification;
    });
  },

  redeemPoints: async (userId, amount, rewardId, description = 'Reward redemption') => {
    return withTransaction(async (tx) => {
      // Check if user has enough points
      const gamification = await tx.userGamification.findUnique({
        where: { userId },
      });

      if (!gamification || gamification.availablePoints < amount) {
        throw new Error('Insufficient points');
      }

      // Update user gamification
      const updatedGamification = await tx.userGamification.update({
        where: { userId },
        data: {
          availablePoints: { decrement: amount },
          totalPointsRedeemed: { increment: amount },
          updatedAt: new Date(),
        },
      });

      // Add points history
      await tx.pointsHistory.create({
        data: {
          userId,
          type: 'redeemed',
          amount: -amount,
          description,
          category: 'redemption',
          relatedType: 'reward',
          relatedId: rewardId,
        },
      });

      return updatedGamification;
    });
  },

  // Badges
  getUserBadges: async (userId) => {
    return prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
  },

  awardBadge: async (userId, badgeId) => {
    return withTransaction(async (tx) => {
      // Check if user already has this badge
      const existing = await tx.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId } },
      });

      if (existing) {
        throw new Error('Badge already earned');
      }

      // Get badge details
      const badge = await tx.badge.findUnique({
        where: { badgeId },
      });

      if (!badge) {
        throw new Error('Badge not found');
      }

      // Award badge
      const userBadge = await tx.userBadge.create({
        data: { userId, badgeId },
        include: { badge: true },
      });

      // Update user gamification
      await tx.userGamification.update({
        where: { userId },
        data: {
          totalBadgesEarned: { increment: 1 },
          totalPoints: { increment: badge.points },
          availablePoints: { increment: badge.points },
          totalPointsEarned: { increment: badge.points },
          updatedAt: new Date(),
        },
      });

      // Add points history
      await tx.pointsHistory.create({
        data: {
          userId,
          type: 'earned',
          amount: badge.points,
          description: `Earned badge: ${badge.name}`,
          category: 'badge',
          relatedType: 'badge',
          relatedId: badgeId,
        },
      });

      return userBadge;
    });
  },

  // Achievements
  getUserAchievements: async (userId) => {
    return prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { completedAt: 'desc' },
    });
  },

  updateAchievementProgress: async (userId, achievementId, progress) => {
    return prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId } },
      update: {
        currentValue: progress,
        completed: false,
        updatedAt: new Date(),
      },
      create: {
        userId,
        achievementId,
        currentValue: progress,
      },
    });
  },

  completeAchievement: async (userId, achievementId) => {
    return withTransaction(async (tx) => {
      // Get achievement details
      const achievement = await tx.achievement.findUnique({
        where: { achievementId },
      });

      if (!achievement) {
        throw new Error('Achievement not found');
      }

      // Update achievement
      const userAchievement = await tx.userAchievement.update({
        where: { userId_achievementId: { userId, achievementId } },
        data: {
          completed: true,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
        include: { achievement: true },
      });

      // Update user gamification
      await tx.userGamification.update({
        where: { userId },
        data: {
          totalAchievements: { increment: 1 },
          totalPoints: { increment: achievement.points },
          availablePoints: { increment: achievement.points },
          totalPointsEarned: { increment: achievement.points },
          updatedAt: new Date(),
        },
      });

      // Add points history
      await tx.pointsHistory.create({
        data: {
          userId,
          type: 'earned',
          amount: achievement.points,
          description: `Completed achievement: ${achievement.name}`,
          category: 'achievement',
          relatedType: 'achievement',
          relatedId: achievementId,
        },
      });

      return userAchievement;
    });
  },

  // Rewards
  getAvailableRewards: async () => {
    return prisma.reward.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  },

  redeemReward: async (userId, rewardId) => {
    return withTransaction(async (tx) => {
      // Get reward details
      const reward = await tx.reward.findUnique({
        where: { rewardId },
      });

      if (!reward) {
        throw new Error('Reward not found');
      }

      if (!reward.isActive) {
        throw new Error('Reward not available');
      }

      // Check stock
      if (reward.availability === 'limited' && reward.stock !== null && reward.stock <= 0) {
        throw new Error('Reward out of stock');
      }

      // Create redemption
      const redemption = await tx.rewardRedemption.create({
        data: {
          userId,
          rewardId,
          pointsSpent: reward.cost,
          status: 'pending',
        },
        include: { reward: true },
      });

      // Deduct points
      await tx.userGamification.update({
        where: { userId },
        data: {
          availablePoints: { decrement: reward.cost },
          totalPointsRedeemed: { increment: reward.cost },
          totalRewardsRedeemed: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      // Update stock if limited
      if (reward.availability === 'limited' && reward.stock !== null) {
        await tx.reward.update({
          where: { rewardId },
          data: { stock: { decrement: 1 } },
        });
      }

      return redemption;
    });
  },
};

// ============================================
// EXPORT ALL SERVICES
// ============================================

export default {
  User: UserService,
  Agent: AgentService,
  AgentSubscription: AgentSubscriptionService,
  Subscription: AgentSubscriptionService, // Alias for backwards compatibility
  ChatSession: ChatSessionService,
  ChatSettings: ChatSettingsService,
  Transaction: TransactionService,
  Analytics: AnalyticsService,
  Community: CommunityService,
  Support: SupportService,
  Favorites: FavoritesService,
  AgentMemory: AgentMemoryService,
  Career: CareerService,
  Webinar: WebinarService,
  Canvas: CanvasService,
  Contact: ContactService,
  Gamification: GamificationService,
  // Raw prisma access for complex queries
  prisma,
  withTransaction,
  handlePrismaError,
};
