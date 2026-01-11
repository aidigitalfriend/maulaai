'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import {
  agentSubscriptionService,
  type AgentSubscription,
} from '@/services/agentSubscriptionService';
import { allAgents } from '@/app/agents/registry';
import {
  ArrowRight,
  Loader2,
  Lock,
  ShieldCheck,
  Unlock,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { useSubscribeRedirect } from '@/hooks/useSubscribeRedirect';

interface AgentCardState {
  agentId: string;
  agentName: string;
  isUnlocked: boolean;
  subscription?: AgentSubscription | null;
}

type PlanType = 'daily' | 'weekly' | 'monthly';

const PLAN_LABELS: Record<PlanType, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export default function AgentManagementPage() {
  const { state } = useAuth();
  const router = useRouter();
  const user = state.user;
  const userId = user?.id;
  const [subscriptions, setSubscriptions] = useState<
    AgentSubscription[] | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingAgentId, setCancellingAgentId] = useState<string | null>(
    null
  );
  const redirectToSubscribe = useSubscribeRedirect();

  useEffect(() => {
    let isMounted = true;

    const loadSubscriptions = async () => {
      if (!userId) {
        setSubscriptions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data =
          await agentSubscriptionService.getUserSubscriptions(userId);
        if (isMounted) {
          setSubscriptions(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load subscriptions', err);
        if (isMounted) {
          setError(
            'Unable to load subscription information. Please try again later.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSubscriptions();

    // Refresh subscriptions when page becomes visible (user returns from checkout)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userId) {
        // Add a small delay to allow webhook processing
        setTimeout(() => {
          loadSubscriptions();
        }, 2000);
      }
    };

    // Also refresh when window gains focus
    const handleFocus = () => {
      if (userId) {
        // Add a small delay to allow webhook processing
        setTimeout(() => {
          loadSubscriptions();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [userId]);

  const activeAgentCount = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) {
      return 0;
    }
    return subscriptions.filter((sub) => sub.status === 'active').length;
  }, [subscriptions]);

  const agentStates: AgentCardState[] = useMemo(() => {
    if (!subscriptions || subscriptions.length === 0) {
      return allAgents.map((agent) => ({
        agentId: agent.id,
        agentName: agent.name,
        isUnlocked: false,
      }));
    }

    return allAgents.map((agent) => {
      const subscription = subscriptions.find(
        (sub) => sub.agentId === agent.id && sub.status === 'active'
      );
      return {
        agentId: agent.id,
        agentName: agent.name,
        isUnlocked: Boolean(subscription),
        subscription,
      };
    });
  }, [subscriptions]);

  const goToSubscribe = (
    agentId: string,
    agentName: string,
    options?: { plan?: string; intent?: 'upgrade' | 'downgrade' | 'cancel' }
  ) => {
    redirectToSubscribe({
      agentName,
      agentSlug: agentId,
      plan: options?.plan,
      intent: options?.intent,
    });
  };

  const handleCardClick = (agentId: string, agentName: string) => {
    goToSubscribe(agentId, agentName);
  };

  const handleCancelSubscription = async (
    agentId: string,
    agentName: string
  ) => {
    if (!userId) return;

    // Confirm cancellation
    if (
      !confirm(
        `Are you sure you want to cancel your subscription to ${agentName}? You will lose access immediately.`
      )
    ) {
      return;
    }

    setCancellingAgentId(agentId);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          agentId,
          immediate: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Successfully cancelled - refresh subscriptions list
      const updatedSubs =
        await agentSubscriptionService.getUserSubscriptions(userId);
      setSubscriptions(updatedSubs);

      alert(`Successfully cancelled your subscription to ${agentName}.`);
    } catch (err) {
      console.error('Cancel subscription error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to cancel subscription. Please try again.'
      );
    } finally {
      setCancellingAgentId(null);
    }
  };

  const handleChatWithAgent = (agentId: string) => {
    router.push(`/agents/${agentId}`);
  };

  const handleRefreshSubscriptions = () => {
    if (userId) {
      const loadSubscriptions = async () => {
        setIsLoading(true);
        try {
          const data =
            await agentSubscriptionService.getUserSubscriptions(userId);
          setSubscriptions(data);
          setError(null);
        } catch (err) {
          console.error('Failed to load subscriptions', err);
          setError(
            'Unable to load subscription information. Please try again later.'
          );
        } finally {
          setIsLoading(false);
        }
      };
      loadSubscriptions();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container-custom section-padding-lg space-y-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-brand-500 font-semibold mb-2">
                  Subscription Hub
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-neural-900">
                  Agent Management
                </h1>
                <p className="text-neural-600 max-w-2xl mt-3">
                  Purchase access to specialized agents on a per-agent basis.
                  Cards stay locked until you subscribe, keeping billing under
                  your control.
                </p>
              </div>
              <div className="bg-white shadow-sm border border-neural-100 rounded-xl p-5 max-w-sm w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-brand-600" />
                    <div>
                      <p className="text-sm text-neural-500">
                        Current Active Agents
                      </p>
                      <p className="text-3xl font-bold text-neural-900">
                        {activeAgentCount}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefreshSubscriptions}
                    disabled={isLoading}
                    className="p-2 rounded-lg hover:bg-neural-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Refresh subscription status"
                  >
                    <RefreshCw
                      className={`w-5 h-5 text-neural-500 ${
                        isLoading ? 'animate-spin' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {agentStates.map((agent) => {
                const subscriptionPlan = agent.subscription?.plan as
                  | PlanType
                  | undefined;

                return (
                  <div
                    key={agent.agentId}
                    className={`relative rounded-2xl border p-6 shadow-sm transition-all duration-300 group ${
                      agent.isUnlocked
                        ? 'bg-white border-green-200 hover:border-green-300'
                        : 'bg-white/80 border-neural-100 hover:border-brand-200'
                    }`}
                  >
                    {!agent.isUnlocked && (
                      <div className="absolute inset-0 rounded-2xl bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                        <Lock className="w-10 h-10 text-brand-500 mb-3" />
                        <p className="font-semibold text-neural-800 mb-2">
                          Purchase Access to {agent.agentName}
                        </p>
                        <p className="text-sm text-neural-600 mb-4">
                          Get instant access by choosing a plan.
                        </p>
                        <button
                          onClick={() =>
                            handleCardClick(agent.agentId, agent.agentName)
                          }
                          className="btn-primary inline-flex items-center gap-2"
                        >
                          Purchase Access
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-neural-500">
                          Agent
                        </p>
                        <h3 className="text-2xl font-bold text-neural-900">
                          {agent.agentName}
                        </h3>
                      </div>
                      {agent.isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-600">
                          <Unlock className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-neural-500">
                          <Lock className="w-4 h-4" /> Locked
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-neural-600 mb-5">
                      {agent.isUnlocked
                        ? `Currently on ${
                            PLAN_LABELS[subscriptionPlan ?? 'daily']
                          } plan. You can cancel anytime.`
                        : `Purchase access to ${agent.agentName} to explore personalized capabilities.`}
                    </p>

                    <div className="space-y-3">
                      {agent.isUnlocked && (
                        <>
                          <button
                            onClick={() => handleChatWithAgent(agent.agentId)}
                            className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl border border-brand-200 text-brand-700 hover:bg-brand-50"
                          >
                            Chat with Agent
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleCancelSubscription(
                                agent.agentId,
                                agent.agentName
                              )
                            }
                            disabled={cancellingAgentId === agent.agentId}
                            className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingAgentId === agent.agentId ? (
                              <>
                                <span>Cancelling...</span>
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </>
                            ) : (
                              <>
                                Cancel Subscription
                                <span className="text-xs uppercase tracking-widest font-semibold">
                                  Stop
                                </span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>

                    {!agent.isUnlocked && (
                      <button
                        onClick={() =>
                          handleCardClick(agent.agentId, agent.agentName)
                        }
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100"
                      >
                        Purchase Access
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-neural-100 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-neural-900 mb-4">
              How Agent Management Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Choose', 'Access', 'Renew'].map((step, index) => (
                <div
                  key={step}
                  className="p-5 rounded-xl border border-neural-100"
                >
                  <p className="text-sm font-semibold text-brand-500 mb-2">
                    Step {index + 1}
                  </p>
                  <h3 className="text-xl font-semibold text-neural-900 mb-2">
                    {step}
                  </h3>
                  <p className="text-neural-600 text-sm">
                    {index === 0 &&
                      'Select any locked agent to see plan options and purchase access.'}
                    {index === 1 &&
                      'Chat with your unlocked agents and access their specialized capabilities.'}
                    {index === 2 &&
                      'Renew or cancel subscriptions anytime - no auto-renewal.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
