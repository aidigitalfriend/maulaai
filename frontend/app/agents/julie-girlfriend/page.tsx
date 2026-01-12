'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import AgentSubscriptionGuard from '../../../components/AgentSubscriptionGuard';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('julie-girlfriend')!;

export default function JulieGirlfriendPage() {
  return (
    <AgentSubscriptionGuard
      agentId="julie-girlfriend"
      agentName={agentConfig.name}
    >
      <UniversalAgentChat agent={agentConfig} />
    </AgentSubscriptionGuard>
  );
}
