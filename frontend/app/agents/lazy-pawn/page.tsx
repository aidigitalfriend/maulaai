'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import AgentSubscriptionGuard from '../../../components/AgentSubscriptionGuard';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('lazy-pawn')!;

export default function LazyPawnPage() {
  return (
    <AgentSubscriptionGuard agentId="lazy-pawn" agentName={agentConfig.name}>
      <UniversalAgentChat agent={agentConfig} />
    </AgentSubscriptionGuard>
  );
}
