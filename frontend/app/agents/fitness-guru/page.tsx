'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import AgentSubscriptionGuard from '../../../components/AgentSubscriptionGuard';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('fitness-guru')!;

export default function FitnessGuruPage() {
  return (
    <AgentSubscriptionGuard agentId="fitness-guru" agentName={agentConfig.name}>
      <UniversalAgentChat agent={agentConfig} />
    </AgentSubscriptionGuard>
  );
}
