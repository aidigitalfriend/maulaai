'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Lock, Crown, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionGuardProps {
  children: ReactNode;
  /** Custom message to show when user doesn't have subscription */
  message?: string;
  /** Where to redirect for subscription (default: /pricing) */
  pricingUrl?: string;
}

/**
 * SubscriptionGuard - Protects pages that require an active subscription
 *
 * Usage:
 * ```tsx
 * export default function MyProtectedPage() {
 *   return (
 *     <SubscriptionGuard>
 *       <YourPageContent />
 *     </SubscriptionGuard>
 *   );
 * }
 * ```
 *
 * This component:
 * 1. Shows loading spinner while checking auth/subscription status
 * 2. If not logged in: Shows login prompt
 * 3. If logged in but no subscription: Shows upgrade prompt
 * 4. If logged in with active subscription: Renders children
 */
export function SubscriptionGuard({
  children,
  message = 'This feature requires an active subscription to access.',
  pricingUrl = '/pricing',
}: SubscriptionGuardProps) {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { hasActiveSubscription, isLoading: subscriptionLoading } =
    useSubscriptionStatus();

  // Combined loading state
  const isLoading = authState.isLoading || subscriptionLoading;

  // Show loading spinner while checking
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-400 animate-spin mx-auto mb-4" />
          <p className="text-neural-300">Checking access...</p>
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
            Please log in to access this feature. Already have an account? Sign
            in below.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
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
            New to One Last AI?{' '}
            <Link
              href="/pricing"
              className="text-brand-400 hover:text-brand-300"
            >
              View our plans
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Logged in but no active subscription - show upgrade prompt
  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-neural-800/50 rounded-2xl p-8 border border-neural-700 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">
            Subscription Required
          </h1>

          <p className="text-neural-300 mb-8">{message}</p>

          <div className="bg-neural-900/50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-neural-400 mb-2">
              What you get:
            </h3>
            <ul className="text-left text-sm text-neural-300 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Access to all Network
                Tools
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Access to all
                Developer Utils
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Access to AI Lab
                Experiments
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Chat with AI Agents
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={pricingUrl}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl font-semibold text-black hover:shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:scale-105"
            >
              <Crown className="w-5 h-5" />
              View Subscription Plans
            </Link>

            <button
              onClick={() => router.back()}
              className="w-full px-6 py-3 border border-neural-600 rounded-xl font-semibold text-neural-300 hover:bg-neural-700 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Has active subscription - render the protected content
  return <>{children}</>;
}

export default SubscriptionGuard;
