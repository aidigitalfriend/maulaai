'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface Subscription {
  _id: string;
  userId: string;
  agentId: string;
  plan: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  expiryDate: string;
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionContextType {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  hasActiveSubscription: (agentId: string) => boolean;
  getSubscription: (agentId: string) => Subscription | undefined;
  getDaysRemaining: (agentId: string) => number;
  refreshSubscriptions: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    if (!state.isAuthenticated || !state.user?.id) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/subscriptions/${state.user.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const data = await response.json();
      
      // Filter to only active, non-expired subscriptions
      const activeSubscriptions = (data.subscriptions || []).filter(
        (sub: Subscription) =>
          sub.status === 'active' && new Date(sub.expiryDate) > new Date()
      );

      setSubscriptions(activeSubscriptions);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [state.isAuthenticated, state.user?.id]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const hasActiveSubscription = useCallback(
    (agentId: string): boolean => {
      return subscriptions.some(
        (sub) =>
          sub.agentId === agentId &&
          sub.status === 'active' &&
          new Date(sub.expiryDate) > new Date()
      );
    },
    [subscriptions]
  );

  const getSubscription = useCallback(
    (agentId: string): Subscription | undefined => {
      return subscriptions.find(
        (sub) =>
          sub.agentId === agentId &&
          sub.status === 'active' &&
          new Date(sub.expiryDate) > new Date()
      );
    },
    [subscriptions]
  );

  const getDaysRemaining = useCallback(
    (agentId: string): number => {
      const sub = getSubscription(agentId);
      if (!sub) return 0;
      
      const now = new Date();
      const expiry = new Date(sub.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(0, diffDays);
    },
    [getSubscription]
  );

  const refreshSubscriptions = useCallback(async () => {
    await fetchSubscriptions();
  }, [fetchSubscriptions]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        loading,
        error,
        hasActiveSubscription,
        getSubscription,
        getDaysRemaining,
        refreshSubscriptions,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
}

export default SubscriptionContext;
