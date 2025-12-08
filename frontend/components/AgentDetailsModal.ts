/**
 * AgentDetailsModal Logic - Agent Components Module
 * Handles agent details display, analytics, and information management
 */

export interface AgentDetailsModalState {
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  agentData: AgentData | null;
  currentTab:
    | 'overview'
    | 'capabilities'
    | 'analytics'
    | 'reviews'
    | 'settings';
  sections: AgentDetailsSection[];
  analytics: AgentAnalytics | null;
  reviews: AgentReview[];
  subscription: AgentSubscriptionInfo | null;
  showSubscriptionModal: boolean;
}

export interface AgentData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  specialty: string;
  version: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'deprecated';
  pricing: AgentPricing;
  capabilities: AgentCapability[];
  features: AgentFeature[];
  limitations: string[];
  requirements: AgentRequirement[];
  metadata: AgentMetadata;
}

export interface AgentDetailsSection {
  id: string;
  title: string;
  icon: string;
  type: 'list' | 'text' | 'badge' | 'progress' | 'chart';
  content?: string;
  items?: string[];
  badges?: SectionBadge[];
  progress?: SectionProgress;
  data?: any;
}

export interface SectionBadge {
  label: string;
  value: string;
  color: 'green' | 'blue' | 'orange' | 'red' | 'gray';
  tooltip?: string;
}

export interface SectionProgress {
  label: string;
  value: number;
  max: number;
  color: string;
  tooltip?: string;
}

export interface AgentPricing {
  model: 'free' | 'subscription' | 'pay-per-use' | 'tiered';
  basePrice: number;
  currency: string;
  billingCycle?: 'monthly' | 'annually';
  usageLimits?: UsageLimits;
  tiers?: PricingTier[];
}

export interface UsageLimits {
  messagesPerDay?: number;
  messagesPerMonth?: number;
  concurrentSessions?: number;
  apiCallsPerMinute?: number;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  limits: UsageLimits;
  features: string[];
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  category:
    | 'nlp'
    | 'vision'
    | 'audio'
    | 'integration'
    | 'reasoning'
    | 'creative';
  enabled: boolean;
  confidence: number; // 0-1
  lastTested?: string;
  performance: CapabilityPerformance;
}

export interface CapabilityPerformance {
  accuracy: number;
  speed: number; // ms average response time
  reliability: number; // success rate
  usage: number; // usage frequency
}

export interface AgentFeature {
  id: string;
  name: string;
  description: string;
  type: 'core' | 'premium' | 'experimental' | 'deprecated';
  availability: 'always' | 'subscription' | 'pay-per-use';
  icon: string;
  status: 'stable' | 'beta' | 'alpha';
}

export interface AgentRequirement {
  type: 'system' | 'subscription' | 'permission' | 'integration';
  name: string;
  description: string;
  required: boolean;
  satisfied: boolean;
  details?: string;
}

export interface AgentMetadata {
  tags: string[];
  languages: string[];
  supportedFormats: string[];
  integrations: string[];
  apis: string[];
  modelInfo: ModelInfo;
  performance: PerformanceMetrics;
}

export interface ModelInfo {
  provider: string;
  model: string;
  version: string;
  parameters?: string;
  trainingDate?: string;
  contextWindow?: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  successRate: number;
  uptime: number;
  lastHealthCheck: string;
  benchmarkScores: Record<string, number>;
}

export interface AgentAnalytics {
  usage: UsageAnalytics;
  performance: PerformanceAnalytics;
  feedback: FeedbackAnalytics;
  trends: TrendAnalytics;
}

export interface UsageAnalytics {
  totalSessions: number;
  totalMessages: number;
  uniqueUsers: number;
  averageSessionLength: number;
  peakUsageHours: number[];
  usageByDay: Record<string, number>;
  usageByRegion: Record<string, number>;
}

export interface PerformanceAnalytics {
  averageResponseTime: number;
  p95ResponseTime: number;
  errorRate: number;
  timeoutRate: number;
  throughput: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  tokens: number;
  apiCalls: number;
}

export interface FeedbackAnalytics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
  sentimentScore: number;
  commonIssues: string[];
  improvementSuggestions: string[];
}

export interface TrendAnalytics {
  growthRate: number;
  userRetention: number;
  sessionTrends: TrendData[];
  satisfactionTrends: TrendData[];
  performanceTrends: TrendData[];
}

export interface TrendData {
  date: string;
  value: number;
}

export interface AgentReview {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  createdAt: string;
  helpful: number;
  reported: boolean;
  verified: boolean;
  agentVersion: string;
}

export interface AgentSubscriptionInfo {
  hasAccess: boolean;
  subscriptionType?: 'free' | 'trial' | 'premium' | 'enterprise';
  status?: 'active' | 'expired' | 'cancelled';
  expiresAt?: string;
  usage?: {
    current: number;
    limit: number;
    period: string;
  };
}

export class AgentDetailsModalLogic {
  private state: AgentDetailsModalState;

  constructor() {
    this.state = {
      isLoading: false,
      error: null,
      isOpen: false,
      agentData: null,
      currentTab: 'overview',
      sections: [],
      analytics: null,
      reviews: [],
      subscription: null,
      showSubscriptionModal: false,
    };
  }

  /**
   * Open agent details modal
   */
  async openModal(agentId: string): Promise<void> {
    this.state.isOpen = true;
    this.state.isLoading = true;
    this.state.error = null;

    try {
      // Load agent data in parallel
      const [agentData, analytics, reviews, subscription] = await Promise.all([
        this.fetchAgentData(agentId),
        this.fetchAgentAnalytics(agentId),
        this.fetchAgentReviews(agentId),
        this.checkSubscriptionStatus(agentId),
      ]);

      this.state.agentData = agentData;
      this.state.analytics = analytics;
      this.state.reviews = reviews;
      this.state.subscription = subscription;

      // Generate sections based on agent data
      this.generateSections();

      this.trackDetailsEvent('modal_opened', {
        agentId,
        agentName: agentData.name,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load agent details';
      this.state.error = message;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.state.isOpen = false;
    this.state.currentTab = 'overview';
    this.state.agentData = null;
    this.state.analytics = null;
    this.state.reviews = [];
    this.state.sections = [];
    this.state.error = null;

    this.trackDetailsEvent('modal_closed');
  }

  /**
   * Switch tab
   */
  switchTab(
    tab: 'overview' | 'capabilities' | 'analytics' | 'reviews' | 'settings'
  ): void {
    this.state.currentTab = tab;

    this.trackDetailsEvent('tab_switched', { tab });
  }

  /**
   * Show subscription modal
   */
  showSubscriptionModal(): void {
    this.state.showSubscriptionModal = true;

    this.trackDetailsEvent('subscription_modal_opened', {
      agentId: this.state.agentData?.id,
    });
  }

  /**
   * Hide subscription modal
   */
  hideSubscriptionModal(): void {
    this.state.showSubscriptionModal = false;
  }

  /**
   * Submit agent review
   */
  async submitReview(reviewData: {
    rating: number;
    title: string;
    content: string;
    pros: string[];
    cons: string[];
  }): Promise<void> {
    if (!this.state.agentData) return;

    try {
      const response = await fetch(
        `/api/agents/${this.state.agentData.id}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      // Add new review to state
      this.state.reviews.unshift(data.review);

      this.trackDetailsEvent('review_submitted', {
        agentId: this.state.agentData.id,
        rating: reviewData.rating,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit review';
      this.state.error = message;
      throw new Error(message);
    }
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string): Promise<void> {
    try {
      const response = await fetch(`/api/agents/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update review in state
        const review = this.state.reviews.find((r) => r.id === reviewId);
        if (review) {
          review.helpful++;
        }

        this.trackDetailsEvent('review_marked_helpful', { reviewId });
      }
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  }

  /**
   * Report review
   */
  async reportReview(reviewId: string, reason: string): Promise<void> {
    try {
      const response = await fetch(`/api/agents/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        this.trackDetailsEvent('review_reported', { reviewId, reason });
      }
    } catch (error) {
      console.error('Failed to report review:', error);
    }
  }

  /**
   * Refresh agent data
   */
  async refreshData(): Promise<void> {
    if (!this.state.agentData) return;

    this.state.isLoading = true;

    try {
      const [agentData, analytics, reviews] = await Promise.all([
        this.fetchAgentData(this.state.agentData.id),
        this.fetchAgentAnalytics(this.state.agentData.id),
        this.fetchAgentReviews(this.state.agentData.id),
      ]);

      this.state.agentData = agentData;
      this.state.analytics = analytics;
      this.state.reviews = reviews;

      this.generateSections();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to refresh data';
      this.state.error = message;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Private helper methods
   */
  private async fetchAgentData(agentId: string): Promise<AgentData> {
    const response = await fetch(`/api/agents/${agentId}/details`);

    if (!response.ok) {
      throw new Error('Failed to fetch agent data');
    }

    const data = await response.json();
    return data.agent;
  }

  private async fetchAgentAnalytics(agentId: string): Promise<AgentAnalytics> {
    const response = await fetch(`/api/agents/${agentId}/analytics`);

    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }

    const data = await response.json();
    return data.analytics;
  }

  private async fetchAgentReviews(agentId: string): Promise<AgentReview[]> {
    const response = await fetch(`/api/agents/${agentId}/reviews`);

    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }

    const data = await response.json();
    return data.reviews || [];
  }

  private async checkSubscriptionStatus(
    agentId: string
  ): Promise<AgentSubscriptionInfo> {
    try {
      const response = await fetch(
        `/api/agents/${agentId}/subscription-status`
      );

      if (response.ok) {
        const data = await response.json();
        return data.subscription;
      }

      return { hasAccess: false };
    } catch (error) {
      return { hasAccess: false };
    }
  }

  private generateSections(): void {
    if (!this.state.agentData) return;

    const agent = this.state.agentData;
    const sections: AgentDetailsSection[] = [];

    // Overview section
    sections.push({
      id: 'basic-info',
      title: 'Basic Information',
      icon: 'ℹ️',
      type: 'badge',
      badges: [
        { label: 'Category', value: agent.category, color: 'blue' },
        { label: 'Specialty', value: agent.specialty, color: 'green' },
        { label: 'Version', value: agent.version, color: 'gray' },
        {
          label: 'Status',
          value: agent.status,
          color: agent.status === 'active' ? 'green' : 'red',
        },
      ],
    });

    // Capabilities section
    if (agent.capabilities.length > 0) {
      sections.push({
        id: 'capabilities',
        title: 'Capabilities',
        icon: '🎯',
        type: 'progress',
        progress: {
          label: 'Overall Capability Score',
          value: Math.round(
            (agent.capabilities.reduce((sum, cap) => sum + cap.confidence, 0) /
              agent.capabilities.length) *
              100
          ),
          max: 100,
          color: '#3B82F6',
        },
      });
    }

    // Features section
    if (agent.features.length > 0) {
      sections.push({
        id: 'features',
        title: 'Features',
        icon: '⭐',
        type: 'list',
        items: agent.features.map(
          (feature) =>
            `${feature.name} ${this.getFeatureStatusBadge(feature.status)}`
        ),
      });
    }

    // Pricing section
    sections.push({
      id: 'pricing',
      title: 'Pricing',
      icon: '💰',
      type: 'badge',
      badges: [
        { label: 'Model', value: agent.pricing.model, color: 'blue' },
        {
          label: 'Price',
          value: `${agent.pricing.basePrice} ${agent.pricing.currency}`,
          color: 'green',
        },
        ...(agent.pricing.billingCycle
          ? [
              {
                label: 'Billing',
                value: agent.pricing.billingCycle,
                color: 'gray' as const,
              },
            ]
          : []),
      ],
    });

    // Requirements section
    if (agent.requirements.length > 0) {
      sections.push({
        id: 'requirements',
        title: 'Requirements',
        icon: '📋',
        type: 'list',
        items: agent.requirements.map(
          (req) => `${req.satisfied ? '✅' : '❌'} ${req.name}`
        ),
      });
    }

    // Performance section
    if (agent.metadata.performance) {
      const perf = agent.metadata.performance;
      sections.push({
        id: 'performance',
        title: 'Performance',
        icon: '📊',
        type: 'badge',
        badges: [
          {
            label: 'Response Time',
            value: `${perf.averageResponseTime}ms`,
            color: perf.averageResponseTime < 1000 ? 'green' : 'orange',
          },
          {
            label: 'Success Rate',
            value: `${Math.round(perf.successRate * 100)}%`,
            color: perf.successRate > 0.95 ? 'green' : 'orange',
          },
          {
            label: 'Uptime',
            value: `${Math.round(perf.uptime * 100)}%`,
            color: perf.uptime > 0.99 ? 'green' : 'red',
          },
        ],
      });
    }

    // Technical details section
    sections.push({
      id: 'technical',
      title: 'Technical Details',
      icon: '⚙️',
      type: 'badge',
      badges: [
        {
          label: 'Provider',
          value: agent.metadata.modelInfo.provider,
          color: 'blue',
        },
        {
          label: 'Model',
          value: agent.metadata.modelInfo.model,
          color: 'blue',
        },
        ...(agent.metadata.modelInfo.contextWindow
          ? [
              {
                label: 'Context Window',
                value: agent.metadata.modelInfo.contextWindow.toLocaleString(),
                color: 'gray' as const,
              },
            ]
          : []),
      ],
    });

    this.state.sections = sections;
  }

  private getFeatureStatusBadge(status: string): string {
    const badges = {
      stable: '✅',
      beta: '🚧',
      alpha: '⚠️',
      deprecated: '❌',
    };
    return badges[status as keyof typeof badges] || '❓';
  }

  private trackDetailsEvent(
    event: string,
    properties?: Record<string, any>
  ): void {
    try {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Agent Details', {
          event,
          timestamp: new Date().toISOString(),
          ...properties,
        });
      }
    } catch (error) {
      console.error('Error tracking details event:', error);
    }
  }

  /**
   * Public getters
   */
  getState(): AgentDetailsModalState {
    return { ...this.state };
  }

  getCurrentAgent(): AgentData | null {
    return this.state.agentData;
  }

  getAnalytics(): AgentAnalytics | null {
    return this.state.analytics;
  }

  getReviews(): AgentReview[] {
    return [...this.state.reviews];
  }

  getSections(): AgentDetailsSection[] {
    return [...this.state.sections];
  }

  getSubscriptionInfo(): AgentSubscriptionInfo | null {
    return this.state.subscription;
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.state.error = null;
  }
}

// Export singleton instance
export const agentDetailsModalLogic = new AgentDetailsModalLogic();

// Export utility functions
export const agentDetailsUtils = {
  /**
   * Format capability confidence
   */
  formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
  },

  /**
   * Get capability color
   */
  getCapabilityColor(confidence: number): string {
    if (confidence >= 0.8) return '#10B981';
    if (confidence >= 0.6) return '#F59E0B';
    return '#EF4444';
  },

  /**
   * Format response time
   */
  formatResponseTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  },

  /**
   * Format usage number
   */
  formatUsage(count: number): string {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  },

  /**
   * Get feature type color
   */
  getFeatureTypeColor(type: string): string {
    const colors = {
      core: '#3B82F6',
      premium: '#8B5CF6',
      experimental: '#F59E0B',
      deprecated: '#EF4444',
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  },

  /**
   * Get pricing color
   */
  getPricingColor(model: string): string {
    const colors = {
      free: '#10B981',
      subscription: '#3B82F6',
      'pay-per-use': '#F59E0B',
      tiered: '#8B5CF6',
    };
    return colors[model as keyof typeof colors] || '#6B7280';
  },

  /**
   * Format rating
   */
  formatRating(rating: number): string {
    return `${rating.toFixed(1)}/5.0`;
  },

  /**
   * Get rating stars
   */
  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      '⭐'.repeat(fullStars) +
      (hasHalfStar ? '⭐' : '') +
      '☆'.repeat(emptyStars)
    );
  },

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(performance: PerformanceMetrics): number {
    const responseWeight = 0.3;
    const successWeight = 0.4;
    const uptimeWeight = 0.3;

    const responseScore = Math.max(
      0,
      1 - performance.averageResponseTime / 5000
    ); // 5s = 0 score
    const successScore = performance.successRate;
    const uptimeScore = performance.uptime;

    return Math.round(
      (responseScore * responseWeight +
        successScore * successWeight +
        uptimeScore * uptimeWeight) *
        100
    );
  },

  /**
   * Validate review data
   */
  validateReview(review: { rating: number; title: string; content: string }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (review.rating < 1 || review.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }

    if (!review.title.trim()) {
      errors.push('Review title is required');
    } else if (review.title.length > 100) {
      errors.push('Review title too long (max 100 characters)');
    }

    if (!review.content.trim()) {
      errors.push('Review content is required');
    } else if (review.content.length > 1000) {
      errors.push('Review content too long (max 1000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
