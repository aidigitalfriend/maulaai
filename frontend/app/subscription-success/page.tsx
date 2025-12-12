'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [agentName, setAgentName] = useState('your AI agent');
  const [agentSlug, setAgentSlug] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

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
  }, [searchParams]);

  const handleAgentRedirect = () => {
    if (agentSlug) {
      router.push(`/agents/${agentSlug}`);
    }
  };

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
          You now have full access to <span className="font-semibold text-brand-600">{agentName}</span>.
          {sessionId ? ` (Session ID: ${sessionId})` : ''}
        </p>

        <div className="bg-white rounded-2xl shadow-lg border border-neural-100 p-8 w-full max-w-2xl mb-10">
          <h2 className="text-2xl font-semibold text-neural-900 mb-4">What's next?</h2>
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
            We couldn't detect which agent you subscribed to. Please return to the dashboard to continue.
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
