'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import AgentSubscriptionGuard from '../../../components/AgentSubscriptionGuard';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('tech-wizard')!;

export default function TechWizardPage() {
  return (
    <AgentSubscriptionGuard agentId="tech-wizard" agentName={agentConfig.name}>
      <UniversalAgentChat agent={agentConfig} />
    </AgentSubscriptionGuard>
  );
}
