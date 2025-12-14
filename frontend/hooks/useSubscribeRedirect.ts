'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SubscribeRedirectOptions {
  agentName?: string;
  agentSlug?: string;
}

export function useSubscribeRedirect(
  defaultAgentName = 'AI Agent',
  defaultAgentSlug = 'agent'
) {
  const router = useRouter();

  return useCallback(
    (options?: SubscribeRedirectOptions) => {
      const agentName = options?.agentName ?? defaultAgentName;
      const agentSlug = options?.agentSlug ?? defaultAgentSlug;

      const subscribeUrl = `/subscribe?agent=${encodeURIComponent(
        agentName
      )}&slug=${encodeURIComponent(agentSlug)}`;
      router.push(subscribeUrl);
    },
    [defaultAgentName, defaultAgentSlug, router]
  );
}
