'use client';

import { ReactNode } from 'react';
import { Lock, Crown } from 'lucide-react';
import Link from 'next/link';

interface LockedCardProps {
  children: ReactNode;
  isLocked: boolean;
  title?: string;
}

export function LockedCard({ children, isLocked, title }: LockedCardProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Original card with blur effect */}
      <div className="blur-sm pointer-events-none opacity-60">{children}</div>

      {/* Lock overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
        <div className="text-center p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            {title ? `${title} Requires Subscription` : 'Premium Feature'}
          </h3>

          <p className="text-gray-300 mb-6 max-w-xs">
            Unlock access to all AI experiments and tools with a subscription
            plan.
          </p>

          <Link href="/pricing">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full font-semibold text-black hover:shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:scale-105">
              <Crown className="w-5 h-5" />
              View Plans
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
