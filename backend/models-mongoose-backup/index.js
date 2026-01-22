/**
 * MODELS INDEX
 * Central export point for all MongoDB models
 */

// User & Authentication
export { default as User } from './User.js';

// Analytics & Tracking
export {
  Visitor,
  Session,
  PageView,
  ChatInteraction,
  ToolUsage,
  UserEvent,
  ApiUsage,
} from './Analytics.js';

// Chat System
export { default as ChatSession } from './ChatSession.js';
export { default as ChatSettings } from './ChatSettings.js';
export { default as ChatFeedback } from './ChatFeedback.js';
export { default as ChatQuickAction } from './ChatQuickAction.js';
export { default as ChatCanvasProject } from './ChatCanvasProject.js';
export { default as ChatCanvasFile } from './ChatCanvasFile.js';
export { default as ChatCanvasHistory } from './ChatCanvasHistory.js';

// AI Agents
export { default as Agent } from './Agent.js';

// Subscriptions & Billing
export { default as AgentSubscription } from './AgentSubscription.js';
export { Transaction } from './Transaction.js';

// AI Lab
export { LabExperiment } from './LabExperiment.js';

// Support
export { SupportTicket } from './SupportTicket.js';
export { Consultation } from './Consultation.js';
export { ContactMessage } from './ContactMessage.js';

// Community
export { default as CommunityPost } from './CommunityPost.js';
export { default as CommunityComment } from './CommunityComment.js';
export { default as CommunityLike } from './CommunityLike.js';
export { default as CommunityGroup } from './CommunityGroup.js';
export { default as CommunityMembership } from './CommunityMembership.js';
export { default as CommunityEvent } from './CommunityEvent.js';
export { default as CommunityContent } from './CommunityContent.js';
export { default as CommunityModeration } from './CommunityModeration.js';
export { default as CommunityMetrics } from './CommunityMetrics.js';
export { CommunitySuggestion } from './CommunitySuggestion.js';

// User Preferences
export { AgentPersonalization } from './AgentPersonalization.js';
export { UserFavorites } from './UserFavorites.js';

// Events & Careers
export { WebinarRegistration } from './WebinarRegistration.js';
export { JobApplication } from './JobApplication.js';
