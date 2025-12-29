'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('mrs-boss')!;

export default function MrsBossPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
