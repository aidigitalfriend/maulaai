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
    <div className="relative overflow-hidden rounded-2xl">
      {/* Original card with subtle blur effect - keep it more readable */}
      <div className="blur-[2px] pointer-events-none opacity-80">{children}</div>

      {/* Lock overlay - lighter overlay for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-neural-900/70 to-neural-800/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center overflow-hidden">
        <div className="text-center p-4 max-w-full">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>

          <h3 className="text-base font-bold text-white mb-2 line-clamp-2">
            {title ? `${title}` : 'Premium Feature'}
          </h3>

          <p className="text-white/80 text-sm mb-4 line-clamp-2 px-2">
            Subscribe to unlock all AI experiments
          </p>

          <Link href="/pricing">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl font-semibold text-neural-900 text-sm hover:shadow-lg hover:shadow-yellow-500/30 transition-all transform hover:scale-105">
              <Crown className="w-4 h-4" />
              View Plans
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
