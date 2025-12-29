'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('lazy-pawn')!;

export default function LazyPawnPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
