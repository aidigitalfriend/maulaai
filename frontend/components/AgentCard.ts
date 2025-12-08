// AgentCard Logic
// Handles agent card interactions, subscription checks, and display logic

export interface AgentCardState {
  isLoading: boolean;
  hasSubscription: boolean;
  subscriptionStatus?: 'active' | 'expired' | 'none';
}

export interface AgentCardActions {
  checkSubscription: (agentId: string, userId?: string) => Promise<boolean>;
  handleSubscribeClick: (agentId: string) => void;
  handleDetailsClick: (agentId: string) => void;
  trackCardView: (agentId: string) => void;
}

export class AgentCardLogic {
  private state: AgentCardState;
  private actions: AgentCardActions;

  constructor() {
    this.state = {
      isLoading: false,
      hasSubscription: false,
      subscriptionStatus: 'none',
    };

    this.actions = {
      checkSubscription: this.checkSubscription.bind(this),
      handleSubscribeClick: this.handleSubscribeClick.bind(this),
      handleDetailsClick: this.handleDetailsClick.bind(this),
      trackCardView: this.trackCardView.bind(this),
    };
  }

  async checkSubscription(agentId: string, userId?: string): Promise<boolean> {
    if (!userId) return false;

    try {
      this.state.isLoading = true;

      const response = await fetch('/api/subscriptions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, agentId }),
      });

      const data = await response.json();
      this.state.hasSubscription = data.hasAccess || false;
      this.state.subscriptionStatus = data.subscription?.status || 'none';

      return this.state.hasSubscription;
    } catch (error) {
      console.error('Subscription check failed:', error);
      return false;
    } finally {
      this.state.isLoading = false;
    }
  }

  handleSubscribeClick(agentId: string): void {
    // Analytics tracking
    this.trackCardView(agentId);

    // Navigation will be handled by the Link component
    console.log(`Navigate to subscription for agent: ${agentId}`);
  }

  handleDetailsClick(agentId: string): void {
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'agent_details_view', {
        agent_id: agentId,
        event_category: 'agent_interaction',
      });
    }
  }

  trackCardView(agentId: string): void {
    // Track agent card impressions
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'agent_card_view', {
        agent_id: agentId,
        event_category: 'agent_discovery',
      });
    }
  }

  getState(): AgentCardState {
    return { ...this.state };
  }

  getActions(): AgentCardActions {
    return this.actions;
  }
}

export default AgentCardLogic;
