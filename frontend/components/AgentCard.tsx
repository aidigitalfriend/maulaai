'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import AgentDetailsModal from './AgentDetailsModal';
import type { AgentConfig } from '@/app/agents/types';
import { useSubscriptions } from '@/contexts/SubscriptionContext';

interface AgentCardProps {
  agent: AgentConfig;
  index?: number;
}

export default function AgentCard({ agent, index = 0 }: AgentCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { hasActiveSubscription, getSubscription, getDaysRemaining, loading } =
    useSubscriptions();

  const isSubscribed = hasActiveSubscription(agent.id);
  const subscription = getSubscription(agent.id);
  const daysRemaining = getDaysRemaining(agent.id);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the details button
    if ((e.target as HTMLElement).closest('[data-details-button]')) {
      e.preventDefault();
      return;
    }
  };

  // Determine link and text based on subscription status
  const linkHref = isSubscribed
    ? `/agents/${agent.id}`
    : `/subscribe?agent=${encodeURIComponent(agent.name)}&slug=${agent.id}`;

  const actionText = loading
    ? 'Checking...'
    : isSubscribed
      ? `✓ Subscribed (${daysRemaining}d left)`
      : 'Subscribe to Access';

  return (
    <>
      <Link
        href={linkHref}
        className="group block p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
        style={{ 
          animationDelay: `${index * 100}ms`,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onClick={handleCardClick}
      >
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${agent.color} p-0.5 mb-4`}>
          <img
            src={agent.avatarUrl}
            alt={`${agent.name} avatar`}
            className="w-full h-full rounded-xl object-cover"
          />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{agent.name}</h3>

          <div className="text-sm font-medium text-cyan-400 mb-3">
            {agent.specialty}
          </div>

          <p className="text-sm text-white/60 mb-4 line-clamp-3">{agent.description}</p>

          <div className="flex flex-wrap gap-2">
            {agent.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'rgba(6, 182, 212, 1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 gap-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <span
            className={`text-sm font-medium flex-1 ${isSubscribed ? 'text-emerald-400' : 'text-cyan-400'}`}
          >
            {actionText}
          </span>

          <div className="flex items-center gap-2">
            {/* Details Button */}
            {agent.details && (
              <button
                data-details-button
                onClick={(e) => {
                  e.preventDefault();
                  setShowDetails(true);
                }}
                className="p-2 text-white/40 hover:text-cyan-400 rounded-lg transition-all duration-200 hover:scale-110"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                title="View agent details"
              >
                <InformationCircleIcon className="w-5 h-5" />
              </button>
            )}

            {/* Arrow */}
            <svg
              className="w-5 h-5 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </Link>

      {/* Details Modal */}
      {agent.details && (
        <AgentDetailsModal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          agentName={agent.name}
          agentIcon={agent.details.icon}
          sections={agent.details.sections}
        />
      )}
    </>
  );
}
