'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import AgentSubscriptionGuard from '../../../components/AgentSubscriptionGuard';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('comedy-king')!;

export default function ComedyKingPage() {
  return (
    <AgentSubscriptionGuard agentId="comedy-king" agentName={agentConfig.name}>
      <UniversalAgentChat agent={agentConfig} />
    </AgentSubscriptionGuard>
  );
}
