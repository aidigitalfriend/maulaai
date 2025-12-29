'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('nid-gaming')!;

export default function NidGamingPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
