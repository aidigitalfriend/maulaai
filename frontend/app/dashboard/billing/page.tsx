'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  CreditCardIcon,
  DocumentTextIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

interface AgentSubscription {
  agentId: string;
  agentName: string;
  plan: string;
  price: number;
  expiryDate: string;
  daysRemaining: number;
}

interface BillingData {
  currentPlan: {
    name: string;
    type: string;
    price: number;
    currency: string;
    period: string;
    status: string;
    renewalDate: string | null;
    daysUntilRenewal: number;
    agents?: AgentSubscription[];
  };
  planOptions?: {
    key: string;
    name: string;
    billingPeriod: string;
    price: number;
    description: string;
    status: string;
  }[];
  invoices?: {
    id: string;
    date: string;
    description: string;
    amount: string;
    status: string;
  }[];
  billingHistory?: {
    id: string;
    date: string;
    description: string;
    amount: string;
    status: string;
  }[];
}

export default function BillingPage() {
  const { state } = useAuth();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBillingData = useCallback(async () => {
    if (!state.user?.id) return;

    try {
      setError('');
      setLoading(true);
      const response = await fetch(\`/api/user/billing/\${state.user.id}\`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setBillingData(result.data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to load billing data');
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('Error loading billing information');
    } finally {
      setLoading(false);
    }
  }, [state.user?.id]);

  useEffect(() => {
    if (state.isAuthenticated && state.user?.id) {
      fetchBillingData();
    } else if (!state.isLoading && !state.isAuthenticated) {
      setLoading(false);
    }
  }, [state.isAuthenticated, state.user?.id, state.isLoading, fetchBillingData]);

  // Not authenticated
  if (!state.isLoading && !state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <CreditCardIcon className="w-16 h-16 text-neural-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neural-900 mb-2">
            Sign in to view billing
          </h1>
          <p className="text-neural-600 mb-6">
            Access your subscription details and payment history
          </p>
          <Link href="/auth/login" className="btn-primary inline-block">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading || state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-neural-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-neural-900 mb-2">
            Unable to load billing
          </h1>
          <p className="text-neural-600 mb-6">{error}</p>
          <button onClick={fetchBillingData} className="btn-primary">
            <ArrowPathIcon className="w-5 h-5 mr-2 inline" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasActiveSubscription = billingData?.currentPlan?.status === 'active';
  const hasAgents = (billingData?.currentPlan?.agents?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-50 to-white">
      {/* Header */}
      <section className="py-8 md:py-12 px-4 border-b border-neural-200">
        <div className="container-custom max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neural-900 mb-1">
                Billing & Subscriptions
              </h1>
              <p className="text-neural-600">
                Manage your agent subscriptions and view payment history
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={\`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium \${
                  hasActiveSubscription
                    ? 'bg-green-100 text-green-700'
                    : 'bg-neural-100 text-neural-600'
                }\`}
              >
                <span
                  className={\`w-2 h-2 rounded-full mr-2 \${
                    hasActiveSubscription ? 'bg-green-500' : 'bg-neural-400'
                  }\`}
                />
                {hasActiveSubscription ? 'Active' : 'No Active Plan'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="container-custom max-w-4xl space-y-6">
          {/* Current Plan Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-neural-200 overflow-hidden"
          >
            <div className="p-6 border-b border-neural-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neural-900 flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5 text-brand-500" />
                  Current Plan
                </h2>
                {hasActiveSubscription && billingData?.currentPlan?.renewalDate && (
                  <span className="text-sm text-neural-500">
                    Renews: {billingData.currentPlan.renewalDate}
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              {hasActiveSubscription ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-neural-900">
                        {billingData?.currentPlan?.name || 'Agent Subscription'}
                      </h3>
                      <p className="text-neural-600 mt-1">
                        {hasAgents
                          ? \`\${billingData?.currentPlan?.agents?.length} active agent\${
                              (billingData?.currentPlan?.agents?.length ?? 0) > 1 ? 's' : ''
                            }\`
                          : billingData?.currentPlan?.period
                          ? \`\${billingData.currentPlan.period} billing\`
                          : 'Active subscription'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-neural-900">
                        \$\{(billingData?.currentPlan?.price ?? 0).toFixed(2)}
                      </p>
                      <p className="text-sm text-neural-500">
                        per {billingData?.currentPlan?.period || 'month'}
                      </p>
                    </div>
                  </div>

                  {/* Next renewal info */}
                  {billingData?.currentPlan?.daysUntilRenewal !== undefined && (
                    <div className="flex items-center gap-2 text-sm text-neural-600 bg-neural-50 rounded-lg p-3">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>
                        {billingData.currentPlan.daysUntilRenewal > 0
                          ? \`\${billingData.currentPlan.daysUntilRenewal} days until renewal\`
                          : 'Renews today'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SparklesIcon className="w-12 h-12 text-neural-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-neural-900 mb-2">
                    No Active Subscription
                  </h3>
                  <p className="text-neural-600 mb-6 max-w-md mx-auto">
                    Subscribe to an AI agent to unlock powerful features and personalized assistance.
                  </p>
                  <Link
                    href="/agents"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    Browse AI Agents
                  </Link>
                </div>
              )}
            </div>
            {hasActiveSubscription && (
              <div className="px-6 py-4 bg-neural-50 border-t border-neural-100 flex flex-wrap gap-3">
                <Link href="/agents" className="btn-secondary text-sm">
                  Add More Agents
                </Link>
                <Link href="/pricing/per-agent" className="btn-outline text-sm">
                  View Pricing
                </Link>
              </div>
            )}
          </motion.div>

          {/* Active Agent Subscriptions */}
          {hasAgents && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-neural-200 overflow-hidden"
            >
              <div className="p-6 border-b border-neural-100">
                <h2 className="text-lg font-semibold text-neural-900 flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-brand-500" />
                  Your AI Agents
                </h2>
              </div>
              <div className="divide-y divide-neural-100">
                {billingData?.currentPlan?.agents?.map((agent, index) => (
                  <div
                    key={agent.agentId || index}
                    className="p-4 hover:bg-neural-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neural-900">
                          {agent.agentName || agent.agentId}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-neural-600">
                          <span className="capitalize">{agent.plan} plan</span>
                          <span className="text-neural-300">•</span>
                          <span>\$\{(agent.price ?? 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={\`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium \${
                            agent.daysRemaining > 7
                              ? 'bg-green-100 text-green-700'
                              : agent.daysRemaining > 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }\`}
                        >
                          {agent.daysRemaining > 0
                            ? \`\${agent.daysRemaining} days left\`
                            : 'Expired'}
                        </span>
                        <p className="text-xs text-neural-500 mt-1">
                          Expires: {new Date(agent.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-neural-50 border-t border-neural-100">
                <Link
                  href="/dashboard/agent-management"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Manage Agent Subscriptions →
                </Link>
              </div>
            </motion.div>
          )}

          {/* Pricing Plans */}
          {billingData?.planOptions && billingData.planOptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl border border-neural-200 overflow-hidden"
            >
              <div className="p-6 border-b border-neural-100">
                <h2 className="text-lg font-semibold text-neural-900">
                  Available Plans
                </h2>
                <p className="text-sm text-neural-600 mt-1">
                  Choose the billing period that works best for you
                </p>
              </div>
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neural-100">
                {billingData.planOptions.map((plan) => (
                  <div key={plan.key} className="p-6 text-center">
                    <h3 className="font-semibold text-neural-900 mb-1">
                      {plan.billingPeriod.charAt(0).toUpperCase() +
                        plan.billingPeriod.slice(1)}
                    </h3>
                    <p className="text-2xl font-bold text-brand-600 mb-2">
                      \$\{(plan.price ?? 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-neural-500 mb-3">
                      per agent / {plan.billingPeriod}
                    </p>
                    {plan.status === 'active' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Currently Active
                      </span>
                    ) : (
                      <Link
                        href="/agents"
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Subscribe →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Billing History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-neural-200 overflow-hidden"
          >
            <div className="p-6 border-b border-neural-100">
              <h2 className="text-lg font-semibold text-neural-900 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-brand-500" />
                Payment History
              </h2>
            </div>
            <div className="p-6">
              {(billingData?.invoices?.length ?? 0) > 0 ||
              (billingData?.billingHistory?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {(billingData?.invoices || billingData?.billingHistory || []).map(
                    (item, index) => (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between p-3 bg-neural-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-neural-900">
                            {item.description || 'Agent Subscription'}
                          </p>
                          <p className="text-sm text-neural-500">{item.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neural-900">
                            {item.amount}
                          </p>
                          <span
                            className={\`text-xs font-medium \${
                              item.status === 'paid' || item.status === 'completed'
                                ? 'text-green-600'
                                : item.status === 'pending'
                                ? 'text-yellow-600'
                                : 'text-neural-500'
                            }\`}
                          >
                            {item.status?.charAt(0).toUpperCase() +
                              item.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="w-10 h-10 text-neural-300 mx-auto mb-3" />
                  <p className="text-neural-500">No payment history yet</p>
                  <p className="text-sm text-neural-400 mt-1">
                    Your payments will appear here once you subscribe
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Back to Dashboard */}
          <div className="text-center pt-4">
            <Link href="/dashboard" className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
