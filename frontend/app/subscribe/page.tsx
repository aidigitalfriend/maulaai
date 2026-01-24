'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state } = useAuth();
  const agentName = searchParams.get('agent') || 'AI Agent';
  const agentSlug = searchParams.get('slug') || 'agent';
  const intent = searchParams.get('intent'); // Check for cancel intent
  const [checking, setChecking] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<any>(null); // ✅ Track active subscription
  const [cancelling, setCancelling] = useState(false); // ✅ Track cancel operation

  // Check authentication and subscription status on mount
  useEffect(() => {
    const checkAccessAndRedirect = async () => {
      // First check if user is authenticated
      if (!state.isAuthenticated || !state.user) {
        const currentUrl = `/subscribe?agent=${encodeURIComponent(
          agentName
        )}&slug=${agentSlug}`;
        router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }

      // Check if user already has subscription for this agent
      try {
        const user = state.user;
        if (user) {
          const response = await fetch('/api/subscriptions/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              agentId: agentSlug,
            }),
          });

          const data = await response.json();

          // Check for either hasAccess or hasActiveSubscription (backend response)
          if ((data.hasAccess || data.hasActiveSubscription) && data.subscription) {
            // ✅ Store active subscription data instead of redirecting
            // Calculate days remaining if not provided
            const subscription = data.subscription;
            if (!subscription.daysUntilRenewal && subscription.expiryDate) {
              const expiry = new Date(subscription.expiryDate);
              const now = new Date();
              subscription.daysUntilRenewal = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            }
            setActiveSubscription(subscription);

            // If intent is cancel, auto-trigger the cancel confirmation
            if (intent === 'cancel') {
              // Small delay to ensure state is updated
              setTimeout(() => {
                const cancelButton = document.querySelector(
                  '[data-cancel-button]'
                ) as HTMLButtonElement;
                if (cancelButton) {
                  cancelButton.click();
                }
              }, 500);
            }
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }

      setChecking(false);
    };

    checkAccessAndRedirect();
  }, [agentName, agentSlug, router, state.isAuthenticated, state.user, intent]);

  // ✅ Handle subscription cancellation
  const handleCancelSubscription = async () => {
    if (!state.user || !activeSubscription) return;

    if (
      !confirm(
        `Are you sure you want to cancel your ${activeSubscription.plan} subscription to ${agentName}? You will lose access immediately.`
      )
    ) {
      return;
    }

    setCancelling(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: state.user.id,
          agentId: agentSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Successfully cancelled
      setActiveSubscription(null);
      alert(
        'Access cancelled successfully. You can purchase again anytime to continue using this agent.'
      );

      // If came from agent management with cancel intent, redirect back
      if (intent === 'cancel') {
        router.push('/dashboard/agent-management');
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to cancel access. Please try again.'
      );
    } finally {
      setCancelling(false);
    }
  };

  // Show loading state while checking
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access status...</p>
        </div>
      </div>
    );
  }

  const subscriptionPlans = [
    {
      type: 'Daily',
      price: '$1',
      period: 'per day',
      features: [
        'Full access to ' + agentName,
        'Unlimited conversations',
        'Real-time responses',
        'No auto-renewal',
      ],
      recommended: false,
      billingCycle: 'daily',
    },
    {
      type: 'Weekly',
      price: '$5',
      period: 'per week',
      features: [
        'Full access to ' + agentName,
        'Unlimited conversations',
        'Real-time responses',
        'No auto-renewal',
        'Save 29% vs daily',
      ],
      recommended: true,
      billingCycle: 'weekly',
    },
    {
      type: 'Monthly',
      price: '$15',
      period: 'per month',
      features: [
        'Full access to ' + agentName,
        'Unlimited conversations',
        'Real-time responses',
        'No auto-renewal',
        'Save 39% vs daily',
        'Best value',
      ],
      recommended: false,
      billingCycle: 'monthly',
    },
  ];

  const handleSubscribe = async (plan: any) => {
    setErrorMessage(null);

    if (!state.isAuthenticated || !state.user) {
      const currentUrl = `/subscribe?agent=${encodeURIComponent(
        agentName
      )}&slug=${agentSlug}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // ✅ Prevent double-click / multiple simultaneous purchases
    if (processingPlan) {
      return; // Already processing another plan
    }

    setProcessingPlan(plan.billingCycle);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          agentId: agentSlug,
          agentName,
          plan: plan.billingCycle,
          userId: state.user.id,
          userEmail: state.user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.url) {
        // Check if user already has subscription
        if (data.alreadySubscribed && data.existingSubscription) {
          const expiryDate = new Date(
            data.existingSubscription.expiryDate
          ).toLocaleDateString();
          throw new Error(
            `You already have an active ${data.existingSubscription.plan} subscription. ` +
              `It expires on ${expiryDate} (${
                data.existingSubscription.daysUntilRenewal || 0
              } days remaining).`
          );
        }
        throw new Error(data.error || 'Failed to start checkout session');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Stripe checkout error:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to start checkout. Please try again.';
      setErrorMessage(message);
      setProcessingPlan(null); // ✅ Reset on error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container-custom section-padding-lg">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
            <span className="text-4xl">🤖</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            {agentName}
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            {activeSubscription
              ? `Manage your access to ${agentName}`
              : `Choose a one-time purchase plan for access to ${agentName}`}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-2xl mx-auto shadow-sm" style={{ backgroundColor: '#fffbeb' }}>
            <p className="text-amber-700 font-medium">
              ⚠️ One agent per purchase. You can purchase access to multiple
              agents, but each requires a separate purchase. No auto-renewal.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto mb-8 border border-red-200 text-red-700 p-4 rounded-xl text-center shadow-sm" style={{ backgroundColor: '#fef2f2' }}>
            {errorMessage}
          </div>
        )}

        {/* ✅ Active Subscription Info */}
        {activeSubscription && (
          <div className="max-w-3xl mx-auto mb-16">
            <div className="border border-green-200 rounded-2xl p-8 shadow-lg" style={{ backgroundColor: '#ffffff' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                    ✅ Active Access
                  </h3>
                  <p className="text-green-700">
                    You have full access to {agentName}
                  </p>
                </div>
                <div className="text-6xl">🎉</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-xl p-4 border border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
                  <p className="text-sm mb-1" style={{ color: '#6b7280' }}>Plan</p>
                  <p className="text-xl font-bold capitalize" style={{ color: '#111827' }}>
                    {activeSubscription.plan}
                  </p>
                </div>
                <div className="rounded-xl p-4 border border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
                  <p className="text-sm mb-1" style={{ color: '#6b7280' }}>Expires On</p>
                  <p className="text-xl font-bold" style={{ color: '#111827' }}>
                    {new Date(
                      activeSubscription.expiryDate
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-xl p-4 border border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
                  <p className="text-sm mb-1" style={{ color: '#6b7280' }}>Days Remaining</p>
                  <p className="text-xl font-bold" style={{ color: '#111827' }}>
                    {activeSubscription.daysUntilRenewal || 0}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/agents/${agentSlug}`}
                  className="flex-1 text-center py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                >
                  🚀 Start Chatting
                </Link>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  data-cancel-button
                  className="flex-1 py-3 px-6 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#fef2f2' }}
                >
                  {cancelling ? '⏳ Cancelling...' : '❌ Cancel Access'}
                </button>
              </div>

              <p className="text-sm mt-4 text-center" style={{ color: '#6b7280' }}>
                💡 After expiration or cancellation, you can purchase a new plan
                anytime
              </p>
            </div>
          </div>
        )}

        {/* ✅ Pricing Plans (only show if no active subscription) */}
        {!activeSubscription && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {subscriptionPlans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 relative shadow-lg border-2 transition-all duration-300 ${
                  plan.recommended
                    ? 'border-blue-500 transform scale-105 shadow-xl shadow-blue-500/10'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
                }`}
                style={{ backgroundColor: '#ffffff' }}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>{plan.type}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="ml-2" style={{ color: '#4b5563' }}>{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-sm"
                      style={{ color: '#374151' }}
                    >
                      <span className="text-green-500 mr-3 font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={processingPlan !== null}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                    plan.recommended
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  } ${
                    processingPlan !== null
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {processingPlan === plan.billingCycle
                    ? '⏳ Processing...'
                    : processingPlan
                      ? 'Processing...'
                      : `Purchase ${plan.type} Access`}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Important Notes */}
        <div className="rounded-2xl p-8 max-w-4xl mx-auto mb-8 shadow-lg border border-gray-200" style={{ backgroundColor: '#ffffff' }}>
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#111827' }}>
            Important Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
              <h3 className="font-bold text-blue-600 mb-3">
                🔒 Individual Purchases
              </h3>
              <p className="text-sm" style={{ color: '#4b5563' }}>
                Each agent requires its own purchase. You can buy access to
                multiple agents individually, but each purchase is separate. No
                auto-renewal.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
              <h3 className="font-bold text-blue-600 mb-3">
                💳 Unified Pricing
              </h3>
              <p className="text-sm" style={{ color: '#4b5563' }}>
                All agents use the same simple pricing: $1/day, $5/week, or
                $15/month. Each purchase is one-time with no recurring charges.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
              <h3 className="font-bold text-blue-600 mb-3">
                🔄 Easy Cancellation
              </h3>
              <p className="text-sm" style={{ color: '#4b5563' }}>
                Cancel your access anytime. Since there's no auto-renewal,
                you're never charged again. Access expires naturally at the end
                of your chosen period.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200" style={{ backgroundColor: '#f9fafb' }}>
              <h3 className="font-bold text-blue-600 mb-3">
                ⚡ Instant Access
              </h3>
              <p className="text-sm" style={{ color: '#4b5563' }}>
                Once you purchase, you'll have immediate access to unlimited
                conversations with {agentName} for your chosen period.
              </p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/agents"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            ← Back to All Agents
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SubscriptionContent />
    </Suspense>
  );
}
