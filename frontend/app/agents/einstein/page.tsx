'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('einstein')!;

export default function AgentPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
