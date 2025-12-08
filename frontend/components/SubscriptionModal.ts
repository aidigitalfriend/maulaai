// SubscriptionModal Logic
// Handles subscription plans, Stripe checkout, payment processing

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  priceFormatted: string;
  billingPeriod: 'day' | 'week' | 'month';
  features: string[];
  recommended?: boolean;
  stripePriceId?: string;
}

export interface SubscriptionState {
  isLoading: boolean;
  selectedPlan: string;
  plans: SubscriptionPlan[];
  isProcessingPayment: boolean;
  error: string | null;
}

export interface SubscriptionActions {
  loadPlans: () => Promise<void>;
  selectPlan: (planId: string) => void;
  processSubscription: (agentId: string, userId?: string) => Promise<void>;
  createStripeCheckout: (planId: string, agentId: string) => Promise<string>;
}

export class SubscriptionModalLogic {
  private state: SubscriptionState;
  private actions: SubscriptionActions;

  constructor() {
    this.state = {
      isLoading: false,
      selectedPlan: 'daily',
      plans: [],
      isProcessingPayment: false,
      error: null,
    };

    this.actions = {
      loadPlans: this.loadPlans.bind(this),
      selectPlan: this.selectPlan.bind(this),
      processSubscription: this.processSubscription.bind(this),
      createStripeCheckout: this.createStripeCheckout.bind(this),
    };
  }

  async loadPlans(): Promise<void> {
    try {
      this.state.isLoading = true;
      this.state.error = null;

      const response = await fetch('/api/subscriptions/pricing');
      if (!response.ok) {
        throw new Error('Failed to load subscription plans');
      }

      const data = await response.json();

      if (data.success && data.data?.plans) {
        this.state.plans = data.data.plans.map((plan: any) => ({
          ...plan,
          features: this.getPlanFeatures(plan),
        }));
      }
    } catch (error) {
      this.state.error =
        error instanceof Error ? error.message : 'Failed to load plans';
      console.error('Failed to load subscription plans:', error);
    } finally {
      this.state.isLoading = false;
    }
  }

  selectPlan(planId: string): void {
    this.state.selectedPlan = planId;

    // Analytics tracking
    this.trackSubscriptionEvent('plan_selected', { plan_id: planId });
  }

  async processSubscription(agentId: string, userId?: string): Promise<void> {
    if (!userId) {
      throw new Error('User must be logged in to subscribe');
    }

    try {
      this.state.isProcessingPayment = true;
      this.state.error = null;

      // Track subscription attempt
      this.trackSubscriptionEvent('subscription_attempted', {
        agent_id: agentId,
        plan_id: this.state.selectedPlan,
        user_id: userId,
      });

      // Create Stripe checkout session
      const checkoutUrl = await this.createStripeCheckout(
        this.state.selectedPlan,
        agentId
      );

      if (checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      this.state.error =
        error instanceof Error ? error.message : 'Subscription failed';
      console.error('Subscription processing failed:', error);

      // Track subscription failure
      this.trackSubscriptionEvent('subscription_failed', {
        agent_id: agentId,
        plan_id: this.state.selectedPlan,
        error: this.state.error,
      });

      throw error;
    } finally {
      this.state.isProcessingPayment = false;
    }
  }

  async createStripeCheckout(planId: string, agentId: string): Promise<string> {
    const plan = this.state.plans.find((p) => p.id === planId);
    if (!plan) {
      throw new Error('Selected plan not found');
    }

    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: plan.id,
        agentId,
        priceId: plan.stripePriceId,
        returnUrl: `${window.location.origin}/payment/success?agent=${agentId}`,
        cancelUrl: `${window.location.origin}/payment/cancel?agent=${agentId}`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data.url;
  }

  private getPlanFeatures(plan: SubscriptionPlan): string[] {
    const baseFeatures = [
      'Unlimited chat messages',
      'Chat history saved',
      'Real-time responses',
      'Mobile & desktop access',
    ];

    switch (plan.id) {
      case 'daily':
        return [...baseFeatures, '24-hour access'];
      case 'weekly':
        return [...baseFeatures, '7-day access', 'Priority support'];
      case 'monthly':
        return [
          ...baseFeatures,
          '30-day access',
          'Priority support',
          'Advanced features',
        ];
      default:
        return baseFeatures;
    }
  }

  private trackSubscriptionEvent(
    event: string,
    properties: Record<string, any>
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'subscription',
      });
    }
  }

  getSelectedPlan(): SubscriptionPlan | undefined {
    return this.state.plans.find((p) => p.id === this.state.selectedPlan);
  }

  formatPrice(plan: SubscriptionPlan): string {
    return `$${plan.price.toFixed(2)}/${plan.billingPeriod}`;
  }

  calculateSavings(plan: SubscriptionPlan): string | null {
    if (plan.id === 'monthly') {
      const dailyEquivalent = 30; // $1 * 30 days
      const savings = (
        ((dailyEquivalent - plan.price) / dailyEquivalent) *
        100
      ).toFixed(0);
      return `Save ${savings}%`;
    }
    if (plan.id === 'weekly') {
      const dailyEquivalent = 7; // $1 * 7 days
      const savings = (
        ((dailyEquivalent - plan.price) / dailyEquivalent) *
        100
      ).toFixed(0);
      return `Save ${savings}%`;
    }
    return null;
  }

  getState(): SubscriptionState {
    return { ...this.state };
  }

  getActions(): SubscriptionActions {
    return this.actions;
  }

  setState(updates: Partial<SubscriptionState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default SubscriptionModalLogic;
