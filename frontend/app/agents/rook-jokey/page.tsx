'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('rook-jokey')!;

export default function RookJokeyPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
