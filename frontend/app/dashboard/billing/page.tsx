'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';

interface AgentSubscription {
  _id: string;
  agentId: string;
  agentName: string;
  plan: 'daily' | 'weekly' | 'monthly';
  price: number;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  expiryDate: string;
  autoRenew: boolean;
}

export default function BillingPage() {
  const { state } = useAuth();
  const [subscriptions, setSubscriptions] = useState<AgentSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<AgentSubscription | null>(
    null
  );

  const fetchSubscriptions = useCallback(async () => {
    if (!state.user?.id) return;

    try {
      setError('');
      setLoading(true);
      const response = await fetch(
        `/api/agent/subscriptions/user/${state.user.id}`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSubscriptions(result.subscriptions || []);
      } else {
        setError('Failed to load subscriptions');
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Error loading subscription data');
    } finally {
      setLoading(false);
    }
  }, [state.user?.id]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Handle cancel subscription
  const handleCancelClick = (sub: AgentSubscription) => {
    setSelectedSub(sub);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedSub) return;

    setCancellingId(selectedSub._id);
    setShowCancelModal(false);

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subscriptionId: selectedSub._id,
          userId: state.user?.id,
          agentId: selectedSub.agentId,
          immediate: true, // Cancel immediately, not at period end
        }),
      });

      if (response.ok) {
        // Refresh subscriptions list
        await fetchSubscriptions();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      alert('Error cancelling subscription. Please try again.');
    } finally {
      setCancellingId(null);
      setSelectedSub(null);
    }
  };

  // Calculate stats
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === 'active'
  );
  const inactiveSubscriptions = subscriptions.filter(
    (s) => s.status === 'expired' || s.status === 'cancelled'
  );
  const totalSpent = subscriptions.reduce((sum, s) => sum + (s.price || 0), 0);

  const getDaysRemaining = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'daily':
        return '$1/day';
      case 'weekly':
        return '$5/week';
      case 'monthly':
        return '$15/month';
      default:
        return plan;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'daily':
        return 'bg-blue-100 text-blue-700';
      case 'weekly':
        return 'bg-purple-100 text-purple-700';
      case 'monthly':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Please log in to view billing
          </h1>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedSub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-2">Cancel Access?</h3>
              <p className="text-slate-400">
                Are you sure you want to cancel access to{' '}
                <span className="text-white font-semibold">
                  {selectedSub.agentName || selectedSub.agentId}
                </span>
                ?
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">
                ⚠️ This will <strong>immediately</strong> revoke your access.
                You won't be able to chat with this agent until you purchase
                again.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedSub(null);
                }}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Keep Access
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Yes, Cancel Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Agent Subscriptions</h1>
          <p className="text-slate-400">Manage your purchased agent access</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">✅</span>
              <span className="text-slate-400">Active Agents</span>
            </div>
            <p className="text-3xl font-bold text-green-400">
              {activeSubscriptions.length}
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📦</span>
              <span className="text-slate-400">Inactive</span>
            </div>
            <p className="text-3xl font-bold text-slate-400">
              {inactiveSubscriptions.length}
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">💰</span>
              <span className="text-slate-400">Total Spent</span>
            </div>
            <p className="text-3xl font-bold text-brand-400">
              ${totalSpent.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Pricing Reminder */}
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-brand-300">
                Simple One-Time Pricing
              </p>
              <p className="text-sm text-slate-400">
                <span className="text-blue-400">$1/day</span> •
                <span className="text-purple-400 mx-2">$5/week</span> •
                <span className="text-green-400">$15/month</span> — No
                auto-renewal. Cancel anytime or let it expire.
              </p>
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        {activeSubscriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Active Subscriptions ({activeSubscriptions.length})
            </h2>
            <div className="space-y-3">
              {activeSubscriptions.map((sub) => {
                const daysRemaining = getDaysRemaining(sub.expiryDate);
                const isExpiringSoon = daysRemaining <= 3;
                const isCancelling = cancellingId === sub._id;

                return (
                  <div
                    key={sub._id}
                    className={`bg-slate-800/50 border rounded-xl p-5 ${
                      isExpiringSoon
                        ? 'border-orange-500/50'
                        : 'border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {sub.agentName || sub.agentId}
                          </h3>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${getPlanColor(
                              sub.plan
                            )}`}
                          >
                            {getPlanLabel(sub.plan)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <span>
                            Started:{' '}
                            {new Date(sub.startDate).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span
                            className={
                              isExpiringSoon
                                ? 'text-orange-400 font-medium'
                                : ''
                            }
                          >
                            {daysRemaining === 0
                              ? 'Expires today'
                              : `${daysRemaining} days remaining`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isExpiringSoon && (
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full">
                            ⚠️ Expiring Soon
                          </span>
                        )}
                        <button
                          onClick={() => handleCancelClick(sub)}
                          disabled={isCancelling}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 text-sm font-medium rounded-lg transition-colors border border-red-600/30 disabled:opacity-50"
                        >
                          {isCancelling ? 'Cancelling...' : 'Cancel Access'}
                        </button>
                        <Link
                          href={`/agents/${sub.agentId}`}
                          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Chat Now
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inactive Subscriptions (Expired + Cancelled) */}
        {inactiveSubscriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
              Inactive Subscriptions ({inactiveSubscriptions.length})
            </h2>
            <div className="space-y-3">
              {inactiveSubscriptions.map((sub) => (
                <div
                  key={sub._id}
                  className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-slate-300">
                          {sub.agentName || sub.agentId}
                        </h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-700 text-slate-400">
                          {getPlanLabel(sub.plan)}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            sub.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-slate-600 text-slate-300'
                          }`}
                        >
                          {sub.status === 'cancelled' ? 'Cancelled' : 'Expired'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500">
                        {sub.status === 'cancelled' ? 'Cancelled' : 'Expired'}:{' '}
                        {new Date(sub.expiryDate).toLocaleDateString()}
                      </div>
                    </div>

                    <Link
                      href={`/subscribe?agent=${encodeURIComponent(
                        sub.agentName || sub.agentId
                      )}&slug=${sub.agentId}`}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Purchase Again
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Subscriptions */}
        {subscriptions.length === 0 && !error && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">
              No Agent Subscriptions Yet
            </h3>
            <p className="text-slate-400 mb-6">
              Purchase access to any of our AI agents to get started
            </p>
            <Link
              href="/agents"
              className="inline-block px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors"
            >
              Browse Agents
            </Link>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchSubscriptions}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-slate-700">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/agents"
              className="text-brand-400 hover:text-brand-300 text-sm font-medium"
            >
              Browse All Agents →
            </Link>
            <Link
              href="/pricing"
              className="text-brand-400 hover:text-brand-300 text-sm font-medium"
            >
              View Pricing →
            </Link>
            <Link
              href="/dashboard"
              className="text-brand-400 hover:text-brand-300 text-sm font-medium"
            >
              Back to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
