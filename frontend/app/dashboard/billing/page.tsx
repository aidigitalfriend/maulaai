'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, CheckCircle, XCircle, Clock, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { gsap, ScrollTrigger, CustomWiggle, Observer } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger, CustomWiggle, Observer);

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
  const [selectedSub, setSelectedSub] = useState<AgentSubscription | null>(null);

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
  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
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
        return 'bg-blue-500/20 text-blue-400';
      case 'weekly':
        return 'bg-purple-500/20 text-purple-400';
      case 'monthly':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-white/5 text-gray-300';
    }
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center relative p-12 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg" />
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Please log in to view billing
          </h1>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold transition-all hover:shadow-lg shadow-cyan-500/25"
          >
            Log In
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs - Legal page theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedSub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative p-8 max-w-md w-full rounded-2xl bg-gradient-to-br from-gray-900/95 to-gray-950 border border-gray-800 shadow-2xl overflow-hidden">
            {/* Corner decorations */}
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-red-500/30 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-red-500/30 rounded-bl-lg" />
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cancel Access?</h3>
              <p className="text-gray-400">
                Are you sure you want to cancel access to{' '}
                <span className="text-white font-semibold">
                  {selectedSub.agentName || selectedSub.agentId}
                </span>
                ?
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm">
                ⚠️ This will <strong>immediately</strong> revoke your access.
                You won&apos;t be able to chat with this agent until you purchase again.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedSub(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl border border-gray-700 transition-colors"
              >
                Keep Access
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
              >
                Yes, Cancel Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-black to-black" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${10 + (i * 7)}%`,
                top: `${20 + (i % 4) * 18}%`,
                background: i % 3 === 0 ? '#22d3ee' : i % 3 === 1 ? '#a855f7' : '#10b981',
                opacity: 0.3
              }}
            />
          ))}
        </div>

        <div className="container-custom text-center relative z-10">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 mb-8">
            <CreditCard className="w-14 h-14 text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">Billing & Subscriptions</h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-6 leading-relaxed">
            Manage your agent subscriptions and billing history
          </p>
          <div className="w-40 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 mx-auto mb-10 rounded-full" />
          <Link
            href="/dashboard"
            className="hero-badge px-5 py-2.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-medium backdrop-blur-sm hover:bg-cyan-500/20 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>

      {/* Billing Content */}
      <section className="relative py-16 px-6">
        <div className="max-w-4xl mx-auto">

        {/* Stats Cards */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 mb-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-emerald-400">{activeSubscriptions.length}</div>
                <div className="text-sm text-gray-400">Active Agents</div>
              </div>
              <div className="text-center p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-gray-400">{inactiveSubscriptions.length}</div>
                <div className="text-sm text-gray-400">Inactive</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-400">${totalSpent.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Total Spent</div>
              </div>
            </div>
          </div>

        {/* Pricing Reminder */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <p className="font-semibold text-white">Simple One-Time Pricing</p>
                <p className="text-sm text-gray-400">
                  <span className="text-cyan-400 font-medium">$1/day</span>
                  <span className="mx-2">•</span>
                  <span className="text-purple-400 font-medium">$5/week</span>
                  <span className="mx-2">•</span>
                  <span className="text-emerald-400 font-medium">$15/month</span>
                  <span className="mx-2">—</span>
                  No auto-renewal. Cancel anytime or let it expire.
                </p>
              </div>
            </div>
          </div>

        {/* Active Subscriptions */}
        {activeSubscriptions.length > 0 && (
          <div className="mb-8">
            <div className="rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                  Active Subscriptions ({activeSubscriptions.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-800">
                {activeSubscriptions.map((sub) => {
                  const daysRemaining = getDaysRemaining(sub.expiryDate);
                  const isExpiringSoon = daysRemaining <= 3;
                  const isCancelling = cancellingId === sub._id;

                  return (
                    <div
                      key={sub._id}
                      className={`p-6 ${isExpiringSoon ? 'bg-amber-500/5' : ''}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-white">
                              {sub.agentName || sub.agentId}
                            </h3>
                            <span
                              className={`text-xs font-medium px-3 py-1 rounded-full ${getPlanColor(sub.plan)}`}
                            >
                              {getPlanLabel(sub.plan)}
                            </span>
                            {isExpiringSoon && (
                              <span className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-medium border border-amber-500/30">
                                ⚠️ Expiring Soon
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                            <span>Started: {new Date(sub.startDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className={isExpiringSoon ? 'text-amber-400 font-medium' : ''}>
                              {daysRemaining === 0 ? 'Expires today' : `${daysRemaining} days remaining`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCancelClick(sub)}
                            disabled={isCancelling}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-xl transition-colors border border-red-500/30 disabled:opacity-50"
                          >
                            {isCancelling ? 'Cancelling...' : 'Cancel'}
                          </button>
                          <Link
                            href={`/agents/${sub.agentId}`}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-colors"
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
          </div>
        )}

        {/* Inactive Subscriptions */}
        {inactiveSubscriptions.length > 0 && (
          <div className="mb-8">
            <div className="rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-gray-400 flex items-center gap-3">
                  <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                  Inactive Subscriptions ({inactiveSubscriptions.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-800">
                {inactiveSubscriptions.map((sub) => (
                  <div key={sub._id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-400">
                            {sub.agentName || sub.agentId}
                          </h3>
                          <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
                            {getPlanLabel(sub.plan)}
                          </span>
                          <span
                            className={`text-xs font-medium px-3 py-1 rounded-full ${
                              sub.status === 'cancelled'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                          >
                            {sub.status === 'cancelled' ? 'Cancelled' : 'Expired'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {sub.status === 'cancelled' ? 'Cancelled' : 'Expired'}:{' '}
                          {new Date(sub.expiryDate).toLocaleDateString()}
                        </div>
                      </div>

                      <Link
                        href={`/subscribe?agent=${encodeURIComponent(sub.agentName || sub.agentId)}&slug=${sub.agentId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Purchase Again
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Subscriptions */}
        {subscriptions.length === 0 && !error && (
          <div className="mb-8">
            <div className="rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 p-12 text-center">
              <div className="w-20 h-20 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No Agent Subscriptions Yet
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Purchase access to any of our AI agents to get started with intelligent conversations
              </p>
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-colors"
              >
                Browse Agents
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchSubscriptions}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Quick Links */}
          <div className="rounded-2xl bg-gradient-to-br from-gray-900/90 to-gray-950 border border-gray-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/agents"
                className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 transition-colors group"
              >
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="font-medium text-white group-hover:text-purple-300 transition-colors">Browse Agents</p>
                  <p className="text-sm text-gray-500">Explore AI agents</p>
                </div>
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors group"
              >
                <span className="text-2xl">💰</span>
                <div>
                  <p className="font-medium text-white group-hover:text-emerald-300 transition-colors">View Pricing</p>
                  <p className="text-sm text-gray-500">See all plans</p>
                </div>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/20 transition-colors group"
              >
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium text-white group-hover:text-cyan-300 transition-colors">Dashboard</p>
                  <p className="text-sm text-gray-500">Back to overview</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
