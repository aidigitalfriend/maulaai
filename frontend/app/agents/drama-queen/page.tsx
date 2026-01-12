'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('drama-queen')!;

export default function AgentPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
