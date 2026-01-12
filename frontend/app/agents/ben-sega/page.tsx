'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import AgentSubscriptionGuard from '../../../components/AgentSubscriptionGuard';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('ben-sega')!;

export default function BenSegaPage() {
  return (
    <AgentSubscriptionGuard agentId="ben-sega" agentName={agentConfig.name}>
      <UniversalAgentChat agent={agentConfig} />
    </AgentSubscriptionGuard>
  );
}
