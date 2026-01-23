'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, CheckCircle, XCircle, Clock, ArrowRight, Wallet } from 'lucide-react';

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
          immediate: true,
        }),
      });

      if (response.ok) {
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
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'weekly':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'monthly':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-neural-100 text-neural-700 border-neural-200';
    }
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-neural-100">
          <h1 className="text-2xl font-bold text-neural-900 mb-4">
            Please log in to view billing
          </h1>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold transition-colors inline-block"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-neural-600">Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedSub && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neural-200 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-neural-900 mb-2">Cancel Access?</h3>
              <p className="text-neural-600">
                Are you sure you want to cancel access to{' '}
                <span className="text-neural-900 font-semibold">
                  {selectedSub.agentName || selectedSub.agentId}
                </span>
                ?
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">
                ⚠️ This will <strong>immediately</strong> revoke your access.
                You won&apos;t be able to chat with this agent until you purchase
                again.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedSub(null);
                }}
                className="flex-1 px-4 py-3 bg-neural-100 hover:bg-neural-200 text-neural-800 font-medium rounded-xl transition-colors"
              >
                Keep Access
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
              >
                Yes, Cancel Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container-custom section-padding-lg">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-brand-600" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Billing & Subscriptions
          </h1>
          <p className="text-xl text-neural-600 leading-relaxed">
            Manage your AI agent subscriptions and payment history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neural-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600">{activeSubscriptions.length}</div>
                <div className="text-sm text-neural-600">Active Agents</div>
              </div>
              <div className="text-center p-4 bg-neural-50 rounded-xl border border-neural-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-neural-500" />
                </div>
                <div className="text-3xl font-bold text-neural-600">{inactiveSubscriptions.length}</div>
                <div className="text-sm text-neural-600">Inactive</div>
              </div>
              <div className="text-center p-4 bg-brand-50 rounded-xl border border-brand-100">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-brand-600" />
                </div>
                <div className="text-3xl font-bold text-brand-600">${totalSpent.toFixed(2)}</div>
                <div className="text-sm text-neural-600">Total Spent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Reminder */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-brand-500 to-accent-500 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <p className="font-semibold text-lg mb-1">Simple One-Time Pricing</p>
                <p className="text-white/90">
                  <span className="font-medium">$1/day</span> •{' '}
                  <span className="font-medium">$5/week</span> •{' '}
                  <span className="font-medium">$15/month</span> — No
                  auto-renewal. Cancel anytime or let it expire.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        {activeSubscriptions.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-neural-800 mb-4 flex items-center gap-3">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Active Subscriptions ({activeSubscriptions.length})
            </h2>
            <div className="space-y-4">
              {activeSubscriptions.map((sub) => {
                const daysRemaining = getDaysRemaining(sub.expiryDate);
                const isExpiringSoon = daysRemaining <= 3;
                const isCancelling = cancellingId === sub._id;

                return (
                  <div
                    key={sub._id}
                    className={`bg-white border rounded-2xl p-6 shadow-sm transition-all hover:shadow-md ${
                      isExpiringSoon
                        ? 'border-orange-300 bg-orange-50/30'
                        : 'border-neural-100'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-neural-900">
                            {sub.agentName || sub.agentId}
                          </h3>
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full border ${getPlanColor(
                              sub.plan
                            )}`}
                          >
                            {getPlanLabel(sub.plan)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neural-600">
                          <span>
                            Started:{' '}
                            {new Date(sub.startDate).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span
                            className={
                              isExpiringSoon
                                ? 'text-orange-600 font-semibold'
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
                          <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full border border-orange-200 font-medium">
                            ⚠️ Expiring Soon
                          </span>
                        )}
                        <button
                          onClick={() => handleCancelClick(sub)}
                          disabled={isCancelling}
                          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors border border-red-200 disabled:opacity-50"
                        >
                          {isCancelling ? 'Cancelling...' : 'Cancel Access'}
                        </button>
                        <Link
                          href={`/agents/${sub.agentId}`}
                          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                        >
                          Chat Now <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inactive Subscriptions */}
        {inactiveSubscriptions.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-neural-500 mb-4 flex items-center gap-3">
              <span className="w-3 h-3 bg-neural-400 rounded-full"></span>
              Inactive Subscriptions ({inactiveSubscriptions.length})
            </h2>
            <div className="space-y-4">
              {inactiveSubscriptions.map((sub) => (
                <div
                  key={sub._id}
                  className="bg-white/60 border border-neural-200 rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-neural-600">
                          {sub.agentName || sub.agentId}
                        </h3>
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-neural-100 text-neural-500 border border-neural-200">
                          {getPlanLabel(sub.plan)}
                        </span>
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            sub.status === 'cancelled'
                              ? 'bg-red-100 text-red-600 border border-red-200'
                              : 'bg-neural-100 text-neural-600 border border-neural-200'
                          }`}
                        >
                          {sub.status === 'cancelled' ? 'Cancelled' : 'Expired'}
                        </span>
                      </div>
                      <div className="text-sm text-neural-500">
                        {sub.status === 'cancelled' ? 'Cancelled' : 'Expired'}:{' '}
                        {new Date(sub.expiryDate).toLocaleDateString()}
                      </div>
                    </div>

                    <Link
                      href={`/subscribe?agent=${encodeURIComponent(
                        sub.agentName || sub.agentId
                      )}&slug=${sub.agentId}`}
                      className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-neural-100">
              <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-neural-800 mb-3">
                No Agent Subscriptions Yet
              </h3>
              <p className="text-neural-600 mb-8 max-w-md mx-auto">
                Purchase access to any of our AI agents to get started with personalized conversations
              </p>
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
              >
                Browse Agents <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchSubscriptions}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-neural-200">
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              href="/agents"
              className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              Browse All Agents <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              View Pricing <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              Back to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
