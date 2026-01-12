'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('lazy-pawn')!;

export default function AgentPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
