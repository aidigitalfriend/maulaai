'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('professor-astrology')!;

export default function AgentPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
