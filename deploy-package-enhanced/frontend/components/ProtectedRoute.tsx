'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = '/auth',
}: ProtectedRouteProps) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (state.isLoading) return;

    // Redirect if not authenticated
    if (!state.isAuthenticated) {
      router.push(redirectTo);
    }
  }, [state.isAuthenticated, state.isLoading, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neural-600 font-medium">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!state.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
