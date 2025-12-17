'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface SubscriptionData {
  success: boolean;
  hasAccess?: boolean;
  subscription?: any;
  error?: string;
  message?: string;
}

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [agentName, setAgentName] = useState('your AI agent');
  const [agentSlug, setAgentSlug] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);

  useEffect(() => {
    const agent = searchParams.get('agent');
    const slug = searchParams.get('slug');
    const session = searchParams.get('session_id');

    if (agent) {
      setAgentName(agent);
    }
    if (slug) {
      setAgentSlug(slug);
    }
    if (session) {
      setSessionId(session);
    }

    // Start verification if we have a session ID
    if (session) {
      verifyStripeSession(session);
    } else {
      // No session ID - this might be a direct access or error
      setVerificationStatus('error');
      setErrorMessage(
        'No session ID provided. Please complete the subscription process first.'
      );
    }
  }, [searchParams]);

  const verifyStripeSession = async (sessionId: string) => {
    try {
      console.log('🔍 Verifying Stripe session:', sessionId);

      // Set a timeout for the verification
      const timeout = setTimeout(() => {
        console.error('⏰ Verification timeout');
        setVerificationStatus('error');
        setErrorMessage(
          'Verification timed out. Please check your subscription status in the dashboard.'
        );
      }, 10000); // 10 second timeout

      // Verify the session with Stripe
      const response = await fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          '❌ Session verification failed:',
          response.status,
          errorData
        );

        if (response.status === 404) {
          setErrorMessage(
            'Session not found. This might be an expired or invalid link.'
          );
        } else if (response.status === 400) {
          setErrorMessage(
            errorData.error || 'Invalid session. Please try subscribing again.'
          );
        } else {
          setErrorMessage(
            'Failed to verify subscription. Please contact support.'
          );
        }
        setVerificationStatus('error');
        return;
      }

      const data = await response.json();
      console.log('✅ Session verification successful:', data);

      setSubscriptionData(data);
      setVerificationStatus('success');
    } catch (error) {
      console.error('❌ Verification error:', error);
      setVerificationStatus('error');
      setErrorMessage(
        'Network error during verification. Please check your connection and try again.'
      );
    }
  };

  const handleAgentRedirect = () => {
    if (agentSlug) {
      router.push(`/agents/${agentSlug}`);
    }
  };

  // Show loading state
  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-neural-600">Verifying your subscription...</p>
          <p className="text-sm text-neural-400 mt-2">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50">
        <div className="container-custom section-padding-lg flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-4xl mb-6">
            ❌
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neural-900 mb-4">
            Verification Failed
          </h1>
          <p className="text-lg text-red-600 max-w-2xl mb-8">
            {errorMessage ||
              'We could not verify your subscription. Please try again or contact support.'}
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center w-full max-w-xl">
            <Link
              href="/dashboard"
              className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/support/contact-us"
              className="flex-1 py-3 px-6 rounded-lg font-semibold border border-red-600 text-red-600 hover:bg-red-50 transition-colors text-center"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50">
      <div className="container-custom section-padding-lg flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mb-6">
          ✅
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-neural-900 mb-4">
          Subscription Confirmed!
        </h1>
        <p className="text-lg text-neural-600 max-w-2xl mb-8">
          You now have full access to{' '}
          <span className="font-semibold text-brand-600">{agentName}</span>.
          {sessionId && (
            <span className="text-sm text-neural-400 block mt-2">
              (Session: {sessionId})
            </span>
          )}
        </p>

        {subscriptionData?.subscription && (
          <div className="bg-white rounded-2xl shadow-lg border border-neural-100 p-6 w-full max-w-2xl mb-8">
            <h3 className="text-lg font-semibold text-neural-900 mb-3">
              Subscription Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neural-500">Plan:</span>
                <span className="font-medium ml-2 capitalize">
                  {subscriptionData.subscription.plan}
                </span>
              </div>
              <div>
                <span className="text-neural-500">Status:</span>
                <span className="font-medium ml-2 text-green-600 capitalize">
                  {subscriptionData.subscription.status}
                </span>
              </div>
              <div>
                <span className="text-neural-500">Price:</span>
                <span className="font-medium ml-2">
                  ${subscriptionData.subscription.price}
                </span>
              </div>
              <div>
                <span className="text-neural-500">Renews:</span>
                <span className="font-medium ml-2">
                  {subscriptionData.subscription.daysUntilRenewal} days
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-neural-100 p-8 w-full max-w-2xl mb-10">
          <h2 className="text-2xl font-semibold text-neural-900 mb-4">
            What's next?
          </h2>
          <ul className="text-left space-y-3 text-neural-600">
            <li>• Enjoy unlimited conversations with your subscribed agent.</li>
            <li>• Manage billing or cancel anytime from your dashboard.</li>
            <li>• Need help? Visit the support center for quick assistance.</li>
          </ul>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center w-full max-w-xl">
          <Link
            href="/dashboard"
            className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={handleAgentRedirect}
            disabled={!agentSlug}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold border border-brand-600 text-brand-600 hover:bg-brand-50 transition-colors ${
              agentSlug ? '' : 'opacity-60 cursor-not-allowed'
            }`}
          >
            Open Agent Chat
          </button>
        </div>

        {!agentSlug && (
          <p className="text-sm text-amber-600 mt-4">
            We couldn't detect which agent you subscribed to. Please return to
            the dashboard to continue.
          </p>
        )}
      </div>

    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-neural-600">Loading subscription details...</p>
          </div>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
