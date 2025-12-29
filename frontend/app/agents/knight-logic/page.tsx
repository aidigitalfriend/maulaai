'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('knight-logic')!;

export default function KnightLogicPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
