'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptions } from '@/contexts/SubscriptionContext';
import { Lock, Crown, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface AgentSubscriptionGuardProps {
  children: React.ReactNode;
  agentId: string;
  agentName: string;
}

/**
 * AgentSubscriptionGuard - Protects agent chat pages that require a subscription to that specific agent
 *
 * Usage:
 * ```tsx
 * export default function BenSegaPage() {
 *   return (
 *     <AgentSubscriptionGuard agentId="ben-sega" agentName="Ben Sega">
 *       <UniversalAgentChat agent={agentConfig} />
 *     </AgentSubscriptionGuard>
 *   );
 * }
 * ```
 */
export function AgentSubscriptionGuard({
  children,
  agentId,
  agentName,
}: AgentSubscriptionGuardProps) {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { hasActiveSubscription, getSubscription, getDaysRemaining, loading: subscriptionLoading } = useSubscriptions();

  // Combined loading state
  const isLoading = authState.isLoading || subscriptionLoading;

  // Show loading spinner while checking
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-400 animate-spin mx-auto mb-4" />
          <p className="text-neural-300">Checking access to {agentName}...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neural-800/50 rounded-2xl p-8 border border-neural-700 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>

          <p className="text-neural-300 mb-8">
            Please log in to chat with {agentName}.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href={`/auth/login?redirect=/agents/${agentId}`}
              className="w-full px-6 py-3 bg-gradient-to-r from-brand-500 to-accent-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-brand-500/50 transition-all transform hover:scale-105"
            >
              Log In
            </Link>

            <Link
              href="/auth/signup"
              className="w-full px-6 py-3 border border-neural-600 rounded-xl font-semibold text-neural-300 hover:bg-neural-700 transition-all"
            >
              Create Account
            </Link>
          </div>

          <p className="text-neural-500 text-sm mt-6">
            Don't have a subscription?{' '}
            <Link
              href={`/subscribe?agent=${encodeURIComponent(agentName)}&slug=${agentId}`}
              className="text-brand-400 hover:text-brand-300"
            >
              Subscribe to {agentName}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Logged in but no subscription for this agent - show subscribe prompt
  if (!hasActiveSubscription(agentId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neural-800/50 rounded-2xl p-8 border border-neural-700 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            Subscribe to {agentName}
          </h1>

          <p className="text-neural-300 mb-8">
            You need an active subscription to chat with {agentName}. Choose a plan that works for you.
          </p>

          <div className="bg-neural-900/50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-neural-400 mb-2">
              Subscription includes:
            </h3>
            <ul className="text-left text-sm text-neural-300 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Unlimited chat with {agentName}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Voice chat capabilities
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> File & image uploads
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Chat history saved
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/subscribe?agent=${encodeURIComponent(agentName)}&slug=${agentId}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl font-semibold text-black hover:shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:scale-105"
            >
              <Crown className="w-5 h-5" />
              Subscribe Now
            </Link>

            <Link
              href="/agents"
              className="w-full px-6 py-3 border border-neural-600 rounded-xl font-semibold text-neural-300 hover:bg-neural-700 transition-all"
            >
              Browse Other Agents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Has active subscription for this agent - render the chat
  return <>{children}</>;
}

export default AgentSubscriptionGuard;
