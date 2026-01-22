/**
 * Agent Subscription Service - API-based
 * All operations go through API routes which use Prisma/PostgreSQL
 */

export interface AgentSubscription {
  id: string;
  agentId: string;
  userId: string;
  plan: 'daily' | 'weekly' | 'monthly';
  price: number;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  expiryDate: Date;
  autoRenew: boolean;
  stripeSubscriptionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response;
}

export const agentSubscriptionService = {
  /**
   * Get all subscriptions for the current user
   */
  async getUserSubscriptions(userId: string): Promise<AgentSubscription[]> {
    try {
      const response = await fetchWithAuth(`/api/subscriptions/${userId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.subscriptions || [];
    } catch (error) {
      console.error('[agentSubscriptionService] Error fetching subscriptions:', error);
      return [];
    }
  },

  /**
   * Check if user has active subscription for an agent
   */
  async hasActiveSubscription(userId: string, agentId: string): Promise<boolean> {
    try {
      const subscriptions = await this.getUserSubscriptions(userId);
      return subscriptions.some(
        (sub) => sub.agentId === agentId && sub.status === 'active' && new Date(sub.expiryDate) > new Date()
      );
    } catch (error) {
      console.error('[agentSubscriptionService] Error checking subscription:', error);
      return false;
    }
  },

  /**
   * Get subscription for a specific agent
   */
  async getSubscription(userId: string, agentId: string): Promise<AgentSubscription | null> {
    try {
      const subscriptions = await this.getUserSubscriptions(userId);
      return subscriptions.find((sub) => sub.agentId === agentId) || null;
    } catch (error) {
      console.error('[agentSubscriptionService] Error getting subscription:', error);
      return null;
    }
  },

  /**
   * Get active subscription for an agent
   */
  async getActiveSubscription(userId: string, agentId: string): Promise<AgentSubscription | null> {
    try {
      const subscriptions = await this.getUserSubscriptions(userId);
      return (
        subscriptions.find(
          (sub) => sub.agentId === agentId && sub.status === 'active' && new Date(sub.expiryDate) > new Date()
        ) || null
      );
    } catch (error) {
      console.error('[agentSubscriptionService] Error getting active subscription:', error);
      return null;
    }
  },

  /**
   * Create a new subscription (typically called after Stripe payment)
   */
  async createSubscription(data: {
    userId: string;
    agentId: string;
    plan: 'daily' | 'weekly' | 'monthly';
    price: number;
    stripeSubscriptionId?: string;
  }): Promise<AgentSubscription | null> {
    try {
      const response = await fetchWithAuth(`/api/subscriptions/${data.userId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) return null;
      const result = await response.json();
      return result.subscription || null;
    } catch (error) {
      console.error('[agentSubscriptionService] Error creating subscription:', error);
      return null;
    }
  },

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string, subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetchWithAuth(`/api/subscriptions/${userId}/${subscriptionId}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('[agentSubscriptionService] Error cancelling subscription:', error);
      return false;
    }
  },
};

export default agentSubscriptionService;
