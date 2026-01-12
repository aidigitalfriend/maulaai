'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import AgentSubscriptionGuard from '../../../components/AgentSubscriptionGuard';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('bishop-burger')!;

export default function BishopBurgerPage() {
  return (
    <AgentSubscriptionGuard
      agentId="bishop-burger"
      agentName={agentConfig.name}
    >
      <UniversalAgentChat agent={agentConfig} />
    </AgentSubscriptionGuard>
  );
}
