/**
 * PRISMA MODEL ADAPTERS
 * Provides consistent interface for database operations using Prisma
 * All models use PostgreSQL via Prisma ORM
 */

import { prisma } from '../lib/prisma.js';

// ============================================
// USER MODEL ADAPTER
// ============================================
class UserAdapter {
  static async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  static async findOne(query) {
    const where = {};
    if (query.email) where.email = query.email.toLowerCase();
    if (query.sessionId) where.sessionId = query.sessionId;
    if (query._id) where.id = query._id;
    return prisma.user.findFirst({ where });
  }

  static async findMany(query = {}) {
    return prisma.user.findMany({ where: query });
  }

  static async create(data) {
    return prisma.user.create({ data });
  }

  static async updateOne(query, update) {
    const where = {};
    if (query._id) where.id = query._id;
    if (query.email) where.email = query.email.toLowerCase();
    return prisma.user.updateMany({ where, data: update.$set || update });
  }
}

// ============================================
// AGENT MODEL ADAPTER
// ============================================
class AgentAdapter {
  static async findById(id) {
    return prisma.agent.findUnique({ where: { id } });
  }

  static async findOne(query) {
    const where = {};
    if (query.agentId) where.agentId = query.agentId;
    if (query.id) where.id = query.id;
    if (query._id) where.id = query._id;
    if (query.status) where.status = query.status;
    return prisma.agent.findFirst({ where });
  }

  static async find(query = {}) {
    const where = {};
    if (query.status) where.status = query.status;
    if (query.isActive !== undefined) where.status = query.isActive ? 'active' : 'deprecated';
    return prisma.agent.findMany({ where, orderBy: { name: 'asc' } });
  }
}

// ============================================
// CHAT SESSION MODEL ADAPTER
// ============================================
class ChatSessionAdapter {
  static async findById(id) {
    return prisma.chatSession.findUnique({ 
      where: { id },
      include: { agent: true, messages: true }
    });
  }

  static async findOne(query) {
    const where = {};
    if (query.sessionId) where.sessionId = query.sessionId;
    if (query.userId) where.userId = query.userId;
    if (query.id) where.id = query.id;
    return prisma.chatSession.findFirst({ 
      where,
      include: { agent: true }
    });
  }

  static async find(query = {}) {
    const where = {};
    if (query.userId) where.userId = query.userId;
    if (query.agentId) where.agentId = query.agentId;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    return prisma.chatSession.findMany({ 
      where,
      include: { agent: true },
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async create(data) {
    return prisma.chatSession.create({
      data: {
        sessionId: data.sessionId,
        userId: data.userId,
        agentId: data.agentId,
        name: data.name,
        description: data.description,
        tags: data.tags || [],
        context: data.context || {},
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        messageCount: data.stats?.messageCount || 0,
        totalTokens: data.stats?.totalTokens || 0,
        lastMessageAt: data.stats?.lastMessageAt,
      }
    });
  }

  static async deleteOne(query) {
    try {
      const where = {};
      if (query.sessionId) where.sessionId = query.sessionId;
      if (query.userId) where.userId = query.userId;
      await prisma.chatSession.deleteMany({ where });
      return { deletedCount: 1 };
    } catch (error) {
      return { deletedCount: 0 };
    }
  }
}

// ============================================
// CHAT SETTINGS MODEL ADAPTER
// ============================================
class ChatSettingsAdapter {
  static async findOne(query) {
    const where = {};
    if (query.userId) where.userId = query.userId;
    return prisma.chatSettings.findFirst({ where });
  }

  static async findOneAndUpdate(query, update, options = {}) {
    const where = {};
    if (query.userId) where.userId = query.userId;
    
    const existing = await prisma.chatSettings.findFirst({ where });
    
    if (existing) {
      return prisma.chatSettings.update({
        where: { id: existing.id },
        data: update.$set || update
      });
    } else if (options.upsert) {
      return prisma.chatSettings.create({
        data: {
          userId: query.userId,
          ...(update.$set || update)
        }
      });
    }
    return null;
  }
}

// ============================================
// CHAT FEEDBACK MODEL ADAPTER
// ============================================
class ChatFeedbackAdapter {
  static async findOne(query) {
    const where = {};
    if (query.messageId) where.messageId = query.messageId;
    if (query.userId) where.userId = query.userId;
    if (query.sessionId) where.sessionId = query.sessionId;
    return prisma.chatFeedback.findFirst({ where });
  }

  static async find(query = {}) {
    const where = {};
    if (query.sessionId) where.sessionId = query.sessionId;
    if (query.userId) where.userId = query.userId;
    return prisma.chatFeedback.findMany({ where });
  }

  static async create(data) {
    return prisma.chatFeedback.create({ data });
  }
}

// ============================================
// CHAT QUICK ACTION MODEL ADAPTER
// ============================================
class ChatQuickActionAdapter {
  static async find(query = {}) {
    const where = {};
    if (query.userId) where.userId = query.userId;
    if (query.isDefault !== undefined) where.isDefault = query.isDefault;
    return prisma.chatQuickAction.findMany({ 
      where,
      orderBy: { sortOrder: 'asc' }
    });
  }

  static async create(data) {
    return prisma.chatQuickAction.create({ data });
  }

  static async findByIdAndUpdate(id, update) {
    return prisma.chatQuickAction.update({
      where: { id },
      data: update
    });
  }

  static async findByIdAndDelete(id) {
    return prisma.chatQuickAction.delete({ where: { id } });
  }
}

// ============================================
// CANVAS PROJECT MODEL ADAPTER
// ============================================
class ChatCanvasProjectAdapter {
  static async find(query = {}) {
    const where = {};
    if (query.userId) where.userId = query.userId;
    if (query.sessionId) where.sessionId = query.sessionId;
    return prisma.chatCanvasProject.findMany({
      where,
      include: { files: true },
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async findById(id) {
    return prisma.chatCanvasProject.findUnique({
      where: { id },
      include: { files: true }
    });
  }

  static async create(data) {
    return prisma.chatCanvasProject.create({
      data: {
        userId: data.userId,
        sessionId: data.sessionId,
        name: data.name,
        description: data.description,
        type: data.type,
        metadata: data.metadata || {}
      }
    });
  }

  static async findByIdAndUpdate(id, update) {
    return prisma.chatCanvasProject.update({
      where: { id },
      data: update.$set || update
    });
  }

  static async findByIdAndDelete(id) {
    // Delete associated files first
    await prisma.chatCanvasFile.deleteMany({ where: { projectId: id } });
    return prisma.chatCanvasProject.delete({ where: { id } });
  }
}

// ============================================
// CANVAS FILE MODEL ADAPTER
// ============================================
class ChatCanvasFileAdapter {
  static async find(query = {}) {
    const where = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.userId) where.userId = query.userId;
    return prisma.chatCanvasFile.findMany({
      where,
      orderBy: { path: 'asc' }
    });
  }

  static async findById(id) {
    return prisma.chatCanvasFile.findUnique({ where: { id } });
  }

  static async create(data) {
    return prisma.chatCanvasFile.create({ data });
  }

  static async findByIdAndUpdate(id, update) {
    return prisma.chatCanvasFile.update({
      where: { id },
      data: update.$set || update
    });
  }

  static async findByIdAndDelete(id) {
    return prisma.chatCanvasFile.delete({ where: { id } });
  }
}

// ============================================
// CANVAS HISTORY MODEL ADAPTER
// ============================================
class ChatCanvasHistoryAdapter {
  static async find(query = {}) {
    const where = {};
    if (query.fileId) where.fileId = query.fileId;
    return prisma.chatCanvasHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  static async create(data) {
    return prisma.chatCanvasHistory.create({ data });
  }
}

// ============================================
// ANALYTICS MODELS ADAPTERS
// ============================================
class VisitorAdapter {
  static async findOne(query) {
    const where = {};
    if (query.visitorId) where.visitorId = query.visitorId;
    return prisma.visitor.findFirst({ where });
  }

  static async countDocuments(query = {}) {
    return prisma.visitor.count({ where: query });
  }
}

class SessionAdapter {
  static async findOne(query) {
    const where = {};
    if (query.sessionId) where.sessionId = query.sessionId;
    return prisma.session.findFirst({ where });
  }

  static async find(query = {}) {
    const where = {};
    if (query.visitorId) where.visitorId = query.visitorId;
    return prisma.session.findMany({ where, orderBy: { startTime: 'desc' } });
  }

  static async countDocuments(query = {}) {
    return prisma.session.count({ where: query });
  }
}

class PageViewAdapter {
  static async countDocuments(query = {}) {
    return prisma.pageView.count({ where: query });
  }

  static async find(query = {}) {
    return prisma.pageView.findMany({ where: query, orderBy: { timestamp: 'desc' } });
  }
}

class UserEventAdapter {
  static async countDocuments(query = {}) {
    return prisma.userEvent.count({ where: query });
  }

  static async find(query = {}) {
    return prisma.userEvent.findMany({ where: query, orderBy: { occurredAt: 'desc' } });
  }
}

class ApiUsageAdapter {
  static async countDocuments(query = {}) {
    return prisma.apiUsage.count({ where: query });
  }

  static async find(query = {}) {
    return prisma.apiUsage.findMany({ where: query, orderBy: { timestamp: 'desc' } });
  }
}

class ChatInteractionAdapter {
  static async findOne(query) {
    const where = {};
    if (query.conversationId) where.conversationId = query.conversationId;
    if (query.userId) where.userId = query.userId;
    return prisma.chatAnalyticsInteraction.findFirst({ where });
  }

  static async find(query = {}) {
    const where = {};
    if (query.conversationId) where.conversationId = query.conversationId;
    if (query.userId) where.userId = query.userId;
    return prisma.chatAnalyticsInteraction.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });
  }

  static async create(data) {
    return prisma.chatAnalyticsInteraction.create({
      data: {
        conversationId: data.conversationId,
        userId: data.userId,
        agentId: data.agentId,
        channel: data.channel || 'web',
        language: data.language || 'en',
        messages: data.messages || [],
        status: data.status || 'active'
      }
    });
  }
}

// ============================================
// SUPPORT MODELS ADAPTERS
// ============================================
class SupportTicketAdapter {
  static async find(query = {}) {
    const where = {};
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;
    return prisma.supportTicket.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async findById(id) {
    return prisma.supportTicket.findUnique({ where: { id } });
  }

  static async create(data) {
    return prisma.supportTicket.create({ data });
  }

  static async findByIdAndUpdate(id, update) {
    return prisma.supportTicket.update({ where: { id }, data: update.$set || update });
  }
}

class ContactMessageAdapter {
  static async find(query = {}) {
    return prisma.contactMessage.findMany({ where: query, orderBy: { createdAt: 'desc' } });
  }

  static async findById(id) {
    return prisma.contactMessage.findUnique({ where: { id } });
  }

  static async create(data) {
    return prisma.contactMessage.create({ data });
  }

  static async findByIdAndUpdate(id, update) {
    return prisma.contactMessage.update({ where: { id }, data: update.$set || update });
  }
}

// ============================================
// COMMUNITY MODELS ADAPTERS
// ============================================
class CommunityPostAdapter {
  static async find(query = {}) {
    const where = {};
    if (query.authorId) where.authorId = query.authorId;
    if (query.category) where.category = query.category;
    return prisma.communityPost.findMany({ 
      where, 
      include: { author: true, comments: true, likes: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findById(id) {
    return prisma.communityPost.findUnique({ 
      where: { id },
      include: { author: true, comments: true, likes: true }
    });
  }

  static async create(data) {
    return prisma.communityPost.create({ data });
  }

  static async findByIdAndUpdate(id, update) {
    return prisma.communityPost.update({ where: { id }, data: update.$set || update });
  }

  static async findByIdAndDelete(id) {
    return prisma.communityPost.delete({ where: { id } });
  }
}

// ============================================
// OTHER MODELS ADAPTERS
// ============================================
class JobApplicationAdapter {
  static async find(query = {}) {
    return prisma.jobApplication.findMany({ where: query, orderBy: { createdAt: 'desc' } });
  }

  static async findById(id) {
    return prisma.jobApplication.findUnique({ where: { id } });
  }

  static async create(data) {
    return prisma.jobApplication.create({ data });
  }

  static async findByIdAndUpdate(id, update) {
    return prisma.jobApplication.update({ where: { id }, data: update.$set || update });
  }
}

class WebinarRegistrationAdapter {
  static async find(query = {}) {
    return prisma.webinarRegistration.findMany({ where: query, orderBy: { createdAt: 'desc' } });
  }

  static async findOne(query) {
    return prisma.webinarRegistration.findFirst({ where: query });
  }

  static async create(data) {
    return prisma.webinarRegistration.create({ data });
  }
}

class UserFavoritesAdapter {
  static async findOne(query) {
    return prisma.userFavorites.findFirst({ where: query });
  }

  static async findOneAndUpdate(query, update, options = {}) {
    const existing = await prisma.userFavorites.findFirst({ where: query });
    if (existing) {
      return prisma.userFavorites.update({ where: { id: existing.id }, data: update.$set || update });
    } else if (options.upsert) {
      return prisma.userFavorites.create({ data: { ...query, ...(update.$set || update) } });
    }
    return null;
  }
}

class TransactionAdapter {
  static async find(query = {}) {
    return prisma.transaction.findMany({ where: query, orderBy: { createdAt: 'desc' } });
  }

  static async findOne(query) {
    return prisma.transaction.findFirst({ where: query });
  }

  static async create(data) {
    return prisma.transaction.create({ data });
  }

  static async findByIdAndUpdate(id, update) {
    return prisma.transaction.update({ where: { id }, data: update.$set || update });
  }
}

class AgentMemoryAdapter {
  static async find(query = {}) {
    return prisma.agentMemory.findMany({ 
      where: query, 
      orderBy: { updatedAt: 'desc' } 
    });
  }

  static async findOne(query) {
    return prisma.agentMemory.findFirst({ where: query });
  }

  static async create(data) {
    return prisma.agentMemory.create({ data });
  }

  static async findByIdAndUpdate(id, update) {
    return prisma.agentMemory.update({ where: { id }, data: update.$set || update });
  }

  static async findByIdAndDelete(id) {
    return prisma.agentMemory.delete({ where: { id } });
  }

  static async deleteMany(query) {
    return prisma.agentMemory.deleteMany({ where: query });
  }
}

class AgentFileAdapter {
  static async find(query = {}) {
    return prisma.agentFile.findMany({ where: query, orderBy: { createdAt: 'desc' } });
  }

  static async findById(id) {
    return prisma.agentFile.findUnique({ where: { id } });
  }

  static async create(data) {
    return prisma.agentFile.create({ data });
  }

  static async findByIdAndDelete(id) {
    return prisma.agentFile.delete({ where: { id } });
  }
}

class CommunitySuggestionAdapter {
  static async find(query = {}) {
    return prisma.communitySuggestion.findMany({ where: query, orderBy: { createdAt: 'desc' } });
  }

  static async findById(id) {
    return prisma.communitySuggestion.findUnique({ where: { id } });
  }

  static async create(data) {
    return prisma.communitySuggestion.create({ data });
  }

  static async findByIdAndUpdate(id, update) {
    return prisma.communitySuggestion.update({ where: { id }, data: update.$set || update });
  }
}

// ============================================
// LAB EXPERIMENT ADAPTER
// Uses AnalyticsEvent to store lab experiments
// ============================================
class LabExperimentAdapter {
  static async find(query = {}) {
    const where = { eventName: 'lab_experiment' };
    if (query.sessionId) where.sessionId = query.sessionId;
    if (query.userId) where.userId = query.userId;
    return prisma.analyticsEvent.findMany({ 
      where, 
      orderBy: { timestamp: 'desc' } 
    });
  }

  static async findById(id) {
    return prisma.analyticsEvent.findUnique({ where: { id } });
  }

  static async create(data) {
    return prisma.analyticsEvent.create({
      data: {
        visitorId: data.visitorId || 'system',
        sessionId: data.sessionId || 'system',
        userId: data.userId,
        eventName: 'lab_experiment',
        eventData: {
          experimentId: data.experimentId,
          experimentType: data.experimentType,
          input: data.input,
          output: data.output,
          status: data.status || 'completed',
          processingTime: data.processingTime,
          tokensUsed: data.tokensUsed,
          costIncurred: data.costIncurred,
          modelUsed: data.modelUsed,
          parameters: data.parameters,
          metadata: data.metadata
        },
        timestamp: new Date()
      }
    });
  }

  static async countDocuments(query = {}) {
    const where = { eventName: 'lab_experiment' };
    if (query.timestamp?.$gte) where.timestamp = { gte: query.timestamp.$gte };
    if (query.timestamp?.$lte) where.timestamp = { ...(where.timestamp || {}), lte: query.timestamp.$lte };
    return prisma.analyticsEvent.count({ where });
  }

  static async distinct(field, query = {}) {
    const where = { eventName: 'lab_experiment' };
    if (query.timestamp?.$gte) where.timestamp = { gte: query.timestamp.$gte };
    const events = await prisma.analyticsEvent.findMany({
      where,
      select: { [field]: true },
      distinct: [field]
    });
    return events.map(e => e[field]).filter(Boolean);
  }

  static async aggregate(pipeline) {
    // Simplified aggregation for avg duration
    const events = await prisma.analyticsEvent.findMany({
      where: { eventName: 'lab_experiment' }
    });
    if (pipeline.some(p => p.$group?._id === null)) {
      const durations = events.map(e => e.eventData?.processingTime || 0);
      const avg = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
      return [{ avgDuration: avg }];
    }
    return [];
  }

  // Make instances with save method
  constructor(data) {
    Object.assign(this, data);
  }

  async save() {
    return LabExperimentAdapter.create(this);
  }
}

// ============================================
// CONSULTATION ADAPTER
// ============================================
class ConsultationAdapter {
  static async find(query = {}) {
    return prisma.consultation.findMany({ 
      where: query, 
      orderBy: { createdAt: 'desc' } 
    });
  }

  static async findById(id) {
    return prisma.consultation.findUnique({ where: { id } });
  }

  static async create(data) {
    return prisma.consultation.create({ data });
  }

  static async findByIdAndUpdate(id, update) {
    return prisma.consultation.update({ 
      where: { id }, 
      data: update.$set || update 
    });
  }
}

// ============================================
// EXPORTS - PRISMA MODEL INTERFACE
// ============================================

export const User = UserAdapter;
export const Agent = AgentAdapter;
export const ChatSession = ChatSessionAdapter;
export const ChatSettings = ChatSettingsAdapter;
export const ChatFeedback = ChatFeedbackAdapter;
export const ChatQuickAction = ChatQuickActionAdapter;
export const ChatCanvasProject = ChatCanvasProjectAdapter;
export const ChatCanvasFile = ChatCanvasFileAdapter;
export const ChatCanvasHistory = ChatCanvasHistoryAdapter;
export const ChatInteraction = ChatInteractionAdapter;

// Analytics
export const Visitor = VisitorAdapter;
export const Session = SessionAdapter;
export const PageView = PageViewAdapter;
export const UserEvent = UserEventAdapter;
export const ApiUsage = ApiUsageAdapter;

// Support
export const SupportTicket = SupportTicketAdapter;
export const ContactMessage = ContactMessageAdapter;
export const Consultation = ConsultationAdapter;

// Community  
export const CommunityPost = CommunityPostAdapter;

// Lab
export const LabExperiment = LabExperimentAdapter;

// Other
export const JobApplication = JobApplicationAdapter;
export const WebinarRegistration = WebinarRegistrationAdapter;
export const UserFavorites = UserFavoritesAdapter;
export const Transaction = TransactionAdapter;
export const AgentMemory = AgentMemoryAdapter;
export const AgentFile = AgentFileAdapter;
export const CommunitySuggestion = CommunitySuggestionAdapter;

// Default export for index.js imports
export default {
  User,
  Agent,
  ChatSession,
  ChatSettings,
  ChatFeedback,
  ChatQuickAction,
  ChatCanvasProject,
  ChatCanvasFile,
  ChatCanvasHistory,
  ChatInteraction,
  Visitor,
  Session,
  PageView,
  UserEvent,
  ApiUsage,
  SupportTicket,
  ContactMessage,
  Consultation,
  CommunityPost,
  LabExperiment,
  JobApplication,
  WebinarRegistration,
  UserFavorites,
  Transaction,
  AgentMemory,
  AgentFile,
  CommunitySuggestion,
};
