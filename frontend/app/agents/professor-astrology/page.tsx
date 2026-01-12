'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import AgentSubscriptionGuard from '../../../components/AgentSubscriptionGuard';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('professor-astrology')!;

export default function ProfessorAstrologyPage() {
  return (
    <AgentSubscriptionGuard
      agentId="professor-astrology"
      agentName={agentConfig.name}
    >
      <UniversalAgentChat agent={agentConfig} />
    </AgentSubscriptionGuard>
  );
}
